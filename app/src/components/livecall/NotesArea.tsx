/**
 * NotesArea Component
 * 
 * Container component that manages both sticky notes and document-style note views.
 * Handles view mode switching and provides unified controls for note management.
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Copy, Check, StickyNote, List } from "lucide-react";
import { NotesAreaProps } from '@/types/livecall';
import { StickyNotesView } from './StickyNotesView';
import { DocumentNotesView } from './DocumentNotesView';

export const NotesArea: React.FC<NotesAreaProps> = ({
  notes,
  documentNotes,
  notesViewMode,
  onNotesViewModeChange,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onDocumentNotesChange,
  onCopyNote,
  onCopyAllNotes,
  onCopyAllDocument,
  onGenerateAiNote,
  copiedNoteIds,
  copiedAllNotes,
  copiedAllDocument
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-muted/30 scrollbar-thin">
      {/* IMPLEMENT LATER: Connect to backend for real-time note synchronization */}
      {/* Expected features: auto-save, real-time collaboration, note categories, search */}
      
      {notesViewMode === 'sticky' ? (
        // Sticky Notes View
        <StickyNotesView
          notes={notes}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
          onCopyNote={onCopyNote}
          copiedNoteIds={copiedNoteIds}
        />
      ) : (
        // Document-Style Editor
        <DocumentNotesView
          documentNotes={documentNotes}
          onDocumentNotesChange={onDocumentNotesChange}
        />
      )}
    </div>
  );
};

/**
 * NotesHeader Component
 * 
 * Header section for the notes area with view mode toggle and action buttons.
 */
interface NotesHeaderProps {
  notesViewMode: 'sticky' | 'document';
  onNotesViewModeChange: (mode: 'sticky' | 'document') => void;
  onAddNote: () => void;
  onCopyAllNotes: () => void;
  onCopyAllDocument: () => void;
  onGenerateAiNote: () => void;
  copiedAllNotes: boolean;
  copiedAllDocument: boolean;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  notesViewMode,
  onNotesViewModeChange,
  onAddNote,
  onCopyAllNotes,
  onCopyAllDocument,
  onGenerateAiNote,
  copiedAllNotes,
  copiedAllDocument
}) => {
  return (
    <div className="p-4 border-b border-border flex items-center justify-between">
      <h2 className="text-xl font-semibold text-card-foreground">Call Notes</h2>
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex border border-border rounded-md overflow-hidden">
          <Button 
            variant={notesViewMode === 'sticky' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNotesViewModeChange('sticky')}
            className="rounded-none border-none"
            title="Switch to sticky notes view"
            aria-label="Switch to sticky notes view"
          >
            <StickyNote size={16} />
          </Button>
          <Button 
            variant={notesViewMode === 'document' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNotesViewModeChange('document')}
            className="rounded-none border-none"
            title="Switch to document editor view"
            aria-label="Switch to document editor view"
          >
            <List size={16} />
          </Button>
        </div>
        
        {notesViewMode === 'sticky' ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddNote}
              className="flex items-center gap-2"
              aria-label="Add new sticky note"
            >
              <Plus size={16} />
              Add Note
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCopyAllNotes}
              className="flex items-center gap-2"
              aria-label="Copy all sticky notes to clipboard"
              title="Copy all sticky notes with timestamps"
            >
              {copiedAllNotes ? (
                <>
                  <Check size={16} className="text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy All
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onGenerateAiNote}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              aria-label="Generate AI-powered call summary"
              title="Generate AI summary based on call transcript and notes"
            >
              <Plus size={16} />
              Generate AI Note
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCopyAllDocument}
              className="flex items-center gap-2"
              aria-label="Copy all document content to clipboard"
              title="Copy entire document with timestamp"
            >
              {copiedAllDocument ? (
                <>
                  <Check size={16} className="text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy All
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
