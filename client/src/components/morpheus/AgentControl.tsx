import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AgentCard, { AgentStatus } from './AgentCard';

// Mock data for agents
export interface AgentData {
  id: number;
  name: string;
  description: string;
  status: AgentStatus;
  capabilities?: string[];
  configuration?: Record<string, any>;
}

interface AgentControlProps {
  initialAgents?: AgentData[];
}

const AgentControl: React.FC<AgentControlProps> = ({ initialAgents = [] }) => {
  const [agents, setAgents] = useState<AgentData[]>(initialAgents.length ? initialAgents : [
    {
      id: 1,
      name: 'Data Analyzer',
      description: 'Processes and analyzes data from various sources, generating insights and visualizations.',
      status: 'idle',
      capabilities: ['data_processing', 'visualization', 'insights']
    },
    {
      id: 2,
      name: 'Web Crawler',
      description: 'Fetches information from web sources based on search parameters and criteria.',
      status: 'active',
      capabilities: ['web_search', 'content_extraction', 'metadata_parsing']
    },
    {
      id: 3,
      name: 'Memory Indexer',
      description: 'Creates searchable indices from chat history and knowledge bases for rapid recall.',
      status: 'paused',
      capabilities: ['indexing', 'search', 'knowledge_organization']
    }
  ]);
  
  const handleStartAgent = (id: number) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, status: 'active' as AgentStatus } : agent
    ));
  };
  
  const handlePauseAgent = (id: number) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, status: 'paused' as AgentStatus } : agent
    ));
  };
  
  const handleEditAgent = (id: number) => {
    console.log(`Edit agent with ID: ${id}`);
    // This would open a modal or navigate to edit page
  };
  
  const handleDeleteAgent = (id: number) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
  };
  
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Agent Control
        </h2>
        <button className="py-2 px-4 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
          <Plus size={18} />
          <span>New Agent</span>
        </button>
      </div>
      
      <div className="morpheus-agent-grid">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            description={agent.description}
            status={agent.status}
            onStart={handleStartAgent}
            onPause={handlePauseAgent}
            onEdit={handleEditAgent}
            onDelete={handleDeleteAgent}
          />
        ))}
      </div>
      
      {agents.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <p className="mb-4">No agents configured yet.</p>
          <button className="py-2 px-4 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-colors">
            <Plus size={18} />
            <span>Create your first agent</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentControl;