/**
 * useAiChat Hook
 * 
 * Custom hook for managing call-specific AI chat functionality including 
 * message handling, response levels, and quick suggestions generation.
 * Uses CallStateContext for proper call isolation.
 */

import { useState, useCallback } from 'react';
import { AiResponseLevel } from '@/types/livecall';
import { useCallStateContext } from '@/contexts/CallStateContext';

export const useAiChat = (callId?: string) => {
  // Local UI state (not call-specific)
  const [newMessage, setNewMessage] = useState('');
  const [aiResponseLevel, setAiResponseLevel] = useState<AiResponseLevel>('quick');

  // Call state context
  const callStateContext = useCallStateContext();
  
  // Get call-specific state if callId is provided
  const callState = callId ? callStateContext.getCallState(callId) : null;
  
  // Fall back to empty state if no callId provided
  const chatMessages = callState?.aiChatMessages || [];
  const isAiTyping = callState?.isAiTyping || false;
  const quickSuggestion = callState?.quickSuggestion || '';
  const isGeneratingSuggestion = callState?.isGeneratingSuggestion || false;
  const error = callState?.aiChatError || null;
  const aiChatLoading = callState?.aiChatLoading || false;

  // Send message to AI chat system
  const sendChatMessage = useCallback(async () => {
    if (!newMessage.trim() || !callId) {
      if (!callId) {
        console.warn('Cannot send message: no callId provided');
      }
      return;
    }

    try {
      await callStateContext.sendAiChatMessage(callId, newMessage, aiResponseLevel);
      setNewMessage(''); // Clear input after successful send
    } catch (error) {
      console.error('Failed to send AI chat message:', error);
    }
  }, [callId, newMessage, aiResponseLevel, callStateContext]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }, [sendChatMessage]);

  // Generate quick suggestion based on call context
  const generateQuickSuggestion = useCallback(async () => {
    if (!callId) {
      console.warn('Cannot generate suggestion: no callId provided');
      return;
    }

    try {
      await callStateContext.generateQuickSuggestion(callId);
    } catch (error) {
      console.error('Failed to generate quick suggestion:', error);
    }
  }, [callId, callStateContext]);

  // Clear error state
  const clearError = useCallback(() => {
    if (!callId) return;
    callStateContext.clearAiChatError(callId);
  }, [callId, callStateContext]);

  return {
    // Call-specific state
    chatMessages,
    isAiTyping,
    quickSuggestion,
    isGeneratingSuggestion,
    error,
    aiChatLoading,
    
    // Local UI state
    newMessage,
    aiResponseLevel,
    
    // State setters
    setNewMessage,
    setAiResponseLevel,
    
    // Actions
    sendChatMessage,
    handleKeyPress,
    generateQuickSuggestion,
    clearError,
  };
};
