/**
 * AiChat Component
 * 
 * Interactive chat interface with AI assistant featuring multiple response levels.
 * Includes message history, typing indicators, and real-time communication.
 */

import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Settings } from "lucide-react";
import { AiChatProps, AiResponseLevel } from '@/types/livecall';

export const AiChat: React.FC<AiChatProps> = ({
  chatMessages,
  newMessage,
  aiResponseLevel,
  isAiTyping,
  quickSuggestion,
  isGeneratingSuggestion,
  error,
  onNewMessageChange,
  onSendMessage,
  onKeyPress,
  onAiResponseLevelChange,
  onGenerateQuickSuggestion,
  onClearError
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showAiLevelDropup, setShowAiLevelDropup] = React.useState(false);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Close dropup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowAiLevelDropup(false);
    if (showAiLevelDropup) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAiLevelDropup]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">AI Chat</h3>
        <div className="text-xs text-muted-foreground">
          Mode: <span className="capitalize font-medium text-primary">{aiResponseLevel}</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive">{error}</span>
            </div>
            {onClearError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearError}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-3 mb-3 min-h-0 scrollbar-thin">
        {/* IMPLEMENT LATER: Load chat history from backend and implement real-time messaging */}
        {/* Expected WebSocket events: 'message-received', 'ai-typing', 'message-delivered' */}
        <div className="space-y-3">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.sender === 'agent'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm shadow-sm'
                }`}
              >
                <div className="break-words">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.sender === 'agent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.aiResponseLevel && (
                    <span className="ml-2 capitalize">({message.aiResponseLevel})</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* AI Typing Indicator */}
          {isAiTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-lg rounded-bl-sm shadow-sm p-3 text-sm">
                <div className="flex items-center gap-1">
                  <span>AI is typing</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Ask the AI assistant anything..."
            className="w-full border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring bg-background"
            rows={2}
          />
        </div>
        
        {/* AI Response Level Selector */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowAiLevelDropup(!showAiLevelDropup);
            }}
            className="h-full px-2"
            title="AI Response Level"
          >
            <Settings size={16} />
          </Button>
          
          {/* Drop-up Menu */}
          {showAiLevelDropup && (
            <div className="absolute bottom-full right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg py-2 min-w-32 z-50">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                AI Answer:
              </div>
              {(['instant', 'quick', 'immediate'] as AiResponseLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    onAiResponseLevelChange(level);
                    setShowAiLevelDropup(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors capitalize ${
                    aiResponseLevel === level ? 'bg-accent/50 text-accent-foreground font-medium' : 'text-popover-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{level}</span>
                    {aiResponseLevel === level && (
                      <span className="text-primary">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button
          onClick={onSendMessage}
          disabled={!newMessage.trim() || isAiTyping}
          size="sm"
          className="h-full px-3"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};
