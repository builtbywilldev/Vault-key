import React from 'react';
import { Play, Pause, Edit, Trash2 } from 'lucide-react';

export type AgentStatus = 'idle' | 'active' | 'paused' | 'error';

export interface AgentProps {
  id: number;
  name: string;
  description: string;
  status: AgentStatus;
  onStart: (id: number) => void;
  onPause: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const AgentCard: React.FC<AgentProps> = ({
  id,
  name,
  description,
  status,
  onStart,
  onPause,
  onEdit,
  onDelete
}) => {
  const getStatusClass = () => {
    switch (status) {
      case 'active': return 'morpheus-status morpheus-status-active';
      case 'paused': return 'morpheus-status morpheus-status-paused';
      case 'error': return 'morpheus-status morpheus-status-error';
      default: return 'morpheus-status morpheus-status-idle';
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };
  
  return (
    <div className="morpheus-agent-card">
      <div className="morpheus-agent-header">
        <span className="morpheus-agent-name">{name}</span>
        <div className={getStatusClass()}>
          <div className="morpheus-status-indicator"></div>
          <span>{getStatusText()}</span>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="flex justify-between mt-auto">
        <div className="flex gap-2">
          {status !== 'active' ? (
            <button 
              onClick={() => onStart(id)}
              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              aria-label="Start agent"
            >
              <Play size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onPause(id)}
              className="p-2 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary transition-colors"
              aria-label="Pause agent"
            >
              <Pause size={18} />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(id)}
            className="p-2 rounded-full bg-muted/10 hover:bg-muted/20 text-muted-foreground transition-colors"
            aria-label="Edit agent"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => onDelete(id)}
            className="p-2 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
            aria-label="Delete agent"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;