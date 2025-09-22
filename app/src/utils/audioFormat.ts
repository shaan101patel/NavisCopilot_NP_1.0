import { AUDIO_CONFIG } from '@/utils/constants';

/**
 * Get the best supported MIME type for audio recording
 */
export function getBestSupportedMimeType(): string {
  for (const mimeType of AUDIO_CONFIG.SUPPORTED_MIME_TYPES) {
    if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }
  return 'audio/webm'; // fallback
}

/**
 * Convert Blob to base64 string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Calculate audio level from audio data
 */
export function calculateAudioLevel(audioData: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  const rms = Math.sqrt(sum / audioData.length);
  return Math.min(rms * 100, 100); // Normalize to 0-100
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Generate a unique ID for transcript segments
 */
export function generateSegmentId(): string {
  return `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
