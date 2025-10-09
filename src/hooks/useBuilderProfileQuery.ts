import type { SecretVaultBuilderClient } from "@nillion/secretvaults";
import { useQuery } from "@tanstack/react-query";
import { useSessionQuery } from "./useSessionQuery";

export const useBuilderProfileQuery = () => {
  const { data: session, isSuccess: isSessionReady } = useSessionQuery();

  return useQuery({
    queryKey: ["builderProfile"],
    queryFn: () => {
      if (!session?.nillionClient || !session?.nildbTokens) {
        throw new Error("Session not ready");
      }
      const nillionClient = session.nillionClient as SecretVaultBuilderClient;
      return nillionClient.readProfile({
        auth: { invocations: session.nildbTokens },
      });
    },
    enabled: isSessionReady,
    retry: false,
  });
};
