/**
 * LiveCall Types and Interfaces
 * 
 * Contains all TypeScript interfaces and types used across the LiveCall feature.
 * This centralizes type definitions for better maintainability and consistency.
 */

export interface CallSession {
  callId: string;
  tabId: string;
  tabLabel: string;
  participantInfo: { 
    agent: string; 
    customer: string; 
    customerPhone?: string; 
  };
  callStatus: 'active' | 'ringing' | 'on-hold' | 'ended' | 'connecting';
  callStartTime: Date;
  isActive: boolean;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'Agent' | 'Customer';
  text: string;
  timestamp: Date;
}

export interface StickyNote {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  color?: 'yellow' | 'blue' | 'green' | 'pink';
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'agent' | 'ai';
  timestamp: Date;
  aiResponseLevel?: AiResponseLevel;
  isTyping?: boolean;
}

export type AiResponseLevel = 'instant' | 'quick' | 'immediate';

export interface Agent {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  department: string;
  skillLevel: 'junior' | 'senior' | 'lead';
}

export interface AgentPhoneNumber {
  id: string;
  number: string;
  label: string;
  isPrimary: boolean;
  isActive?: boolean;
}

export interface TicketForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issueTitle: string;
  issueDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'technical' | 'billing' | 'account' | 'other';
  callId: string;
  agentNotes: string;
}

export interface MockPhoneState {
  isConnected: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isOnHold: boolean;
  showKeypad: boolean;
  selectedPhoneNumber: string;
  callDuration: string;
}

export type AudioConnectionMode = 'share-screen' | 'mock-phone';

export type NotesViewMode = 'sticky' | 'document';

// Props interfaces for components
export interface CallTabsProps {
  callSessions: CallSession[];
  activeTabId: string;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCreateNewTab: () => void;
}

export interface CallControlsProps {
  hasActiveCall: boolean;
  showCallControlsMenu: boolean;
  onToggleCallControls: () => void;
  onHold: () => void;
  onHangUp: () => void;
  onTransfer: () => void;
}

export interface TranscriptAreaProps {
  transcript: TranscriptEntry[];
  onCopyTranscript: (id: string, text: string, speaker: string, timestamp: Date) => void;
  copiedTranscriptIds: Set<string>;
}

export interface NotesAreaProps {
  notes: StickyNote[];
  documentNotes: string;
  notesViewMode: NotesViewMode;
  onNotesViewModeChange: (mode: NotesViewMode) => void;
  onAddNote: () => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onDocumentNotesChange: (content: string) => void;
  onCopyNote: (id: string, content: string) => void;
  onCopyAllNotes: () => void;
  onCopyAllDocument: () => void;
  onGenerateAiNote: () => void;
  copiedNoteIds: Set<string>;
  copiedAllNotes: boolean;
  copiedAllDocument: boolean;
}

export interface AiChatProps {
  chatMessages: ChatMessage[];
  newMessage: string;
  aiResponseLevel: AiResponseLevel;
  isAiTyping: boolean;
  quickSuggestion: string;
  isGeneratingSuggestion: boolean;
  onNewMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onAiResponseLevelChange: (level: AiResponseLevel) => void;
  onGenerateQuickSuggestion: () => void;
}
