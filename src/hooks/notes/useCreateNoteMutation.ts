import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "../useNillionClient";
import { useNillion } from "../useNillion";
import { useNotesCollection } from "./useNotesCollection";
import type { Note } from "./useNotes";

export interface CreateNoteInput {
  title: string;
  content: string;
}

export function useCreateNoteMutation() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const walletAddress = state.wallets.metaMaskAddress;
  const { data: collectionId } = useNotesCollection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createNote"],
    mutationFn: async (input: CreateNoteInput) => {
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

      const now = new Date().toISOString();
      const note: Note = {
        _id: crypto.randomUUID(),
        walletAddress: walletAddress.toLowerCase(),
        title: input.title,
        content: { "%allot": input.content },
        createdAt: now,
        updatedAt: now,
      };

      await nillionClient.createStandardData(
        {
          collection: collectionId,
          data: [note as unknown as Record<string, unknown>],
        },
        { auth: { invocations: nildbTokens } },
      );

      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", walletAddress] });
    },
  });
}





