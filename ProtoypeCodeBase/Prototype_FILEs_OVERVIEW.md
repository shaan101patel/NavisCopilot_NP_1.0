# File Overview and Responsibilities

This document explains what each significant file and folder in this prototype does, so you can port the right pieces into another project and wire them up quickly.

## Top-level

- `package.json` — Project manifest. Depends on React 18 and TypeScript tooling. Vite is used in this repo but you can use any React/TS toolchain in your destination project. The only runtime dependency that’s tied to deprecated code is `@fal-ai/client` (used by `wizperAPI.ts`). You can omit it if you don’t use Wizper.
- `vite.config.ts` / `tsconfig*.json` — Build and TypeScript configs for this repo. When porting, keep your existing project’s configs; just ensure your TS `lib` includes `dom` (for MediaRecorder, File, FormData types).
- `.env.local` (not checked in) — This app expects `VITE_GROQ_P7_KEY` in development. In your project, provide the Groq API key via your own env system. For production, proxy the Groq request server-side instead of exposing keys in the browser.

## Core Types (`src/types`)

- `types/audio.ts`
  - Defines audio-related types used across hooks/services:
    - `AudioChunk` — { data: Blob, timestamp: number, duration: number }
    - `AudioCaptureState` — Simple capture UI state.
    - `AudioCaptureConfig` — Optional parameters for the recorder (sampleRate, channelCount, bitRate, mimeType, chunkDuration).
    - `AudioError` — Discriminated union for audio errors.

- `types/transcript.ts`
  - Defines transcript state and API response shapes:
    - `TranscriptSegment` — A unit of transcript text with timing, confidence, and optional `sourceId` (mic/share).
    - `TranscriptState` — Aggregate state for UI.
    - `WizperResponse` / `WizperError` — Generic response/error contracts used by the STT client. (Groq client maps its JSON into this shape.)

## Utilities (`src/utils`)

- `utils/constants.ts`
  - Central configuration:
    - `AUDIO_CONFIG` — Defaults for MediaRecorder (sample rate, channel count, chunk duration, supported mime types, etc.).
    - `API_CONFIG` — Limits, timeouts, retries (e.g., `MAX_FILE_SIZE`, `MAX_RETRIES`).
    - `UI_CONFIG` — Non-critical UI thresholds (confidence colors, debounce values).

- `utils/audioFormat.ts`
  - Small helpers used broadly:
    - `getBestSupportedMimeType()` — Walks preferred MIME types and returns the first supported by the browser’s MediaRecorder.
    - `blobToBase64(blob)` — Converts a Blob to a base64 string (not required for Groq, but handy).
    - `calculateAudioLevel()` — Simple RMS-based level meter (UI only).
    - `formatDuration()` — MM:SS formatting.
    - `generateSegmentId()` — Unique IDs for transcript segments.

## Services (`src/services`)

- `services/audioCapture.ts`
  - Encapsulates MediaRecorder setup and lifecycle for recording audio from mic or a provided MediaStream.
  - Key methods:
    - `initialize()` — Requests microphone and prepares `MediaRecorder`.
    - `initializeWithStream(stream)` — Bind to an external stream (e.g., `getDisplayMedia` with audio). Internally extracts audio tracks to avoid container mismatches.
    - `startRecording(onChunk?)` — Starts recording. Emits periodic chunks via `ondataavailable` using `AUDIO_CONFIG.CHUNK_DURATION`.
    - `stopRecording()` — Resolves a single Blob of all collected chunks.
    - `pauseRecording()` / `resumeRecording()` — Controls `MediaRecorder`.
    - `cleanup()` — Stops tracks and clears references.
  - Auto-selects a supported mime type and optionally applies bitrate.
  - Emits structured `AudioError` on common failures (permission denied, no device, recording failed).

- `services/groqSTT.ts`
  - Client for Groq’s OpenAI-compatible audio endpoints (transcriptions/translations). Designed to run in the browser for prototyping.
  - Key methods:
    - `transcribe(audioBlob)` — Validates, normalizes to `audio/webm`, posts via multipart form to Groq, and maps the result into `WizperResponse`.
    - `transcribeFromUrl(url)` — Same flow but with remote audio.
    - `healthCheck()` — Fetches model list as a simple connectivity check.
    - `updateConfig(partial)` — Adjusts runtime options (language, model, temperature, etc.).
  - Retries transient failures up to `API_CONFIG.MAX_RETRIES`.
  - Notes: For production, call Groq from a server to keep your API key secret.

