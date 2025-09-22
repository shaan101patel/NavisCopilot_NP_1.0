import { useState, useCallback, useRef } from 'react';
import { GroqSTT, GroqConfig } from '../services/groqSTT';
import { TranscriptSegment, TranscriptState, WizperResponse } from '../types/transcript';
import { generateSegmentId } from '../utils/audioFormat';

export function useTranscription(config: GroqConfig & { sourceId?: 'mic' | 'share'; appendMode?: boolean }) {
  const [state, setState] = useState<TranscriptState>({
    segments: [],
    isProcessing: false,
    totalDuration: 0,
    wordCount: 0,
    averageConfidence: 0,
  });

  const groqRef = useRef<GroqSTT | null>(null);

  const initializeGroq = useCallback(() => {
    if (!groqRef.current) {
      groqRef.current = new GroqSTT(config);
    }
  }, [config]);

  const processAudio = useCallback(async (audioBlob: Blob): Promise<void> => {
    initializeGroq();
    if (!groqRef.current) {
      throw new Error('Groq STT not initialized');
    }
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const response: WizperResponse = await groqRef.current.transcribe(audioBlob);
      if (config.appendMode) {
        const appended = squashSegments(createSegmentsFromResponse(response, config.sourceId));
        setState(prev => {
          const next = mergeIncremental(prev.segments, appended);
          return recalcState({ ...prev, isProcessing: false, segments: next }, response.duration);
        });
      } else {
        const newSegments = squashSegments(createSegmentsFromResponse(response, config.sourceId));
        setState(prev => {
          const totalDuration = Math.max(prev.totalDuration, response.duration || 0);
          const wordCount = calculateWordCount(newSegments);
          const averageConfidence = calculateAverageConfidence(newSegments);
          return { segments: newSegments, isProcessing: false, totalDuration, wordCount, averageConfidence };
        });
      }
    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  }, [initializeGroq, config.appendMode, config.sourceId]);

  const addSegment = useCallback((text: string, confidence: number = 1.0): void => {
    const segment: TranscriptSegment = {
      id: generateSegmentId(),
      text: text.trim(),
      timestamp: Date.now(),
      confidence,
      startTime: state.totalDuration,
      endTime: state.totalDuration + 2,
    };
    setState(prev => {
      const newSegments = [...prev.segments, segment].filter(s => !s.isProcessing);
      return {
        ...prev,
        segments: newSegments,
        wordCount: calculateWordCount(newSegments),
        averageConfidence: calculateAverageConfidence(newSegments),
        totalDuration: Math.max(prev.totalDuration, segment.endTime),
      };
    });
  }, [state.totalDuration]);

  const clearTranscript = useCallback((): void => {
    setState({ segments: [], isProcessing: false, totalDuration: 0, wordCount: 0, averageConfidence: 0 });
  }, []);

  const getTranscriptText = useCallback((): string => {
    return state.segments
      .filter(s => !s.isProcessing)
      .sort((a, b) => a.startTime - b.startTime)
      .map(s => s.text)
      .join(' ');
  }, [state.segments]);

  const updateConfig = useCallback((newConfig: Partial<GroqConfig>): void => {
    if (groqRef.current) {
      groqRef.current.updateConfig(newConfig);
    }
  }, []);

  return { ...state, processAudio, addSegment, clearTranscript, getTranscriptText, updateConfig };
}

function createSegmentsFromResponse(response: WizperResponse, sourceId?: 'mic' | 'share'): TranscriptSegment[] {
  if (response.segments && response.segments.length > 0) {
    return response.segments.map((segment, index) => ({
      id: generateSegmentId(),
      text: segment.text.trim(),
      timestamp: Date.now() + index,
      confidence: segment.confidence || 0.9,
      startTime: segment.start || 0,
      endTime: segment.end || (segment.start || 0),
      sourceId,
      isFinal: true,
    }));
  }
  return [{
    id: generateSegmentId(),
    text: (response.text || '').trim(),
    timestamp: Date.now(),
    confidence: 0.9,
    startTime: 0,
    endTime: response.duration || 0,
    sourceId,
    isFinal: true,
  }];
}

function calculateWordCount(segments: TranscriptSegment[]): number {
  return segments
    .filter(s => !s.isProcessing)
    .reduce((count, segment) => count + segment.text.split(/\s+/).filter(word => word.length > 0).length, 0);
}

function calculateAverageConfidence(segments: TranscriptSegment[]): number {
  const validSegments = segments.filter(s => !s.isProcessing);
  if (validSegments.length === 0) return 0;
  const totalConfidence = validSegments.reduce((sum, segment) => sum + segment.confidence, 0);
  return totalConfidence / validSegments.length;
}

function mergeIncremental(existing: TranscriptSegment[], incoming: TranscriptSegment[]): TranscriptSegment[] {
  if (incoming.length === 0) return existing;
  const next = [...existing];
  for (const seg of incoming) {
    const idx = next.findIndex(s => s.sourceId === seg.sourceId && Math.abs(s.startTime - seg.startTime) < 0.2 && Math.abs(s.endTime - seg.endTime) < 0.2);
    if (idx >= 0) {
      next[idx] = { ...seg };
    } else {
      next.push(seg);
    }
  }
  return next.sort((a, b) => a.startTime - b.startTime || a.timestamp - b.timestamp);
}

function recalcState(state: TranscriptState, duration?: number): TranscriptState {
  const wordCount = calculateWordCount(state.segments);
  const averageConfidence = calculateAverageConfidence(state.segments);
  const totalDuration = Math.max(state.totalDuration, duration || 0);
  return { ...state, wordCount, averageConfidence, totalDuration };
}

function normalizeText(t: string): string {
  return t
    .toLowerCase()
    .replace(/[-\u2013\u2014]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function squashSegments(segments: TranscriptSegment[]): TranscriptSegment[] {
  const out: TranscriptSegment[] = [];
  for (const seg of segments.sort((a, b) => a.startTime - b.startTime)) {
    const curNorm = normalizeText(seg.text);
    if (!curNorm) continue;
    const last = out[out.length - 1];
    if (last) {
      const lastNorm = normalizeText(last.text);
      const isIdentical = lastNorm === curNorm;
      const isContained = lastNorm.includes(curNorm) || curNorm.includes(lastNorm);
      const closeInTime = Math.abs(seg.startTime - last.endTime) < 1.0;
      if (isIdentical || (isContained && closeInTime)) {
        last.endTime = Math.max(last.endTime, seg.endTime);
        continue;
      }
      if (curNorm.length < 6 && lastNorm.endsWith(curNorm) && closeInTime) {
        last.endTime = Math.max(last.endTime, seg.endTime);
        continue;
      }
    }
    out.push({ ...seg });
  }
  return out;
}
