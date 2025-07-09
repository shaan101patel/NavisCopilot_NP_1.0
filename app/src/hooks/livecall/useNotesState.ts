/**
 * useNotesState Hook
 * 
 * Custom hook for managing notes state and clipboard operations.
 * Handles both sticky notes and document-style note management.
 */

import { useState, useCallback } from 'react';
import { StickyNote, NotesViewMode } from '@/types/livecall';

// IMPLEMENT LATER: Replace with real notes data from backend (Supabase)
const mockNotes: StickyNote[] = [
  { id: "note-1", content: "Customer mentioned previous issue with shipping", createdAt: new Date(), color: "yellow" },
  { id: "note-2", content: "Check order status in system", createdAt: new Date(), color: "blue" },
  { id: "note-3", content: "Customer prefers email updates over phone calls", createdAt: new Date(), color: "green" },
  { id: "note-4", content: "Follow up needed within 24 hours", createdAt: new Date(), color: "pink" },
];

export const useNotesState = () => {
  const [notes, setNotes] = useState<StickyNote[]>(mockNotes);
  const [documentNotes, setDocumentNotes] = useState('');
  const [notesViewMode, setNotesViewMode] = useState<NotesViewMode>('sticky');
  
  // Copy functionality state
  const [copiedNoteIds, setCopiedNoteIds] = useState<Set<string>>(new Set());
  const [copiedAllNotes, setCopiedAllNotes] = useState(false);
  const [copiedAllDocument, setCopiedAllDocument] = useState(false);

  // IMPLEMENT LATER: Connect to backend for note operations
  const addNote = useCallback(() => {
    // IMPLEMENT LATER: Create new note in backend and update local state
    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      content: "New note...",
      createdAt: new Date(),
      color: "yellow"
    };
    setNotes(prev => [...prev, newNote]);
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    // IMPLEMENT LATER: Update note in backend
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, content, updatedAt: new Date() } : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    // IMPLEMENT LATER: Delete note from backend
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  // Copy button: Copies the content of this sticky note to clipboard.
  const copyStickyNoteToClipboard = useCallback(async (noteId: string, content: string) => {
    try {
      // Use modern Clipboard API for reliable copying across browsers
      await navigator.clipboard.writeText(content);
      
      // Provide visual feedback that copy was successful
      setCopiedNoteIds(prev => new Set(prev).add(noteId));
      
      // Clear the feedback after 2 seconds
      setTimeout(() => {
        setCopiedNoteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(noteId);
          return newSet;
        });
      }, 2000);
      
    } catch (err) {
      // Fallback for browsers that don't support Clipboard API
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Still provide visual feedback
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

  // Copy all sticky notes to clipboard
  const copyAllStickyNotes = useCallback(async () => {
    try {
      // Format all notes with timestamps and separators
      const allNotesText = notes.map((note, index) => {
        const timestamp = note.createdAt.toLocaleString();
        return `Note ${index + 1} (${timestamp}):\n${note.content}`;
      }).join('\n\n---\n\n');
      
      const formattedText = `Call Notes Summary - ${new Date().toLocaleString()}\n\n${allNotesText}`;
      
      // Use modern Clipboard API
      await navigator.clipboard.writeText(formattedText);
      
      // Provide visual feedback
      setCopiedAllNotes(true);
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopiedAllNotes(false);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to copy all sticky notes to clipboard:', err);
    }
  }, [notes]);

  // Copy all document content to clipboard
  const copyAllDocumentNotes = useCallback(async () => {
    try {
      // Add header and timestamp to document content
      const timestamp = new Date().toLocaleString();
      const formattedContent = `Call Summary & Notes - ${timestamp}\n\n${documentNotes || 'No notes written yet.'}`;
      
      // Use modern Clipboard API
      await navigator.clipboard.writeText(formattedContent);
      
      // Provide visual feedback
      setCopiedAllDocument(true);
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setCopiedAllDocument(false);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to copy document notes to clipboard:', err);
    }
  }, [documentNotes]);

  // IMPLEMENT LATER: Generate AI-powered call summary and insert into the document editor.
  const generateAiNote = useCallback(async () => {
    // Mock AI generation for now
    const mockAiSummary = `
Call Summary - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

Customer: Customer from current call
Issue: Order inquiry and shipping concerns

Key Points:
• Customer inquired about order ORD-12345
• Mentioned previous shipping issues
• Prefers email communication over phone calls
• Requires follow-up within 24 hours

Action Items:
• Check order status in system
• Update customer preferences for email notifications
• Schedule follow-up contact within 24 hours
• Review shipping history for improvement opportunities

Resolution: [To be completed]

Agent Notes: Customer was patient and understanding. Issue appears to be related to shipping delays.
`;

    // Insert the generated content into the document editor
    const currentContent = documentNotes;
    const newContent = currentContent 
      ? `${currentContent}\n\n---\n\n${mockAiSummary.trim()}`
      : mockAiSummary.trim();
    
    setDocumentNotes(newContent);
    
    console.log('AI note generated and inserted into document');
  }, [documentNotes]);

  return {
    notes,
    documentNotes,
    notesViewMode,
    copiedNoteIds,
    copiedAllNotes,
    copiedAllDocument,
    setNotesViewMode,
    setDocumentNotes,
    addNote,
    updateNote,
    deleteNote,
    copyStickyNoteToClipboard,
    copyAllStickyNotes,
    copyAllDocumentNotes,
    generateAiNote
  };
};
