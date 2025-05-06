import React from 'react';
import { Home, MessageSquare, Database, Cpu } from 'lucide-react';

// Tab types for Morpheus UI
export type TabType = 'home' | 'chat' | 'memory' | 'agents';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  // Tab configuration with icons and labels
  const tabs = [
    { id: 'home' as TabType, label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'chat' as TabType, label: 'Chat', icon: <MessageSquare size={20} /> },
    { id: 'memory' as TabType, label: 'Memory Logs', icon: <Database size={20} /> },
    { id: 'agents' as TabType, label: 'Agent Control', icon: <Cpu size={20} /> },
  ];
  
  return (
    <div className="morpheus-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`morpheus-tab ${activeTab === tab.id ? 'active' : ''}`}
          aria-label={tab.label}
        >
          <div className="morpheus-tab-icon">
            {tab.icon}
          </div>
          <span className="morpheus-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;