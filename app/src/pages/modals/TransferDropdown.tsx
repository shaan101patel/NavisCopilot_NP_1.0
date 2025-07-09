/**
 * TransferDropdown Component
 * 
 * Dropdown modal for transferring calls to available agents.
 * Features agent search, availability status, and real-time agent filtering.
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Agent } from '@/types/livecall';

interface TransferDropdownProps {
  show: boolean;
  selectedAgent: string | null;
  agentSearchQuery: string;
  filteredAgents: Agent[];
  onSelectAgent: (agentId: string) => void;
  onSearchQueryChange: (query: string) => void;
  onConfirmTransfer: () => void;
  onCancelTransfer: () => void;
}

export const TransferDropdown: React.FC<TransferDropdownProps> = ({
  show,
  selectedAgent,
  agentSearchQuery,
  filteredAgents,
  onSelectAgent,
  onSearchQueryChange,
  onConfirmTransfer,
  onCancelTransfer
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4 shadow-xl">
        <div 
          className="p-6 transfer-dropdown-container"
          role="listbox"
          aria-label="Available agents for transfer"
        >
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-foreground mb-2">Transfer Call To:</h4>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search agents..."
                value={agentSearchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Select an available agent to transfer the call</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto border border-border rounded-md">
            <div className="py-2">
              {/* IMPLEMENT LATER: Fetch available agents from backend API */}
              {/* Expected API call: GET /api/agents/available?department=all&skillLevel=any */}
              {/* Filter by: availability, department, skill level, call capacity */}
              {/* Real-time updates via WebSocket for agent status changes */}
              {/* Search functionality: filter by name, department, skill level */}
              {filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => onSelectAgent(agent.id)}
                  className={`w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:bg-accent focus:ring-2 focus:ring-ring focus:ring-inset ${
                    selectedAgent === agent.id ? 'bg-accent border-r-2 border-primary' : ''
                  } ${agent.status !== 'available' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={agent.status !== 'available'}
                  role="option"
                  aria-selected={selectedAgent === agent.id}
                  aria-describedby={`agent-${agent.id}-status`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {agent.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {agent.department} • {agent.skillLevel}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === 'available' ? 'bg-green-500' : 
                        agent.status === 'busy' ? 'bg-red-500' : 
                        agent.status === 'away' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span 
                        id={`agent-${agent.id}-status`}
                        className={`text-xs capitalize ${
                          agent.status === 'available' ? 'text-green-600' : 
                          agent.status === 'busy' ? 'text-red-600' : 
                          agent.status === 'away' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredAgents.length === 0 && agentSearchQuery ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No agents found matching "{agentSearchQuery}"
                </div>
              ) : filteredAgents.filter(agent => agent.status === 'available').length === 0 && filteredAgents.length > 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No available agents found{agentSearchQuery ? ` for "${agentSearchQuery}"` : ''}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No agents currently available for transfer
                </div>
              ) : null}
            </div>
          </div>
          
          {/* Transfer Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={onCancelTransfer}
              variant="ghost"
              size="sm"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmTransfer}
              disabled={!selectedAgent || !filteredAgents.find(a => a.id === selectedAgent && a.status === 'available')}
              size="sm"
              className="flex-1"
            >
              Confirm Transfer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
