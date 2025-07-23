/**
 * useLiveCallState Hook
 * 
 * Custom hook for managing live call session state, tab switching, and call controls.
 * Centralizes call management logic and provides clean interface for components.
 */

import { useState, useCallback, useEffect } from 'react';
import { CallSession } from '@/types/livecall';
import { callAPI } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';

// No mock data - start with empty call sessions
export const useLiveCallState = () => {
  const { user } = useAuth();
  const [callSessions, setCallSessions] = useState<CallSession[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check for pending call tab from incoming calls
  // IMPLEMENT LATER: Replace with real-time WebSocket events
  useEffect(() => {
    const pendingCallTab = sessionStorage.getItem('pendingCallTab');
    if (pendingCallTab) {
      try {
        const callTabData = JSON.parse(pendingCallTab);
        setCallSessions(prev => [...prev, callTabData]);
        setActiveTabId(callTabData.tabId);
        sessionStorage.removeItem('pendingCallTab');
        console.log('Added pending call tab:', callTabData);
      } catch (error) {
        console.error('Failed to parse pending call tab:', error);
        sessionStorage.removeItem('pendingCallTab');
      }
    }
  }, []); // Run once on mount
  
  // Get current active call session
  const activeCallSession = callSessions.find(session => session.tabId === activeTabId);
  const hasActiveCall = activeCallSession?.callStatus === 'active';

  // Create new call tab with backend integration
  const createNewCallTab = useCallback(async () => {
    if (!user?.id) {
      console.error('No authenticated user found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create call session via API
      const sessionResult = await callAPI.createCallSession({
        agentId: user.id,
        sessionType: 'outbound',
        priority: 'medium'
      });

      const newSession: CallSession = {
        callId: sessionResult.callId,
        tabId: sessionResult.tabId,
        tabLabel: `New Call #${callSessions.length + 1}`,
        participantInfo: { 
          agent: user.name || "Agent", 
          customer: "New Customer", 
          customerPhone: "" 
        },
        callStatus: 'connecting',
        callStartTime: new Date(),
        isActive: false
      };
      
      setCallSessions(prev => [...prev, newSession]);
      setActiveTabId(newSession.tabId);
      console.log('✅ New call tab created via API:', newSession);
    } catch (error: any) {
      console.error('❌ Failed to create call session:', error);
      setError(error.message || 'Failed to create call session');
      
      // Fallback to mock creation
      const fallbackTabId = `tab-${Date.now()}`;
      const fallbackSession: CallSession = {
        callId: `call-${Date.now()}`,
        tabId: fallbackTabId,
        tabLabel: `New Call #${callSessions.length + 1}`,
        participantInfo: { agent: user.name || "Agent", customer: "New Customer", customerPhone: "" },
        callStatus: 'connecting',
        callStartTime: new Date(),
        isActive: false
      };
      
      setCallSessions(prev => [...prev, fallbackSession]);
      setActiveTabId(fallbackTabId);
      console.log('⚠️ Using fallback call tab creation:', fallbackSession);
    } finally {
      setIsLoading(false);
    }
  }, [callSessions.length, user]);

  // Switch to tab with backend activation
  const switchToTab = useCallback(async (tabId: string) => {
    const targetSession = callSessions.find(session => session.tabId === tabId);
    if (!targetSession) {
      console.error('Target session not found:', tabId);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Activate the call session via API
      await callAPI.activateCallSession(targetSession.callId);
      
      setActiveTabId(tabId);
      console.log('✅ Switched to tab via API:', tabId);
    } catch (error: any) {
      console.error('❌ Failed to activate call session:', error);
      setError(error.message || 'Failed to activate call session');
      
      // Fallback to local switch
      setActiveTabId(tabId);
      console.log('⚠️ Using fallback tab switch:', tabId);
    } finally {
      setIsLoading(false);
    }
  }, [callSessions]);

  // Close call tab with backend cleanup
  const closeCallTab = useCallback(async (tabId: string) => {
    const sessionToClose = callSessions.find(session => session.tabId === tabId);
    if (!sessionToClose) return;

    // Show confirmation if call is active
    if (sessionToClose.callStatus === 'active') {
      const confirmed = window.confirm('This will end the active call. Are you sure?');
      if (!confirmed) return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // End call session via API
      await callAPI.endCallSession(sessionToClose.callId, 'agent_closed');
      
      // Remove the session locally
      setCallSessions(prev => prev.filter(session => session.tabId !== tabId));
      
      // Switch to another tab if closing the active one
      if (tabId === activeTabId) {
        const remainingSessions = callSessions.filter(session => session.tabId !== tabId);
        if (remainingSessions.length > 0) {
          setActiveTabId(remainingSessions[0].tabId);
        } else {
          // No tabs remain, set activeTabId to null
          setActiveTabId(null);
        }
      }
      
      console.log('✅ Call tab closed via API:', tabId);
    } catch (error: any) {
      console.error('❌ Failed to end call session:', error);
      setError(error.message || 'Failed to end call session');
      
      // Fallback to local cleanup
      setCallSessions(prev => prev.filter(session => session.tabId !== tabId));
      
      if (tabId === activeTabId) {
        const remainingSessions = callSessions.filter(session => session.tabId !== tabId);
        if (remainingSessions.length > 0) {
          setActiveTabId(remainingSessions[0].tabId);
        } else {
          setActiveTabId(null);
        }
      }
      
      console.log('⚠️ Using fallback tab close:', tabId);
    } finally {
      setIsLoading(false);
    }
  }, [callSessions, activeTabId, createNewCallTab]);

  return {
    callSessions,
    activeTabId,
    activeCallSession,
    hasActiveCall,
    isLoading,
    error,
    createNewCallTab,
    switchToTab,
    closeCallTab
  };
};
