/**
 * useNotesState Hook
 * 
 * Custom hook for managing call-specific notes state and clipboard operations.
 * Handles both sticky notes and document-style note management with proper
 * call isolation.
 */

import { useState, useCallback, useEffect } from 'react';
import { StickyNote, NotesViewMode } from '@/types/livecall';
import { useCallStateContext } from '@/contexts/CallStateContext';

export const useNotesState = (callId?: string) => {
  // Local UI state (not call-specific)
  const [notesViewMode, setNotesViewMode] = useState<NotesViewMode>('sticky');
  const [copiedNoteIds, setCopiedNoteIds] = useState<Set<string>>(new Set());
  const [copiedAllNotes, setCopiedAllNotes] = useState(false);
  const [copiedAllDocument, setCopiedAllDocument] = useState(false);

  // Call state context
  const callStateContext = useCallStateContext();
  
  // Ensure call state exists when callId changes
  useEffect(() => {
    if (callId) {
      callStateContext.ensureCallState(callId);
    }
  }, [callId, callStateContext]);
  
  // Get call-specific state if callId is provided
  const callState = callId ? callStateContext.getCallState(callId) : null;
  
  // Fall back to empty state if no callId provided
  const notes = callState?.notes || [];
  const documentNotes = callState?.documentNotes || '';
  const notesError = callState?.notesError || null;
  const notesLoading = callState?.notesLoading || false;

  // Notes operations (call-specific)
  const addNote = useCallback(async () => {
    if (!callId) {
      console.warn('Cannot add note: no callId provided');
      return;
    }
    
    try {
      await callStateContext.addCallNote(callId, "New note...", "yellow");
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  }, [callId, callStateContext]);

  const updateNote = useCallback(async (id: string, content: string) => {
    if (!callId) {
      console.warn('Cannot update note: no callId provided');
      return;
    }
    
    try {
      await callStateContext.updateCallNote(callId, id, content);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }, [callId, callStateContext]);

  const deleteNote = useCallback(async (id: string) => {
    if (!callId) {
      console.warn('Cannot delete note: no callId provided');
      return;
    }
    
    try {
      await callStateContext.deleteCallNote(callId, id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [callId, callStateContext]);

  const updateDocumentNotes = useCallback(async (content: string) => {
    if (!callId) {
      console.warn('Cannot update document notes: no callId provided');
      return;
    }
    
    try {
      await callStateContext.updateDocumentNotes(callId, content);
    } catch (error) {
      console.error('Failed to update document notes:', error);
    }
  }, [callId, callStateContext]);

  // Copy functionality (UI-specific, not call-dependent)
  const copyStickyNoteToClipboard = useCallback(async (noteId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      
      setCopiedNoteIds(prev => new Set(prev).add(noteId));
      
      setTimeout(() => {
        setCopiedNoteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteId);
          return newSet;
        });
      }, 2000);
      
    } catch (err) {
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopiedNoteIds(prev => new Set(prev).add(noteId));
        setTimeout(() => {
          setCopiedNoteIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteId);
            return newSet;
          });
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy sticky note to clipboard:', fallbackErr);
      }
    }
  }, []);

  const copyAllStickyNotes = useCallback(async () => {
    try {
      const allNotesText = notes.map((note, index) => {
        const timestamp = note.createdAt.toLocaleString();
        return `Note ${index + 1} (${timestamp}):\n${note.content}`;
      }).join('\n\n---\n\n');
      
      const formattedText = `Call Notes Summary - ${new Date().toLocaleString()}\n\n${allNotesText}`;
      
      await navigator.clipboard.writeText(formattedText);
      
      setCopiedAllNotes(true);
      setTimeout(() => setCopiedAllNotes(false), 2000);
      
    } catch (err) {
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const allNotesText = notes.map((note, index) => {
          const timestamp = note.createdAt.toLocaleString();
          return `Note ${index + 1} (${timestamp}):\n${note.content}`;
        }).join('\n\n---\n\n');
        
        const formattedText = `Call Notes Summary - ${new Date().toLocaleString()}\n\n${allNotesText}`;
        
        const textArea = document.createElement('textarea');
        textArea.value = formattedText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopiedAllNotes(true);
        setTimeout(() => setCopiedAllNotes(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy all notes to clipboard:', fallbackErr);
      }
    }
  }, [notes]);

  const copyDocumentNotesToClipboard = useCallback(async () => {
    try {
      const formattedText = `Call Document Notes - ${new Date().toLocaleString()}\n\n${documentNotes}`;
      
      await navigator.clipboard.writeText(formattedText);
      
      setCopiedAllDocument(true);
      setTimeout(() => setCopiedAllDocument(false), 2000);
      
    } catch (err) {
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const formattedText = `Call Document Notes - ${new Date().toLocaleString()}\n\n${documentNotes}`;
        
        const textArea = document.createElement('textarea');
        textArea.value = formattedText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopiedAllDocument(true);
        setTimeout(() => setCopiedAllDocument(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy document notes to clipboard:', fallbackErr);
      }
    }
  }, [documentNotes]);

  return {
    // Call-specific state
    notes,
    documentNotes,
    notesError,
    notesLoading,
    
    // UI state
    notesViewMode,
    setNotesViewMode,
    copiedNoteIds,
    copiedAllNotes,
    copiedAllDocument,
    
    // Call-specific operations
    addNote,
    updateNote,
    deleteNote,
    updateDocumentNotes,
    
    // Copy operations
    copyStickyNoteToClipboard,
    copyAllStickyNotes,
    copyDocumentNotesToClipboard,
  };
};
