import type { CreateQueryRequest } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";

export const useCreateQueryMutation = () => {
  const { nillionClient, nildbTokens } = useNillionClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (query: CreateQueryRequest) => {
      return nillionClient.createQuery(query, {
        auth: { invocations: nildbTokens },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queries"] });
    },
  });
};
