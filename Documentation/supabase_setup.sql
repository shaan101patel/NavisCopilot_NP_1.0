-- ==========================================
-- COMPLETE SQL SETUP FOR DOCUMENT SEARCH
-- Run these commands in your Supabase SQL Editor
-- ==========================================

-- Step 1: Clean up existing functions to avoid conflicts
-- Drop all versions of search_document_chunks with different signatures
DROP FUNCTION IF EXISTS public.search_document_chunks(vector, float, int) CASCADE;
DROP FUNCTION IF EXISTS public.search_document_chunks(vector, float, int, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.search_document_chunks(vector, float, int, text) CASCADE;
DROP FUNCTION IF EXISTS public.search_document_chunks(text, float, int) CASCADE;
DROP FUNCTION IF EXISTS public.search_document_chunks(text, float, int, uuid) CASCADE;

-- Drop all versions of search_documents with different signatures
DROP FUNCTION IF EXISTS public.search_documents(vector, float, int) CASCADE;
DROP FUNCTION IF EXISTS public.search_documents(vector, float, int, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.search_documents(text, float, int) CASCADE;
DROP FUNCTION IF EXISTS public.search_documents(text, float, int, uuid) CASCADE;

-- Drop embed function
DROP FUNCTION IF EXISTS public.embed CASCADE;
DROP FUNCTION IF EXISTS public.embed(text, text) CASCADE;

-- Step 2: Ensure vector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 3: Add missing columns to documents table if they don't exist
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS content_text text,
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Step 4: Create or recreate document_chunks table with correct schema
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  content_length integer NOT NULL,
  embedding vector(384),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 5: Create vector indexes for better performance
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON public.documents USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- Step 6: Set up RLS policies (allow all operations for now)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS documents_select ON public.documents;
DROP POLICY IF EXISTS documents_insert ON public.documents;
DROP POLICY IF EXISTS documents_update ON public.documents;
DROP POLICY IF EXISTS documents_delete ON public.documents;

DROP POLICY IF EXISTS document_chunks_select ON public.document_chunks;
DROP POLICY IF EXISTS document_chunks_insert ON public.document_chunks;
DROP POLICY IF EXISTS document_chunks_update ON public.document_chunks;
DROP POLICY IF EXISTS document_chunks_delete ON public.document_chunks;

-- Create open RLS policies for testing (you can restrict these later)
CREATE POLICY documents_select ON public.documents
  FOR SELECT USING (true);
CREATE POLICY documents_insert ON public.documents
  FOR INSERT WITH CHECK (true);
CREATE POLICY documents_update ON public.documents
  FOR UPDATE USING (true);
CREATE POLICY documents_delete ON public.documents
  FOR DELETE USING (true);

CREATE POLICY document_chunks_select ON public.document_chunks
  FOR SELECT USING (true);
CREATE POLICY document_chunks_insert ON public.document_chunks
  FOR INSERT WITH CHECK (true);
CREATE POLICY document_chunks_update ON public.document_chunks
  FOR UPDATE USING (true);
CREATE POLICY document_chunks_delete ON public.document_chunks
  FOR DELETE USING (true);

-- Step 7: Create the correct search functions
CREATE OR REPLACE FUNCTION public.search_document_chunks(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  document_id uuid,
  document_name text,
  chunk_index int,
  metadata jsonb
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT 
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.document_id,
    COALESCE(d.original_name, d.file_name, 'Untitled') as document_name,
    dc.chunk_index,
    dc.metadata
  FROM public.document_chunks dc
  JOIN public.documents d ON dc.document_id = d.id
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION public.search_documents(
  query_embedding vector(384),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  document_id uuid,
  document_name text,
  metadata jsonb
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT 
    d.id,
    COALESCE(d.content_text, d.description, 'No content available') as content,
    1 - (d.embedding <=> query_embedding) as similarity,
    d.id as document_id,
    COALESCE(d.original_name, d.file_name, 'Untitled') as document_name,
    jsonb_build_object(
      'file_name', d.file_name,
      'file_size', d.file_size,
      'file_extension', d.file_extension,
      'created_at', d.created_at,
      'upload_date', d.upload_date
    ) as metadata
  FROM public.documents d
  WHERE d.embedding IS NOT NULL
    AND 1 - (d.embedding <=> query_embedding) > similarity_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 8: Create a helper function to insert sample data for testing
CREATE OR REPLACE FUNCTION public.insert_sample_document_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_id uuid;
  sample_embedding vector(384);
BEGIN
  -- Create a sample embedding (all 0.1 values for testing)
  SELECT array_fill(0.1, ARRAY[384])::vector(384) INTO sample_embedding;
  
  -- Insert a sample document if none exist
  IF NOT EXISTS (SELECT 1 FROM public.documents LIMIT 1) THEN
    INSERT INTO public.documents (
      file_name,
      original_name,
      file_type,
      file_size,
      file_extension,
      url,
      storage_path,
      uploaded_by,
      uploaded_by_name,
      content_text,
      embedding,
      category
    ) VALUES (
      'sample_document.txt',
      'Sample Document for Testing',
      'text/plain',
      1024,
      'txt',
      '/sample/path',
      '/storage/sample_document.txt',
      (SELECT id FROM auth.users LIMIT 1),
      'System',
      'This is a sample document for testing the search functionality. It contains some basic text content that can be searched.',
      sample_embedding,
      'document'
    )
    RETURNING id INTO doc_id;
    
    -- Insert sample chunks for the document
    INSERT INTO public.document_chunks (
      document_id,
      chunk_index,
      content,
      content_length,
      embedding,
      metadata
    ) VALUES 
    (
      doc_id,
      0,
      'This is a sample document for testing the search functionality.',
      58,
      sample_embedding,
      '{"chunk_type": "text", "tokens": 12}'::jsonb
    ),
    (
      doc_id,
      1,
      'It contains some basic text content that can be searched.',
      52,
      sample_embedding,
      '{"chunk_type": "text", "tokens": 10}'::jsonb
    );
    
    RAISE NOTICE 'Sample document and chunks inserted successfully with ID: %', doc_id;
  ELSE
    RAISE NOTICE 'Documents already exist, skipping sample data insertion';
  END IF;
END;
$$;

-- Step 9: Test the functions
-- Uncomment the line below to insert sample data for testing
-- SELECT public.insert_sample_document_data();

-- Test the search functions with a sample embedding
-- SELECT * FROM public.search_document_chunks(array_fill(0.1, ARRAY[384])::vector(384), 0.5, 5);
-- SELECT * FROM public.search_documents(array_fill(0.1, ARRAY[384])::vector(384), 0.5, 5);

-- Step 10: Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.search_document_chunks TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_documents TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_sample_document_data TO authenticated;

GRANT SELECT ON public.documents TO authenticated;
GRANT SELECT ON public.document_chunks TO authenticated;

-- ==========================================
-- SETUP COMPLETE!
-- ==========================================
-- 
-- Next steps:
-- 1. Deploy the edge function: npx supabase functions deploy retrieve-similar-chunks
-- 2. Set your OpenAI API key in Supabase: OPENAI_API_KEY
-- 3. Test the search functionality
-- ==========================================
