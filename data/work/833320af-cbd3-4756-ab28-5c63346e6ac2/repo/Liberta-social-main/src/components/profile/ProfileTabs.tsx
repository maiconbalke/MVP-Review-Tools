import { useState, useRef, useEffect } from "react";

interface Tab {
  key: string;
  label: string;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

const ProfileTabs = ({ tabs, activeTab, onTabChange }: ProfileTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="relative border-b border-border" ref={containerRef}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            data-tab={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Animated underline */}
      <div
        className="absolute bottom-0 h-0.5 bg-accent transition-all duration-300 ease-out"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
      />
    </div>
  );
};

export default ProfileTabs;
