/**
 * AiSuggestionsPanel Component
 * 
 * Displays AI-powered quick suggestions with manual generation capability.
 * Provides contextual assistance for agents during live calls.
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Zap, Info } from "lucide-react";

interface AiSuggestionsPanelProps {
  quickSuggestion: string;
  isGeneratingSuggestion: boolean;
  onGenerateQuickSuggestion: () => void;
}

export const AiSuggestionsPanel: React.FC<AiSuggestionsPanelProps> = ({
  quickSuggestion,
  isGeneratingSuggestion,
  onGenerateQuickSuggestion
}) => {
  return (
    <div className="border-b border-border pb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Suggestion</h3>
        <div className="flex items-center gap-2">
          {/* Manual Trigger Button */}
          <Button
            variant="default"
            size="sm"
            onClick={onGenerateQuickSuggestion}
            disabled={isGeneratingSuggestion}
            className="flex items-center gap-1 px-2 py-1 h-7 bg-primary text-primary-foreground hover:bg-primary/90"
            title="Generate Quick Suggestion"
            aria-label="Generate AI-powered quick suggestion for current call context"
          >
            {isGeneratingSuggestion ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            <span className="text-xs">Generate</span>
          </Button>
          
          {/* Automatic Generation Info */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-7 w-7"
            title="A quick suggestion will automatically appear here whenever the customer asks a question."
            aria-label="Information about automatic suggestion generation"
          >
            <Info size={12} className="text-muted-foreground" />
          </Button>
        </div>
      </div>
      
      {/* Single Quick Suggestion Display */}
      <div className="p-3 bg-muted/50 rounded-lg border border-border">
        <div className="text-sm text-foreground leading-relaxed">
          {isGeneratingSuggestion ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Generating suggestion...</span>
            </div>
          ) : (
            quickSuggestion
          )}
        </div>
      </div>
    </div>
  );
};
