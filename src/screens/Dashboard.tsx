import { useEffect, useState } from "react";
import { TerminalLog } from "@/components/terminal/TerminalLog";
import { Tabs } from "@/components/ui/Tabs";
import { CollectionsTab } from "@/screens/tabs/CollectionsTab";
import { CreateDataTab } from "@/screens/tabs/CreateDataTab";
import { HomeTab } from "@/screens/tabs/HomeTab";
import { QueriesTab } from "@/screens/tabs/QueriesTab";
import { ReadDataTab } from "@/screens/tabs/ReadDataTab";

const TABS = [
  { name: "🏠 Home", id: "home", content: <HomeTab /> },
  { name: "📚 Collections", id: "collections", content: <CollectionsTab /> },
  { name: "➕ Create Data", id: "create", content: <CreateDataTab /> },
  { name: "🔍 Read Data", id: "read", content: <ReadDataTab /> },
  { name: "❓ Queries", id: "queries", content: <QueriesTab /> },
];

function getTabIndexFromUrl(): number {
  const params = new URLSearchParams(window.location.search);
  const tabId = params.get("tab");
  if (!tabId) return 0;

  const index = TABS.findIndex((tab) => tab.id === tabId);
  return index >= 0 ? index : 0;
}

function updateUrlTab(tabId: string) {
  const params = new URLSearchParams(window.location.search);
  params.set("tab", tabId);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, "", newUrl);
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState(getTabIndexFromUrl);
  const isHomeTab = activeTab === 0;

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    updateUrlTab(TABS[index].id);
  };

  useEffect(() => {
    // Set initial URL if no tab param exists
    const params = new URLSearchParams(window.location.search);
    if (!params.has("tab")) {
      updateUrlTab(TABS[activeTab].id);
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabIndexFromUrl());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center py-6 px-8 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wider text-accent">nillion://secret_vault_dashboard</h1>
      </header>

      <div className="flex flex-col flex-grow min-h-0 px-8 pb-8">
        {/* Conditional Layout: Log View for Home, Full-Screen for Others */}
        {isHomeTab ? (
          <>
            {/* Log View Layout */}
            <div className="flex-grow min-h-0">
              <TerminalLog />
            </div>

            <div className="flex-shrink-0 mt-8 border border-border bg-panel-bg">
              <main className="p-4">{TABS[activeTab].content}</main>
            </div>
          </>
        ) : (
          <>
            {/* Full-Screen Content View Layout */}
            <div className="flex-grow min-h-0">{TABS[activeTab].content}</div>
          </>
        )}

        {/* Tab Bar (Footer) */}
        <div className="flex-shrink-0 mt-8 border border-border bg-code-bg">
          <Tabs tabs={TABS.map((t) => t.name)} activeTab={activeTab} setActiveTab={handleTabChange} />
        </div>
      </div>
    </div>
  );
}
