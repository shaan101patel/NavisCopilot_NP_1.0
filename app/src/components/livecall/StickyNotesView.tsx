/**
 * StickyNotesView Component
 * 
 * Displays notes in a sticky note grid layout with copy and delete functionality.
 * Each note is color-coded and shows creation timestamp.
 */

import React from 'react';
import { Copy, Check, Trash2 } from "lucide-react";
import { StickyNote } from '@/types/livecall';

interface StickyNotesViewProps {
  notes: StickyNote[];
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onCopyNote: (id: string, content: string) => void;
  copiedNoteIds: Set<string>;
}

export const StickyNotesView: React.FC<StickyNotesViewProps> = ({
  notes,
  onUpdateNote,
  onDeleteNote,
  onCopyNote,
  copiedNoteIds
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {notes.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
          <div className="text-base font-medium mb-1">No Notes Yet</div>
          <div className="text-sm">Click the + button above to add your first note</div>
        </div>
      ) : (
        notes.map((note) => (
        <div 
          key={note.id}
          className={`relative p-3 rounded-lg shadow-md transition-all hover:shadow-lg ${
            note.color === 'yellow' ? 'bg-yellow-200 dark:bg-yellow-800/40 dark:text-yellow-100' :
            note.color === 'blue' ? 'bg-blue-200 dark:bg-blue-800/40 dark:text-blue-100' :
            note.color === 'green' ? 'bg-green-200 dark:bg-green-800/40 dark:text-green-100' :
            'bg-pink-200 dark:bg-pink-800/40 dark:text-pink-100'
          }`}
        >
          <textarea
            className="w-full bg-transparent border-none resize-none text-sm placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none"
            value={note.content}
            onChange={(e) => onUpdateNote(note.id, e.target.value)}
            placeholder="Add a note..."
            rows={3}
          />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-300">
            <span>{note.createdAt.toLocaleTimeString()}</span>
            <div className="flex gap-1">
              {/* Copy button: Copies the content of this sticky note to clipboard. */}
              <button 
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                onClick={() => onCopyNote(note.id, note.content)}
                title={copiedNoteIds.has(note.id) ? "Copied!" : "Copy note content"}
                aria-label={`Copy sticky note content: ${note.content.substring(0, 30)}${note.content.length > 30 ? '...' : ''}`}
              >
                {copiedNoteIds.has(note.id) ? (
                  <Check size={12} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
              <button 
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-red-600 dark:text-red-400"
                onClick={() => onDeleteNote(note.id)}
                title="Delete note"
                aria-label="Delete sticky note"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
        ))
      )}
    </div>
  );
};
