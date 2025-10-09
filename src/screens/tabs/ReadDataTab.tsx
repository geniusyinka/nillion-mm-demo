import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useFindDataQuery } from "@/hooks/useFindDataQuery";
import { useProfile } from "@/hooks/useProfile";

export function ReadDataTab() {
  const { hasCollection } = useProfile();
  const [offset, setOffset] = useState(0);
  const limit = 5;
  const { data, isLoading, isError, error } = useFindDataQuery(offset, limit);

  if (!hasCollection) {
    return <p className="text-heading-secondary">Create a collection in the 'Collections' tab to manage data.</p>;
  }

  const total = data?.pagination.total || 0;
  const canGoNext = offset + limit < total;
  const canGoPrev = offset > 0;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0 text-base text-heading-secondary uppercase">Read Collection Data</h3>
      <div className="border border-border p-2 bg-code-bg min-h-[200px] mt-2">
        {isLoading && <p>Loading data...</p>}
        {isError && <p className="text-red-500">Error: {error.message}</p>}
        {data && (
          <div>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(data.data, null, 2)}</pre>
            <div className="flex justify-between items-center mt-2 text-sm">
              <Button
                onClick={() => setOffset((p) => Math.max(0, p - limit))}
                disabled={!canGoPrev || isLoading}
                className="w-auto px-3 py-1"
              >
                Previous
              </Button>
              <span>
                {offset + 1} - {Math.min(offset + limit, total)} of {total}
              </span>
              <Button
                onClick={() => setOffset((p) => p + limit)}
                disabled={!canGoNext || isLoading}
                className="w-auto px-3 py-1"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
