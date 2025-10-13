import { useState } from "react";
import { Loading } from "@/components/ui/Loading";
import { Pagination } from "@/components/ui/Pagination";
import { useFindDataQuery } from "@/hooks/useFindDataQuery";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import { useProfile } from "@/hooks/useProfile";

export function ReadDataTab() {
  const { hasCollection } = useProfile();
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const { data, isLoading, isError, error } = useFindDataQuery(offset, limit);
  const showLoading = useMinimumLoadingTime(isLoading, 500);

  if (!hasCollection) {
    return <p className="text-heading-secondary">Create a collection in the 'Collections' tab to manage data.</p>;
  }

  const total = data?.pagination.total || 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const handlePrevious = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const handleNext = () => {
    if (offset + limit < total) {
      setOffset((prev) => prev + limit);
    }
  };

  return (
    <section className="flex flex-col h-full gap-2">
      <div className="flex-grow border border-border p-4 bg-code-bg overflow-auto shadow-[0_0_20px_rgba(180,190,254,0.15)]">
        {showLoading && <Loading message="Loading data..." />}
        {!showLoading && isError && <p className="text-red-500">Error: {error.message}</p>}
        {!showLoading && data && (
          <pre
            className="text-[13px] whitespace-pre-wrap animate-in fade-in duration-300 font-mono tracking-wide leading-relaxed"
            style={{ fontVariantLigatures: "none", fontFeatureSettings: '"calt" 0' }}
          >
            {JSON.stringify(data.data, null, 2)}
          </pre>
        )}
      </div>
      {data && (
        <div className="border border-border rounded-md bg-code-bg">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      )}
    </section>
  );
}
