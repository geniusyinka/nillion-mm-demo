import type { SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useSessionQuery } from "./useSessionQuery";

interface NillionClientHook {
  nillionClient: SecretVaultBuilderClient;
  nildbTokens: Record<string, string>;
}

export function useNillionClient(): NillionClientHook {
  const { data: session, isSuccess } = useSessionQuery();

  if (!isSuccess || !session?.nillionClient || !session?.nildbTokens) {
    throw new Error("Nillion client and tokens are not available.");
  }

  return {
    nillionClient: session.nillionClient as SecretVaultBuilderClient,
    nildbTokens: session.nildbTokens,
  };
}
