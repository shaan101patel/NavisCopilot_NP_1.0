/**
 * CallTabs Component
 * 
 * Renders Chrome-style horizontal tabs for managing multiple live call sessions.
 * Each tab represents an individual call with status indicators and close functionality.
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { CallTabsProps } from '@/types/livecall';

export const CallTabs: React.FC<CallTabsProps> = ({
  callSessions,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onCreateNewTab
}) => {
  return (
    <div className="flex items-center bg-muted/30 border-b border-border mb-6">
      <div className="flex flex-1 overflow-x-auto scrollbar-thin">
        {callSessions.map((session) => (
          <div
            key={session.tabId}
            className={`relative flex items-center min-w-0 max-w-xs group ${
              session.tabId === activeTabId 
                ? 'bg-background border-t-2 border-primary' 
                : 'bg-muted/50 hover:bg-muted/70'
            }`}
            style={{
              clipPath: session.tabId === activeTabId 
                ? 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)' 
                : 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)'
            }}
          >
            <button
              onClick={() => onSwitchTab(session.tabId)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium min-w-0 flex-1 focus:outline-none focus:ring-2 focus:ring-ring"
              title={`${session.tabLabel} - ${session.participantInfo.customer || 'Unknown Customer'}`}
              aria-label={`Switch to call tab: ${session.tabLabel}`}
            >
              {/* Call Status Indicator */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                session.callStatus === 'active' ? 'bg-green-500 animate-pulse' :
                session.callStatus === 'on-hold' ? 'bg-yellow-500' :
                session.callStatus === 'ringing' ? 'bg-blue-500 animate-pulse' :
                session.callStatus === 'connecting' ? 'bg-orange-500 animate-pulse' :
                'bg-gray-400'
              }`}></div>
              
              {/* Tab Label */}
              <span className="truncate flex-1 text-left">
                {session.tabLabel}
              </span>
              
              {/* Customer Info */}
              <span className="text-xs text-muted-foreground truncate max-w-24">
                {session.participantInfo.customer}
              </span>
            </button>
            
            {/* Close Tab Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(session.tabId);
              }}
              className="p-1 mr-2 rounded hover:bg-destructive/20 hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
              title="Close tab"
              aria-label={`Close call tab: ${session.tabLabel}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Add New Tab Button */}
      <Button
        onClick={onCreateNewTab}
        variant="ghost"
        size="sm"
        className="ml-2 mr-4 flex items-center gap-1"
        title="Start new call session"
        aria-label="Create new call tab"
      >
        <Plus size={16} />
        New Call
      </Button>
    </div>
  );
};
