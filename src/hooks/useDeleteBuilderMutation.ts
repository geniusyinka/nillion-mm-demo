import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillion } from "./useNillion";
import { useNillionClient } from "./useNillionClient";
import { usePersistedConnection } from "./usePersistedConnection";

export const useDeleteBuilderMutation = (
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationKey" | "mutationFn">,
) => {
  const queryClient = useQueryClient();
  const { nillionClient } = useNillionClient();
  const { state } = useNillion();
  const { clearAll } = usePersistedConnection();

  return useMutation({
    mutationKey: ["deleteBuilder"],
    mutationFn: async () => {
      if (!state.signer) {
        throw new Error("Signer not available");
      }

      await nillionClient.deleteBuilder();
    },
    onSuccess: async (data, variables, context, mutation) => {
      // Clear stored session data
      clearAll();
      queryClient.clear();
      await options?.onSuccess?.(data, variables, context, mutation);
    },
    ...options,
  });
};
