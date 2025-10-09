import { useState } from "react";
import { TerminalLog } from "@/components/terminal/TerminalLog";
import { Tabs } from "@/components/ui/Tabs";
import { CollectionsTab } from "@/screens/tabs/CollectionsTab";
import { CreateDataTab } from "@/screens/tabs/CreateDataTab";
import { HomeTab } from "@/screens/tabs/HomeTab";
import { QueriesTab } from "@/screens/tabs/QueriesTab";
import { ReadDataTab } from "@/screens/tabs/ReadDataTab";

export function Dashboard() {
  const TABS = [
    { name: "🏠 Home", content: <HomeTab /> },
    { name: "📚 Collections", content: <CollectionsTab /> },
    { name: "➕ Create Data", content: <CreateDataTab /> },
    { name: "🔍 Read Data", content: <ReadDataTab /> },
    { name: "❓ Queries", content: <QueriesTab /> },
  ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center py-6 px-8 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wider text-accent">nillion://secret_vault_dashboard</h1>
      </header>

      {/* Main content area */}
      <div className="flex flex-col flex-grow min-h-0 px-8 pb-8">
        {/* Top Pane: Terminal Log */}
        <div className="flex-grow min-h-0">
          <TerminalLog />
        </div>

        {/* Bottom Pane: Controls */}
        <div className="flex-shrink-0 mt-8 border border-border bg-panel-bg">
          {/* Tab Content */}
          <main className="p-4">{TABS[activeTab].content}</main>

          {/* Tab Bar */}
          <div className="bg-code-bg">
            <Tabs tabs={TABS.map((t) => t.name)} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
