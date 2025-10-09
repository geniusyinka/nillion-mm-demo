import { Builder, Codec, type Command, NilauthClient, PayerBuilder } from "@nillion/nuc";
import { NucCmd, SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NETWORK_CONFIG } from "@/config";
import { useLogContext } from "@/context/LogContext";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import { isUserRejection } from "@/utils/errors";
import type { Session } from "./useSessionQuery";

async function initializeSession(
  signer: ReturnType<typeof useNillion>["state"]["signer"],
  log: ReturnType<typeof useLogContext>["log"],
): Promise<Session> {
  if (!signer) {
    throw new Error("Signer not available");
  }

  log("⚙️ Initializing Nillion clients...");
  const payer = await PayerBuilder.fromKeplr(NETWORK_CONFIG.chainId).chainUrl(NETWORK_CONFIG.nilchain).build();
  const nilauthClient = await NilauthClient.create({ baseUrl: NETWORK_CONFIG.nilauth, payer });

  const subscriberDid = await signer.getDid();
  log("🔍 Checking subscription status...");
  const subStatus = await nilauthClient.subscriptionStatus(subscriberDid, "nildb");

  if (!subStatus.subscribed) {
    log("ℹ️ No active subscription found. Starting payment flow...");
    const cost = await nilauthClient.subscriptionCost("nildb");
    log(`💰 Subscription cost: ${cost} unil`);
    const payerDid = await signer.getDid();
    const { resourceHash, payload } = nilauthClient.createPaymentResource(subscriberDid, "nildb", payerDid);
    log("⏳ Waiting for Keplr payment approval...");
    const txHash = await payer.pay(resourceHash, cost);
    log(`✅ Payment successful! Tx: ${txHash.slice(0, 10)}...`);
    log("⏳ Waiting for MetaMask signature to validate payment...");
    await nilauthClient.validatePayment(txHash, payload, signer);
    log("✅ Payment validated.");
  } else {
    log("✅ Active subscription found.");
  }

  const nillionClient = await SecretVaultBuilderClient.from({
    signer,
    nilauthClient,
    dbs: NETWORK_CONFIG.nildb,
    blindfold: { operation: "store" },
  });

  log("🔑 Creating root authorization token...");
  await nillionClient.refreshRootToken();
  const rootToken = nillionClient.rootToken;
  log("✅ Root token created.");

  log(`🔨 Minting invocation tokens for ${nillionClient.nodes.length} NilDB nodes...`);
  const nildbTokens: Record<string, string> = {};
  for (const node of nillionClient.nodes) {
    nildbTokens[node.id.didString] = await Builder.invocationFrom(rootToken)
      .audience(node.id)
      .command(NucCmd.nil.db.root as Command)
      .signAndSerialize(signer);
  }
  log("✅ All node tokens minted.");

  return { nillionClient, nilauthClient, rootToken, nildbTokens };
}

export const useInitializeSessionMutation = () => {
  const { log } = useLogContext();
  const { state } = useNillion();
  const queryClient = useQueryClient();
  const { setStoredRootToken, setStoredNildbTokens } = usePersistedConnection();

  return useMutation({
    mutationFn: () => initializeSession(state.signer, log),
    onSuccess: (data) => {
      log("✅ Session setup complete!");
      queryClient.setQueryData(["session"], data);
      setStoredRootToken(Codec.serializeBase64Url(data.rootToken));
      setStoredNildbTokens(data.nildbTokens);
      queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
    },
    onError: (error) => {
      if (isUserRejection(error)) {
        log("❌ Process cancelled by user.");
      } else {
        log("❌ Session initialization failed", error instanceof Error ? error.message : String(error));
      }
    },
  });
};
