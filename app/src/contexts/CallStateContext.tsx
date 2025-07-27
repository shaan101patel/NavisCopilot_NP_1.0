/**
 * CallStateContext - Call State Isolation Management
 * 
 * Provides isolated state management for each call session to ensure that
 * notes, AI chat messages, transcripts, and quick suggestions are unique
 * per call tab and don't interfere with each other.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { StickyNote, ChatMessage, TranscriptEntry, AiResponseLevel } from '@/types/livecall';
import { callAPI } from '@/services/supabase';

// Individual call state interface
interface CallState {
  callId: string;
  // Notes state
  notes: StickyNote[];
  documentNotes: string;
  notesLoaded: boolean;
  
  // AI Chat state
  aiChatMessages: ChatMessage[];
  aiChatLoaded: boolean;
  isAiTyping: boolean;
  quickSuggestion: string;
  isGeneratingSuggestion: boolean;
  
  // Transcript state
  transcript: TranscriptEntry[];
  transcriptLoaded: boolean;
  
  // Error states
  notesError: string | null;
  aiChatError: string | null;
  transcriptError: string | null;
  
  // Loading states
  notesLoading: boolean;
  aiChatLoading: boolean;
  transcriptLoading: boolean;
}

// Default empty call state
const createEmptyCallState = (callId: string): CallState => ({
  callId,
  notes: [],
  documentNotes: '',
  notesLoaded: false,
  aiChatMessages: [],
  aiChatLoaded: false,
  isAiTyping: false,
  quickSuggestion: '',
  isGeneratingSuggestion: false,
  transcript: [],
  transcriptLoaded: false,
  notesError: null,
  aiChatError: null,
  transcriptError: null,
  notesLoading: false,
  aiChatLoading: false,
  transcriptLoading: false,
});

// Context interface
interface CallStateContextType {
  // State access
  getCallState: (callId: string) => CallState;
  ensureCallState: (callId: string) => void;
  
  // Notes operations
  loadCallNotes: (callId: string) => Promise<void>;
  addCallNote: (callId: string, content: string, color?: string) => Promise<void>;
  updateCallNote: (callId: string, noteId: string, content: string) => Promise<void>;
  deleteCallNote: (callId: string, noteId: string) => Promise<void>;
  updateDocumentNotes: (callId: string, content: string) => Promise<void>;
  
  // AI Chat operations
  loadCallAiChat: (callId: string) => Promise<void>;
  sendAiChatMessage: (callId: string, message: string, responseLevel: AiResponseLevel) => Promise<void>;
  generateQuickSuggestion: (callId: string) => Promise<void>;
  clearAiChatError: (callId: string) => void;
  
  // Transcript operations
  loadCallTranscript: (callId: string) => Promise<void>;
  addTranscriptSegment: (callId: string, speaker: 'agent' | 'customer', text: string) => Promise<void>;
  
  // State management
  clearCallState: (callId: string) => void;
  getAllCallStates: () => Map<string, CallState>;
}

const CallStateContext = createContext<CallStateContextType | undefined>(undefined);

// Provider component
interface CallStateProviderProps {
  children: ReactNode;
}

export const CallStateProvider: React.FC<CallStateProviderProps> = ({ children }) => {
  const [callStates, setCallStates] = useState<Map<string, CallState>>(new Map());

  // Get call state (read-only, no setState during render)
  const getCallState = useCallback((callId: string): CallState => {
    return callStates.get(callId) || createEmptyCallState(callId);
  }, [callStates]);

  // Ensure call state exists (use this for initialization)
  const ensureCallState = useCallback((callId: string) => {
    if (!callStates.has(callId)) {
      setCallStates(prev => new Map(prev).set(callId, createEmptyCallState(callId)));
    }
  }, [callStates]);

  // Update call state
  const updateCallState = useCallback((callId: string, updates: Partial<CallState>) => {
    setCallStates(prev => {
      const current = prev.get(callId) || createEmptyCallState(callId);
      const updated = { ...current, ...updates };
      return new Map(prev).set(callId, updated);
    });
  }, []);

  // ===== NOTES OPERATIONS =====
  
  const loadCallNotes = useCallback(async (callId: string) => {
    try {
      updateCallState(callId, { notesLoading: true, notesError: null });
      
      const response = await callAPI.getCallNotes(callId);
      if (response.success) {
        updateCallState(callId, {
          notes: response.notes,
          documentNotes: response.documentNotes,
          notesLoaded: true,
          notesLoading: false
        });
      }
    } catch (error: any) {
      console.error('Failed to load call notes:', error);
      updateCallState(callId, {
        notesError: error.message || 'Failed to load notes',
        notesLoading: false
      });
    }
  }, [updateCallState]);

  const addCallNote = useCallback(async (callId: string, content: string, color: string = 'yellow') => {
    try {
      updateCallState(callId, { notesLoading: true, notesError: null });
      
      const response = await callAPI.createCallNote(callId, {
        content,
        noteType: 'sticky',
        color
      });
      
      if (response.success) {
        const currentState = getCallState(callId);
        updateCallState(callId, {
          notes: [...currentState.notes, response.note],
          notesLoading: false
        });
      }
    } catch (error: any) {
      console.error('Failed to add call note:', error);
      updateCallState(callId, {
        notesError: error.message || 'Failed to add note',
        notesLoading: false
      });
    }
  }, [getCallState, updateCallState]);

  const updateCallNote = useCallback(async (callId: string, noteId: string, content: string) => {
    try {
      updateCallState(callId, { notesLoading: true, notesError: null });
      
      const response = await callAPI.updateCallNote(noteId, { content });
      
      if (response.success) {
        const currentState = getCallState(callId);
        const updatedNotes = currentState.notes.map(note =>
          note.id === noteId ? { ...note, content, updatedAt: new Date() } : note
        );
        
        updateCallState(callId, {
          notes: updatedNotes,
          notesLoading: false
        });
      }
    } catch (error: any) {
      console.error('Failed to update call note:', error);
      updateCallState(callId, {
        notesError: error.message || 'Failed to update note',
        notesLoading: false
      });
    }
  }, [getCallState, updateCallState]);

  const deleteCallNote = useCallback(async (callId: string, noteId: string) => {
    try {
      updateCallState(callId, { notesLoading: true, notesError: null });
      
      const response = await callAPI.deleteCallNote(noteId);
      
      if (response.success) {
        const currentState = getCallState(callId);
        const filteredNotes = currentState.notes.filter(note => note.id !== noteId);
        
        updateCallState(callId, {
          notes: filteredNotes,
          notesLoading: false
        });
      }
    } catch (error: any) {
      console.error('Failed to delete call note:', error);
      updateCallState(callId, {
        notesError: error.message || 'Failed to delete note',
        notesLoading: false
      });
    }
  }, [getCallState, updateCallState]);

  const updateDocumentNotes = useCallback(async (callId: string, content: string) => {
    try {
      // Update local state immediately for better UX
      updateCallState(callId, { documentNotes: content });
      
      // Save to backend
      await callAPI.createCallNote(callId, {
        content,
        noteType: 'document'
      });
    } catch (error: any) {
      console.error('Failed to update document notes:', error);
      updateCallState(callId, {
        notesError: error.message || 'Failed to update document notes'
      });
    }
  }, [updateCallState]);

  // ===== AI CHAT OPERATIONS =====
  
  const loadCallAiChat = useCallback(async (callId: string) => {
    try {
      updateCallState(callId, { aiChatLoading: true, aiChatError: null });
      
      const response = await callAPI.getCallAiChatMessages(callId);
      if (response.success) {
        updateCallState(callId, {
          aiChatMessages: response.messages,
          aiChatLoaded: true,
          aiChatLoading: false
        });
      }
    } catch (error: any) {
      console.error('Failed to load AI chat:', error);
      updateCallState(callId, {
        aiChatError: error.message || 'Failed to load AI chat',
        aiChatLoading: false
      });
    }
  }, [updateCallState]);

  const sendAiChatMessage = useCallback(async (callId: string, message: string, responseLevel: AiResponseLevel) => {
    if (!message.trim()) return;

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: message,
        sender: 'agent',
        timestamp: new Date(),
        aiResponseLevel: responseLevel
      };

      const currentState = getCallState(callId);
      updateCallState(callId, {
        aiChatMessages: [...currentState.aiChatMessages, userMessage],
        isAiTyping: true,
        aiChatError: null
      });

      // Send to AI backend
      const response = await callAPI.sendAiChatMessage({
        callId,
        message,
        responseLevel,
        context: {
          transcript: currentState.transcript,
          notes: currentState.notes,
        }
      });

      if (response.success) {
        const aiMessage: ChatMessage = {
          id: response.responseId,
          content: response.response,
          sender: 'ai',
          timestamp: new Date(),
          aiResponseLevel: responseLevel,
          suggestions: response.suggestions,
          confidence: response.confidence
        };

        const updatedState = getCallState(callId);
        updateCallState(callId, {
          aiChatMessages: [...updatedState.aiChatMessages, aiMessage],
          isAiTyping: false
        });
      }
    } catch (error: any) {
      console.error('Failed to send AI chat message:', error);
      updateCallState(callId, {
        aiChatError: error.message || 'Failed to send message',
        isAiTyping: false
      });
    }
  }, [getCallState, updateCallState]);

  const generateQuickSuggestion = useCallback(async (callId: string) => {
    try {
      updateCallState(callId, { isGeneratingSuggestion: true, aiChatError: null });
      
      const currentState = getCallState(callId);
      const contextMessage = currentState.transcript.length > 0 
        ? `Based on current conversation: "${currentState.transcript.slice(-2).map(t => `${t.speaker}: ${t.text}`).join(' ')}", provide a quick suggestion.`
        : 'Provide a quick suggestion for effective customer service.';

      const response = await callAPI.sendAiChatMessage({
        callId,
        message: contextMessage,
        responseLevel: 'quick',
        context: {
          transcript: currentState.transcript,
          notes: currentState.notes,
        }
      });

      if (response.success) {
        updateCallState(callId, {
          quickSuggestion: response.response,
          isGeneratingSuggestion: false
        });
      }
    } catch (error: any) {
      console.error('Failed to generate quick suggestion:', error);
      updateCallState(callId, {
        aiChatError: error.message || 'Failed to generate suggestion',
        isGeneratingSuggestion: false
      });
    }
  }, [getCallState, updateCallState]);

  const clearAiChatError = useCallback((callId: string) => {
    updateCallState(callId, { aiChatError: null });
  }, [updateCallState]);

  // ===== TRANSCRIPT OPERATIONS =====
  
  const loadCallTranscript = useCallback(async (callId: string) => {
    try {
      updateCallState(callId, { transcriptLoading: true, transcriptError: null });
      
      const response = await callAPI.getCallTranscript(callId);
      updateCallState(callId, {
        transcript: response.transcript,
        transcriptLoaded: true,
        transcriptLoading: false
      });
    } catch (error: any) {
      console.error('Failed to load transcript:', error);
      updateCallState(callId, {
        transcriptError: error.message || 'Failed to load transcript',
        transcriptLoading: false
      });
    }
  }, [updateCallState]);

  const addTranscriptSegment = useCallback(async (callId: string, speaker: 'agent' | 'customer', text: string) => {
    try {
      const response = await callAPI.addCallTranscriptSegment(callId, {
        speaker,
        text,
        timestamp: new Date()
      });

      if (response.success) {
        const currentState = getCallState(callId);
        updateCallState(callId, {
          transcript: [...currentState.transcript, response.segment]
        });
      }
    } catch (error: any) {
      console.error('Failed to add transcript segment:', error);
      updateCallState(callId, {
        transcriptError: error.message || 'Failed to add transcript segment'
      });
    }
  }, [getCallState, updateCallState]);

  // ===== STATE MANAGEMENT =====
  
  const clearCallState = useCallback((callId: string) => {
    setCallStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(callId);
      return newMap;
    });
  }, []);

  const getAllCallStates = useCallback(() => {
    return new Map(callStates);
  }, [callStates]);

  // Auto-load data when call state is first accessed
  useEffect(() => {
    callStates.forEach((state, callId) => {
      if (!state.notesLoaded && !state.notesLoading) {
        loadCallNotes(callId);
      }
      if (!state.aiChatLoaded && !state.aiChatLoading) {
        loadCallAiChat(callId);
      }
      if (!state.transcriptLoaded && !state.transcriptLoading) {
        loadCallTranscript(callId);
      }
    });
  }, [callStates, loadCallNotes, loadCallAiChat, loadCallTranscript]);

  const contextValue: CallStateContextType = {
    getCallState,
    ensureCallState,
    loadCallNotes,
    addCallNote,
    updateCallNote,
    deleteCallNote,
    updateDocumentNotes,
    loadCallAiChat,
    sendAiChatMessage,
    generateQuickSuggestion,
    clearAiChatError,
    loadCallTranscript,
    addTranscriptSegment,
    clearCallState,
    getAllCallStates,
  };

  return (
    <CallStateContext.Provider value={contextValue}>
      {children}
    </CallStateContext.Provider>
  );
};

// Hook to use the CallStateContext
export const useCallStateContext = (): CallStateContextType => {
  const context = useContext(CallStateContext);
  if (!context) {
    throw new Error('useCallStateContext must be used within a CallStateProvider');
  }
  return context;
};

// Helper hook to get state for a specific call
export const useCallState = (callId?: string) => {
  const context = useCallStateContext();
  
  if (!callId) {
    return null;
  }
  
  return context.getCallState(callId);
}; 