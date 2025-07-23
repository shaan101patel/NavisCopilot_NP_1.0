/**
 * useCallControls Hook
 * 
 * Custom hook for managing call control actions and state.
 * Handles hold, hang up, transfer operations and menu visibility.
 */

import { useState, useEffect, useCallback } from 'react';
import { Agent } from '../../types/livecall';
import { callAPI } from '@/services/supabase';

export const useCallControls = (activeCallId?: string) => {
  const [showCallControlsMenu, setShowCallControlsMenu] = useState(false);
  const [showTransferDropdown, setShowTransferDropdown] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Get available agents (not busy or away)
  const availableAgents = filteredAgents.filter(agent => 
    agent.status === 'available'
  );

  // Handle hold call with backend integration
  const handleHold = useCallback(async () => {
    if (!activeCallId) {
      console.error('No active call ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await callAPI.holdCall(activeCallId, 'Agent requested hold');
      console.log('✅ Call put on hold via API');
      setShowCallControlsMenu(false);
    } catch (error: any) {
      console.error('❌ Failed to put call on hold:', error);
      setError(error.message || 'Failed to put call on hold');
      
      // Fallback to local state change
      console.log('⚠️ Using fallback hold operation');
      setShowCallControlsMenu(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeCallId]);

  // Handle hang up with backend integration
  const handleHangUp = useCallback(async () => {
    if (!activeCallId) {
      console.error('No active call ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await callAPI.endCall(activeCallId, 'agent_hangup');
      console.log('✅ Call ended via API');
      setShowCallControlsMenu(false);
    } catch (error: any) {
      console.error('❌ Failed to end call:', error);
      setError(error.message || 'Failed to end call');
      
      // Fallback to local state change
      console.log('⚠️ Using fallback hang up operation');
      setShowCallControlsMenu(false);
    } finally {
      setIsLoading(false);
    }
  }, [activeCallId]);

  // Handle transfer with backend integration
  const handleTransfer = useCallback(() => {
    // Show transfer dropdown instead of closing menu
    setShowTransferDropdown(true);
    setShowCallControlsMenu(false);
  }, []);

  // Handle confirm transfer with backend integration
  const handleConfirmTransfer = useCallback(async () => {
    if (!selectedAgent || !activeCallId) {
      console.error('No agent selected or no active call ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await callAPI.transferCall(activeCallId, selectedAgent, 'Agent requested transfer');
      console.log('✅ Call transferred via API to agent:', selectedAgent);
      
      setShowTransferDropdown(false);
      setSelectedAgent('');
      setAgentSearchQuery('');
      setShowCallControlsMenu(false);
    } catch (error: any) {
      console.error('❌ Failed to transfer call:', error);
      setError(error.message || 'Failed to transfer call');
      
      // Fallback to local state change
      console.log('⚠️ Using fallback transfer operation');
      setShowTransferDropdown(false);
      setSelectedAgent('');
      setAgentSearchQuery('');
      setShowCallControlsMenu(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent, activeCallId]);

  // Handle cancel transfer
  const handleCancelTransfer = useCallback(() => {
    setShowTransferDropdown(false);
    setSelectedAgent('');
    setAgentSearchQuery('');
  }, []);

  // Toggle call controls menu
  const toggleCallControls = useCallback(() => {
    setShowCallControlsMenu(!showCallControlsMenu);
  }, [showCallControlsMenu]);

  // Handle agent selection for transfer
  const handleAgentSelect = useCallback((agentId: string) => {
    setSelectedAgent(agentId);
  }, []);

  // Handle agent search
  const handleAgentSearch = useCallback((query: string) => {
    setAgentSearchQuery(query);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    showCallControlsMenu,
    showTransferDropdown,
    selectedAgent,
    agentSearchQuery,
    isLoading,
    error,
    
    // Available agents
    availableAgents,
    filteredAgents,
    
    // Actions
    handleHold,
    handleHangUp,
    handleTransfer,
    handleConfirmTransfer,
    handleCancelTransfer,
    toggleCallControls,
    handleAgentSelect,
    handleAgentSearch,
    clearError,
  };
};
