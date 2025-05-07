import React, { useState } from 'react';
import TabNavigation, { TabType } from './TabNavigation';
import ChatInterface from './ChatInterface';
import Dashboard from './Dashboard';
import MemoryLogs from './MemoryLogs';
import AgentControl from './AgentControl';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';

const MorpheusContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { user, isLoading, isAuthenticated } = useAuth();
  
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
        return isAuthenticated ? <MemoryLogs /> : <LoginPrompt />;
      case 'agents':
        return isAuthenticated ? <AgentControl /> : <LoginPrompt />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  // Login prompt component
  const LoginPrompt = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
      <h2 className="text-2xl font-bold mb-4 text-primary">Authentication Required</h2>
      <p className="mb-6 text-gray-300 max-w-md">
        Please sign in to access Morpheus' memory functions and agent capabilities.
      </p>
      <a href="/api/login">
        <Button className="bg-primary hover:bg-primary/90">
          Sign In with Replit
        </Button>
      </a>
    </div>
  );
  
  return (
    <div className="morpheus-layout">
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="morpheus-content">
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
      {isAuthenticated && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {user?.profileImageUrl && (
            <img 
              src={user.profileImageUrl} 
              alt={user.username} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-white/70">{user?.username}</span>
          <a href="/api/logout" className="text-xs text-white/50 hover:text-white">Sign Out</a>
        </div>
      )}
    </div>
  );
};

export default MorpheusContainer;