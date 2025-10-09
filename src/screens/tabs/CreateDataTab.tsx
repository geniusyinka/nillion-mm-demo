import { useState } from "react";
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

  if (!hasCollection) {
    return <p className="text-heading-secondary">Create a collection in the 'Collections' tab to manage data.</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    log("Creating data record...");
    const record = {
      _id: crypto.randomUUID(),
      description,
      secret: { "%allot": secret },
    };
    createDataMutation.mutate([record], {
      onSuccess: () => log("✅ Data record created."),
      onError: (err) => log("❌ Data creation failed", err.message),
    });
  };

  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0 text-base text-heading-secondary uppercase">Create Data Record</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-button-bg border border-border p-2"
          placeholder="Description"
        />
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="bg-button-bg border border-border p-2"
          placeholder="Secret"
        />
        <Button type="submit" disabled={createDataMutation.isPending} className="py-2">
          {createDataMutation.isPending ? "Creating..." : "Create Record"}
        </Button>
      </form>
    </section>
  );
}
