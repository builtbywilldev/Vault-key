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
  
  // Detect iOS devices 
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      document.body.classList.add('ios-device');
    }
  }, []);
  
  // Mobile viewport and keyboard visibility adjustments with more robust iOS detection
  useEffect(() => {
    const handleResize = () => {
      // Set viewport height variable
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
      
      // Detect keyboard visibility with improved iOS detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      // Update the ios-device class to ensure it's always correct
      if (isIOS) {
        document.body.classList.add('ios-device');
      } else {
        document.body.classList.remove('ios-device');
      }
      
      if (isIOS) {
        // More accurate keyboard detection
        let keyboardOpen = false;
        
        // Use visualViewport API when available (modern iOS Safari)
        if (window.visualViewport) {
          // When keyboard is open, the visual viewport height is significantly smaller
          // than the inner window height (by approximately the keyboard height)
          keyboardOpen = window.innerHeight - window.visualViewport.height > 140;
        } else {
          // Fallback for older browsers - not as accurate
          const windowHeight = window.innerHeight;
          keyboardOpen = windowHeight < window.outerHeight * 0.75;
        }
        
        // Apply or remove the class based on keyboard status
        if (keyboardOpen) {
          document.body.classList.add('ios-keyboard-open');
          
          // When keyboard opens, scroll the messages to the bottom
          // to ensure the latest messages and input are visible
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        } else {
          document.body.classList.remove('ios-keyboard-open');
        }
      }
    };
    
    // Attach event listeners with better detection
    if (window.visualViewport) {
      // Modern browsers with visualViewport API
      const visualViewport = window.visualViewport;
      visualViewport.addEventListener('resize', handleResize);
      visualViewport.addEventListener('scroll', handleResize);
      
      // Also listen for orientation changes which affect iOS keyboard
      window.addEventListener('orientationchange', handleResize);
      
      handleResize(); // Initial call
      
      return () => {
        visualViewport.removeEventListener('resize', handleResize);
        visualViewport.removeEventListener('scroll', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    } else {
      // Fallback to regular window resize and orientation change
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      handleResize();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
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
  
  // Handler to dismiss keyboard when tapping outside the input
  const handleMessagesClick = () => {
    // Only add this behavior for iOS devices to avoid side effects elsewhere
    const isIOS = document.body.classList.contains('ios-device');
    if (isIOS) {
      // Find any active inputs and blur them to hide keyboard
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        activeElement.blur();
        
        // Remove keyboard open class
        setTimeout(() => {
          document.body.classList.remove('ios-keyboard-open');
        }, 100);
      }
    }
  };

  return (
    <div className="morpheus-chat-container">
      <div 
        className="morpheus-messages" 
        onClick={handleMessagesClick}
      >
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