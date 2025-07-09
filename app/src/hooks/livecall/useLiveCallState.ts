/**
 * useLiveCallState Hook
 * 
 * Custom hook for managing live call session state, tab switching, and call controls.
 * Centralizes call management logic and provides clean interface for components.
 */

import { useState, useCallback } from 'react';
import { CallSession } from '@/types/livecall';

// Mock data for call sessions
const mockCallSessions: CallSession[] = [
  {
    callId: "call-001",
    tabId: "tab-1",
    tabLabel: "Customer Support #1",
    participantInfo: { agent: "Agent Smith", customer: "John Doe", customerPhone: "+1 (555) 123-4567" },
    callStatus: 'active',
    callStartTime: new Date(Date.now() - 204000), // 3:24 ago
    isActive: true
  },
  {
    callId: "call-002", 
    tabId: "tab-2",
    tabLabel: "Technical Support #2",
    participantInfo: { agent: "Agent Smith", customer: "Jane Smith", customerPhone: "+1 (555) 987-6543" },
    callStatus: 'on-hold',
    callStartTime: new Date(Date.now() - 600000), // 10 minutes ago
    isActive: false
  }
];

export const useLiveCallState = () => {
  const [callSessions, setCallSessions] = useState<CallSession[]>(mockCallSessions);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  
  // Get current active call session
  const activeCallSession = callSessions.find(session => session.tabId === activeTabId);
  const hasActiveCall = activeCallSession?.callStatus === 'active';

  // IMPLEMENT LATER: Tab management functions with backend integration
  const createNewCallTab = useCallback(() => {
    // Expected API call:
    // - POST /api/calls/sessions/create
    // - Payload: { agentId: string, sessionType: 'outbound' | 'inbound' | 'transfer' }
    // - Response: { sessionId: string, tabId: string, callId: string }
    // - WebSocket event: 'new-session-created'
    
    const newTabId = `tab-${Date.now()}`;
    const newSession: CallSession = {
      callId: `call-${Date.now()}`,
      tabId: newTabId,
      tabLabel: `New Call #${callSessions.length + 1}`,
      participantInfo: { agent: "Agent Smith", customer: "New Customer", customerPhone: "" },
      callStatus: 'connecting',
      callStartTime: new Date(),
      isActive: false
    };
    
    setCallSessions(prev => [...prev, newSession]);
    setActiveTabId(newTabId);
    console.log('New call tab created:', newSession);
  }, [callSessions.length]);

  const switchToTab = useCallback((tabId: string) => {
    // IMPLEMENT LATER: Save current tab state before switching
    // Expected API call:
    // - PUT /api/calls/sessions/{currentSessionId}/save-state
    // - PUT /api/calls/sessions/{newSessionId}/activate
    // - WebSocket event: 'session-switched'
    
    setActiveTabId(tabId);
    console.log('Switched to tab:', tabId);
  }, []);

  const closeCallTab = useCallback((tabId: string) => {
    // IMPLEMENT LATER: End call session and cleanup
    // Expected API call:
    // - POST /api/calls/sessions/{sessionId}/end
    // - Payload: { endReason: 'agent_closed', callSummary?: string }
    // - Response: { success: boolean, endedAt: Date }
    // - WebSocket event: 'session-ended'
    
    const sessionToClose = callSessions.find(session => session.tabId === tabId);
    if (!sessionToClose) return;

    // Show confirmation if call is active
    if (sessionToClose.callStatus === 'active') {
      const confirmed = window.confirm('This will end the active call. Are you sure?');
      if (!confirmed) return;
    }

    // Remove the session
    setCallSessions(prev => prev.filter(session => session.tabId !== tabId));
    
    // Switch to another tab if closing the active one
    if (tabId === activeTabId) {
      const remainingSessions = callSessions.filter(session => session.tabId !== tabId);
      if (remainingSessions.length > 0) {
        setActiveTabId(remainingSessions[0].tabId);
      } else {
        // Create a new default tab if no sessions remain
        createNewCallTab();
      }
    }
    
    console.log('Call tab closed:', tabId);
  }, [callSessions, activeTabId, createNewCallTab]);

  return {
    callSessions,
    activeTabId,
    activeCallSession,
    hasActiveCall,
    createNewCallTab,
    switchToTab,
    closeCallTab
  };
};
