import type { NilauthClient } from "@nillion/nuc";
import { useQuery } from "@tanstack/react-query";
import { useNillion } from "@/hooks/useNillion";
import { useSessionQuery } from "./useSessionQuery";

export const useCheckSubscriptionQuery = () => {
  const { state } = useNillion();
  const { data: session, isSuccess: isSessionReady } = useSessionQuery();

  return useQuery({
    queryKey: ["subscriptionStatus", state.did],
    queryFn: async () => {
      if (!session || !state.signer) {
        throw new Error("Session or signer not initialized");
      }
      const nilauthClient = session.nilauthClient as NilauthClient;
      return await nilauthClient.subscriptionStatus(await state.signer.getDid(), "nildb");
    },
    enabled: isSessionReady && !!state.did,
    staleTime: 30_000,
  });
};
