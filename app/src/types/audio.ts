// Audio-related types
export interface AudioChunk {
  data: Blob;
  timestamp: number;
  duration: number;
}

export interface AudioCaptureState {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  totalDuration: number;
  error: string | null;
}

export interface AudioCaptureConfig {
  sampleRate?: number;
  channelCount?: number;
  bitRate?: number;
  mimeType?: string;
  chunkDuration?: number; // milliseconds
}

export interface AudioError {
  type: 'PERMISSION_DENIED' | 'DEVICE_NOT_FOUND' | 'RECORDING_FAILED' | 'PROCESSING_FAILED';
  message: string;
  originalError?: Error;
}
