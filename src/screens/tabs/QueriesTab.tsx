import type { ByNodeName, Uuid } from "@nillion/secretvaults";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { DEMO_QUERY_PIPELINE } from "@/config";
import { useCreateQueryMutation } from "@/hooks/useCreateQueryMutation";
import { useDeleteQueryMutation } from "@/hooks/useDeleteQueryMutation";
import { useGetQueriesQuery } from "@/hooks/useGetQueriesQuery";
import { useGetQueryResultsQuery } from "@/hooks/useGetQueryResultsQuery";
import { useMinimumLoadingTime } from "@/hooks/useMinimumLoadingTime";
import { useProfile } from "@/hooks/useProfile";
import { useRunQueryMutation } from "@/hooks/useRunQueryMutation";

export function QueriesTab() {
  const { hasCollection, collectionId } = useProfile();
  const [runIds, setRunIds] = useState<ByNodeName<Uuid> | null>(null);

  // Queries
  const getQueries = useGetQueriesQuery();
  const createQuery = useCreateQueryMutation();
  const deleteQuery = useDeleteQueryMutation();
  const runQuery = useRunQueryMutation({
    onSuccess: (data) => setRunIds(data),
  });

  // Results
  const getResults = useGetQueryResultsQuery(runIds);
  const isPollingResults = useMinimumLoadingTime(getResults.isLoading, 500);

  if (!hasCollection) {
    return <p className="text-heading-secondary">Create a collection and some data to run queries.</p>;
  }

  const queries = getQueries.data?.data || [];
  const query = queries[0]; // Only support a single query
  const hasQuery = !!query;

  const handleCreateQuery = () => {
    createQuery.mutate({
      _id: crypto.randomUUID(),
      collection: collectionId as string,
      name: "Get Oldest/Newest/Count",
      pipeline: DEMO_QUERY_PIPELINE,
      variables: {},
    });
  };

  const handleDeleteQuery = () => {
    if (query) {
      deleteQuery.mutate(query._id);
      setRunIds(null); // Clear results when deleting query
    }
  };

  const handleRunQuery = () => {
    if (query) {
      runQuery.mutate({ _id: query._id, variables: {} });
    }
  };

  return (
    <section className="flex flex-col h-full gap-2">
      {/* Main Content Area - Two Column Grid */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        {/* Query Definition Panel */}
        <div className="border border-border p-4 bg-code-bg shadow-[0_0_20px_rgba(180,190,254,0.15)] flex flex-col overflow-hidden">
          <h3 className="text-sm font-medium text-heading-secondary mb-2">Query Definition</h3>
          <pre className="text-[13px] whitespace-pre-wrap font-mono tracking-wide leading-relaxed p-4 border border-border bg-button-bg flex-grow overflow-auto">
            {hasQuery
              ? JSON.stringify(
                  {
                    name: query.name,
                    collection: query.collection,
                    pipeline: DEMO_QUERY_PIPELINE,
                  },
                  null,
                  2,
                )
              : "No query created. Click 'Create Query' below to get started."}
          </pre>
        </div>

        {/* Query Results Panel */}
        <div className="border border-border p-4 bg-code-bg shadow-[0_0_20px_rgba(180,190,254,0.15)] flex flex-col overflow-hidden">
          <h3 className="text-sm font-medium text-heading-secondary mb-2">Query Results</h3>
          <div className="p-4 border border-border bg-button-bg flex-grow overflow-auto">
            {isPollingResults ? (
              <Loading message="Polling for query results..." />
            ) : getResults.error ? (
              <p className="text-red-500">Error: {getResults.error.message}</p>
            ) : getResults.data ? (
              <pre className="text-[13px] whitespace-pre-wrap animate-in fade-in duration-300 font-mono tracking-wide leading-relaxed">
                {JSON.stringify(getResults.data, null, 2)}
              </pre>
            ) : runIds ? (
              <div>
                <p className="text-sm text-heading-secondary mb-2">Query run started. Polling for results...</p>
                <pre className="text-[13px] whitespace-pre-wrap font-mono tracking-wide leading-relaxed">
                  {JSON.stringify({ runIds }, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-heading-secondary">
                {hasQuery ? "Run the query to see results." : "Create a query to get started."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border border-border rounded-md bg-code-bg p-3 flex justify-end gap-2">
        <Button onClick={handleCreateQuery} disabled={hasQuery || createQuery.isPending} className="w-auto px-6">
          {createQuery.isPending ? "Creating..." : "Create Query"}
        </Button>
        <Button onClick={handleRunQuery} disabled={!hasQuery || runQuery.isPending} className="w-auto px-6">
          {runQuery.isPending ? "Starting..." : "Run Query"}
        </Button>
        <Button
          onClick={handleDeleteQuery}
          disabled={!hasQuery || deleteQuery.isPending}
          className="w-auto px-6 bg-red-900/50 text-red-300 border-red-500/50 hover:bg-red-800/50 disabled:hover:bg-red-900/50"
        >
          {deleteQuery.isPending ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </section>
  );
}
