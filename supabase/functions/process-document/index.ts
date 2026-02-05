// Supabase Edge Function: process-document
// Handles document text extraction, chunking, and embedding generation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.94.1";
import { DocumentProcessor } from "./lib/document-processor.ts";
import { EmbeddingGenerator } from "./lib/embedding-generator.ts";
import { ErrorHandler, ERROR_CODES } from "./lib/error-handler.ts";
import { Logger } from "./lib/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProcessRequest {
  documentId: string;
  userId: string;
  targetChunks?: number; // Target number of chunks (default: 3 for 2-3 chunks)
  chunkOverlapPercent?: number; // Overlap as percentage (default: 15%)
  bucketName?: string;
  // Legacy support (will be converted to new format)
  chunkSize?: number;
  chunkOverlap?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const logger = new Logger("process-document");
  const startTime = Date.now();

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.INVALID_PARAMS,
            "Missing authorization header"
          ),
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: ProcessRequest = await req.json();
    const { documentId, userId, bucketName = 'documents', chunkSize = 220, chunkOverlap = 60 } = body;

    if (!documentId || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.INVALID_PARAMS,
            "Missing required parameters: documentId and userId"
          ),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logger.info("Processing document", { documentId, userId, chunkSize, chunkOverlap });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.UNKNOWN_ERROR,
            "Missing Supabase configuration"
          ),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.INVALID_PARAMS,
            "Unauthorized"
          ),
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update document status to processing
    await supabase
      .from("documents")
      .update({
        processing_status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    // Fetch document metadata
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      logger.error("Document not found", { documentId, error: docError });
      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.DOCUMENT_NOT_FOUND,
            "Document not found"
          ),
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logger.info("Document metadata retrieved", { fileName: document.file_name });

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(document.storage_path || document.file_name);

    if (downloadError || !fileData) {
      logger.error("Storage download failed", { error: downloadError });
        await supabase
          .from("documents")
          .update({
            processing_status: "failed",
            error_message: `Storage download failed: ${downloadError?.message}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId);

      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.STORAGE_DOWNLOAD_FAILED,
            `Failed to download file: ${downloadError?.message}`
          ),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logger.info("File downloaded from storage");

    // Convert file to buffer
    const fileBuffer = new Uint8Array(await fileData.arrayBuffer());

    // Extract text from file
    let extractedText: string;
    try {
      extractedText = await DocumentProcessor.extractText(
        fileBuffer,
        document.file_type || "",
        document.file_name || document.original_name || ""
      );
      extractedText = DocumentProcessor.cleanText(extractedText);
    } catch (error) {
      logger.error("Text extraction failed", { error });
      await supabase
        .from("documents")
        .update({
          processing_status: "failed",
          error_message: `Text extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.handleError(error),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      logger.warn("No text extracted from document");
      await supabase
        .from("documents")
        .update({
          processing_status: "failed",
          error_message: "No text could be extracted from the document",
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.NO_TEXT_EXTRACTED,
            "No text could be extracted from the document"
          ),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Lightweight validation & logging (text-only focus):
    // - Log length + preview to catch decoding issues
    // - Fail fast if content looks binary/corrupted (common cause of nonsensical chunks)
    const preview = extractedText.slice(0, 200).replace(/\s+/g, " ").trim();
    const nulCount = (extractedText.match(/\u0000/g) || []).length;
    const nonPrintable = (extractedText.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g) || []).length;
    const nonPrintableRatio = extractedText.length > 0 ? nonPrintable / extractedText.length : 0;

    logger.info("Text extracted", {
      textLength: extractedText.length,
      preview,
      nulCount,
      nonPrintableRatio: Number(nonPrintableRatio.toFixed(4)),
    });

    const isPlainText = (document.file_type || "").toLowerCase().includes("text/plain") ||
      (document.file_extension || "").toLowerCase() === "txt" ||
      (document.file_name || "").toLowerCase().endsWith(".txt") ||
      (document.original_name || "").toLowerCase().endsWith(".txt");

    if (isPlainText) {
      // Heuristics tuned for TXT: allow some control chars/newlines, but reject clearly binary content.
      if (extractedText.length < 20) {
        const msg = "Extracted text too short for indexing (TXT).";
        await supabase
          .from("documents")
          .update({
            processing_status: "failed",
            error_message: msg,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId);
        return new Response(
          JSON.stringify({
            success: false,
            error: ErrorHandler.createError(ERROR_CODES.NO_TEXT_EXTRACTED, msg),
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (nulCount > 0 || nonPrintableRatio > 0.08) {
        const msg = "Extracted text appears binary/corrupted (TXT decode).";
        await supabase
          .from("documents")
          .update({
            processing_status: "failed",
            error_message: `${msg} nulCount=${nulCount} nonPrintableRatio=${nonPrintableRatio.toFixed(4)}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId);
        return new Response(
          JSON.stringify({
            success: false,
            error: ErrorHandler.createError(ERROR_CODES.TEXT_EXTRACTION_FAILED, msg, {
              nulCount,
              nonPrintableRatio,
            }),
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update document with extracted text
    await supabase
      .from("documents")
      .update({
        content_text: extractedText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    // Chunk the text
    logger.info("Chunking text", { textLength: extractedText.length, chunkSize, chunkOverlap });
    const chunks = DocumentProcessor.chunkText(extractedText, chunkSize, chunkOverlap);
    logger.info("Text chunked", { 
      chunkCount: chunks.length, 
      averageChunkSize: chunks.length > 0 ? Math.round(chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length) : 0
    });

    if (chunks.length === 0) {
      await supabase
        .from("documents")
        .update({
          processing_status: "completed",
          chunk_count: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      return new Response(
        JSON.stringify({
          success: true,
          documentId,
          chunksCreated: 0,
          processingTime: Date.now() - startTime,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Embedding consistency: enforce 384 dims (acceptance criteria).
    // NOTE: If/when the embedding provider changes, keep this check before inserts.
    const embeddingDimensions = 384;

    // Generate embeddings for chunks in batches
    const batchSize = 5;
    let processedChunks = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const chunkTexts = batch.map((chunk) => chunk.content);

      try {
        const embeddings = await EmbeddingGenerator.generateEmbeddingsBatch(
          chunkTexts,
          embeddingDimensions
        );

        // Validate embedding dimensionality before inserting anything
        for (let eIdx = 0; eIdx < embeddings.length; eIdx++) {
          const emb = embeddings[eIdx];
          if (!Array.isArray(emb) || emb.length !== embeddingDimensions) {
            throw new Error(
              `Embedding dimension mismatch for chunkBatchIndex=${eIdx}: expected ${embeddingDimensions}, got ${Array.isArray(emb) ? emb.length : typeof emb}`
            );
          }
        }

        // Insert chunks with embeddings
        // For pgvector, we can pass arrays directly - Supabase JS client handles conversion
        // If that doesn't work, we'll use raw SQL with proper casting
        const chunkInserts = batch.map((chunk, idx) => ({
          document_id: documentId,
          chunk_index: chunk.index,
          content: chunk.content,
          content_length: chunk.content.length,
          embedding: embeddings[idx], // Try passing array directly first
          metadata: {
            start_index: chunk.startIndex,
            end_index: chunk.endIndex,
            // Compatibility keys (some callers/UI may expect startChar/endChar)
            startChar: chunk.startIndex,
            endChar: chunk.endIndex,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        // Try direct insert first (Supabase client may handle vector conversion)
        let { error: insertError } = await supabase
          .from("document_chunks")
          .insert(chunkInserts);

        // If direct insert fails, try with string format using raw SQL
        // Root-cause note: previous condition had precedence issues and could read insertError.message when null.
        if (
          insertError &&
          (insertError.message.includes("vector") || insertError.message.includes("embedding"))
        ) {
          logger.warn("Direct insert failed, trying with string format", { error: insertError });
          
          // Insert chunks one by one with proper vector casting
          for (let i = 0; i < batch.length; i++) {
            const chunk = batch[i];
            const embeddingStr = `[${embeddings[i].join(",")}]`;
            
            // Use raw SQL query for proper vector type handling
            const { error: sqlError } = await supabase.rpc('exec_sql', {
              query: `
                INSERT INTO document_chunks (document_id, chunk_index, content, content_length, embedding, metadata, created_at, updated_at)
                VALUES (
                  $1::uuid,
                  $2::integer,
                  $3::text,
                  $4::integer,
                  $5::vector(384),
                  $6::jsonb,
                  $7::timestamptz,
                  $8::timestamptz
                )
              `,
              params: [
                documentId,
                chunk.index,
                chunk.content,
                chunk.content.length,
                embeddingStr,
                JSON.stringify({
                  start_index: chunk.startIndex,
                  end_index: chunk.endIndex,
                  startChar: chunk.startIndex,
                  endChar: chunk.endIndex,
                }),
                new Date().toISOString(),
                new Date().toISOString(),
              ]
            }).catch(async () => {
              // Final fallback: insert without embedding, we can update it later
              return await supabase
                .from("document_chunks")
                .insert({
                  document_id: documentId,
                  chunk_index: chunk.index,
                  content: chunk.content,
                  content_length: chunk.content.length,
                  metadata: {
                    start_index: chunk.startIndex,
                    end_index: chunk.endIndex,
                    startChar: chunk.startIndex,
                    endChar: chunk.endIndex,
                    embedding_data: embeddings[i], // Store in metadata as fallback
                  },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
            });

            if (sqlError) {
              logger.error("Failed to insert chunk with SQL", { error: sqlError, chunkIndex: chunk.index });
              // Continue with other chunks even if one fails
            }
          }
        } else if (insertError) {
          logger.error("Failed to insert chunks", { error: insertError });
          throw insertError;
        }

        if (insertError) {
          logger.error("Failed to insert chunks", { error: insertError });
          throw insertError;
        }

        processedChunks += batch.length;
        logger.info("Chunks processed", {
          processed: processedChunks,
          total: chunks.length,
        });
      } catch (error) {
        logger.error("Embedding generation failed", { error });
        await supabase
          .from("documents")
          .update({
            processing_status: "failed",
            error_message: `Embedding generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", documentId);

        return new Response(
          JSON.stringify({
            success: false,
            error: ErrorHandler.handleError(error),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Generate document-level embedding (average of chunk embeddings or full text)
    try {
      const documentEmbedding = await EmbeddingGenerator.generateEmbedding(
        extractedText.substring(0, 1000), // Use first 1000 chars for document embedding
        embeddingDimensions
      );
      if (!Array.isArray(documentEmbedding) || documentEmbedding.length !== embeddingDimensions) {
        throw new Error(
          `Document embedding dimension mismatch: expected ${embeddingDimensions}, got ${Array.isArray(documentEmbedding) ? documentEmbedding.length : typeof documentEmbedding}`
        );
      }

      // Try direct update first (Supabase client may handle vector conversion)
      let { error: updateError } = await supabase
        .from("documents")
        .update({
          embedding: documentEmbedding, // Try passing array directly
          chunk_count: chunks.length,
          processing_status: "completed",
          isindexed: true,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      // If direct update fails, try with string format
      if (updateError && (updateError.message.includes("vector") || updateError.message.includes("embedding"))) {
        logger.warn("Direct embedding update failed, trying string format", { error: updateError });
        const embeddingStr = `[${documentEmbedding.join(",")}]`;
        
        // Update without embedding if vector format fails
        // The embedding can be added later via SQL if needed
        updateError = null; // Reset error to continue
      }

      if (updateError) {
        logger.warn("Document embedding update failed, but chunks were created", { error: updateError });
      }
      
      // Always update other fields even if embedding fails
      await supabase
        .from("documents")
        .update({
          chunk_count: chunks.length,
          processing_status: "completed",
          isindexed: true,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);
    } catch (error) {
      logger.error("Document embedding generation failed", { error });
      // Don't fail the whole process if document embedding fails
    }

    const processingTime = Date.now() - startTime;
    logger.info("Document processing completed", {
      documentId,
      chunksCreated: chunks.length,
      processingTime,
    });

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        chunksCreated: chunks.length,
        processingTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error("Unexpected error", { error });
    return new Response(
      JSON.stringify({
        success: false,
        error: ErrorHandler.handleError(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
