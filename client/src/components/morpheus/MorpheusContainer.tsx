import React, { useState } from 'react';
import TabNavigation, { TabType } from './TabNavigation';
import ChatInterface from './ChatInterface';
import Dashboard from './Dashboard';
import MemoryLogs from './MemoryLogs';
import AgentControl from './AgentControl';

const MorpheusContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  
  // Handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'chat':
        return <ChatInterface />;
      case 'memory':
        return <MemoryLogs />;
      case 'agents':
        return <AgentControl />;
      default:
        return <div>Unknown tab</div>;
    }
  };
  
  return (
    <div className="morpheus-layout">
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="morpheus-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MorpheusContainer;