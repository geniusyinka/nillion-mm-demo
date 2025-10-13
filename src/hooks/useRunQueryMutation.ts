import type { ByNodeName, RunQueryRequest, Uuid } from "@nillion/secretvaults";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useLogContext } from "@/context/LogContext";
import { useNillionClient } from "./useNillionClient";
import { useProfile } from "./useProfile";

export const useRunQueryMutation = (
  options?: Omit<UseMutationOptions<ByNodeName<Uuid>, Error, RunQueryRequest>, "mutationFn">,
) => {
  const { hasCollection } = useProfile();
  const { nillionClient, nildbTokens } = useNillionClient();
  const { log } = useLogContext();

  return useMutation<ByNodeName<Uuid>, Error, RunQueryRequest>({
    mutationFn: async (body: RunQueryRequest) => {
      if (!hasCollection) {
        throw new Error("Collection not found. Please create one first.");
      }

      log("Executing query...", body);
      const resultsByNode = await nillionClient.runQuery(body, {
        auth: { invocations: nildbTokens },
      });

      // Extract just the run id from each node's response
      const runIds = Object.entries(resultsByNode).reduce(
        (acc, [node, result]) => {
          acc[node] = result.data;
          return acc;
        },
        {} as ByNodeName<Uuid>,
      );

      log("✅ Query run started.", runIds);
      return runIds;
    },
    ...options,
  });
};
