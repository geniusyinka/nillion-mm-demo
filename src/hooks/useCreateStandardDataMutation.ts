import type { CreateStandardDataRequest } from "@nillion/secretvaults";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useProfile } from "./useProfile";

export const useCreateStandardDataMutation = () => {
  const { collectionId } = useProfile();
  const { nillionClient, nildbTokens } = useNillionClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createStandardData"],
    mutationFn: (data: CreateStandardDataRequest["data"]) => {
      if (!collectionId) throw new Error("No collection found");

      return nillionClient.createStandardData(
        {
          collection: collectionId,
          data,
        },
        { auth: { invocations: nildbTokens } },
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["findData"] }),
  });
};
