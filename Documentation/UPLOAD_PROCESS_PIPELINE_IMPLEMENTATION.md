# Upload and Process Document Pipeline Implementation

## Overview

This document summarizes the implementation of the document upload and processing pipeline for Navis Copilot. The pipeline consists of two main Supabase Edge Functions:

1. **upload-document** - Handles file uploads to Supabase Storage and creates document records
2. **process-document** - Extracts text, chunks documents, and generates embeddings

## Implementation Status

✅ **Completed:**
- upload-document edge function
- process-document edge function with text extraction
- Intelligent chunking with configurable size and overlap
- Embedding generation (mock implementation ready for production integration)
- Error handling and logging
- Database integration

## File Structure

```
supabase/functions/
├── upload-document/
│   └── index.ts                    # Main upload handler
└── process-document/
    ├── index.ts                    # Main processing handler
    └── lib/
        ├── document-processor.ts   # Text extraction and chunking
        ├── embedding-generator.ts  # Embedding generation
        ├── error-handler.ts       # Error management
        └── logger.ts              # Structured logging
```

## Upload Document Function

### Endpoint
`POST /functions/v1/upload-document`

### Features
- Accepts multipart/form-data file uploads
- Validates file size (max 50MB)
- Uploads files to Supabase Storage bucket (`documents` by default)
- Creates document records in the `documents` table
- Returns normalized document data for frontend consumption

### Request Format
```typescript
FormData:
  - file: File (required)
  - category: string (optional, default: "General")
  - description: string (optional)
  - isPublic: boolean (optional, default: true)
  - ticketId: string (optional)
  - callId: string (optional)
```

### Response Format
```typescript
{
  success: boolean,
  document: {
    id: string,
    fileName: string,
    originalName: string,
    fileType: string,
    fileSize: number,
    url: string,
    uploadedBy: string,
    uploadedByName: string,
    // ... other fields
  },
  message: string
}
```

## Process Document Function

### Endpoint
`POST /functions/v1/process-document`

### Features
- Downloads file from Supabase Storage
- Extracts text from files (currently supports TXT; PDF/DOCX/PPTX placeholders)
- Chunks text intelligently with sentence boundary detection
- Generates embeddings for chunks and document
- Stores chunks in `document_chunks` table
- Updates document status throughout processing

### Request Format
```typescript
{
  documentId: string (required),
  userId: string (required),
  chunkSize?: number (default: 1000),
  chunkOverlap?: number (default: 100),
  bucketName?: string (default: "documents")
}
```

### Response Format
```typescript
{
  success: boolean,
  documentId: string,
  chunksCreated: number,
  processingTime: number,
  error?: {
    code: string,
    message: string,
    details?: any,
    timestamp: string
  }
}
```

## Chunking Algorithm

The chunking process uses intelligent text splitting:

1. **Normalization**: Removes excessive whitespace and normalizes line endings
2. **Size-based splitting**: Creates chunks of specified size (default: 1000 characters)
3. **Boundary detection**: Attempts to break at sentence boundaries (., !, ?)
4. **Word boundary fallback**: If no sentence boundary found, breaks at word boundaries
5. **Overlap handling**: Ensures proper overlap between chunks (default: 100 characters)
6. **Progress tracking**: Processes chunks in batches to avoid overwhelming the system

### Chunking Features
- Sentence boundary detection in the last 20% of chunk
- Word boundary fallback for better text preservation
- Proper overlap calculation to maintain context
- Safety checks to prevent infinite loops

## Text Extraction

Currently implemented:
- ✅ **TXT files**: Direct UTF-8 text decoding

Placeholders for future implementation:
- ⏳ **PDF files**: Requires PDF parsing library (e.g., pdf-parse)
- ⏳ **DOCX files**: Requires DOCX parsing (ZIP + XML extraction)
- ⏳ **PPTX files**: Requires PPTX parsing (ZIP + XML extraction)

## Embedding Generation

Current implementation uses a mock/deterministic embedding generator for testing. The structure is ready for integration with:

- OpenAI embeddings API
- Supabase's built-in embedding functions
- Other embedding services (Hugging Face, Cohere, etc.)

### Embedding Configuration
- Default dimensions: 384 (gte-small compatible)
- Configurable via `EMBEDDING_DIMENSIONS` environment variable
- Batch processing for efficiency

## Database Schema Requirements

The functions expect the following database structure:

### Documents Table
Required columns:
- `id` (uuid, primary key)
- `file_name` (text)
- `original_name` (text)
- `file_type` (text)
- `file_size` (bigint)
- `file_extension` (text)
- `url` (text)
- `storage_path` (text)
- `uploaded_by` (uuid, foreign key to profiles)
- `uploaded_by_name` (text)
- `category` (text)
- `description` (text)
- `is_public` (boolean)
- `processing_status` (text) - 'pending' | 'processing' | 'completed' | 'failed'
- `indexingstatus` (text) - 'pending' | 'processing' | 'completed' | 'failed'
- `content_text` (text) - extracted text content
- `embedding` (vector(384)) - document-level embedding
- `chunk_count` (integer)
- `isindexed` (boolean)
- `error_message` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `processed_at` (timestamptz)

Optional columns:
- `ticket_id` (uuid, foreign key to tickets)
- `call_id` (uuid, foreign key to calls)

