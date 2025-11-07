import { useQuery } from "@tanstack/react-query";
import { useNillionClient } from "../useNillionClient";
import { useNillion } from "../useNillion";
import { useNotesCollection } from "./useNotesCollection";

export interface Note {
  _id: string;
  walletAddress: string;
  title: string;
  content: { "%allot": string };
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook to fetch all notes for the current wallet.
 */
export function useNotes() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const walletAddress = state.wallets.metaMaskAddress;
  const { data: collectionId } = useNotesCollection();

  return useQuery({
    queryKey: ["notes", walletAddress],
    queryFn: async () => {
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

      // Fetch all notes and filter by walletAddress
      const result = await nillionClient.findData(
        {
          collection: collectionId,
          filter: {
            walletAddress: walletAddress.toLowerCase(),
          },
          pagination: { offset: 0, limit: 1000 }, // Get all notes
        },
        { auth: { invocations: nildbTokens } },
      );

      // Parse the content from encrypted format
      const notes: Note[] = (result.data || []).map((record: any) => ({
        ...record,
        content: record.content || { "%allot": "" },
      }));

      // Sort by updatedAt descending
      return notes.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return dateB - dateA;
      });
    },
    enabled: !!collectionId && !!walletAddress && !!clientResult,
  });
}





