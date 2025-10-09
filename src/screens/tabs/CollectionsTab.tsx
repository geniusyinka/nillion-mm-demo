import { Button } from "@/components/ui/Button";
import { useLogContext } from "@/context/LogContext";
import { useCreateCollectionMutation } from "@/hooks/useCreateCollectionMutation";
import { useDeleteCollectionMutation } from "@/hooks/useDeleteCollectionMutation";
import { useProfile } from "@/hooks/useProfile";
import { useReadCollectionQuery } from "@/hooks/useReadCollectionQuery";

export function CollectionsTab() {
  const { log } = useLogContext();
  const { isRegistered, hasCollection, collectionId } = useProfile();

  const { refetch: getCollection } = useReadCollectionQuery(collectionId);

  const createCollectionMutation = useCreateCollectionMutation({
    onSuccess: (newId) => log("✅ Collection created.", { collectionId: newId }),
    onError: (err) => log("❌ Collection creation failed.", err.message),
  });

  const deleteCollectionMutation = useDeleteCollectionMutation({
    onSuccess: () => log("✅ Collection deleted."),
    onError: (err) => log("❌ Collection deletion failed.", err.message),
  });

  const handleGetCollection = async () => {
    log("Fetching collection...");
    const result = await getCollection();
    result.isError ? log("❌ Error", result.error.message) : log("✅ Success", result.data);
  };

  const isLoading = createCollectionMutation.isPending || deleteCollectionMutation.isPending;

  if (!isRegistered) {
    return <p className="text-heading-secondary">Register a builder in the 'Home' tab to manage collections.</p>;
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0 text-base text-heading-secondary uppercase">Collection Management</h3>

      <Button onClick={() => createCollectionMutation.mutate()} disabled={isLoading || hasCollection} className="py-2">
        {hasCollection ? "Collection Created" : "Create Collection"}
      </Button>

      {hasCollection && (
        <>
          <Button onClick={handleGetCollection} disabled={isLoading} className="py-2">
            Read Collection Metadata
          </Button>
          <Button
            onClick={() => collectionId && deleteCollectionMutation.mutate(collectionId)}
            disabled={isLoading}
            className="py-2 bg-red-900/50 text-red-300 border-red-500/50 hover:bg-red-800/50 disabled:hover:bg-red-900/50"
          >
            Delete Collection
          </Button>
        </>
      )}
    </section>
  );
}
