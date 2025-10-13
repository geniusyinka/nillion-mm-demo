import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { useLogContext } from "@/context/LogContext";
import { useCreateCollectionMutation } from "@/hooks/useCreateCollectionMutation";
import { useDeleteCollectionMutation } from "@/hooks/useDeleteCollectionMutation";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import { useProfile } from "@/hooks/useProfile";
import { useReadCollectionQuery } from "@/hooks/useReadCollectionQuery";

export function CollectionsTab() {
  const { log } = useLogContext();
  const { isRegistered, hasCollection, collectionId } = useProfile();

  const {
    data: collectionMetadata,
    isLoading: isLoadingMetadata,
    error: metadataError,
  } = useReadCollectionQuery(collectionId);

  const showLoading = useMinimumLoadingTime(isLoadingMetadata, 500);

  const createCollectionMutation = useCreateCollectionMutation({
    onSuccess: (newId) => log("✅ Collection created.", { collectionId: newId }),
    onError: (err) => log("❌ Collection creation failed.", err.message),
  });

  const deleteCollectionMutation = useDeleteCollectionMutation({
    onSuccess: () => log("✅ Collection deleted."),
    onError: (err) => log("❌ Collection deletion failed.", err.message),
  });

  const isLoading = createCollectionMutation.isPending || deleteCollectionMutation.isPending;

  if (!isRegistered) {
    return <p className="text-heading-secondary">Register a builder in the Home tab to manage collections.</p>;
  }

  return (
    <section className="flex flex-col h-full gap-2">
      <div className="flex-grow border border-border p-4 bg-code-bg overflow-auto shadow-[0_0_20px_rgba(180,190,254,0.15)]">
        {!hasCollection ? (
          <p className="text-heading-secondary">No collection exists. Create one to get started.</p>
        ) : showLoading ? (
          <Loading message="Loading collection metadata..." />
        ) : metadataError ? (
          <p className="text-red-500">Error loading collection metadata: {metadataError.message}</p>
        ) : collectionMetadata ? (
          <pre
            className="text-[13px] whitespace-pre-wrap animate-in fade-in duration-300 font-mono tracking-wide leading-relaxed"
            style={{ fontVariantLigatures: "none", fontFeatureSettings: '"calt" 0' }}
          >
            {JSON.stringify(collectionMetadata.data, null, 2)}
          </pre>
        ) : null}
      </div>
      <div className="border border-border rounded-md bg-code-bg p-3 flex justify-end gap-3">
        <Button
          onClick={() => createCollectionMutation.mutate()}
          disabled={isLoading || hasCollection}
          className="w-auto px-6"
        >
          Create Collection
        </Button>
        {hasCollection && (
          <Button
            onClick={() => collectionId && deleteCollectionMutation.mutate(collectionId)}
            disabled={isLoading}
            className="w-auto px-6 bg-red-900/50 text-red-300 border-red-500/50 hover:bg-red-800/50 disabled:hover:bg-red-900/50"
          >
            Delete Collection
          </Button>
        )}
      </div>
    </section>
  );
}
