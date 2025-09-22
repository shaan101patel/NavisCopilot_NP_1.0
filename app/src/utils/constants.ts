// Audio capture constants
export const AUDIO_CONFIG = {
  DEFAULT_SAMPLE_RATE: 16000,
  DEFAULT_CHANNEL_COUNT: 1,
  DEFAULT_BIT_RATE: 128000,
  CHUNK_DURATION: 4000, // 4 seconds for healthier incremental aggregates
  MAX_RECORDING_DURATION: 6000000, // 100 minutes
  SUPPORTED_MIME_TYPES: [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav'
  ]
} as const;

// API constants
export const API_CONFIG = {
  // Groq OpenAI-compatible audio endpoints limits (free tier: 25MB, dev tier: 100MB)
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3
} as const;

// UI constants
export const UI_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.7,
  LOW_CONFIDENCE_THRESHOLD: 0.5,
  PROCESSING_ANIMATION_DURATION: 1000,
  TRANSCRIPT_UPDATE_DEBOUNCE: 300
} as const;