- `services/wizperAPI.ts` (Deprecated)
  - Old integration using `@fal-ai/client` for the Wizper model. Kept for reference/testing. Prefer `groqSTT.ts` in new code.

## Hooks (`src/hooks`)

- `hooks/useAudioCapture.ts`
  - React hook that wraps `AudioCaptureService` for microphone capture.
  - Provides a simple state + control API: `initialize`, `startRecording(onChunk?)`, `stopRecording()`, `pauseRecording`, `resumeRecording`, `clearError`.
  - Tracks duration with an interval and exposes `isRecording/isPaused/totalDuration/error`.

- `hooks/useDisplayAudioCapture.ts`
  - Same API as `useAudioCapture`, but sources audio from `navigator.mediaDevices.getDisplayMedia` (tab/window share).
  - Handles HTTPS/iframe Permissions Policy guardrails and validates that the chosen source actually includes an audio track.
  - Internally calls `AudioCaptureService.initializeWithStream(stream)` to attach the audio track(s).

- `hooks/useTranscription.ts`
  - Manages transcription state and calls `GroqSTT`.
  - `processAudio(blob)` — Posts audio to Groq and merges new segments into state.
  - `appendMode` option — When true, merges incremental updates; otherwise replaces segments. Utilities `squashSegments` and `mergeIncremental` help reduce duplicates.
  - Also exposes `addSegment()`, `clearTranscript()`, `getTranscriptText()`, and `updateConfig()`.

## UI Components (Optional to port)

- `components/AudioCapture/AudioControls.tsx`
  - UI buttons and indicators for starting/pausing/resuming/stopping recording.
  - Renders a simple level bar and duration. Uses `formatDuration` and hook callbacks.

- `components/AudioCapture/RecordingStatus.tsx`
  - Condensed status chip showing Ready/Recording/Paused/Processing/Error with colored styles.

- `components/Transcript/TranscriptDisplay.tsx`
  - Displays transcript stats (word count, segment count, average confidence), a list of segments, and actions to copy/clear.

- `components/Transcript/ChatThread.tsx`
  - Merges mic and share segments, orders by time, dedupes consecutive duplicates, and renders them as chat bubbles.

- `components/Transcript/MessageBubble.tsx`
  - A single chat bubble; aligns/stylizes by `sourceId` (mic vs share).

- `components/Transcript/TranscriptSegment.tsx`
  - Displays one segment with timestamp, duration, confidence bar, and copy action.

- `components/Transcript/ConfidenceIndicator.tsx`
  - Small confidence bar used in segment rendering.

- `components/Layout/Header.tsx` / `components/Layout/PrototypeLayout.tsx`
  - Lightweight layout and header wrappers used by the demo.

## App Integration Example

- `src/App.tsx`
  - Demo screen that wires everything together:
    - Two capture sources: microphone (`useAudioCapture`) and tab/share (`useDisplayAudioCapture`).
    - Two independent transcription states: one for mic, one for share (`useTranscription`).
    - Accumulates chunks and periodically submits aggregated blobs to STT to get near-real-time updates.
    - Renders status, controls, chat thread, and debug transcript views.
  - Environment variable: reads `VITE_GROQ_P7_KEY` (Vite). Replace with your own env mechanism when porting.

## Integration Notes and Gotchas

- Browser/security:
  - getUserMedia/getDisplayMedia require HTTPS or localhost.
  - If embedded in an iframe, you may need `allow="display-capture; microphone; camera; clipboard-read; clipboard-write"` plus server `Permissions-Policy` headers that include `display-capture=(self)`.
- Media formats:
  - `getBestSupportedMimeType()` selects a usable encoder. The code normalizes uploads to `audio/webm` for Groq.
- Latency vs. quality:
  - `AUDIO_CONFIG.CHUNK_DURATION` is 4000ms by default to reduce API churn. Lower it for lower latency but expect more requests and potentially more partial duplicates.
- Key secrecy:
  - This prototype calls Groq directly from the browser for convenience. In production, put a thin server in front of Groq to attach the `Authorization` header and keep the API key out of the client.

## Minimal Set to Port for Core Behavior

1. `src/services/audioCapture.ts`
2. `src/services/groqSTT.ts`
3. `src/hooks/useAudioCapture.ts`
4. `src/hooks/useDisplayAudioCapture.ts`
5. `src/hooks/useTranscription.ts`
6. `src/utils/audioFormat.ts`
7. `src/utils/constants.ts`
8. `src/types/audio.ts`
9. `src/types/transcript.ts`

Copy these files with the same relative paths. Then wire them into a page or component similar to `App.tsx` using your project’s state and UI.
