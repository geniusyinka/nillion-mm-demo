import { useBuilderProfileQuery } from "./useBuilderProfileQuery";

export function useProfile() {
  const { data: profileData, ...query } = useBuilderProfileQuery();

  const profile = profileData?.data || null;
  const isRegistered = !!profile;
  const collections = profile?.collections || [];
  const hasCollection = collections.length > 0;
  const collectionId = hasCollection ? collections[0] : null;

  return {
    profile,
    isRegistered,
    collections,
    hasCollection,
    collectionId,
    ...query,
  };
}
