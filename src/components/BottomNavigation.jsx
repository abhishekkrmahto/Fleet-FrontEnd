export function BottomNavigation({ tabs, activeTab, onChange }) {
  return (
    <nav className="bottom-nav" style={{ "--nav-count": tabs.length }} aria-label="Main navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            className={isActive ? "active" : ""}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
