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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
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
  
  // Improve mobile experience when input is focused
  useEffect(() => {
    const isIOS = document.body.classList.contains('ios-device');
    
    if (isIOS) {
      if (isFocused) {
        // When input is focused on iOS, scroll to make sure it's visible
        setTimeout(() => {
          // Ensure the input is in view when the keyboard appears
          textareaRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [isFocused]);
  
  // Better touch handling for mobile
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      // If we're on iOS with a focused input, prevent background scrolling behind keyboard
      const isIOS = document.body.classList.contains('ios-device');
      if (isIOS && isFocused && e.target !== textareaRef.current) {
        // Allow scrolling within the message area, but not on empty spaces
        const target = e.target as HTMLElement;
        const isMessageArea = target.closest('.morpheus-messages');
        if (!isMessageArea) {
          e.preventDefault();
        }
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isFocused]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        
        // On iOS, blur the textarea to close keyboard
        const isIOS = document.body.classList.contains('ios-device');
        if (isIOS) {
          textareaRef.current.blur();
          setIsFocused(false);
          
          // Remove keyboard open class after a delay
          setTimeout(() => {
            document.body.classList.remove('ios-keyboard-open');
          }, 100);
        }
      }
    }
  };
  
  // Handle Enter key to submit (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
      
      // On iOS, blur the input after sending to help hide the keyboard
      const isIOS = document.body.classList.contains('ios-device');
      if (isIOS && e.currentTarget) {
        e.currentTarget.blur();
        setIsFocused(false);
      }
    }
  };
  
  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className={`morpheus-chat-input-container ${isFocused ? 'input-focused' : ''}`}
    >
      <div className="morpheus-chat-input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Send a message..."
          disabled={isDisabled}
          className="morpheus-chat-textarea"
          rows={1}
          autoCapitalize="sentences"
          autoComplete="off"
          spellCheck={true}
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
            type="submit"
            className={`morpheus-chat-send-button ${(!message.trim() || isDisabled) ? 'disabled' : ''}`}
            disabled={!message.trim() || isDisabled}
            aria-label="Send message"
          >
            <Send size={20} /> {/* Slightly larger icon for better touch targets */}
          </button>
        </div>
      </div>
      
      {/* Only show footer text on desktop */}
      {window.innerWidth >= 640 && (
        <div className="morpheus-chat-input-footer">
          <span className="text-xs text-muted-foreground">
            Morpheus responds based on your input. Press Enter to send.
          </span>
        </div>
      )}
    </form>
  );
};

export default ChatInput;