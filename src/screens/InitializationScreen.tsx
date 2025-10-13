import { TerminalLog } from "@/components/terminal/TerminalLog";
import { Tabs } from "@/components/ui/Tabs";

export function InitializationScreen() {
  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center py-6 px-8 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wider text-accent">nillion://secret_vault_initialization</h1>
      </header>

      <div className="flex flex-col flex-grow min-h-0 px-8 pb-8">
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

        {/* Tab Bar (Footer) - Disabled */}
        <div className="flex-shrink-0 mt-8 border border-border bg-code-bg">
          <Tabs tabs={["🏠 Home"]} activeTab={0} setActiveTab={() => {}} disabled />
        </div>
      </div>
    </div>
  );
}
