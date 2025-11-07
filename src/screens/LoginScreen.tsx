import { Button } from "@/components/ui/Button";
import { useNillion } from "@/hooks/useNillion";
import { useState } from "react";

function Step({
  label,
  status,
  action,
  actionLabel,
  content,
}: {
  label: string;
  status: "pending" | "loading" | "done";
  action?: () => void;
  actionLabel?: string;
  content?: string;
}) {
  const statusIndicator =
    status === "loading" ? "text-warning" : status === "done" ? "text-success" : "text-heading-secondary";

  return (
    <>
      <tr className="border-b border-border">
        <td className={`p-3 font-semibold whitespace-nowrap ${statusIndicator}`}>{label}</td>
        <td className="p-3 text-right">
          {status !== "done" && action && (
            <Button onClick={action} className="w-auto px-3 py-1 text-sm">
              {status === "loading" ? "Connecting..." : actionLabel}
            </Button>
          )}
        </td>
      </tr>
      {status === "done" && content && (
        <tr className="border-b border-border">
          <td colSpan={2} className="px-3 py-2">
            <div className="text-xs font-mono text-heading-secondary break-all">{content}</div>
          </td>
        </tr>
      )}
    </>
  );
}

export function LoginScreen() {
  const { state, connectMetaMask } = useNillion();
  const { wallets } = state;
  const [mmLoading, setMmLoading] = useState(false);

  const onConnectMM = async () => {
    if (wallets.isMetaMaskConnected || mmLoading) return;
    setMmLoading(true);
    try {
      await connectMetaMask();
    } finally {
      setMmLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-lg p-8 border border-border bg-panel-bg shadow-[0_0_20px_rgba(180,190,254,0.1)]">
        <h1 className="text-2xl font-bold tracking-wider text-center mb-6 text-accent">nillion://passwordless_notes</h1>
        <p className="text-sm text-center mb-6 text-heading-secondary">
          Connect your MetaMask wallet to access your secure notes.
        </p>
        <table className="w-full border-collapse table-fixed">
          <tbody>
            <Step
              label="MetaMask Wallet"
              status={wallets.isMetaMaskConnected ? "done" : mmLoading ? "loading" : "pending"}
              action={onConnectMM}
              actionLabel="Connect MetaMask"
              content={state.did || ""}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
