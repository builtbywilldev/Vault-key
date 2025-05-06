import React, { useState, useEffect } from 'react';
import TabNavigation, { TabType } from './TabNavigation';
import ChatInterface from './ChatInterface';
import Dashboard from './Dashboard';
import MemoryLogs from './MemoryLogs';
import AgentControl from './AgentControl';
import { MessageProps } from './ChatMessage';

const MorpheusContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<MessageProps[]>([
    {
      role: 'assistant',
      content: 'Hello, I am Morpheus. How can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    // Set processing state
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Add assistant response
      const assistantResponse: MessageProps = {
        role: 'assistant',
        content: generateResponse(content),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      setIsProcessing(false);
    }, 1500); // Simulate delay
  };
  
  // Simple response generator (to be replaced with real API call)
  const generateResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return 'Hello! I am Morpheus, your AI assistant. How can I help you today?';
    }
    
    if (userMessage.toLowerCase().includes('help')) {
      return 'I can help you with various tasks. You can ask me to analyze data, search for information, or manage your digital assets. What would you like to do?';
    }
    
    if (userMessage.toLowerCase().includes('agent') || userMessage.toLowerCase().includes('agents')) {
      return 'My agents are specialized modules that can perform specific tasks. You can view and manage them in the "Agent Control" tab. Would you like me to tell you more about any specific agent?';
    }
    
    if (userMessage.toLowerCase().includes('memory') || userMessage.toLowerCase().includes('logs')) {
      return 'I maintain detailed logs of all activities and interactions. You can view these in the "Memory Logs" tab. This helps with transparency and allows you to understand my decision-making process.';
    }
    
    return 'I understand your message. My capabilities are still evolving. Is there something specific you\'d like me to help you with today?';
  };
  
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
        return (
          <ChatInterface 
            initialMessages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        );
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