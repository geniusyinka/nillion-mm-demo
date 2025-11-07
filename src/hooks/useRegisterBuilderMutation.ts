import type { SecretVaultBuilderClient } from "@nillion/secretvaults";
import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";

type RegisterBuilderResult = Awaited<ReturnType<SecretVaultBuilderClient["register"]>>;

export const useRegisterBuilderMutation = (
  options?: Omit<UseMutationOptions<RegisterBuilderResult, Error, void>, "mutationKey" | "mutationFn">,
) => {
  const clientData = useNillionClient();
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationKey: ["registerBuilder"],
    mutationFn: async () => {
      if (!clientData) {
        throw new Error("Nillion client not initialized");
      }
      const { nillionClient } = clientData;
      const did = await nillionClient.getId();
      return await nillionClient.register({
        did,
        name: "Demo Builder",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["builderProfile"] }),
  });
};
