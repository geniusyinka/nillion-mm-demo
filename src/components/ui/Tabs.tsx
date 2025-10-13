interface TabsProps {
  tabs: string[];
  activeTab: number;
  setActiveTab: (index: number) => void;
  disabled?: boolean;
}

export function Tabs({ tabs, activeTab, setActiveTab, disabled = false }: TabsProps) {
  return (
    <div className="flex">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(index)}
          disabled={disabled}
          className={`flex-1 px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-all duration-200 ${
            activeTab === index
              ? "border-accent text-accent shadow-[0_2px_8px_rgba(180,190,254,0.3)]"
              : "border-transparent text-heading-secondary hover:text-foreground hover:border-accent/30"
          } ${disabled ? "cursor-not-allowed opacity-50" : "hover:scale-105 active:scale-95"}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
