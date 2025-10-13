import { useQuery } from "@tanstack/react-query";
import { useNillionClient } from "./useNillionClient";
import { useProfile } from "./useProfile";

export const useGetQueriesQuery = () => {
  const { hasCollection } = useProfile();
  const { nillionClient, nildbTokens } = useNillionClient();
  const collectionId = useProfile().collectionId as string;

  return useQuery({
    queryKey: ["queries", collectionId],
    queryFn: () => {
      return nillionClient.getQueries({
        pagination: { limit: 100, offset: 0 },
        auth: { invocations: nildbTokens },
      });
    },
    enabled: hasCollection,
  });
};
