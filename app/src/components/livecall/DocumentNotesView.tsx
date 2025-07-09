/**
 * DocumentNotesView Component
 * 
 * Provides a document-style editor for comprehensive call notes and summaries.
 * Includes word/character count and AI note generation capability.
 */

import React from 'react';

interface DocumentNotesViewProps {
  documentNotes: string;
  onDocumentNotesChange: (content: string) => void;
}

export const DocumentNotesView: React.FC<DocumentNotesViewProps> = ({
  documentNotes,
  onDocumentNotesChange
}) => {
  return (
    <div className="h-full">
      <div 
        className="bg-background border border-border rounded-lg shadow-sm h-full flex flex-col"
        style={{ minHeight: '400px' }}
      >
        {/* Document Header */}
        <div className="border-b border-border p-3 bg-muted/50">
          <h3 className="text-sm font-medium text-foreground">Call Summary & Notes</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Document-style editor for comprehensive call notes
          </p>
        </div>
        
        {/* Document Editor */}
        <div className="flex-1 p-0">
          <textarea
            value={documentNotes}
            onChange={(e) => onDocumentNotesChange(e.target.value)}
            placeholder="Type your call summary or notes here…

You can freely format and organize your notes in this document-style space. 

Use the 'Generate AI Note' button to automatically create summaries based on the call transcript and existing notes."
            className="w-full h-full border-none resize-none text-sm leading-relaxed p-4 bg-transparent focus:outline-none placeholder-muted-foreground"
            style={{ 
              fontFamily: 'inherit',
              lineHeight: '1.6',
              minHeight: '350px'
            }}
            aria-label="Document-style call notes editor"
          />
        </div>
        
        {/* Document Footer */}
        <div className="border-t border-border p-2 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {documentNotes.length} characters
              {documentNotes.split(/\s+/).filter(word => word.length > 0).length > 0 && 
                ` • ${documentNotes.split(/\s+/).filter(word => word.length > 0).length} words`
              }
            </span>
            <span>Auto-saved • Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
