import type { Dispatch, SetStateAction } from "react";

interface TabsProps {
  tabs: string[];
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>;
}

export function Tabs({ tabs, activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="flex border-t border-border">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(index)}
          className={`px-4 py-2 -mt-px border-t-2 text-sm font-medium transition-colors duration-150 ${
            activeTab === index
              ? "border-accent text-accent"
              : "border-transparent text-heading-secondary hover:text-foreground"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
