/**
 * AgentStatusButton Component
 * 
 * Displays the agent's current status and handles incoming call notifications.
 * Provides a status button with popup for incoming calls.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Phone, 
  PhoneCall, 
  Clock, 
  UserCheck, 
  UserX,
  PhoneIncoming,
  PhoneOff
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAgent } from '@/contexts/AgentContext';

// IMPLEMENT LATER: These types should come from backend API
interface IncomingCall {
  callId: string;
  callerName?: string;
  callerNumber: string;
  timestamp: Date;
}

interface AgentStatus {
  status: 'ready' | 'on-call' | 'away' | 'busy';
  lastUpdated: Date;
}

interface AgentStatusButtonProps {
  // No props needed - uses global context
}

export const AgentStatusButton: React.FC<AgentStatusButtonProps> = () => {
  const navigate = useNavigate();
  const { createCallTabFromIncoming } = useAgent();
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    status: 'ready',
    lastUpdated: new Date()
  });
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // IMPLEMENT LATER: Replace with real WebSocket or polling for incoming calls
  // Expected WebSocket event: { type: 'incoming_call', data: IncomingCall }
  // Expected API endpoint: GET /api/agent/status, PUT /api/agent/status
  useEffect(() => {
    // Mock incoming call simulation - remove when backend is ready
    const mockIncomingCall = () => {
      if (agentStatus.status === 'ready' && Math.random() > 0.95) {
        const mockCall: IncomingCall = {
          callId: `call-${Date.now()}`,
          callerName: 'John Doe',
          callerNumber: '+1 (555) 123-4567',
          timestamp: new Date()
        };
        setIncomingCall(mockCall);
        setShowCallPopup(true);
      }
    };

    const interval = setInterval(mockIncomingCall, 5000);
    return () => clearInterval(interval);
  }, [agentStatus.status]);

  // Handle clicking outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCallPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCallPopup(false);
      }
    };

    if (showCallPopup) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showCallPopup]);

  // Get status configuration
  const getStatusConfig = (status: AgentStatus['status']) => {
    switch (status) {
      case 'ready':
        return {
          label: 'Ready',
          icon: <UserCheck size={16} />,
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          indicatorColor: 'bg-green-500'
        };
      case 'on-call':
        return {
          label: 'On Call',
          icon: <PhoneCall size={16} />,
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          indicatorColor: 'bg-red-500'
        };
      case 'away':
        return {
          label: 'Away',
          icon: <Clock size={16} />,
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          indicatorColor: 'bg-yellow-500'
        };
      case 'busy':
        return {
          label: 'Busy',
          icon: <UserX size={16} />,
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
          indicatorColor: 'bg-orange-500'
        };
      default:
        return {
          label: 'Unknown',
          icon: <UserX size={16} />,
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          indicatorColor: 'bg-gray-500'
        };
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: AgentStatus['status']) => {
    // IMPLEMENT LATER: Send status update to backend
    // API call: PUT /api/agent/status { status: newStatus }
    setAgentStatus({
      status: newStatus,
      lastUpdated: new Date()
    });
    setShowCallPopup(false);
  };

  // Handle starting the call
  const handleStartCall = () => {
    if (!incomingCall) return;

    // IMPLEMENT LATER: Backend API call to accept the call
    // API call: POST /api/calls/accept { callId: incomingCall.callId }
    
    // Update agent status to on-call
    setAgentStatus({
      status: 'on-call',
      lastUpdated: new Date()
    });

    // Create call tab if callback provided
    createCallTabFromIncoming(incomingCall);

    // Navigate to live call page
    navigate('/live-call');

    // Clear incoming call and close popup
    setIncomingCall(null);
    setShowCallPopup(false);
  };

  // Handle declining the call
  const handleDeclineCall = () => {
    if (!incomingCall) return;

    // IMPLEMENT LATER: Backend API call to decline the call
    // API call: POST /api/calls/decline { callId: incomingCall.callId }
    
    // Clear incoming call and close popup
    setIncomingCall(null);
    setShowCallPopup(false);
  };

  const statusConfig = getStatusConfig(agentStatus.status);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        onClick={() => setShowCallPopup(!showCallPopup)}
        className={`flex items-center gap-2 ${incomingCall ? 'animate-pulse border-green-500' : ''}`}
        aria-label={`Agent status: ${statusConfig.label}. ${incomingCall ? 'Incoming call available' : ''}`}
        aria-expanded={showCallPopup}
        aria-haspopup="dialog"
      >
        {/* Status indicator dot */}
        <div className={`w-2 h-2 rounded-full ${statusConfig.indicatorColor} ${
          agentStatus.status === 'ready' ? 'animate-pulse' : ''
        }`} />
        
        {/* Status icon and label */}
        {statusConfig.icon}
        <span className="hidden sm:inline">{statusConfig.label}</span>
        
        {/* Incoming call indicator */}
        {incomingCall && (
          <Badge variant="success" className="ml-1 animate-pulse">
            <PhoneIncoming size={12} className="mr-1" />
            Call
          </Badge>
        )}
      </Button>

      {/* Status/Incoming Call Popup */}
      {showCallPopup && (
        <Card 
          ref={popupRef}
          className="absolute top-full right-0 mt-2 w-80 shadow-lg z-50 border-border"
          role="dialog"
          aria-label={incomingCall ? "Incoming call notification" : "Agent status menu"}
        >
          {incomingCall ? (
            // Incoming Call Popup
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <PhoneIncoming className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Incoming Call</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(incomingCall.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Caller Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Caller:</span>
                    <span className="text-sm">
                      {incomingCall.callerName || 'Unknown Caller'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Number:</span>
                    <span className="text-sm font-mono">
                      {incomingCall.callerNumber}
                    </span>
                  </div>
                </div>

                {/* Call Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleStartCall}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    aria-label="Accept incoming call"
                  >
                    <Phone size={16} className="mr-2" />
                    Start Call
                  </Button>
                  <Button
                    onClick={handleDeclineCall}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    aria-label="Decline incoming call"
                  >
                    <PhoneOff size={16} className="mr-2" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            // Status Change Menu
            <>
              <CardHeader className="pb-3">
                <h3 className="font-semibold">Change Status</h3>
                <p className="text-sm text-muted-foreground">
                  Current: {statusConfig.label}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-2">
                {(['ready', 'away', 'busy'] as const).map((status) => {
                  const config = getStatusConfig(status);
                  return (
                    <Button
                      key={status}
                      variant={agentStatus.status === status ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleStatusChange(status)}
                      className="w-full justify-start"
                      aria-label={`Set status to ${config.label}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${config.indicatorColor} mr-3`} />
                      {config.icon}
                      <span className="ml-2">{config.label}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </>
          )}
        </Card>
      )}
    </div>
  );
};
