import { Codec, NilauthClient, PayerBuilder } from "@nillion/nuc";
import { SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NETWORK_CONFIG } from "@/config";
import { useLogContext } from "@/context/LogContext";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import { isUserRejection } from "@/utils/errors";
import type { Session } from "./useSessionQuery";

async function login(
  signer: ReturnType<typeof useNillion>["state"]["signer"],
  log: ReturnType<typeof useLogContext>["log"],
  getStoredRootToken: () => string | null,
  getStoredNildbTokens: () => Record<string, string> | null,
): Promise<Session> {
  if (!signer) {
    throw new Error("Signer not available");
  }

  const storedRootToken = getStoredRootToken();
  const storedNildbTokens = getStoredNildbTokens();

  if (!storedRootToken || !storedNildbTokens) {
    throw new Error("No stored session found to login.");
  }

  log("📦 Found stored session, re-hydrating clients...");
  const payer = await PayerBuilder.fromKeplr(NETWORK_CONFIG.chainId).chainUrl(NETWORK_CONFIG.nilchain).build();
  const nilauthClient = await NilauthClient.create({ baseUrl: NETWORK_CONFIG.nilauth, payer });

  const nillionClient = await SecretVaultBuilderClient.from({
    signer,
    nilauthClient,
    dbs: NETWORK_CONFIG.nildb,
    blindfold: { operation: "store" },
    rootToken: storedRootToken,
  });

  log("✅ Clients re-hydrated.");
  const rootToken = Codec.decodeBase64Url(storedRootToken);
  const nildbTokens = storedNildbTokens;

  return { nillionClient, nilauthClient, rootToken, nildbTokens };
}

export const useLoginMutation = () => {
  const { log } = useLogContext();
  const { state } = useNillion();
  const { getStoredRootToken, getStoredNildbTokens } = usePersistedConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => login(state.signer, log, getStoredRootToken, getStoredNildbTokens),
    onSuccess: (data) => {
      log("✅ Session re-established.");
      queryClient.setQueryData(["session"], data);
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
    },
    onError: (error) => {
      if (isUserRejection(error)) {
        log("❌ Process cancelled by user.");
      } else {
        log("❌ Login failed.", error instanceof Error ? error.message : String(error));
      }
    },
  });
};
