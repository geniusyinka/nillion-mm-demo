import { Builder, Codec, type Command, NilauthClient } from "@nillion/nuc";
import { NucCmd, SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NETWORK_CONFIG } from "@/config";
import { useLogContext } from "@/context/LogContext";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import { isUserRejection, isCorsError, isNetworkError, formatErrorForLogging } from "@/utils/errors";
import type { Session } from "./useSessionQuery";

async function initializeSession(
  signer: ReturnType<typeof useNillion>["state"]["signer"],
  log: ReturnType<typeof useLogContext>["log"],
): Promise<Session> {
  if (!signer) {
    throw new Error("Signer not available");
  }

  log("⚙️ Initializing clients...");
  console.log("🔧 Network config:", {
    chainId: NETWORK_CONFIG.chainId,
    nilchain: NETWORK_CONFIG.nilchain,
    nilauth: NETWORK_CONFIG.nilauth,
    nildb: NETWORK_CONFIG.nildb,
  });

  let nilauthClient;
  
  try {
    // Create NilauthClient without payer for subscription checks only
    nilauthClient = await NilauthClient.create({ 
      baseUrl: NETWORK_CONFIG.nilauth, 
      payer: undefined 
    });
    log("✅ Nilauth client created");
    console.log("✅ Nilauth client base URL:", NETWORK_CONFIG.nilauth);
  } catch (error) {
    const formattedError = formatErrorForLogging(error);
    console.error("❌ Error creating clients:", formattedError);
    if (isCorsError(error)) {
      log("🚫 CORS Error: Testnet endpoint may not support CORS for browser requests.");
    }
    if (isNetworkError(error)) {
      log("🌐 Network Error: Check endpoint connectivity.");
    }
    throw error;
  }

  const subscriberDid = await signer.getDid();
  log("🔍 Checking subscription status for builder account...");
  console.log("🔍 Builder DID:", subscriberDid.didString);
  
  let subStatus;
  try {
    subStatus = await nilauthClient.subscriptionStatus(subscriberDid, "nildb");
    console.log("📊 Subscription status:", subStatus);
  } catch (error) {
    const formattedError = formatErrorForLogging(error);
    console.error("❌ Subscription check error:", formattedError);
    if (isCorsError(error)) {
      log("🚫 CORS Error during subscription check. Testnet endpoint may not support CORS.");
    }
    if (isNetworkError(error)) {
      log("🌐 Network Error during subscription check.");
    }
    throw error;
  }

  if (!subStatus.subscribed) {
    const errorMsg = "No active NilDB subscription found for this builder account. Please ensure your builder account has an active subscription.";
    log("❌ " + errorMsg);
    throw new Error(errorMsg);
  }
  
  log("✅ Active subscription found for builder account.");


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

  log("🔍 Checking for existing builder profile...");
  try {
    await nillionClient.readProfile({ auth: { invocations: nildbTokens } });
    log("✅ Builder profile found.");
  } catch (_error) {
    // If readProfile fails the builder might not be registered
    log("ℹ️ No profile found, attempting to register builder...");
    try {
      const subscriberDid = await signer.getDid();
      await nillionClient.register({
        did: subscriberDid.didString,
        name: "Demo Builder",
      });
      log("✅ Builder registered successfully.");
    } catch (registerError: any) {
      // If registration fails with duplicate error, builder already exists (that's fine)
      const errorMessage = registerError?.message || String(registerError);
      const errorString = JSON.stringify(registerError);
      const errorsArray = registerError?.errors || [];
      const hasDuplicateError =
        errorMessage.includes("DuplicateEntryError") ||
        errorMessage.includes("duplicate") ||
        errorString.includes("DuplicateEntryError") ||
        errorsArray.some((e: any) => String(e).includes("DuplicateEntryError"));
      
      if (hasDuplicateError) {
        log("ℹ️ Builder already registered (duplicate entry) - continuing.");
      } else {
        // Re-throw if it's a different error
        throw registerError;
      }
    }
  }

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
      const formattedError = formatErrorForLogging(error);
      console.error("❌ Session initialization error:", formattedError);
      
      if (isUserRejection(error)) {
        log("❌ Process cancelled by user.");
      } else if (isCorsError(error)) {
        log("🚫 CORS Error: Testnet endpoints may not support CORS. Check browser console for details.");
        console.error("CORS Error Details:", formattedError);
      } else if (isNetworkError(error)) {
        log("🌐 Network Error: Check your connection and endpoint availability.");
        console.error("Network Error Details:", formattedError);
      } else {
        log("❌ Session initialization failed", error instanceof Error ? error.message : String(error));
        console.error("Full Error:", formattedError);
      }
    },
  });
};
