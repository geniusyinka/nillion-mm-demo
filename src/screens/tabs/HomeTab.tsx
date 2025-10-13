import { Button } from "@/components/ui/Button";
import { useDeleteBuilderMutation } from "@/hooks/useDeleteBuilderMutation";
import { useNillion } from "@/hooks/useNillion";
import { useProfile } from "@/hooks/useProfile";

function ProfileItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex border-b border-border last:border-b-0">
      <span className="w-1/3 py-2 px-3 bg-panel-bg font-semibold">{label}</span>
      <span className="w-2/3 py-2 px-3 font-mono break-all">{value}</span>
    </div>
  );
}

export function HomeTab() {
  const { state } = useNillion();
  const { profile } = useProfile();
  const deleteBuilder = useDeleteBuilderMutation();

  const handleDeleteAccount = () => {
    deleteBuilder.mutate();
  };

  return (
    <section className="flex flex-col h-full gap-2">
      <div className="flex-grow overflow-auto">
        <div>
          <h3 className="m-0 mb-2 text-base text-heading-secondary uppercase">Builder Profile</h3>
          <div className="border border-border bg-code-bg text-sm">
            <ProfileItem label="Id" value={state.did || "N/A"} />
            <ProfileItem label="Name" value={profile?.name || "N/A"} />
            <ProfileItem label="Collections" value={profile?.collections.length || 0} />
            <ProfileItem label="Queries" value={profile?.queries.length || 0} />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-md bg-code-bg p-3 flex justify-end gap-2">
        <Button
          onClick={handleDeleteAccount}
          disabled={!profile || deleteBuilder.isPending}
          className="w-auto px-6 bg-red-900/50 text-red-300 border-red-500/50 hover:bg-red-800/50 disabled:hover:bg-red-900/50"
        >
          {deleteBuilder.isPending ? "Deleting..." : "Delete Account"}
        </Button>
      </div>
    </section>
  );
}
