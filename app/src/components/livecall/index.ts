/**
 * LiveCall Components Index
 * 
 * Central export file for all LiveCall-related components.
 * Provides clean imports and better organization.
 */

// Core components
export { CallTabs } from './CallTabs';
export { CallControls } from './CallControls';
export { TranscriptArea } from './TranscriptArea';
export { NotesArea, NotesHeader } from './NotesArea';
export { StickyNotesView } from './StickyNotesView';
export { DocumentNotesView } from './DocumentNotesView';
export { AiSuggestionsPanel } from './AiSuggestionsPanel';
export { AiChat } from './AiChat';

// Re-export hooks for convenience
export { useLiveCallState } from '../../hooks/livecall/useLiveCallState';
export { useCallControls } from '../../hooks/livecall/useCallControls';
export { useNotesState } from '../../hooks/livecall/useNotesState';
export { useAiChat } from '../../hooks/livecall/useAiChat';
export { useTranscript } from '../../hooks/livecall/useTranscript';

// Re-export types
export * from '../../types/livecall';
