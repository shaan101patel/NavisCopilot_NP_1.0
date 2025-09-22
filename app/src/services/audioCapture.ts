import { AudioChunk, AudioCaptureConfig, AudioError } from '../types/audio';
import { AUDIO_CONFIG } from '../utils/constants';
import { getBestSupportedMimeType } from '../utils/audioFormat';

export class AudioCaptureService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private config: AudioCaptureConfig;

  constructor(config: Partial<AudioCaptureConfig> = {}) {
    this.config = {
      sampleRate: AUDIO_CONFIG.DEFAULT_SAMPLE_RATE,
      channelCount: AUDIO_CONFIG.DEFAULT_CHANNEL_COUNT,
      bitRate: AUDIO_CONFIG.DEFAULT_BIT_RATE,
      mimeType: getBestSupportedMimeType(),
      chunkDuration: AUDIO_CONFIG.CHUNK_DURATION,
      ...config,
    };
  }

  /**
   * Initialize audio capture by requesting microphone permission
   */
  async initialize(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      this.audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.setupMediaRecorder();
    } catch (error) {
      throw this.createAudioError('PERMISSION_DENIED', 'Microphone access denied', error as Error);
    }
  }

  /**
   * Initialize with an externally provided MediaStream (e.g., getDisplayMedia with audio)
   */
  async initializeWithStream(stream: MediaStream): Promise<void> {
    try {
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        throw this.createAudioError(
          'DEVICE_NOT_FOUND',
          'No audio track in shared stream. In the share dialog, enable "Share tab audio".'
        );
      }
      this.audioStream = new MediaStream(audioTracks);

      audioTracks.forEach((t) => {
        t.addEventListener('ended', () => {
          try { this.mediaRecorder?.state === 'recording' && this.mediaRecorder?.stop(); } catch {}
        });
      });

      this.setupMediaRecorder();
    } catch (error) {
      if ((error as any)?.type) throw error as any;
      throw this.createAudioError('DEVICE_NOT_FOUND', 'Failed to initialize with provided stream', error as Error);
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(onChunk?: (chunk: AudioChunk) => void): Promise<void> {
    if (!this.mediaRecorder) {
      throw this.createAudioError('DEVICE_NOT_FOUND', 'Audio recorder not initialized');
    }

    if (this.mediaRecorder.state === 'recording') {
      return; // Already recording
    }

    this.audioChunks = [];
    this.startTime = Date.now();

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
        if (onChunk) {
          const chunk: AudioChunk = {
            data: event.data,
            timestamp: Date.now(),
            duration: Date.now() - this.startTime,
          };
          onChunk(chunk);
        }
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };

    try {
      this.mediaRecorder.start(this.config.chunkDuration);
    } catch (error) {
      throw this.createAudioError('RECORDING_FAILED', 'Failed to start recording', error as Error);
    }
  }

  /**
   * Stop recording and return the complete audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(this.createAudioError('RECORDING_FAILED', 'No active recording to stop'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: this.config.mimeType });
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (error) => {
        console.error('Error during recording stop:', error);
        reject(this.createAudioError('RECORDING_FAILED', 'Recording failed', (error as any).error));
      };

      this.mediaRecorder.stop();
    });
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  getState(): string {
    return this.mediaRecorder?.state || 'inactive';
  }

  cleanup(): void {
    if (this.mediaRecorder) {
      try { this.mediaRecorder.stop(); } catch {}
      this.mediaRecorder = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    this.audioChunks = [];
  }

  private setupMediaRecorder(): void {
    if (!this.audioStream) return;

    const mimeType = getBestSupportedMimeType();
    this.config.mimeType = mimeType;

    const options: MediaRecorderOptions = { mimeType };
    if (this.config.bitRate) {
      try { (options as any).bitsPerSecond = this.config.bitRate; } catch {}
    }

    this.mediaRecorder = new MediaRecorder(this.audioStream, options);
  }

  private createAudioError(type: AudioError['type'], message: string, originalError?: Error): AudioError {
    return { type, message, originalError };
  }
}
