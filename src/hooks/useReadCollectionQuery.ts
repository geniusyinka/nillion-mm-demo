import { useQuery } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";

export const useReadCollectionQuery = (collectionId: string | null) => {
  const { nillionClient, nildbTokens } = useNillionClient();
  return useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => {
      if (!collectionId) throw new Error("Collection ID is required");
      return nillionClient.readCollection(collectionId, {
        auth: { invocations: nildbTokens },
      });
    },
    enabled: !!collectionId,
    retry: false,
  });
};
