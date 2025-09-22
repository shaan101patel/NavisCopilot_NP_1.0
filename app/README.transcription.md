# Transcription Page (Real-time, Chunked STT)

This MVP page mirrors the Prototype's behavior: microphone and screen-share audio are captured in chunks (via MediaRecorder with timeslice), chunks are aggregated into a rolling Blob, and sent incrementally to Groq Whisper for real-time transcript updates.

## Route
- Protected route: `/transcription`

## Environment
- Add your Groq API key via CRA env: `REACT_APP_GROQ_API_KEY=<your_key>` in `app/.env.local` (create if missing). Or use the in-page "Enter API Key" button.
- Optional: `REACT_APP_DEFAULT_LANGUAGE` (default `en`).

## Files added
- src/types/audio.ts, src/types/transcript.ts
- src/utils/constants.ts, src/utils/audioFormat.ts
- src/services/audioCapture.ts, src/services/groqSTT.ts
- src/hooks/useAudioCapture.ts, src/hooks/useDisplayAudioCapture.ts, src/hooks/useTranscription.ts
- src/components/transcription/* (controls + transcript UI)
- src/pages/Transcription.tsx

## How it works (brief)
- MediaRecorder emits small chunks (default 4s). Each chunk is appended to an accumulator array per source (mic/share).
- When a new chunk arrives, we build an aggregated Blob from all chunks so far and POST it to Groq.
- The transcription hook merges new segments incrementally by time and source and updates the UI live.

## Notes
- Screen share audio requires selecting a tab/window and enabling "Share tab audio".
- Browser must allow microphone/screen capture and be served over HTTPS or localhost.
