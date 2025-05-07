import React, { useState, useEffect } from 'react';
import TabNavigation, { TabType } from './TabNavigation';
import ChatInterface from './ChatInterface';
import Dashboard from './Dashboard';
import MemoryLogs from './MemoryLogs';
import AgentControl from './AgentControl';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, User as UserIcon } from 'lucide-react';

// Define a proper type for the user (should match server response)
interface UserData {
  id: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
}

const MorpheusContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 640);
  const typedUser = user as UserData | undefined;
  
  // Track mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Authentication Required
      </h2>
      <p className="mb-6 text-gray-300 max-w-md">
        Please sign in to access Morpheus' memory functions and agent capabilities.
      </p>
      <a href="/api/login">
        <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 flex items-center gap-2 h-12 px-6">
          <LogIn size={18} />
          <span>Sign In with Replit</span>
        </Button>
      </a>
    </div>
  );
  
  return (
    <div className={`morpheus-layout ${isAuthenticated ? 'authenticated' : ''}`}>
      <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className={`morpheus-content ${isAuthenticated && isMobile ? 'has-user-profile' : ''}`}>
        {/* User profile for mobile - shown above content when authenticated */}
        {isMobile && isAuthenticated && typedUser && (
          <div className="mobile-user-profile flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              {typedUser.profileImageUrl ? (
                <img 
                  src={typedUser.profileImageUrl} 
                  alt={typedUser.username} 
                  className="w-7 h-7 rounded-full border border-primary/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center">
                  <UserIcon size={14} className="text-white/80" />
                </div>
              )}
              <span className="text-xs text-white/90 font-medium">{typedUser.username}</span>
            </div>
            <a 
              href="/api/logout" 
              className="text-xs px-2 py-1 rounded-md bg-card hover:bg-card/80 text-white/70 hover:text-white"
            >
              Sign Out
            </a>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
      
      {/* Desktop user profile - shown in top right corner */}
      {!isMobile && isAuthenticated && typedUser && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {typedUser.profileImageUrl && (
            <img 
              src={typedUser.profileImageUrl} 
              alt={typedUser.username} 
              className="w-8 h-8 rounded-full border border-primary/20"
            />
          )}
          <span className="text-sm text-white/70">{typedUser.username}</span>
          <a href="/api/logout" className="text-xs text-white/50 hover:text-white">Sign Out</a>
        </div>
      )}
    </div>
  );
};

export default MorpheusContainer;