/**
 * AgentContext - Global agent state management
 * 
 * Provides agent status, incoming call handling, and integration 
 * with live call tab management across the application.
 */

import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { useLiveCallState } from '@/hooks/livecall/useLiveCallState';

export type AgentStatus = 'ready' | 'on-call' | 'away' | 'busy';

// IMPLEMENT LATER: These types should come from backend API
interface IncomingCall {
  callId: string;
  callerName?: string;
  callerNumber: string;
  timestamp: Date;
}

interface AgentContextType {
  // Agent status
  status: AgentStatus;
  setStatus: (status: AgentStatus) => void;
  
  // Incoming call handling
  incomingCall: IncomingCall | null;
  simulateIncomingCall: () => void;
  acceptIncomingCall: () => void;
  declineIncomingCall: () => void;
  
  // Call tab management
  createCallTabFromIncoming: (callData: IncomingCall) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

interface AgentProviderProps {
  children: ReactNode;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<AgentStatus>('ready');
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  
  // IMPLEMENT LATER: Replace with real incoming call detection
  // Expected backend integration:
  // - WebSocket connection for real-time call notifications
  // - Data structure: { callId, callerName, callerNumber, priority, accountInfo }
  // - Integration with telephony system (Twilio, etc.)
  const simulateIncomingCall = useCallback(() => {
    if (status !== 'ready') {
      console.log('Agent not ready to receive calls');
      return;
    }

    const mockCall: IncomingCall = {
      callId: `call-${Date.now()}`,
      callerName: `Customer ${Math.floor(Math.random() * 1000)}`,
      callerNumber: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
      timestamp: new Date()
    };

    setIncomingCall(mockCall);
  }, [status]);

  // IMPLEMENT LATER: Replace with backend call acceptance
  // Expected backend actions:
  // - Notify telephony system to connect the call
  // - Create call session record in database
  // - Initialize transcription and AI assistance services
  // - Update agent status to 'on-call'
  const acceptIncomingCall = useCallback(() => {
    if (!incomingCall) return;

    // Create the call tab
    createCallTabFromIncoming(incomingCall);
    
    setStatus('on-call');
    setIncomingCall(null);
  }, [incomingCall]);

  // IMPLEMENT LATER: Replace with backend call decline
  // Expected backend actions:
  // - Notify telephony system to decline/route the call
  // - Log the declined call for analytics
  // - Optionally route to voicemail or another agent
  const declineIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);
  
  // Note: We can't use the hook directly here as it's specific to LiveCall page
  // Instead, we'll pass the data through context when needed
  
  const createCallTabFromIncoming = useCallback((callData: IncomingCall) => {
    // IMPLEMENT LATER: This should dispatch a global action that any page can handle
    // For now, we'll store the incoming call data in localStorage/sessionStorage
    // and let the LiveCall page pick it up
    
    const callTabData = {
      callId: callData.callId,
      tabId: `tab-${Date.now()}`,
      tabLabel: `${callData.callerName || 'Incoming Call'}`,
      participantInfo: {
        agent: "Current Agent", // IMPLEMENT LATER: Get from auth context
        customer: callData.callerName || 'Unknown Caller',
        customerPhone: callData.callerNumber
      },
      callStatus: 'active' as const,
      callStartTime: new Date(),
      isActive: true
    };
    
    // Store for LiveCall page to pick up
    sessionStorage.setItem('pendingCallTab', JSON.stringify(callTabData));
    
    console.log('Created call tab from incoming call:', callTabData);
  }, []);

  const value: AgentContextType = {
    status,
    setStatus,
    incomingCall,
    simulateIncomingCall,
    acceptIncomingCall,
    declineIncomingCall,
    createCallTabFromIncoming
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
