import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioCaptureService } from '../services/audioCapture';
import { AudioCaptureState, AudioChunk, AudioError } from '../types/audio';

export function useAudioCapture() {
  const [state, setState] = useState<AudioCaptureState>({
    isRecording: false,
    isPaused: false,
    audioLevel: 0,
    totalDuration: 0,
    error: null,
  });

  const captureServiceRef = useRef<AudioCaptureService | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const initialize = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      if (!captureServiceRef.current) {
        captureServiceRef.current = new AudioCaptureService();
      }
      await captureServiceRef.current.initialize();
    } catch (error) {
      const audioError = error as AudioError;
      setState(prev => ({
        ...prev,
        error: audioError.message || 'Failed to initialize audio capture',
        isRecording: false,
      }));
    }
  }, []);

  const startRecording = useCallback(async (onChunk?: (chunk: AudioChunk) => void): Promise<void> => {
    if (!captureServiceRef.current) {
      await initialize();
    }
    try {
      setState(prev => ({ ...prev, error: null }));
      await captureServiceRef.current!.startRecording(onChunk);
      startTimeRef.current = Date.now();
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        totalDuration: 0,
      }));

      durationIntervalRef.current = window.setInterval(() => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        setState(prev => ({ ...prev, totalDuration: duration }));
      }, 100);
    } catch (error) {
      const audioError = error as AudioError;
      setState(prev => ({
        ...prev,
        error: audioError.message || 'Failed to start recording',
        isRecording: false,
      }));
    }
  }, [initialize]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!captureServiceRef.current) return null;
    try {
      const audioBlob = await captureServiceRef.current.stopRecording();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        audioLevel: 0,
      }));
      return audioBlob;
    } catch (error) {
      const audioError = error as AudioError;
      setState(prev => ({
        ...prev,
        error: audioError.message || 'Failed to stop recording',
        isRecording: false,
      }));
      return null;
    }
  }, []);

  const pauseRecording = useCallback((): void => {
    if (!captureServiceRef.current) return;
    captureServiceRef.current.pauseRecording();
    setState(prev => ({ ...prev, isPaused: true }));
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const resumeRecording = useCallback((): void => {
    if (!captureServiceRef.current) return;
    captureServiceRef.current.resumeRecording();
    setState(prev => ({ ...prev, isPaused: false }));
    const pausedDuration = state.totalDuration;
    startTimeRef.current = Date.now() - (pausedDuration * 1000);
    durationIntervalRef.current = window.setInterval(() => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      setState(prev => ({ ...prev, totalDuration: duration }));
    }, 100);
  }, [state.totalDuration]);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (captureServiceRef.current) {
        captureServiceRef.current.cleanup();
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearError,
    isAvailable: !!captureServiceRef.current,
  };
}
