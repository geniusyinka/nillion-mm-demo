import type { CreateCollectionRequest } from "@nillion/secretvaults";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DEMO_COLLECTION_PAYLOAD } from "@/config";
import { useNillionClient } from "./useNillionClient";

export const useCreateCollectionMutation = (
  options?: Omit<UseMutationOptions<string, Error, void>, "mutationKey" | "mutationFn">,
) => {
  const queryClient = useQueryClient();
  const { nillionClient, nildbTokens } = useNillionClient();

  return useMutation({
    mutationKey: ["createCollection"],
    mutationFn: async () => {
      const newId = crypto.randomUUID();
      await nillionClient.createCollection(
        {
          _id: newId,
          ...(DEMO_COLLECTION_PAYLOAD as Omit<CreateCollectionRequest, "_id">),
        },
        { auth: { invocations: nildbTokens } },
      );
      return newId;
    },
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ["builderProfile"] });
      await options?.onSuccess?.(data, variables, context, mutation);
    },
    ...options,
  });
};
