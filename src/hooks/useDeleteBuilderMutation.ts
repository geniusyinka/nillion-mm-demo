import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useNillion } from "./useNillion";
import { useNillionClient } from "./useNillionClient";

export const useDeleteBuilderMutation = (
  options?: Omit<UseMutationOptions<void, Error, void>, "mutationKey" | "mutationFn">,
) => {
  const { nillionClient } = useNillionClient();
  const { state, logout } = useNillion();

  return useMutation({
    ...options,
    mutationKey: ["deleteBuilder"],
    mutationFn: async () => {
      if (!state.signer) {
        throw new Error("Signer not available");
      }

      // don't override auth here to force a MM signature
      await nillionClient.deleteBuilder();
    },
    onSuccess: async (data, variables, context, mutation) => {
      logout();
      await options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
