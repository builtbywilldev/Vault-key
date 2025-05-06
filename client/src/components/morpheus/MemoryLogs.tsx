import React, { useState } from 'react';
import { AlertTriangle, Info, Bug, Search } from 'lucide-react';

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export interface LogEntry {
  id: number;
  agentId: number;
  agentName: string;
  action: string;
  details: Record<string, any>;
  level: LogLevel;
  timestamp: Date;
}

interface MemoryLogsProps {
  initialLogs?: LogEntry[];
}

const MemoryLogs: React.FC<MemoryLogsProps> = ({ initialLogs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  
  // Mock data for logs
  const [logs] = useState<LogEntry[]>(initialLogs.length ? initialLogs : [
    {
      id: 1,
      agentId: 2,
      agentName: 'Web Crawler',
      action: 'Initiated web search',
      details: { query: 'latest AI research papers', limit: 10 },
      level: 'info',
      timestamp: new Date(Date.now() - 15 * 60000) // 15 minutes ago
    },
    {
      id: 2,
      agentId: 1,
      agentName: 'Data Analyzer',
      action: 'Data analysis complete',
      details: { records_processed: 2507, insights_found: 3 },
      level: 'info',
      timestamp: new Date(Date.now() - 5 * 60000) // 5 minutes ago
    },
    {
      id: 3,
      agentId: 3,
      agentName: 'Memory Indexer',
      action: 'Failed to index document',
      details: { error: 'Invalid document format', doc_id: 'XP-1092' },
      level: 'error',
      timestamp: new Date(Date.now() - 2 * 60000) // 2 minutes ago
    },
    {
      id: 4,
      agentId: 2,
      agentName: 'Web Crawler',
      action: 'Rate limit warning',
      details: { domain: 'research-papers.org', remaining_requests: 2 },
      level: 'warning',
      timestamp: new Date(Date.now() - 1 * 60000) // 1 minute ago
    },
    {
      id: 5,
      agentId: 1,
      agentName: 'Data Analyzer',
      action: 'Debugging trace',
      details: { module: 'DataParser', function: 'parseJSON', line: 142 },
      level: 'debug',
      timestamp: new Date() // Now
    }
  ]);
  
  // Filter logs based on search term and selected level
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });
  
  // Sort logs by timestamp (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error': return <AlertTriangle size={16} className="text-destructive" />;
      case 'warning': return <AlertTriangle size={16} className="text-[#ffcc00]" />;
      case 'info': return <Info size={16} className="text-primary" />;
      case 'debug': return <Bug size={16} className="text-muted-foreground" />;
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="morpheus-logs-container">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Memory Logs
        </h2>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          {/* Search box */}
          <div className="relative w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-9 pr-4 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          {/* Filter dropdown */}
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
            className="py-2 px-4 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      </div>
      
      {/* Log entries */}
      <div className="space-y-3">
        {sortedLogs.map(log => (
          <div key={log.id} className={`morpheus-log-entry ${log.level}`}>
            <div className="morpheus-log-header">
              <div className="flex items-center gap-2">
                {getLevelIcon(log.level)}
                <span className="font-medium">{log.agentName}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground capitalize">{log.level}</span>
              </div>
              <span className="morpheus-log-time">{formatDate(new Date(log.timestamp))}</span>
            </div>
            
            <div className="font-medium">{log.action}</div>
            
            {/* Details as formatted JSON */}
            <pre className="mt-2 bg-background p-2 rounded text-xs overflow-x-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        ))}
        
        {sortedLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No logs found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryLogs;