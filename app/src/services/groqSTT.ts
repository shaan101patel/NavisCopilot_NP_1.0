import { API_CONFIG } from '../utils/constants';
import { WizperResponse, WizperError } from '../types/transcript';

export interface GroqConfig {
  apiKey: string;
  language?: string; // ISO-639-1, e.g. 'en'
  prompt?: string;
  model?: 'whisper-large-v3-turbo' | 'whisper-large-v3';
  temperature?: number;
  enableTimestamps?: boolean; // if true, request verbose_json
  timestampGranularities?: Array<'segment' | 'word'>;
  task?: 'transcribe' | 'translate'; // translate => English via translations endpoint
}

export class GroqSTT {
  private config: GroqConfig;
  private retryCount = 0;
  private static BASE_URL = 'https://api.groq.com/openai/v1/audio';

  constructor(config: GroqConfig) {
    this.config = {
      model: 'whisper-large-v3-turbo',
      temperature: 0,
      enableTimestamps: true,
      timestampGranularities: ['segment'],
      task: 'transcribe',
      ...config,
    };
  }

  async transcribe(audioBlob: Blob): Promise<WizperResponse> {
    try {
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Audio blob is empty.');
      }
      if (audioBlob.size > API_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      // Skip tiny aggregates (< ~200KB) to reduce 400s and rate pressure
      if (audioBlob.size < 200 * 1024) {
        return { text: '', segments: [], duration: 0 } as WizperResponse;
      }

      const normalizedBlob = new Blob([audioBlob], { type: 'audio/webm' });
      const filename = `chunk-${Date.now()}.webm`;
      const file = new File([normalizedBlob], filename, { type: 'audio/webm' });

      const form = new FormData();
      form.append('file', file);
      form.append('model', this.config.model!);

      if (this.config.enableTimestamps) {
        form.append('response_format', 'verbose_json');
        const granularities = this.config.timestampGranularities ?? ['segment'];
        for (const g of granularities) form.append('timestamp_granularities[]', g);
      } else {
        form.append('response_format', 'json');
      }

      if (this.config.language) form.append('language', this.config.language);
      if (typeof this.config.temperature === 'number') form.append('temperature', String(this.config.temperature));
      if (this.config.prompt) form.append('prompt', this.config.prompt);

      const endpoint = this.config.task === 'translate' ? 'translations' : 'transcriptions';
      const url = `${GroqSTT.BASE_URL}/${endpoint}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
        body: form,
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type') || '';
        let detail = '';
        try {
          if (contentType.includes('application/json')) {
            const j = await res.json();
            detail = (j && (j.error?.message || JSON.stringify(j))) || '';
          } else {
            detail = await res.text();
          }
        } catch {}
        throw new Error(`Groq STT request failed (${res.status}): ${detail || res.statusText}`);
      }

      const data = await res.json();
      return this.parseGroqResponse(data);
    } catch (error) {
      if (this.retryCount < API_CONFIG.MAX_RETRIES) {
        this.retryCount++;
        await new Promise(r => setTimeout(r, 500));
        return this.transcribe(audioBlob);
      }
      throw this.createError(error);
    } finally {
      this.retryCount = 0;
    }
  }

  updateConfig(newConfig: Partial<GroqConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private parseGroqResponse(data: any): WizperResponse {
    const segments = Array.isArray(data.segments)
      ? data.segments.map((s: any) => ({
          text: String(s.text || '').trim(),
          start: typeof s.start === 'number' ? s.start : 0,
          end: typeof s.end === 'number' ? s.end : 0,
          confidence: 0.9,
        }))
      : undefined;

    const duration = segments && segments.length > 0 ? segments[segments.length - 1].end : undefined;

    return {
      text: String(data.text || '').trim(),
      segments,
      language: (data.language as string) || this.config.language,
      duration,
    };
  }

  private createError(error: any): WizperError {
    let message = 'Unknown error';
    let statusCode: number | undefined;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      try {
        const e = error as any;
        if (e.error && e.error.message) message = e.error.message;
        if (e.error && e.error.code) statusCode = Number(e.error.code);
      } catch {}
    }

    return { error: 'TRANSCRIPTION_FAILED', message, statusCode };
  }
}
