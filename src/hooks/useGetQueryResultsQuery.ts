import type { ByNodeName, Uuid } from "@nillion/secretvaults";
import { useQuery } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";

export const useGetQueryResultsQuery = (runIds: ByNodeName<Uuid> | null) => {
  const { nillionClient, nildbTokens } = useNillionClient();

  return useQuery({
    queryKey: ["queryResults", runIds],
    queryFn: async () => {
      if (!runIds) throw new Error("Run IDs are required");
      // In a real scenario, this logic would need to handle multiple results.
      const queryResultsByNode = await nillionClient.readQueryRunResults(runIds, {
        auth: { invocations: nildbTokens },
      });
      // For this demo, assume the pipeline returns a single aggregated document
      const firstNodeResult = Object.values(queryResultsByNode)[0];
      // Return the full data object so we can check the status field
      return firstNodeResult.data;
    },
    enabled: !!runIds,
    // Poll for results, but stop polling once the query is complete or fails.
    refetchInterval: (query) => {
      if (!runIds) return false;

      // Check the status from the last fetched data
      // If status is complete or error, stop refetching
      const queryData = query.state.data as { status: "complete" | "error" | string } | undefined;
      if (queryData?.status === "complete" || queryData?.status === "error") {
        return false;
      }
      // Otherwise, poll every second
      return 1000;
    },
    refetchOnWindowFocus: false,
  });
};
