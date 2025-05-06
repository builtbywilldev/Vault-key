import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { MessageProps } from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatInterfaceProps {
  initialMessages?: MessageProps[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  initialMessages = [], 
  onSendMessage,
  isProcessing = false
}) => {
  const [messages, setMessages] = useState<MessageProps[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Update messages when initialMessages change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  
  const handleSendMessage = (content: string) => {
    // Create a new message
    const newMessage: MessageProps = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // Update messages state locally for immediate feedback
    setMessages(prev => [...prev, newMessage]);
    
    // Call the parent handler to process the message
    onSendMessage(content);
  };
  
  return (
    <div className="morpheus-chat-container">
      <div className="morpheus-messages">
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome to Morpheus</h3>
            <p className="mt-2">Start the conversation by sending a message below.</p>
          </div>
        )}
        
        {/* Display messages */}
        {messages.map((msg, index) => (
          <ChatMessage key={index} {...msg} />
        ))}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="morpheus-thinking">
            <span className="text-muted-foreground text-sm">Morpheus is thinking</span>
            <div className="morpheus-thinking-dots">
              <div className="morpheus-thinking-dot"></div>
              <div className="morpheus-thinking-dot"></div>
              <div className="morpheus-thinking-dot"></div>
            </div>
          </div>
        )}
        
        {/* Empty div for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input area */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isDisabled={isProcessing}
      />
    </div>
  );
};

export default ChatInterface;