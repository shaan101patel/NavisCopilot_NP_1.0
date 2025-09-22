import React, { useCallback, useRef, useState } from 'react';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useDisplayAudioCapture } from '@/hooks/useDisplayAudioCapture';
import { useTranscription } from '@/hooks/useTranscription';
import { AudioControls } from '@/components/transcription/AudioControls';
import { TranscriptDisplay } from '@/components/transcription/TranscriptDisplay';
import type { AudioChunk } from '../types/audio';

// Uses Groq API key from environment variable if present. For CRA, prefix REACT_APP_
const DEFAULT_API_KEY = (process.env.REACT_APP_GROQ_API_KEY as string) || '';
const DEFAULT_LANGUAGE = (process.env.REACT_APP_DEFAULT_LANGUAGE as string) || 'en';

const Transcription: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [isConfigured, setIsConfigured] = useState<boolean>(!!DEFAULT_API_KEY);

  // Mic capture
  const {
    isRecording, isPaused, audioLevel, totalDuration, error: audioError,
    initialize, startRecording, stopRecording, pauseRecording, resumeRecording, clearError,
  } = useAudioCapture();

  // Display/tab audio capture
  const {
    isRecording: isShareRecording, isPaused: isSharePaused, totalDuration: shareDuration, error: shareError,
    initialize: initializeShare, startRecording: startShareRecording, stopRecording: stopShareRecording,
    pauseRecording: pauseShareRecording, resumeRecording: resumeShareRecording,
  } = useDisplayAudioCapture();

  // Transcription hook (Groq STT)
  const { segments: micSegments, isProcessing: isMicProcessing, wordCount: micWordCount, averageConfidence: micAvgConf, processAudio: processMicAudio, clearTranscript: clearMicTranscript } = useTranscription({
    apiKey, language: DEFAULT_LANGUAGE, task: 'transcribe', enableTimestamps: true, model: 'whisper-large-v3-turbo', timestampGranularities: ['segment', 'word'], sourceId: 'mic', appendMode: false,
  });
  const { segments: shareSegments, isProcessing: isShareProcessing, wordCount: shareWordCount, averageConfidence: shareAvgConf, processAudio: processShareAudio, clearTranscript: clearShareTranscript } = useTranscription({
    apiKey, language: DEFAULT_LANGUAGE, task: 'transcribe', enableTimestamps: true, model: 'whisper-large-v3-turbo', timestampGranularities: ['segment', 'word'], sourceId: 'share', appendMode: false,
  });

  // Per-source in-flight queues and accumulatorsa
  const inFlightRefMic = useRef(false);
  const pendingRefMic = useRef(false);
  const accumulatedChunksRefMic = useRef<Blob[]>([]);

  const inFlightRefShare = useRef(false);
  const pendingRefShare = useRef(false);
  const accumulatedChunksRefShare = useRef<Blob[]>([]);

  const buildAggregatedBlob = useCallback((chunks: Blob[]) => new Blob(chunks, { type: 'audio/webm' }), []);

  const submitAggregatedMic = useCallback(async () => {
    if (inFlightRefMic.current) { pendingRefMic.current = true; return; }
    const blob = buildAggregatedBlob(accumulatedChunksRefMic.current);
    if (!blob || blob.size === 0) return;
    inFlightRefMic.current = true;
    try { await processMicAudio(blob); }
    catch (e) { console.error('Mic aggregated transcription failed', e); }
    finally { inFlightRefMic.current = false; if (pendingRefMic.current) { pendingRefMic.current = false; submitAggregatedMic(); } }
  }, [buildAggregatedBlob, processMicAudio]);

  const submitAggregatedShare = useCallback(async () => {
    if (inFlightRefShare.current) { pendingRefShare.current = true; return; }
    const blob = buildAggregatedBlob(accumulatedChunksRefShare.current);
    if (!blob || blob.size === 0) return;
    inFlightRefShare.current = true;
    try { await processShareAudio(blob); }
    catch (e) { console.error('Share aggregated transcription failed', e); }
    finally { inFlightRefShare.current = false; if (pendingRefShare.current) { pendingRefShare.current = false; submitAggregatedShare(); } }
  }, [buildAggregatedBlob, processShareAudio]);

  // Mic handlers
  const handleStartRecording = useCallback(async () => {
    try {
      if (!isConfigured) { alert('Please enter your Groq API key first'); return; }
      accumulatedChunksRefMic.current = []; inFlightRefMic.current = false; pendingRefMic.current = false;
      await initialize();
      await startRecording((chunk: AudioChunk) => {
        if (chunk?.data && chunk.data.size > 0) {
          accumulatedChunksRefMic.current.push(chunk.data);
          submitAggregatedMic();
        }
      });
    } catch (error) { console.error('Failed to start recording:', error); }
  }, [initialize, startRecording, isConfigured, submitAggregatedMic]);

  const handleStopRecording = useCallback(async () => {
    try {
      const finalBlob = await stopRecording();
      if (finalBlob) { accumulatedChunksRefMic.current = [finalBlob]; pendingRefMic.current = false; inFlightRefMic.current = false; await submitAggregatedMic(); }
    } catch (error) { console.error('Failed to stop recording:', error); }
  }, [stopRecording, submitAggregatedMic]);

  // Share handlers
  const handleStartShare = useCallback(async () => {
    try {
      if (!isConfigured) { alert('Please enter your Groq API key first'); return; }
      accumulatedChunksRefShare.current = []; inFlightRefShare.current = false; pendingRefShare.current = false;
      await initializeShare();
      await startShareRecording((chunk: AudioChunk) => {
        if (chunk?.data && chunk.data.size > 0) {
          accumulatedChunksRefShare.current.push(chunk.data);
          submitAggregatedShare();
        }
      });
    } catch (e) { console.error('Failed to start share recording:', e); }
  }, [initializeShare, startShareRecording, isConfigured, submitAggregatedShare]);

  const handleStopShare = useCallback(async () => {
    try {
      const finalBlob = await stopShareRecording();
      if (finalBlob) { accumulatedChunksRefShare.current = [finalBlob]; pendingRefShare.current = false; inFlightRefShare.current = false; await submitAggregatedShare(); }
    } catch (e) { console.error('Failed to stop share recording:', e); }
  }, [stopShareRecording, submitAggregatedShare]);

  const handleConfigureAPI = useCallback(() => {
    const key = prompt('Enter your Groq API key:');
    if (key) { setApiKey(key); setIsConfigured(true); }
  }, []);

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transcription</h1>
        {!isConfigured && (
          <button className="btn-primary" onClick={handleConfigureAPI}>Enter API Key</button>
        )}
      </div>

      {!isConfigured && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">API Configuration Required</h3>
              <p className="text-sm text-blue-700 mt-1">Add your Groq API key via REACT_APP_GROQ_API_KEY or enter it manually.</p>
            </div>
            <button onClick={handleConfigureAPI} className="btn-primary text-sm">Enter API Key</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AudioControls
            isRecording={isRecording}
            isPaused={isPaused}
            totalDuration={totalDuration}
            audioLevel={audioLevel}
            error={audioError}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            onClearError={clearError}
          />

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Share Audio Controls</h2>
              <div className="text-sm text-gray-500">Duration: {Math.round(shareDuration)}s</div>
            </div>
            {shareError && (<div className="mb-3 text-sm text-red-600">{shareError}</div>)}
            <div className="flex items-center space-x-3">
              {!isShareRecording ? (
                <button className="btn-primary" onClick={handleStartShare}>Start Share Audio</button>
              ) : (
                <>
                  <button className="btn-secondary" onClick={pauseShareRecording} disabled={isSharePaused}>Pause</button>
                  <button className="btn-secondary" onClick={resumeShareRecording} disabled={!isSharePaused}>Resume</button>
                  <button className="btn-danger" onClick={handleStopShare}>Stop</button>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Tip: When choosing a tab/window, enable "Share tab audio".</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Mic Transcript</h3>
            <TranscriptDisplay segments={micSegments} isProcessing={isMicProcessing} wordCount={micWordCount} averageConfidence={micAvgConf} onClearTranscript={clearMicTranscript} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Share Transcript</h3>
            <TranscriptDisplay segments={shareSegments} isProcessing={isShareProcessing} wordCount={shareWordCount} averageConfidence={shareAvgConf} onClearTranscript={clearShareTranscript} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transcription;