### Document Chunks Table
Required columns:
- `id` (uuid, primary key)
- `document_id` (uuid, foreign key to documents)
- `chunk_index` (integer)
- `content` (text)
- `content_length` (integer)
- `embedding` (vector(384))
- `metadata` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Environment Variables

Required for both functions:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database operations

Optional:
- `DOCUMENTS_BUCKET` - Storage bucket name (default: "documents")
- `DOCUMENT_CHUNK_SIZE` - Default chunk size (default: 1000)
- `DOCUMENT_CHUNK_OVERLAP` - Default chunk overlap (default: 100)
- `EMBEDDING_DIMENSIONS` - Embedding vector dimensions (default: 384)

## Deployment

### Deploy upload-document function:
```bash
supabase functions deploy upload-document --project-ref <your-project-ref>
```

### Deploy process-document function:
```bash
supabase functions deploy process-document --project-ref <your-project-ref>
```

### Set environment variables:
```bash
supabase secrets set SUPABASE_URL=<your-url>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-key>
supabase secrets set DOCUMENTS_BUCKET=documents
supabase secrets set EMBEDDING_DIMENSIONS=384
```

## Frontend Integration

The frontend (`app/src/pages/Documents.tsx`) is already configured to:

1. Call `upload-document` when files are uploaded
2. Automatically trigger `process-document` after successful upload (or can be triggered manually)
3. Poll for processing status updates
4. Display processing progress and status

### Example Usage

```typescript
// Upload document
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'General');

const uploadResponse = await fetch(`${API_FUNCTIONS_URL}/upload-document`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const uploadResult = await uploadResponse.json();

// Process document (if not automatic)
if (uploadResult.success) {
  const processResponse = await fetch(`${API_FUNCTIONS_URL}/process-document`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      documentId: uploadResult.document.id,
      userId: currentUser.id,
      chunkSize: 1000,
      chunkOverlap: 100
    })
  });

  const processResult = await processResponse.json();
}
```

## Error Handling

Both functions implement comprehensive error handling:

### Error Codes
- `INVALID_PARAMS` - Missing or invalid parameters
- `DOCUMENT_NOT_FOUND` - Document not found in database
- `UNSUPPORTED_FILE_TYPE` - File type not supported
- `STORAGE_DOWNLOAD_FAILED` - Failed to download from storage
- `TEXT_EXTRACTION_FAILED` - Text extraction error
- `NO_TEXT_EXTRACTED` - No text found in document
- `EMBEDDING_GENERATION_FAILED` - Embedding generation error
- `DATABASE_CONNECTION_ERROR` - Database operation failed
- `UNKNOWN_ERROR` - Unexpected error

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any,
    timestamp: string
  }
}
```

## Known Limitations

1. **Text Extraction**: Currently only TXT files are fully supported. PDF, DOCX, and PPTX extraction requires additional libraries.

2. **Embedding Generation**: Uses mock/deterministic embeddings. Production integration with actual embedding service needed.

3. **Vector Type Handling**: Supabase JS client vector type conversion may need adjustment based on actual deployment behavior. If direct array insertion fails, SQL helper functions may be needed.

4. **Large Files**: Very large files (>50MB) are rejected. Consider implementing streaming for larger files.

## Next Steps

1. **Integrate PDF/DOCX/PPTX parsing libraries**:
   - For PDF: Use `pdf-parse` or similar
   - For DOCX: Use `mammoth` or `docx` library
   - For PPTX: Use `pptxgenjs` or similar

2. **Replace mock embeddings** with actual embedding service:
   - OpenAI embeddings API
   - Supabase embedding functions
   - Hugging Face transformers

3. **Add SQL helper functions** for vector type handling if needed:
   ```sql
   CREATE OR REPLACE FUNCTION insert_document_chunk(
     p_document_id uuid,
     p_chunk_index integer,
     p_content text,
     p_content_length integer,
     p_embedding text, -- '[1,2,3]' format
     p_metadata jsonb
   ) RETURNS void AS $$
   BEGIN
     INSERT INTO document_chunks (
       document_id, chunk_index, content, content_length,
       embedding, metadata, created_at, updated_at
     ) VALUES (
       p_document_id, p_chunk_index, p_content, p_content_length,
       p_embedding::vector(384), p_metadata, now(), now()
     );
   END;
   $$ LANGUAGE plpgsql;
   ```

4. **Add processing queue** for better scalability and retry logic

5. **Implement real-time status updates** via Supabase Realtime

## Testing

Use the provided test files:
- `test-document-processing.html` - Interactive web-based testing
- `test-document-processing.js` - Automated Node.js testing

## Troubleshooting

### Upload fails
- Check file size (max 50MB)
- Verify storage bucket exists and has proper permissions
- Check RLS policies on documents table

### Processing fails
- Verify document exists in database
- Check file is accessible in storage
- Review function logs: `supabase functions logs process-document`
- Check database schema matches expected structure

### Embedding insertion fails
- Verify vector extension is enabled: `CREATE EXTENSION IF NOT EXISTS vector;`
- Check embedding dimensions match table definition (384)
- Review error logs for specific vector type errors

## Support

For issues or questions, refer to:
- Supabase Edge Functions documentation
- pgvector documentation for vector type handling
- Project documentation in `/Documentation` folder
