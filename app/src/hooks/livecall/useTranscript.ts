/**
 * useTranscript Hook
 * 
 * Custom hook for managing live transcript data and copy functionality.
 * Handles real-time transcript updates and clipboard operations.
 */

import { useState, useCallback } from 'react';
import { TranscriptEntry } from '@/types/livecall';

// IMPLEMENT LATER: Replace with real-time call and transcript data from backend (Supabase)
const mockTranscript: TranscriptEntry[] = [
  { id: "1", speaker: "Agent", text: "Hello, thank you for calling Navis support. How can I help you today?", timestamp: new Date() },
  { id: "2", speaker: "Customer", text: "Hi, I need help with my order.", timestamp: new Date() },
  { id: "3", speaker: "Agent", text: "I'd be happy to help you with your order. Can you please provide me with your order number?", timestamp: new Date() },
  { id: "4", speaker: "Customer", text: "Sure, it's ORD-12345.", timestamp: new Date() },
];

export const useTranscript = () => {
  const [transcript] = useState<TranscriptEntry[]>(mockTranscript);
  const [copiedTranscriptIds, setCopiedTranscriptIds] = useState<Set<string>>(new Set());

  // Copy transcript entry to clipboard
  const copyTranscriptToClipboard = useCallback(async (transcriptId: string, text: string, speaker: string, timestamp: Date) => {
    try {
      // Format the text with speaker and timestamp for better context
      const formattedText = `[${timestamp.toLocaleTimeString()}] ${speaker}: ${text}`;
      
      // Use modern Clipboard API for reliable copying across browsers
      // FEATURE: Copy individual transcript lines to clipboard for easy reference
      // PURPOSE: Allows agents to quickly copy specific parts of conversation for:
      // - Adding to call notes or tickets
      // - Sharing key customer statements with supervisors
      // - Documentation and follow-up actions
      // - Quality assurance and training purposes
      await navigator.clipboard.writeText(formattedText);
      
      // Provide visual feedback that copy was successful
      setCopiedTranscriptIds(prev => new Set(prev).add(transcriptId));
      
      // Clear the feedback after 2 seconds
      setTimeout(() => {
        setCopiedTranscriptIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(transcriptId);
          return newSet;
        });
      }, 2000);
      
    } catch (err) {
      // Fallback for browsers that don't support Clipboard API
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `[${timestamp.toLocaleTimeString()}] ${speaker}: ${text}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Still provide visual feedback
        setCopiedTranscriptIds(prev => new Set(prev).add(transcriptId));
        setTimeout(() => {
          setCopiedTranscriptIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(transcriptId);
            return newSet;
          });
        }, 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy text to clipboard:', fallbackErr);
      }
    }
  }, []);

  return {
    transcript,
    copiedTranscriptIds,
    copyTranscriptToClipboard
  };
};
