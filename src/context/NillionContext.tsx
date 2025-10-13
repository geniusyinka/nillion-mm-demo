import { Signer } from "@nillion/nuc";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createWalletClient, custom, type TypedDataDomain } from "viem";
import { mainnet } from "viem/chains";
import { NETWORK_CONFIG } from "@/config";
import { AuthFlowManager } from "@/context/AuthFlowManager";
import { useLogContext } from "@/context/LogContext";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import type { NillionState } from "./NillionState";

interface INillionContext {
  state: NillionState;
  connectMetaMask: () => Promise<void>;
  connectKeplr: () => Promise<void>;
  logout: () => void;
}

export const NillionContext = createContext<INillionContext | null>(null);

const initialState: NillionState = {
  signer: null,
  did: null,
  wallets: {
    isMetaMaskConnected: false,
    isKeplrConnected: false,
    keplrAddress: null,
  },
};

export function NillionProvider({ children }: { children: ReactNode }) {
  const { log, clearLogs } = useLogContext();
  const [state, setState] = useState<NillionState>(initialState);
  const {
    hasConnected,
    setMetaMaskConnected,
    setKeplrConnected,
    clearAll: clearPersistedConnection,
  } = usePersistedConnection();
  const reconnectIdempotencyRef = useRef(false);
  const queryClient = useQueryClient();

  const connectMetaMask = useCallback(async () => {
    log("🔌 Connecting to MetaMask...");
    if (!window.ethereum) {
      return log("❌ MetaMask is not installed.");
    }
    try {
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      });
      const [account] = await walletClient.requestAddresses();

      const nucSigner = Signer.fromWeb3({
        getAddress: async () => account,
        signTypedData: async (domain, types, message) => {
          const primaryType = Object.keys(types)[0];
          return walletClient.signTypedData({
            account,
            domain: domain as TypedDataDomain | undefined,
            types,
            primaryType,
            message,
          });
        },
      });

      const did = await nucSigner.getDid();
      setState((prev) => ({
        ...prev,
        signer: nucSigner,
        did: did.didString,
        wallets: {
          ...prev.wallets,
          isMetaMaskConnected: true,
        },
      }));
      setMetaMaskConnected();
      log(`✅ MetaMask connected: ${did.didString.slice(0, 20)}...`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      log("❌ MetaMask connection failed.", message);
    }
  }, [log, setMetaMaskConnected]);

  const connectKeplr = useCallback(async () => {
    log("🔌 Connecting to Keplr for payments...");
    if (!window.keplr) {
      return log("❌ Keplr wallet is not installed.");
    }
    try {
      await window.keplr.enable(NETWORK_CONFIG.chainId);
      const key = await window.keplr.getKey(NETWORK_CONFIG.chainId);
      setState((prev) => ({
        ...prev,
        wallets: {
          ...prev.wallets,
          isKeplrConnected: true,
          keplrAddress: key.bech32Address,
        },
      }));
      setKeplrConnected();
      log(`✅ Keplr connected: ${key.bech32Address}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      log("❌ Keplr connection failed.", message);
    }
  }, [log, setKeplrConnected]);

  const logout = useCallback(() => {
    setState(initialState);
    clearPersistedConnection();
    queryClient.removeQueries({ queryKey: ["session"] });
    queryClient.removeQueries({ queryKey: ["subscriptionStatus"] });
    queryClient.removeQueries({ queryKey: ["builderProfile"] });
    clearLogs("🔌 Session disconnected.");
  }, [clearPersistedConnection, clearLogs, queryClient]);

  // Auto-reconnect effect (only run once on mount)
  useEffect(() => {
    if (reconnectIdempotencyRef.current) return;
    reconnectIdempotencyRef.current = true;

    const reconnect = async () => {
      if (hasConnected.metaMask && !state.wallets.isMetaMaskConnected) {
        await connectMetaMask();
      }
      if (hasConnected.keplr && !state.wallets.isKeplrConnected) {
        await connectKeplr();
      }
    };
    reconnect().catch(console.error);
  }, [
    connectKeplr,
    connectMetaMask,
    hasConnected.keplr,
    hasConnected.metaMask,
    state.wallets.isKeplrConnected,
    state.wallets.isMetaMaskConnected,
  ]);

  const contextValue = useMemo(
    () => ({
      state,
      connectMetaMask,
      connectKeplr,
      logout,
    }),
    [state, connectMetaMask, connectKeplr, logout],
  );

  return (
    <NillionContext.Provider value={contextValue}>
      <AuthFlowManager />
      {children}
    </NillionContext.Provider>
  );
}
