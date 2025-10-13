import { AppFooter } from "@/components/layouts/AppFooter";
import { AppHeader } from "@/components/layouts/AppHeader";
import { TerminalLog } from "@/components/terminal/TerminalLog";
import { Tabs } from "@/components/ui/Tabs";

export function InitializationScreen() {
  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto w-full">
      <AppHeader title="nillion://secret_vault_initialization" />

      <div className="flex-shrink-0 px-8 pt-6">
        <Tabs tabs={["🏠 Home"]} activeTab={0} setActiveTab={() => {}} disabled />
      </div>

      <div className="flex flex-col flex-grow min-h-0 px-8 pt-6 pb-8">
        {/* Main Content: Terminal Log */}
        <div className="flex-grow min-h-0">
          <TerminalLog />
        </div>

        {/* Bottom Pane: Placeholder Content */}
        <div className="flex-shrink-0 mt-8 border border-border bg-panel-bg">
          <div className="p-4">
            <p className="text-heading-secondary">Initializing...</p>
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
