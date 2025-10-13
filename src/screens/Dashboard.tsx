import { useEffect, useState } from "react";
import { AppFooter } from "@/components/layouts/AppFooter";
import { AppHeader } from "@/components/layouts/AppHeader";
import { TerminalLog } from "@/components/terminal/TerminalLog";
import { Tabs } from "@/components/ui/Tabs";
import { useCheckSubscriptionQuery } from "@/hooks/useCheckSubscriptionQuery";
import { useNillion } from "@/hooks/useNillion";
import { useProfile } from "@/hooks/useProfile";
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

  const { state: nillionState, logout } = useNillion();
  const { isRegistered } = useProfile();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useCheckSubscriptionQuery();

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
      <AppHeader title="nillion://secret_vault_dashboard" />

      <div className="flex-shrink-0 px-8 pt-6">
        <Tabs tabs={TABS.map((t) => t.name)} activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      <div className="flex flex-col flex-grow min-h-0 px-8 pt-6 pb-8">
        {/* Conditional Layout: Log View for Home, Full-Screen for Others */}
        {isHomeTab ? (
          <>
            {/* Log View Layout */}
            <div className="flex-grow min-h-0 mt-2 animate-in fade-in duration-300">
              <TerminalLog />
            </div>

            <div className="flex-shrink-0 mt-2 border border-border bg-panel-bg p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {TABS[activeTab].content}
            </div>
          </>
        ) : (
          <>
            {/* Full-Screen Content View Layout */}
            <div className="flex-grow min-h-0 mt-2 animate-in fade-in slide-in-from-right-4 duration-300">
              {TABS[activeTab].content}
            </div>
          </>
        )}
      </div>

      <AppFooter
        did={did}
        subscriptionStatus={subscriptionStatus}
        registrationStatus={registrationStatus}
        expiresAt={expiresAt}
        onLogout={logout}
      />
    </div>
  );
}
