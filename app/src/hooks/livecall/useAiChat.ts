/**
 * useAiChat Hook
 * 
 * Custom hook for managing AI chat functionality including message handling,
 * response levels, and quick suggestions generation.
 */

import { useState, useCallback } from 'react';
import { ChatMessage, AiResponseLevel } from '@/types/livecall';

// IMPLEMENT LATER: Replace with real chat messages from backend AI system
const mockChatMessages: ChatMessage[] = [
  { id: "msg-1", content: "What's the best way to handle shipping complaints?", sender: "agent", timestamp: new Date(Date.now() - 300000) },
  { id: "msg-2", content: "For shipping complaints, first acknowledge the issue, then check the tracking status in our system. Offer immediate solutions like expedited shipping or refunds based on company policy.", sender: "ai", timestamp: new Date(Date.now() - 250000), aiResponseLevel: "quick" },
  { id: "msg-3", content: "How should I handle the refund process?", sender: "agent", timestamp: new Date(Date.now() - 120000) },
];

const mockQuickSuggestion = "Ask for the customer's order number to help track their shipment status.";

export const useAiChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [aiResponseLevel, setAiResponseLevel] = useState<AiResponseLevel>('quick');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [quickSuggestion, setQuickSuggestion] = useState(mockQuickSuggestion);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  // IMPLEMENT LATER: Connect to backend AI chat system
  const sendChatMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: 'agent',
      timestamp: new Date(),
    };

    // Add user message immediately
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsAiTyping(true);

    // IMPLEMENT LATER: Send message to AI backend with selected response level
    // Expected API call:
    // - Endpoint: POST /api/ai/chat
    // - Payload: { message: string, responseLevel: AiResponseLevel, callContext: CallContext }
    // - Response: { message: string, suggestions?: string[], confidence: number }
    // - WebSocket for real-time streaming responses
    
    // Simulate AI response (REMOVE when backend is ready)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: `AI Response (${aiResponseLevel} mode): Based on your query, I recommend checking the customer's order history and offering appropriate compensation.`,
        sender: 'ai',
        timestamp: new Date(),
        aiResponseLevel,
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsAiTyping(false);
    }, 1500);
  }, [newMessage, aiResponseLevel]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }, [sendChatMessage]);

  // IMPLEMENT LATER: Generate quick suggestion based on call context
  const generateQuickSuggestion = useCallback(async () => {
    setIsGeneratingSuggestion(true);
    
    // Expected API call:
    // - POST /api/ai/quick-suggestion/generate
    // - Payload: { 
    //     callId: string,
    //     transcript: TranscriptEntry[],
    //     context: 'manual_trigger',
    //     agentRequest?: string
    //   }
    // - Response: { 
    //     suggestion: string,
    //     confidence: number,
    //     context: string,
    //     id: string
    //   }
    
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock different suggestions based on call context
      const suggestions = [
        "Apologize for the inconvenience and ask for specific details about the issue.",
        "Offer to escalate to a supervisor if the customer seems frustrated.",
        "Suggest checking the customer's account history for previous interactions.",
        "Recommend providing a reference number for follow-up tracking.",
        "Ask if there's anything else you can help with today."
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setQuickSuggestion(randomSuggestion);
      
    } catch (error) {
      console.error('Failed to generate quick suggestion:', error);
      setQuickSuggestion("Unable to generate suggestion. Please try again.");
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }, []);

  return {
    chatMessages,
    newMessage,
    aiResponseLevel,
    isAiTyping,
    quickSuggestion,
    isGeneratingSuggestion,
    setNewMessage,
    setAiResponseLevel,
    sendChatMessage,
    handleKeyPress,
    generateQuickSuggestion
  };
};
