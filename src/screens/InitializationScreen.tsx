import { AppFooter } from "@/components/layouts/AppFooter";
import { AppHeader } from "@/components/layouts/AppHeader";
import { TerminalLog } from "@/components/terminal/TerminalLog";

export function InitializationScreen() {
  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto w-full">
      <AppHeader title="nillion://passwordless_notes" />

      <div className="flex flex-col flex-grow min-h-0 px-8 pt-6 pb-8">
        {/* Main Content: Terminal Log */}
        <div className="flex-grow min-h-0">
          <TerminalLog />
        </div>

        {/* Bottom Pane: Placeholder Content */}
        <div className="flex-shrink-0 mt-8 border border-border bg-panel-bg">
          <div className="p-4">
            <p className="text-heading-secondary">Initializing notes collection...</p>
          </div>
        </div>
      </div>

      <AppFooter
        did=""
        subscriptionStatus="unknown"
        registrationStatus="unknown"
        expiresAt={undefined}
        onLogout={() => {}}
      />
    </div>
  );
}
