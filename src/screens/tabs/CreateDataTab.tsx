import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLogContext } from "@/context/LogContext";
import { useCreateStandardDataMutation } from "@/hooks/useCreateStandardDataMutation";
import { useProfile } from "@/hooks/useProfile";

export function CreateDataTab() {
  const { hasCollection } = useProfile();
  const { log } = useLogContext();
  const [description, setDescription] = useState("My secret data");
  const [secret, setSecret] = useState("is very secret");
  const createDataMutation = useCreateStandardDataMutation();
  const descriptionId = useId();
  const secretId = useId();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record = {
      _id: crypto.randomUUID(),
      description,
      secret: { "%allot": secret },
    };
    log("Creating data record...", { recordId: record._id });
    createDataMutation.mutate([record], {
      onSuccess: () => log("✅ Data record created.", { recordId: record._id }),
      onError: (err) => log("❌ Data creation failed", err.message),
    });
  };

  if (!hasCollection) {
    return <p className="text-heading-secondary">Create a collection in the Collections tab to manage data.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full gap-2">
      <h3 className="m-0 text-base text-heading-secondary uppercase">Create Data</h3>
      <div className="flex-grow border border-border p-4 bg-code-bg overflow-auto mt-2">
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="flex flex-col gap-2">
            <label htmlFor={descriptionId} className="text-sm font-medium text-heading-secondary">
              Description
            </label>
            <input
              id={descriptionId}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-button-bg border border-border p-3 text-foreground"
              placeholder="Enter a description for your data"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={secretId} className="text-sm font-medium text-heading-secondary">
              Secret
            </label>
            <input
              id={secretId}
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="bg-button-bg border border-border p-3 text-foreground"
              placeholder="Enter your secret data"
            />
          </div>
        </div>
      </div>
      <div className="border border-border rounded-md bg-code-bg p-3 flex justify-end">
        <Button type="submit" disabled={createDataMutation.isPending} className="w-auto px-6">
          {createDataMutation.isPending ? "Creating..." : "Create Record"}
        </Button>
      </div>
    </form>
  );
}
