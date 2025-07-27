/**
 * TranscriptArea Component
 * 
 * Displays live call transcript with copy functionality for individual entries.
 * Shows speaker, timestamp, and conversation content with accessible controls.
 */

import React from 'react';
import { Copy, Check } from "lucide-react";
import { TranscriptAreaProps } from '@/types/livecall';

export const TranscriptArea: React.FC<TranscriptAreaProps> = ({
  transcript,
  onCopyTranscript,
  copiedTranscriptIds
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
      {/* IMPLEMENT LATER: Stream real-time transcript data here with WebSocket connection */}
      {/* Expected WebSocket events: 'transcript-update', 'speaker-change', 'call-status-change' */}
      
      {transcript.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">Live Transcript</div>
          <div className="text-sm">Conversation transcript will appear here once the call begins</div>
        </div>
      ) : (
        <div className="space-y-3">
          {transcript.map((entry) => (
          <div key={entry.id} className="group relative">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-sm ${
                entry.speaker === 'Agent' ? 'text-primary' : 'text-orange-600'
              }`}>
                {entry.speaker}
              </span>
              <span className="text-xs text-muted-foreground">
                {entry.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-card rounded-lg p-3 shadow-sm border border-border relative">
              <div className="pr-8">
                {entry.text}
              </div>
              
              {/* Copy Button - always visible on mobile, appears on hover on desktop */}
              <button
                onClick={() => onCopyTranscript(entry.id, entry.text, entry.speaker, entry.timestamp)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background border border-border shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                title={copiedTranscriptIds.has(entry.id) ? "Copied!" : "Copy transcript line"}
                aria-label={`Copy transcript line: ${entry.text.substring(0, 50)}${entry.text.length > 50 ? '...' : ''}`}
              >
                {copiedTranscriptIds.has(entry.id) ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
