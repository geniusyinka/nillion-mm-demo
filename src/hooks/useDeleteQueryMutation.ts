import type { Uuid } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";

export const useDeleteQueryMutation = () => {
  const { nillionClient, nildbTokens } = useNillionClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queryId: Uuid) => {
      return nillionClient.deleteQuery(queryId, {
        auth: { invocations: nildbTokens },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queries"] });
    },
  });
};
