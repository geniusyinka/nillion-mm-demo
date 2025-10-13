import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";

export const useDeleteCollectionMutation = (
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationKey" | "mutationFn">,
) => {
  const queryClient = useQueryClient();
  const { nillionClient, nildbTokens } = useNillionClient();

  return useMutation({
    ...options,
    mutationKey: ["deleteCollection"],
    mutationFn: async (collectionId: string) => {
      await nillionClient.deleteCollection(collectionId, {
        auth: { invocations: nildbTokens },
      });
    },
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
