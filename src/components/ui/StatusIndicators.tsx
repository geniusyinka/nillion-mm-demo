import { Tooltip } from "@/components/ui/Tooltip";

interface StatusIndicatorsProps {
  subscriptionStatus: "unknown" | "inactive" | "active";
  registrationStatus: "unknown" | "inactive" | "active";
  expiresAt: number | undefined;
  onLogout: () => void;
}

const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffSeconds = Math.round((timestamp - now) / 1000);

  if (diffSeconds < 0) {
    return "expired";
  }
  const diffDays = Math.floor(diffSeconds / (60 * 60 * 24));
  if (diffDays > 1) return `in ${diffDays} days`;
  if (diffDays === 1) return "in 1 day";
  const diffHours = Math.floor(diffSeconds / (60 * 60));
  if (diffHours > 1) return `in ${diffHours} hours`;
  return "soon";
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: "unknown" | "inactive" | "active") => {
  switch (status) {
    case "active":
      return "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse";
    case "inactive":
      return "bg-red-500";
    case "unknown":
      return "bg-warning shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-pulse";
  }
};

export function StatusIndicators({
  subscriptionStatus,
  registrationStatus,
  expiresAt,
  onLogout,
}: StatusIndicatorsProps) {
  const subscriptionTooltip =
    subscriptionStatus === "active"
      ? `Subscription active${expiresAt ? ` - expires ${formatDate(expiresAt)} (${getRelativeTime(expiresAt)})` : ""}`
      : subscriptionStatus === "inactive"
        ? "Subscription inactive"
        : "Checking subscription status...";

  const registrationTooltip =
    registrationStatus === "active"
      ? "Builder registered with NilDB cluster"
      : registrationStatus === "inactive"
        ? "Builder not registered"
        : "Checking registration status...";

  return (
    <div className="flex items-center gap-3 font-mono">
      <Tooltip content={subscriptionTooltip}>
        <span className="flex items-center gap-1.5">
          <span className="text-foreground/60">S</span>
          <span className={`w-2 h-2 rounded-full ${getStatusColor(subscriptionStatus)}`} />
        </span>
      </Tooltip>
      <span className="text-border">|</span>
      <Tooltip content={registrationTooltip}>
        <span className="flex items-center gap-1.5">
          <span className="text-foreground/60">R</span>
          <span className={`w-2 h-2 rounded-full ${getStatusColor(registrationStatus)}`} />
        </span>
      </Tooltip>
      <Tooltip content="Logout">
        <button
          onClick={onLogout}
          type="button"
          className="font-mono text-red-400 hover:text-red-200 hover:scale-110 active:scale-95 pl-2 transition-all duration-150 cursor-pointer"
        >
          [X]
        </button>
      </Tooltip>
    </div>
  );
}
