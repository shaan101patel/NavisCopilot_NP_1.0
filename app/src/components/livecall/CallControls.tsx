/**
 * CallControls Component
 * 
 * Context-aware call controls that changes appearance and functionality based on call state.
 * - Shows "Connect Audio" button when no active call
 * - Shows green "Call Controls" dropdown menu when call is active
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Phone, Headphones, Pause, PhoneOff, Users } from "lucide-react";
import { CallControlsProps } from '@/types/livecall';

export const CallControls: React.FC<CallControlsProps> = ({
  hasActiveCall,
  showCallControlsMenu,
  onToggleCallControls,
  onHold,
  onHangUp,
  onTransfer
}) => {
  if (hasActiveCall) {
    return (
      <div className="relative call-controls-container">
        <Button 
          onClick={onToggleCallControls}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          aria-label="Call controls menu - hold, hang up, transfer"
          title="Manage active call - hold, hang up, or transfer"
        >
          <Phone size={18} />
          Call Controls
        </Button>

        {/* Call Controls Dropdown Menu */}
        {showCallControlsMenu && (
          <div className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg py-2 min-w-48 z-50">
            <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-border mb-1">
              Active Call Actions:
            </div>
            
            <button
              onClick={onHold}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              aria-label="Put call on hold"
            >
              <Pause size={16} />
              Hold
            </button>
            
            <button
              onClick={onHangUp}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 text-destructive hover:text-destructive"
              aria-label="End call"
            >
              <PhoneOff size={16} />
              Hang Up
            </button>
            
            <button
              onClick={onTransfer}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
              aria-label="Transfer call to another agent"
            >
              <Users size={16} />
              Transfer
            </button>
          </div>
        )}
      </div>
    );
  }

  // No active call - show Connect Audio button
  return (
    <Button 
      onClick={onToggleCallControls}
      variant="outline"
      className="flex items-center gap-2"
      aria-label="Connect audio - choose screen share or Phone"
      title="Connect audio for enhanced call experience"
    >
      <Headphones size={18} />
      Connect Audio
    </Button>
  );
};
