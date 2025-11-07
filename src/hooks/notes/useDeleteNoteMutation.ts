import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "../useNillionClient";
import { useNillion } from "../useNillion";
import { useNotesCollection } from "./useNotesCollection";

export function useDeleteNoteMutation() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const walletAddress = state.wallets.metaMaskAddress;
  const { data: collectionId } = useNotesCollection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteNote"],
    mutationFn: async (noteId: string) => {
      if (!clientResult) {
        throw new Error("Nillion client not available");
      }
      const { nillionClient, nildbTokens } = clientResult;

      if (!collectionId) {
        throw new Error("Collection not ready");
      }
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }

      await nillionClient.deleteData(
        {
          collection: collectionId,
          filter: {
            _id: noteId,
            walletAddress: walletAddress.toLowerCase(),
          },
        },
        { auth: { invocations: nildbTokens } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", walletAddress] });
    },
  });
}





