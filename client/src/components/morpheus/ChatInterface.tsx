import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { MessageProps } from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatInterfaceProps {
  initialMessages?: MessageProps[];
  onSendMessage?: (message: string) => void;
  isProcessing?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  initialMessages = [], 
  onSendMessage,
  isProcessing: externalProcessing = false
}) => {
  const [messages, setMessages] = useState<MessageProps[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState<boolean>(externalProcessing);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // Set up WebSocket connection
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Connection opened
    socket.addEventListener('open', () => {
      console.log('Connected to Morpheus WebSocket server');
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        // Create a new message from the received data
        const receivedMessage: MessageProps = {
          role: data.role,
          content: data.content,
          timestamp: new Date(data.timestamp)
        };
        
        // Add received message to the chat
        setMessages(prev => [...prev, receivedMessage]);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
    
    // Handle connection errors
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);
  
  // Mobile viewport adjustments to handle keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      // Apply any window-specific adjustments if needed
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
    };
    
    // Use visualViewport API if available (better for mobile keyboards)
    if (window.visualViewport) {
      const visualViewport = window.visualViewport;
      visualViewport.addEventListener('resize', handleResize);
      handleResize(); // Initial call
      
      return () => visualViewport.removeEventListener('resize', handleResize);
    } else {
      // Fallback to regular window resize
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial call
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use setTimeout to ensure scroll happens after DOM update and animation starts
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);
  
  // Update messages when initialMessages change
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);
  
  // Update processing state from props
  useEffect(() => {
    setIsProcessing(externalProcessing);
  }, [externalProcessing]);
  
  const handleSendMessage = (content: string) => {
    // Create a new message
    const newMessage: MessageProps = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    // Update messages state locally for immediate feedback
    setMessages(prev => [...prev, newMessage]);
    
    // Show processing indicator
    setIsProcessing(true);
    
    // Send message through WebSocket if available
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(newMessage));
    }
    
    // Also call the parent handler if provided (for backward compatibility)
    if (onSendMessage) {
      onSendMessage(content);
    }
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