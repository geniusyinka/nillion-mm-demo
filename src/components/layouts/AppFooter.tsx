import { StatusIndicators } from "@/components/ui/StatusIndicators";
import { truncateDid } from "@/utils/text";

interface AppFooterProps {
  did: string;
  subscriptionStatus: "unknown" | "inactive" | "active";
  registrationStatus: "unknown" | "inactive" | "active";
  expiresAt: number | undefined;
  onLogout: () => void;
}

export function AppFooter({ did, subscriptionStatus, registrationStatus, expiresAt, onLogout }: AppFooterProps) {
  return (
    <footer className="flex justify-between items-center bg-zinc-900 border-t border-border text-sm p-3 flex-shrink-0">
      <div className="flex items-center gap-4 text-foreground/80">
        <span>{did ? `🔑 ${truncateDid(did, 12, 4)}` : ""}</span>
      </div>
      <StatusIndicators
        subscriptionStatus={subscriptionStatus}
        registrationStatus={registrationStatus}
        expiresAt={expiresAt}
        onLogout={onLogout}
      />
    </footer>
  );
}
