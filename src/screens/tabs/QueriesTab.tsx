import { Button } from "@/components/ui/Button";

export function QueriesTab() {
  return (
    <section className="flex flex-col h-full gap-2">
      <div className="flex-grow border border-border p-4 bg-code-bg overflow-auto shadow-[0_0_20px_rgba(180,190,254,0.15)]">
        <p className="text-heading-secondary">Query results will appear here.</p>
      </div>
      <div className="border border-border rounded-md bg-code-bg p-3 flex justify-end">
        <Button disabled className="w-auto px-6">
          Run Query
        </Button>
      </div>
    </section>
  );
}
