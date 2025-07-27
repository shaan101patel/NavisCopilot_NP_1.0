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
    <div className="flex flex-col h-full">
      {/* Notes Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">Call Notes</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={notesViewMode === 'sticky' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNotesViewModeChange('sticky')}
              className="h-8 px-3 text-xs"
            >
              <StickyNote size={14} className="mr-1" />
              Sticky Notes
            </Button>
            <Button
              variant={notesViewMode === 'document' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNotesViewModeChange('document')}
              className="h-8 px-3 text-xs"
            >
              <List size={14} className="mr-1" />
              Call Summary
            </Button>
          </div>

          {/* Action Buttons - Different for each mode */}
          {notesViewMode === 'sticky' ? (
            // Sticky Notes Mode Actions
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddNote}
                className="h-8 px-3 text-xs"
              >
                <Plus size={14} className="mr-1" />
                Add Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyAllNotes}
                className="h-8 px-3 text-xs"
              >
                {copiedAllNotes ? (
                  <Check size={14} className="mr-1 text-green-500" />
                ) : (
                  <Copy size={14} className="mr-1" />
                )}
                Copy All
              </Button>
            </>
          ) : (
            // Document Mode Actions
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateAiNote}
                className="h-8 px-3 text-xs bg-blue-500 text-white hover:bg-blue-600"
              >
                Generate AI Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onCopyAllDocument}
                className="h-8 px-3 text-xs"
              >
                {copiedAllDocument ? (
                  <Check size={14} className="mr-1 text-green-500" />
                ) : (
                  <Copy size={14} className="mr-1" />
                )}
                Copy All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Notes Content */}
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
    </div>
  );
};


