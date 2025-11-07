import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "../useNillionClient";
import { useNillion } from "../useNillion";
import { useNotesCollection } from "./useNotesCollection";
import type { Note } from "./useNotes";

export interface UpdateNoteInput {
  id: string;
  title: string;
  content: string;
}

export function useUpdateNoteMutation() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const walletAddress = state.wallets.metaMaskAddress;
  const { data: collectionId } = useNotesCollection();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateNote"],
    mutationFn: async (input: UpdateNoteInput) => {
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

      // First, fetch the existing note to preserve createdAt
      const result = await nillionClient.findData(
        {
          collection: collectionId,
          filter: {
            _id: input.id,
            walletAddress: walletAddress.toLowerCase(),
          },
          pagination: { offset: 0, limit: 1 },
        },
        { auth: { invocations: nildbTokens } },
      );

      const existingNote = result.data?.[0] as unknown as Note | undefined;
      if (!existingNote) {
        throw new Error("Note not found");
      }

      const updatedNote: Note = {
        ...existingNote,
        title: input.title,
        content: { "%allot": input.content },
        updatedAt: new Date().toISOString(),
      };

      // Update by deleting old and creating new (NILDB doesn't have direct update)
      await nillionClient.deleteData(
        {
          collection: collectionId,
          filter: { _id: input.id },
        },
        { auth: { invocations: nildbTokens } },
      );

      await nillionClient.createStandardData(
        {
          collection: collectionId,
          data: [updatedNote as unknown as Record<string, unknown>],
        },
        { auth: { invocations: nildbTokens } },
      );

      return updatedNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", walletAddress] });
    },
  });
}





