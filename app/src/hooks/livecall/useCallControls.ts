/**
 * useCallControls Hook
 * 
 * Custom hook for managing call control actions and state.
 * Handles hold, hang up, transfer operations and menu visibility.
 */

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '../../types/livecall';

export const useCallControls = () => {
  const [showCallControlsMenu, setShowCallControlsMenu] = useState(false);
  const [showTransferDropdown, setShowTransferDropdown] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');

  // IMPLEMENT LATER: Replace with real agent data from backend user management system
  const mockAvailableAgents: Agent[] = [
    { id: 'agent-1', name: 'Sarah Johnson', status: 'available', department: 'Customer Support', skillLevel: 'senior' },
    { id: 'agent-2', name: 'Mike Chen', status: 'available', department: 'Technical Support', skillLevel: 'lead' },
    { id: 'agent-3', name: 'Emily Rodriguez', status: 'busy', department: 'Customer Support', skillLevel: 'junior' },
    { id: 'agent-4', name: 'David Kim', status: 'available', department: 'Sales', skillLevel: 'senior' },
    { id: 'agent-5', name: 'Lisa Thompson', status: 'away', department: 'Technical Support', skillLevel: 'senior' },
  ];

  // Filter agents based on search query
  const filteredAgents = mockAvailableAgents.filter(agent =>
    agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.department.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.skillLevel.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

  // Close call controls menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.call-controls-container')) {
        setShowCallControlsMenu(false);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCallControlsMenu(false);
      }
    };
    
    if (showCallControlsMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showCallControlsMenu]);

  // Close transfer dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.transfer-dropdown-container')) {
        setShowTransferDropdown(false);
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowTransferDropdown(false);
        setSelectedAgent('');
        setAgentSearchQuery('');
      }
    };
    
    if (showTransferDropdown) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showTransferDropdown]);

  // Clear selected agent if it's not in filtered results
  useEffect(() => {
    if (selectedAgent && !filteredAgents.find(agent => agent.id === selectedAgent)) {
      setSelectedAgent('');
    }
  }, [filteredAgents, selectedAgent]);

  // IMPLEMENT LATER: Connect to backend call control system for active call management
  const handleHold = useCallback(() => {
    // IMPLEMENT LATER: Put current call on hold
    // Expected API call:
    // - POST /api/calls/{callId}/hold
    // - Payload: { holdReason?: string }
    // - Response: { success: boolean, callStatus: 'on-hold', holdStartTime: Date }
    // - Update call status in current session
    // - WebSocket event: 'call-held'
    console.log('Putting call on hold...');
    setShowCallControlsMenu(false);
  }, []);

  const handleHangUp = useCallback(() => {
    // IMPLEMENT LATER: End current call
    // Expected API call:
    // - POST /api/calls/{callId}/end
    // - Payload: { endReason: 'agent_hangup', callSummary?: string }
    // - Response: { success: boolean, callId: string, endedAt: Date }
    // - Update call status in database
    // - Clean up real-time connections (WebSocket, WebRTC)
    console.log('Hanging up call...');
    setShowCallControlsMenu(false);
  }, []);

  const handleTransfer = useCallback(() => {
    // Show transfer dropdown instead of closing menu
    setShowTransferDropdown(true);
    setShowCallControlsMenu(false);
  }, []);

  const handleConfirmTransfer = useCallback(() => {
    if (!selectedAgent) return;
    
    // IMPLEMENT LATER: Execute call transfer to selected agent
    console.log(`Transferring call to agent: ${selectedAgent}...`);
    setShowTransferDropdown(false);
    setSelectedAgent('');
    setAgentSearchQuery('');
    setShowCallControlsMenu(false);
  }, [selectedAgent]);

  const handleCancelTransfer = useCallback(() => {
    setShowTransferDropdown(false);
    setSelectedAgent('');
    setAgentSearchQuery('');
  }, []);

  const toggleCallControls = useCallback(() => {
    setShowCallControlsMenu(!showCallControlsMenu);
  }, [showCallControlsMenu]);

  return {
    showCallControlsMenu,
    showTransferDropdown,
    selectedAgent,
    agentSearchQuery,
    filteredAgents,
    setSelectedAgent,
    setAgentSearchQuery,
    handleHold,
    handleHangUp,
    handleTransfer,
    handleConfirmTransfer,
    handleCancelTransfer,
    toggleCallControls
  };
};
