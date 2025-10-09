import { useEffect, useRef } from "react";
import { useLogContext } from "@/context/LogContext";
import { useCheckSubscriptionQuery } from "@/hooks/useCheckSubscriptionQuery";
import { useNillion } from "@/hooks/useNillion";
import { useProfile } from "@/hooks/useProfile";
import { truncateDid } from "@/utils/text";

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

interface PowerlineHeaderProps {
  did: string;
  subscriptionStatus: "unknown" | "inactive" | "active";
  registrationStatus: "unknown" | "inactive" | "active";
  expiresAt: number | undefined;
  onLogout: () => void;
}

function PowerlineHeader({ did, subscriptionStatus, registrationStatus, expiresAt, onLogout }: PowerlineHeaderProps) {
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
        return "bg-green-500";
      case "inactive":
        return "bg-red-500";
      case "unknown":
        return "bg-warning";
    }
  };

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
    <div className="flex justify-between items-center bg-zinc-900 border-b border-border text-sm px-3 py-1">
      {/* Left side */}
      <div className="flex items-center gap-4 text-foreground/80">
        <span>{did ? `🔑 ${truncateDid(did, 12, 4)}` : ""}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 font-mono">
        <span className="flex items-center gap-1.5" title={subscriptionTooltip}>
          <span className="text-foreground/60">S</span>
          <span className={`w-2 h-2 rounded-full ${getStatusColor(subscriptionStatus)}`} />
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1.5" title={registrationTooltip}>
          <span className="text-foreground/60">R</span>
          <span className={`w-2 h-2 rounded-full ${getStatusColor(registrationStatus)}`} />
        </span>
        <button
          onClick={onLogout}
          type="button"
          className="font-mono text-red-400 hover:text-red-200 pl-2"
          title="Logout"
        >
          [X]
        </button>
      </div>
    </div>
  );
}

export function TerminalLog() {
  const { logs } = useLogContext();
  const logContainerRef = useRef<HTMLPreElement>(null);

  const { state: nillionState, logout } = useNillion();
  const { isRegistered } = useProfile();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useCheckSubscriptionQuery();

  // biome-ignore lint/correctness/useExhaustiveDependencies: Auto-scroll needs to run on every log change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Determine subscription status: unknown, inactive, or active
  const subscriptionStatus: "unknown" | "inactive" | "active" =
    isSubscriptionLoading || !subscriptionData ? "unknown" : subscriptionData.subscribed ? "active" : "inactive";

  // Determine registration status: unknown, inactive, or active
  const registrationStatus: "unknown" | "inactive" | "active" = !nillionState.did
    ? "unknown"
    : isRegistered
      ? "active"
      : "inactive";

  const did = nillionState.did || "";
  const expiresAt = subscriptionData?.details?.expiresAt;

  return (
    <section className="border border-border p-0 h-full max-h-full flex flex-col bg-code-bg shadow-[0_0_20px_rgba(180,190,254,0.15)]">
      <PowerlineHeader
        did={did}
        subscriptionStatus={subscriptionStatus}
        registrationStatus={registrationStatus}
        expiresAt={expiresAt}
        onLogout={logout}
      />
      <pre
        ref={logContainerRef}
        className="p-3 flex-grow overflow-y-auto whitespace-pre-wrap break-all text-sm font-mono"
        style={{ lineHeight: "1.2" }}
      >
        {logs.join("\n")}
        {"\n> "}
        <span className="animate-blink">█</span>
      </pre>
    </section>
  );
}
