import type { CreateCollectionRequest } from "@nillion/secretvaults";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNillionClient } from "../useNillionClient";
import { useProfile } from "../useProfile";
import { useNillion } from "../useNillion";

// Schema for notes collection
const NOTES_COLLECTION_SCHEMA: Omit<CreateCollectionRequest, "_id"> = {
  type: "standard",
  name: "notes",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "array",
    uniqueItems: true,
    items: {
      type: "object",
      properties: {
        _id: { type: "string", format: "uuid" },
        walletAddress: { type: "string" },
        title: { type: "string" },
        content: {
          type: "object",
          properties: { "%allot": { type: "string" } },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
      required: ["_id", "walletAddress", "title", "content", "createdAt", "updatedAt"],
    },
  },
};

const NOTES_COLLECTION_ID_KEY = "notes_collection_id";

/**
 * Hook to get or create the notes collection ID.
 * Uses localStorage to persist the collection ID per wallet.
 */
export function useNotesCollection() {
  const clientResult = useNillionClient();
  const { state } = useNillion();
  const { isRegistered } = useProfile();
  const walletAddress = state.wallets.metaMaskAddress;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["notesCollection", walletAddress],
    queryFn: async () => {
      if (!clientResult) {
        throw new Error("Nillion client not available");
      }
      const { nillionClient, nildbTokens } = clientResult;

      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }
      if (!isRegistered) {
        throw new Error("Builder profile not registered");
      }

      // Check localStorage for existing collection ID for this wallet
      const storageKey = `${NOTES_COLLECTION_ID_KEY}_${walletAddress.toLowerCase()}`;
      const storedId = localStorage.getItem(storageKey);

      if (storedId) {
        // Verify collection still exists by trying to read it
        try {
          await nillionClient.readCollection(storedId, {
            auth: { invocations: nildbTokens },
          });
          return storedId;
        } catch {
          // Collection doesn't exist, create a new one
          localStorage.removeItem(storageKey);
        }
      }

      // Create new collection with notes schema
      const collectionId = crypto.randomUUID();
      await nillionClient.createCollection(
        {
          _id: collectionId,
          ...NOTES_COLLECTION_SCHEMA,
        },
        { auth: { invocations: nildbTokens } },
      );

      // Store in localStorage
      localStorage.setItem(storageKey, collectionId);

      // Invalidate profile to update collections list
      queryClient.invalidateQueries({ queryKey: ["builderProfile"] });

      return collectionId;
    },
    enabled: !!walletAddress && isRegistered && !!clientResult,
    staleTime: Infinity, // Collection ID doesn't change once created
  });
}

