import React from 'react';

export interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const ChatMessage: React.FC<MessageProps> = ({ 
  role, 
  content, 
  timestamp 
}) => {
  // Format the timestamp
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Determine the message class based on role
  const messageClass = role === 'user' ? 'morpheus-user-message' : 'morpheus-assistant-message';
  
  return (
    <div className={`morpheus-message ${messageClass}`}>
      <div className="morpheus-message-header">
        <div className="morpheus-message-avatar">
          {role === 'user' ? (
            // User avatar (simple circle with first letter)
            <div className="morpheus-user-avatar">
              U
            </div>
          ) : (
            // Morpheus avatar (circular gradient)
            <div className="morpheus-assistant-avatar">
              M
            </div>
          )}
        </div>
        <div className="morpheus-message-sender">
          {role === 'user' ? 'You' : 'Morpheus'}
        </div>
        <div className="morpheus-message-time">
          {formatTime(timestamp)}
        </div>
      </div>
      <div className="morpheus-message-content">
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;