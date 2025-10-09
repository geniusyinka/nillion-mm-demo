import { useQuery } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useProfile } from "./useProfile";

export const useFindDataQuery = (offset: number, limit: number) => {
  const { collectionId } = useProfile();
  const { nillionClient, nildbTokens } = useNillionClient();

  return useQuery({
    queryKey: ["findData", collectionId, offset, limit],
    queryFn: () => {
      if (!collectionId) {
        throw new Error("Client or collection not ready");
      }
      return nillionClient.findData(
        {
          collection: collectionId,
          filter: {},
          pagination: { offset, limit },
        },
        { auth: { invocations: nildbTokens } },
      );
    },
    enabled: !!collectionId,
  });
};
