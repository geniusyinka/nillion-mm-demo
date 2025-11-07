import { Codec, NilauthClient } from "@nillion/nuc";
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
  // Create NilauthClient without payer for subscription checks only
  const nilauthClient = await NilauthClient.create({ 
    baseUrl: NETWORK_CONFIG.nilauth, 
    payer: undefined 
  });

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

  // Check if builder is registered, register if not
  log("🔍 Checking for existing builder profile...");
  let profileExists = false;
  try {
    await nillionClient.readProfile({ auth: { invocations: nildbTokens } });
    log("✅ Builder profile found.");
    profileExists = true;
  } catch (profileError) {
    // If readProfile fails the builder might not be registered
    log("ℹ️ No profile found, attempting to register builder...");
    try {
      const subscriberDid = await signer.getDid();
      await nillionClient.register({
        did: subscriberDid.didString,
        name: "Demo Builder",
      });
      log("✅ Builder registered successfully.");
      profileExists = true;
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
        profileExists = true; // If duplicate, it means it's already registered
      } else {
        // Re-throw if it's a different error
        throw registerError;
      }
    }
  }

  return { nillionClient, nilauthClient, rootToken, nildbTokens };
}

export const useLoginMutation = () => {
  const { log } = useLogContext();
  const { state } = useNillion();
  const { getStoredRootToken, getStoredNildbTokens } = usePersistedConnection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => login(state.signer, log, getStoredRootToken, getStoredNildbTokens),
    onSuccess: async (data) => {
      log("✅ Session re-established.");
      queryClient.setQueryData(["session"], data);
      await queryClient.invalidateQueries({ queryKey: ["subscriptionStatus"] });
      await queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
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
