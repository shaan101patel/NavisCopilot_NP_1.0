/**
 * LiveCall Page - Refactored
 * 
 * Main container component for the live call interface featuring:
 * - Chrome-style tabbed call sessions
 * - Context-aware call controls
 * - Real-time transcript display
 * - Dual-mode notes (sticky + document)
 * - AI chat assistant with suggestions
 * - Audio connection modals
 * - Ticket creation system
 * 
 * This component acts as a container orchestrating child components
 * and managing shared state through custom hooks.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripHorizontal, Ticket, Plus } from "lucide-react";
import { CallStateProvider } from '@/contexts/CallStateContext';

// Import refactored components and hooks
import { CallTabs } from '@/components/livecall/CallTabs';
import { CallControls } from '@/components/livecall/CallControls';
import { TranscriptArea } from '@/components/livecall/TranscriptArea';
import { NotesArea } from '@/components/livecall/NotesArea';
import { AiSuggestionsPanel } from '@/components/livecall/AiSuggestionsPanel';
import { AiChat } from '@/components/livecall/AiChat';
import { CreateTicketModal } from '@/pages/modals/CreateTicketModal';

import { useLiveCallState } from '@/hooks/livecall/useLiveCallState';
import { useCallControls } from '@/hooks/livecall/useCallControls';
import { useNotesState } from '@/hooks/livecall/useNotesState';
import { useAiChat } from '@/hooks/livecall/useAiChat';
import { useTranscript } from '@/hooks/livecall/useTranscript';

const LiveCallContent: React.FC = () => {
  // Custom hooks for state management
  const callState = useLiveCallState();
  const callControls = useCallControls(callState.activeCallSession?.callId);
  const notesState = useNotesState(callState.activeCallSession?.callId);
  const aiChatState = useAiChat(callState.activeCallSession?.callId);
  const transcriptState = useTranscript(callState.activeCallSession?.callId);

  // Local component state
  const [callDuration, setCallDuration] = useState('03:24');
  const [showConnectAudioModal, setShowConnectAudioModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

  // Draggable divider state
  const [transcriptHeight, setTranscriptHeight] = useState(60); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle dragging for the horizontal divider
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = e.clientY - containerRect.top;
    const newPercentage = (mouseY / containerHeight) * 100;
    
    // Constrain between 20% and 80%
    const constrainedPercentage = Math.max(20, Math.min(80, newPercentage));
    setTranscriptHeight(constrainedPercentage);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Set up mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle connect audio or show call controls
  const handleConnectAudioOrControls = useCallback(() => {
    if (callState.hasActiveCall) {
      callControls.toggleCallControls();
    } else {
      setShowConnectAudioModal(true);
    }
  }, [callState.hasActiveCall, callControls]);

  // Handle create ticket
  const handleCreateTicket = useCallback(() => {
    setShowCreateTicketModal(true);
  }, []);

  return (
    <div className="h-[calc(100vh-200px)]">
      {/* Chrome-style Call Tabs */}
      <CallTabs
        callSessions={callState.callSessions}
        activeTabId={callState.activeTabId || ""}
        onSwitchTab={callState.switchToTab}
        onCloseTab={callState.closeCallTab}
        onCreateNewTab={callState.createNewCallTab}
      />

      {/* Header with Call Information and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Live Calls</h1>
          {callState.activeCallSession ? (
            <p className="text-sm text-muted-foreground mt-1">
              {callState.activeCallSession.participantInfo.customer} 
              {callState.activeCallSession.participantInfo.customerPhone && 
                ` • ${callState.activeCallSession.participantInfo.customerPhone}`
              }
              {callState.activeCallSession.callStatus !== 'connecting' && ` • ${callDuration}`}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              No active calls. Click "New Call" to start a call session.
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Context-Aware Call Controls */}
          <CallControls
            hasActiveCall={!!callState.activeCallSession}
            showCallControlsMenu={callControls.showCallControlsMenu}
            onToggleCallControls={handleConnectAudioOrControls}
            onHold={callControls.handleHold}
            onHangUp={callControls.handleHangUp}
            onTransfer={callControls.handleTransfer}
          />

          {/* Create Ticket Button */}
          <Button 
            onClick={handleCreateTicket}
            variant="outline"
            className="flex items-center gap-2"
            aria-label="Create a new support ticket"
            title="Create a new support ticket for this call"
          >
            <Ticket size={18} />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(callState.error || callControls.error) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">
            {callState.error || callControls.error}
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      {callState.callSessions.length === 0 ? (
        <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Call Sessions</h3>
            <p className="text-gray-500 mb-4">Click "New Call" to start your first call session</p>
            <Button onClick={callState.createNewCallTab} className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Start New Call
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Left Pane: Transcript and Notes with Draggable Divider */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 flex flex-col overflow-hidden" ref={containerRef}>
            {/* Transcript Section */}
            <div 
              className="flex flex-col overflow-hidden"
              style={{ height: `${transcriptHeight}%` }}
            >
              <div className="p-4 border-b border-border">
                <h2 className="text-xl font-semibold text-card-foreground">Live Transcript</h2>
              </div>
              <TranscriptArea
                transcript={transcriptState.transcript}
                onCopyTranscript={transcriptState.copyTranscriptToClipboard}
                copiedTranscriptIds={transcriptState.copiedTranscriptIds}
              />
            </div>

            {/* Draggable Divider */}
            <div
              className="flex items-center justify-center h-3 bg-border hover:bg-primary/20 cursor-row-resize transition-colors"
              onMouseDown={handleMouseDown}
            >
              <GripHorizontal size={16} className="text-gray-500" />
            </div>

            {/* Notes Section */}
            <div 
              className="flex flex-col overflow-hidden"
              style={{ height: `${100 - transcriptHeight}%` }}
            >
              <NotesArea
                notes={notesState.notes}
                documentNotes={notesState.documentNotes}
                notesViewMode={notesState.notesViewMode}
                onNotesViewModeChange={notesState.setNotesViewMode}
                onAddNote={notesState.addNote}
                onUpdateNote={notesState.updateNote}
                onDeleteNote={notesState.deleteNote}
                onDocumentNotesChange={notesState.updateDocumentNotes}
                onCopyNote={notesState.copyStickyNoteToClipboard}
                onCopyAllNotes={notesState.copyAllStickyNotes}
                onCopyAllDocument={notesState.copyDocumentNotesToClipboard}
                onGenerateAiNote={() => {}} // Placeholder function
                copiedNoteIds={notesState.copiedNoteIds}
                copiedAllNotes={notesState.copiedAllNotes}
                copiedAllDocument={notesState.copiedAllDocument}
              />
            </div>
          </Card>
        </div>

        {/* Right Pane: AI Assistant & Chat */}
        <Card className="p-6 flex flex-col gap-4 h-full">
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">AI Assistant & Chat</h2>
          
          {/* AI Quick Suggestions */}
          <AiSuggestionsPanel
            quickSuggestion={aiChatState.quickSuggestion}
            isGeneratingSuggestion={aiChatState.isGeneratingSuggestion}
            onGenerateQuickSuggestion={aiChatState.generateQuickSuggestion}
          />

          {/* AI Chat Interface */}
          <AiChat
            chatMessages={aiChatState.chatMessages}
            newMessage={aiChatState.newMessage}
            aiResponseLevel={aiChatState.aiResponseLevel}
            isAiTyping={aiChatState.isAiTyping}
            quickSuggestion={aiChatState.quickSuggestion}
            isGeneratingSuggestion={aiChatState.isGeneratingSuggestion}
            error={aiChatState.error}
            onNewMessageChange={aiChatState.setNewMessage}
            onSendMessage={aiChatState.sendChatMessage}
            onKeyPress={aiChatState.handleKeyPress}
            onAiResponseLevelChange={aiChatState.setAiResponseLevel}
            onGenerateQuickSuggestion={aiChatState.generateQuickSuggestion}          onClearError={aiChatState.clearError}
        />
      </Card>
    </div>
    )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        show={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        callSession={callState.activeCallSession}
        transcript={transcriptState.transcript}
        stickyNotes={notesState.notes}
        documentNotes={notesState.documentNotes}
        aiChatMessages={aiChatState.chatMessages}
        callAnalytics={{
          callDuration: Date.now() - (callState.activeCallSession?.callStartTime.getTime() || 0),
          sentimentScore: 0.7, // Mock data - replace with actual analytics
          keywordsMentioned: ['billing', 'refund', 'technical'], // Mock data
          escalationFlags: [], // Mock data
          resolutionStatus: 'pending'
        }}
      />
    </div>
  );
};

// Main export with CallStateProvider wrapper
export default function LiveCall() {
  return (
    <CallStateProvider>
      <LiveCallContent />
    </CallStateProvider>
  );
}
