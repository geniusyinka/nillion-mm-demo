import type { NilauthClient } from "@nillion/nuc";
import { useQuery } from "@tanstack/react-query";
import { useNillion } from "@/hooks/useNillion";
import { useSessionQuery } from "./useSessionQuery";
import { isCorsError, isNetworkError, formatErrorForLogging } from "@/utils/errors";

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
      
      try {
        const userDid = await state.signer.getDid();
        console.log("🔍 Checking subscription for DID:", userDid.didString);
        console.log("🔍 Nilauth endpoint:", session.nilauthClient);
        const result = await nilauthClient.subscriptionStatus(userDid, "nildb");
        console.log("✅ Subscription check result:", result);
        return result;
      } catch (error) {
        const formattedError = formatErrorForLogging(error);
        console.error("❌ Subscription check error:", formattedError);
        
        if (isCorsError(error)) {
          console.error("🚫 CORS Error detected! This might be blocking the request.");
          console.error("   Check if the testnet endpoint supports CORS for browser requests.");
        }
        if (isNetworkError(error)) {
          console.error("🌐 Network Error detected! Check your internet connection and endpoint availability.");
        }
        
        throw error;
      }
    },
    enabled: isSessionReady && !!state.did,
    staleTime: 30_000,
  });
};
