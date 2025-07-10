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
import { GripHorizontal, Ticket } from "lucide-react";

// Import refactored components and hooks
import {
  CallTabs,
  CallControls,
  TranscriptArea,
  NotesArea,
  NotesHeader,
  AiSuggestionsPanel,
  AiChat,
  useLiveCallState,
  useCallControls,
  useNotesState,
  useAiChat,
  useTranscript
} from '@/components/livecall';

// Import remaining modals and components that need to be extracted
import { ConnectAudioModal, CreateTicketModal, TransferDropdown } from './modals';

export default function LiveCall() {
  // Custom hooks for state management
  const callState = useLiveCallState();
  const callControls = useCallControls();
  const notesState = useNotesState();
  const aiChatState = useAiChat();
  const transcriptState = useTranscript();

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

  // Attach global mouse events when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update call duration timer (mock)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const start = callState.activeCallSession?.callStartTime || new Date();
      const diffMs = now.getTime() - start.getTime();
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [callState.activeCallSession?.callStartTime]);

  // Handle modal actions
  const handleCreateTicket = () => {
    setShowCreateTicketModal(true);
  };

  const handleConnectAudioOrControls = () => {
    if (callState.hasActiveCall) {
      callControls.toggleCallControls();
    } else {
      setShowConnectAudioModal(true);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      {/* Chrome-style Call Tabs */}
      <CallTabs
        callSessions={callState.callSessions}
        activeTabId={callState.activeTabId}
        onSwitchTab={callState.switchToTab}
        onCloseTab={callState.closeCallTab}
        onCreateNewTab={callState.createNewCallTab}
      />

      {/* Header with Call Information and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading text-foreground">Live Calls</h1>
          {callState.activeCallSession && (
            <p className="text-sm text-muted-foreground mt-1">
              {callState.activeCallSession.participantInfo.customer} 
              {callState.activeCallSession.participantInfo.customerPhone && 
                ` • ${callState.activeCallSession.participantInfo.customerPhone}`
              }
              {callState.activeCallSession.callStatus !== 'connecting' && ` • ${callDuration}`}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Context-Aware Call Controls */}
          <CallControls
            hasActiveCall={callState.hasActiveCall}
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

      {/* Main Content Grid */}
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
              <NotesHeader
                notesViewMode={notesState.notesViewMode}
                onNotesViewModeChange={notesState.setNotesViewMode}
                onAddNote={notesState.addNote}
                onCopyAllNotes={notesState.copyAllStickyNotes}
                onCopyAllDocument={notesState.copyAllDocumentNotes}
                onGenerateAiNote={notesState.generateAiNote}
                copiedAllNotes={notesState.copiedAllNotes}
                copiedAllDocument={notesState.copiedAllDocument}
              />
              <NotesArea
                notes={notesState.notes}
                documentNotes={notesState.documentNotes}
                notesViewMode={notesState.notesViewMode}
                onNotesViewModeChange={notesState.setNotesViewMode}
                onAddNote={notesState.addNote}
                onUpdateNote={notesState.updateNote}
                onDeleteNote={notesState.deleteNote}
                onDocumentNotesChange={notesState.setDocumentNotes}
                onCopyNote={notesState.copyStickyNoteToClipboard}
                onCopyAllNotes={notesState.copyAllStickyNotes}
                onCopyAllDocument={notesState.copyAllDocumentNotes}
                onGenerateAiNote={notesState.generateAiNote}
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
            onNewMessageChange={aiChatState.setNewMessage}
            onSendMessage={aiChatState.sendChatMessage}
            onKeyPress={aiChatState.handleKeyPress}
            onAiResponseLevelChange={aiChatState.setAiResponseLevel}
            onGenerateQuickSuggestion={aiChatState.generateQuickSuggestion}
          />
        </Card>
      </div>

      {/* Modals */}
      
      {/* Transfer Dropdown - Standalone Modal */}
      <TransferDropdown
        show={callControls.showTransferDropdown}
        selectedAgent={callControls.selectedAgent}
        agentSearchQuery={callControls.agentSearchQuery}
        filteredAgents={callControls.filteredAgents}
        onSelectAgent={callControls.setSelectedAgent}
        onSearchQueryChange={callControls.setAgentSearchQuery}
        onConfirmTransfer={callControls.handleConfirmTransfer}
        onCancelTransfer={callControls.handleCancelTransfer}
      />

      {/* Connect Audio Modal */}
      <ConnectAudioModal
        show={showConnectAudioModal}
        onClose={() => setShowConnectAudioModal(false)}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        show={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        callSession={callState.activeCallSession}
      />
    </div>
  );
}
