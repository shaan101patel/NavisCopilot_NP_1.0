/**
 * useTranscript Hook
 * 
 * Custom hook for managing call-specific live transcript data and copy functionality.
 * Handles real-time transcript updates and clipboard operations with proper call isolation.
 */

import { useState, useCallback } from 'react';
import { useCallStateContext } from '@/contexts/CallStateContext';

export const useTranscript = (callId?: string) => {
  // Local UI state (not call-specific)
  const [copiedTranscriptIds, setCopiedTranscriptIds] = useState<Set<string>>(new Set());

  // Call state context
  const callStateContext = useCallStateContext();
  
  // Get call-specific state if callId is provided
  const callState = callId ? callStateContext.getCallState(callId) : null;
  
  // Fall back to empty state if no callId provided
  const transcript = callState?.transcript || [];
  const transcriptError = callState?.transcriptError || null;
  const transcriptLoading = callState?.transcriptLoading || false;

  // Add transcript segment
  const addTranscriptSegment = useCallback(async (speaker: 'agent' | 'customer', text: string) => {
    if (!callId) {
      console.warn('Cannot add transcript segment: no callId provided');
      return;
    }

    try {
      await callStateContext.addTranscriptSegment(callId, speaker, text);
    } catch (error) {
      console.error('Failed to add transcript segment:', error);
    }
  }, [callId, callStateContext]);

  // Copy transcript entry to clipboard
  const copyTranscriptToClipboard = useCallback(async (transcriptId: string, text: string, speaker: string, timestamp: Date) => {
    try {
      // Format the text with speaker and timestamp for better context
      const formattedText = `[${timestamp.toLocaleTimeString()}] ${speaker}: ${text}`;
      
      // Use modern Clipboard API for reliable copying across browsers
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

  // Copy entire transcript to clipboard
  const copyFullTranscript = useCallback(async () => {
    try {
      const fullTranscriptText = transcript
        .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
        .join('\n');
      
      const formattedText = `Call Transcript - ${new Date().toLocaleString()}\n\n${fullTranscriptText}`;
      
      await navigator.clipboard.writeText(formattedText);
      
    } catch (err) {
      console.warn('Clipboard API not available, falling back to execCommand');
      try {
        const fullTranscriptText = transcript
          .map(entry => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`)
          .join('\n');
        
        const formattedText = `Call Transcript - ${new Date().toLocaleString()}\n\n${fullTranscriptText}`;
        
        const textArea = document.createElement('textarea');
        textArea.value = formattedText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error('Failed to copy full transcript to clipboard:', fallbackErr);
      }
    }
  }, [transcript]);

  return {
    // Call-specific state
    transcript,
    transcriptError,
    transcriptLoading,
    
    // UI state
    copiedTranscriptIds,
    
    // Actions
    addTranscriptSegment,
    copyTranscriptToClipboard,
    copyFullTranscript,
  };
};
