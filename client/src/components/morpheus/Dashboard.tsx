import React from 'react';
import { Brain, Cpu, Database, MessageSquare, Activity } from 'lucide-react';

interface DashboardProps {
  systemStatus?: 'online' | 'offline' | 'degraded';
  stats?: {
    activeAgents: number;
    messagesProcessed: number;
    memorySize: string;
    uptime: string;
    lastActive: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ 
  systemStatus = 'online',
  stats = {
    activeAgents: 2,
    messagesProcessed: 1247,
    memorySize: '2.4 GB',
    uptime: '23 days, 4 hours',
    lastActive: '2 minutes ago'
  }
}) => {
  const getStatusColor = () => {
    switch (systemStatus) {
      case 'online': return 'text-[#4cd964]';
      case 'degraded': return 'text-[#ffcc00]';
      case 'offline': return 'text-destructive';
    }
  };
  
  return (
    <div className="morpheus-dashboard">
      <div className="morpheus-dashboard-header">
        <h1 className="morpheus-dashboard-title text-3xl">Morpheus System Dashboard</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className={`h-2 w-2 rounded-full ${getStatusColor()}`}></div>
          <span className="text-muted-foreground">
            System Status: <span className={getStatusColor()}>{systemStatus}</span>
          </span>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="morpheus-grid">
        <div className="morpheus-stat-card">
          <div className="flex justify-between">
            <span className="morpheus-stat-title">Active Agents</span>
            <Cpu size={18} className="text-primary opacity-70" />
          </div>
          <span className="morpheus-stat-value">{stats.activeAgents}</span>
        </div>
        
        <div className="morpheus-stat-card">
          <div className="flex justify-between">
            <span className="morpheus-stat-title">Messages Processed</span>
            <MessageSquare size={18} className="text-primary opacity-70" />
          </div>
          <span className="morpheus-stat-value">{stats.messagesProcessed}</span>
        </div>
        
        <div className="morpheus-stat-card">
          <div className="flex justify-between">
            <span className="morpheus-stat-title">Memory Size</span>
            <Database size={18} className="text-primary opacity-70" />
          </div>
          <span className="morpheus-stat-value">{stats.memorySize}</span>
        </div>
        
        <div className="morpheus-stat-card">
          <div className="flex justify-between">
            <span className="morpheus-stat-title">System Uptime</span>
            <Activity size={18} className="text-primary opacity-70" />
          </div>
          <span className="morpheus-stat-value">{stats.uptime}</span>
        </div>
      </div>
      
      {/* System Information */}
      <div className="bg-card p-6 rounded-lg border border-border mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Brain size={20} className="text-primary" />
          <span>System Information</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Core Functions</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Neural Processing</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Memory Management</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Agent Coordination</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Natural Language Understanding</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">System Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CPU</span>
                  <span>42%</span>
                </div>
                <div className="h-2 bg-card border border-border rounded-full mt-1">
                  <div className="h-full bg-primary rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Memory</span>
                  <span>67%</span>
                </div>
                <div className="h-2 bg-card border border-border rounded-full mt-1">
                  <div className="h-full bg-primary rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <span>23%</span>
                </div>
                <div className="h-2 bg-card border border-border rounded-full mt-1">
                  <div className="h-full bg-primary rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'Web Crawler completed search task', time: '2 minutes ago' },
            { action: 'Memory indexing operation completed', time: '15 minutes ago' },
            { action: 'Data analysis report generated', time: '1 hour ago' },
            { action: 'System maintenance performed', time: '3 hours ago' },
            { action: 'New agent deployed: Content Summarizer', time: '1 day ago' }
          ].map((activity, index) => (
            <div key={index} className="py-2 border-b border-border last:border-0">
              <div className="flex justify-between">
                <span>{activity.action}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;