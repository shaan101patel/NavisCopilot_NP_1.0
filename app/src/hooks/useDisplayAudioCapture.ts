import { useState, useCallback, useEffect, useRef } from 'react';
import { AudioCaptureService } from '../services/audioCapture';
import { AudioCaptureState, AudioChunk, AudioError } from '../types/audio';

export function useDisplayAudioCapture() {
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

      if (!('mediaDevices' in navigator) || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
        throw { type: 'DEVICE_NOT_FOUND', message: 'Screen audio capture is not supported in this browser.' } as AudioError;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: { echoCancellation: false, noiseSuppression: false } as MediaTrackConstraints,
        });
      } catch (e: any) {
        const name = String(e?.name || '');
        if (name === 'NotAllowedError') {
          throw { type: 'PERMISSION_DENIED', message: 'Screen capture was blocked or canceled. Please allow it and try again.' } as AudioError;
        }
        throw { type: 'DEVICE_NOT_FOUND', message: 'Failed to start screen capture. ' + (e?.message || '') } as AudioError;
      }

      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
        throw { type: 'DEVICE_NOT_FOUND', message: 'No audio track in shared stream. In the share dialog, enable "Share tab audio".' } as AudioError;
      }

      if (captureServiceRef.current) {
        try { captureServiceRef.current.cleanup(); } catch {}
      }
      captureServiceRef.current = new AudioCaptureService();
      await captureServiceRef.current.initializeWithStream(stream);
    } catch (error: any) {
      const audioError = (error?.type ? error : { type: 'DEVICE_NOT_FOUND', message: error?.message || 'Failed to initialize display audio' }) as AudioError;
      setState(prev => ({ ...prev, error: audioError.message || 'Failed to initialize display audio', isRecording: false }));
      captureServiceRef.current = null;
      throw error;
    }
  }, []);

  const startRecording = useCallback(async (onChunk?: (chunk: AudioChunk) => void): Promise<void> => {
    if (!captureServiceRef.current) {
      await initialize();
    }
    try {
      setState(prev => ({ ...prev, error: null }));
      await captureServiceRef.current!.startRecording(onChunk);
    } catch (err) {
      const audioError = err as AudioError;
      if ((audioError as any)?.type === 'DEVICE_NOT_FOUND') {
        await initialize();
        await captureServiceRef.current!.startRecording(onChunk);
      } else {
        throw err;
      }
    }

    startTimeRef.current = Date.now();
    setState(prev => ({ ...prev, isRecording: true, isPaused: false, totalDuration: 0 }));

    durationIntervalRef.current = window.setInterval(() => {
      const duration = (Date.now() - startTimeRef.current) / 1000;
      setState(prev => ({ ...prev, totalDuration: duration }));
    }, 100);
  }, [initialize]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!captureServiceRef.current) return null;
    try {
      const audioBlob = await captureServiceRef.current.stopRecording();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      setState(prev => ({ ...prev, isRecording: false, isPaused: false, audioLevel: 0 }));
      return audioBlob;
    } catch (error) {
      const audioError = error as AudioError;
      setState(prev => ({ ...prev, error: audioError.message || 'Failed to stop display recording', isRecording: false }));
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
    startTimeRef.current = Date.now() - pausedDuration * 1000;
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
