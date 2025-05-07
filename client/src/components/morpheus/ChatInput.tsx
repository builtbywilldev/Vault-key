import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isDisabled = false 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea as content grows, but with limits for mobile
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      
      // On mobile, limit the max height more strictly to prevent keyboard issues
      const isMobile = window.innerWidth < 640;
      const maxHeight = isMobile ? 80 : 150;
      
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [message]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  // Handle Enter key to submit (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="morpheus-chat-input-container">
      <div className="morpheus-chat-input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={isDisabled}
          className="morpheus-chat-textarea"
          rows={1}
        />
        
        {message && (
          <button
            type="button"
            onClick={() => setMessage('')}
            className="morpheus-chat-clear-button"
            aria-label="Clear message"
          >
            <X size={16} />
          </button>
        )}
        
        <div className="morpheus-chat-actions">
          <button
            type="button"
            className="morpheus-chat-action-button"
            aria-label="Voice input"
            disabled={isDisabled}
          >
            <Mic size={18} />
          </button>
          
          <button
            type="submit"
            className={`morpheus-chat-send-button ${(!message.trim() || isDisabled) ? 'disabled' : ''}`}
            disabled={!message.trim() || isDisabled}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      <div className="morpheus-chat-input-footer">
        <span className="text-xs text-muted-foreground">
          Morpheus responds based on your input. Press Enter to send.
        </span>
      </div>
    </form>
  );
};

export default ChatInput;