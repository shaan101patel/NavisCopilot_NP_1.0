# Document Processing Pipeline Setup Guide

This guide explains how to enable the end-to-end document indexing flow (storage upload → text extraction → chunking → embedding → search) for the Navis Copilot project.

## 1. Prerequisites

1. **Supabase CLI** – install from [Supabase Docs](https://supabase.com/docs/guides/cli).
2. **Edge Function environment variables** – configure the following secrets in the Supabase dashboard or via CLI:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (or the API key for your embedding provider)
   - Optional tuning knobs:
     - `DOCUMENTS_BUCKET` (default: `documents`)
     - `DOCUMENT_CHUNK_SIZE` (default: `1000`)
     - `DOCUMENT_CHUNK_OVERLAP` (default: `100`)
     - `EMBEDDING_MODEL` (default: `text-embedding-3-small`)
     - `EMBEDDING_PROVIDER` (default: `openai`)
     - `EMBEDDING_DIMENSIONS` (default: `1536`)

> **Tip:** If you use a 384-dimension model like `gte-small`, set `EMBEDDING_MODEL=gte-small` and `EMBEDDING_DIMENSIONS=384` before deploying.

## 2. Apply the database migration

The repository now contains a Supabase migration that provisions the processing tables and adds the missing metadata columns to `documents`.

```powershell
# From the project root
supabase db push --file supabase/migrations/20250925_document_processing_pipeline.sql
```

This migration will:
- Add document metadata columns (`content_text`, `chunk_count`, `indexingstatus`, etc.)
- Create the `document_processing_jobs` and `embedding_model_config` tables
- Seed RLS policies so the service role can write while authenticated users can read their own job history

## 3. Deploy the `process-document` edge function

```powershell
# From project root
supabase functions deploy process-document --project-ref <your-project-ref>
```

The function performs the full indexing workflow:
1. Pull metadata from the `documents` table
2. Download the binary from Supabase Storage
3. Extract text (supports TXT, PDF, DOCX, PPTX)
4. Chunk the text and generate embeddings via OpenAI (or configured provider)
5. Persist chunks to `document_chunks`, update the document row, and record a `document_processing_jobs` entry

## 4. Frontend wiring

The React `Documents` page automatically triggers the edge function after every successful upload and keeps polling until the job completes. Users can now see:
- Live indexing status badges (Pending, Indexing…, Indexed, Failed)
- Retry controls that re-run the edge function when a job fails
- Inline error surfacing if extraction or embedding fails

No additional configuration is required after the migration and deployment are complete.

## 5. Manual smoke test

1. Log into the Supabase dashboard and open Table Editor > `documents`.
2. Upload a sample document from the UI (or run `test-document-processing.js`).
3. Confirm:
   - A new row appears in `document_processing_jobs`
   - The `document_chunks` table is populated with chunked embeddings
   - The original document row transitions `indexingstatus` → `completed` and `isindexed = true`

If anything fails, check the function logs:
```powershell
supabase functions logs process-document --project-ref <your-project-ref>
```

## 6. Common troubleshooting tips

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `PROCESSING_FAILED` from function | Missing secrets or unsupported file type | Verify Supabase secrets and ensure the file is TXT/PDF/DOCX/PPTX |
| No rows in `document_processing_jobs` | Function not deployed or incorrect URL | Redeploy the function and confirm the frontend `REACT_APP_SUPABASE_URL` matches the project |
| `document_chunks` insert fails | Migration missing or embedding dimension mismatch | Re-run the migration and align `EMBEDDING_DIMENSIONS` with the model |
| UI stuck on "Indexing…" | Edge function still running or failed silently | Inspect function logs and the `document_processing_jobs` table for status/errors |

Once these steps are complete, the full document ingestion → embedding pipeline should populate all supporting tables and drive the RAG experience end-to-end.
