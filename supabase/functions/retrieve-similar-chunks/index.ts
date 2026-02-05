// Supabase Edge Function: retrieve-similar-chunks
// Handles semantic search over document chunks using vector similarity

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { EmbeddingGenerator } from "./lib/embedding-generator.ts";
import { ErrorHandler, ERROR_CODES } from "./lib/error-handler.ts";
import { Logger } from "./lib/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query: string;
  similarity_threshold?: number;
  match_count?: number;
  search_type?: "chunks" | "documents" | "both";
}

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  document_id: string;
  document_name: string;
  chunk_index?: number;
  metadata?: any;
}

interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  total_results: number;
  processing_time: number;
  search_type: string;
  error?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const logger = new Logger("retrieve-similar-chunks");
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
    const body: SearchRequest = await req.json();
    const {
      query,
      similarity_threshold = 0.7,
      match_count = 10,
      search_type = "chunks",
    } = body;

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: ErrorHandler.createError(
            ERROR_CODES.INVALID_PARAMS,
            "Missing required parameter: query"
          ),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logger.info("Search request received", {
      query: query.substring(0, 100), // Log first 100 chars
      similarity_threshold,
      match_count,
      search_type,
    });

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

    if (authError || !user) {
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

    // Generate embedding for the query
    const embeddingDimensions = 384;
    logger.info("Generating query embedding");
    const queryEmbedding = await EmbeddingGenerator.generateEmbedding(
      query,
      embeddingDimensions
    );

    // Validate embedding
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== embeddingDimensions) {
      throw new Error(
        `Invalid embedding: expected array of length ${embeddingDimensions}, got ${Array.isArray(queryEmbedding) ? queryEmbedding.length : typeof queryEmbedding}`
      );
    }

    logger.info("Query embedding generated", {
      dimensions: queryEmbedding.length,
    });

    // Perform search based on type
    let results: SearchResult[] = [];

    if (search_type === "chunks" || search_type === "both") {
      logger.info("Searching document chunks");
      const { data: chunkResults, error: chunkError } = await supabase.rpc(
        "search_document_chunks",
        {
          query_embedding: queryEmbedding,
          similarity_threshold,
          match_count: search_type === "both" ? Math.ceil(match_count / 2) : match_count,
        }
      );

      if (chunkError) {
        logger.error("Chunk search failed", { error: chunkError });
        throw new Error(`Chunk search failed: ${chunkError.message}`);
      }

      if (chunkResults && Array.isArray(chunkResults)) {
        results.push(...chunkResults);
      }
    }

    if (search_type === "documents" || search_type === "both") {
      logger.info("Searching documents");
      const { data: docResults, error: docError } = await supabase.rpc(
        "search_documents",
        {
          query_embedding: queryEmbedding,
          similarity_threshold,
          match_count: search_type === "both" ? Math.ceil(match_count / 2) : match_count,
        }
      );

      if (docError) {
        logger.error("Document search failed", { error: docError });
        throw new Error(`Document search failed: ${docError.message}`);
      }

      if (docResults && Array.isArray(docResults)) {
        results.push(...docResults);
      }
    }

    // Sort by similarity (descending) and limit to match_count
    results.sort((a, b) => b.similarity - a.similarity);
    results = results.slice(0, match_count);

    const processingTime = Date.now() - startTime;
    logger.info("Search completed", {
      total_results: results.length,
      processing_time: processingTime,
    });

    const response: SearchResponse = {
      success: true,
      query,
      results,
      total_results: results.length,
      processing_time: processingTime,
      search_type,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Search error", { error });
    const processingTime = Date.now() - startTime;

    const response: SearchResponse = {
      success: false,
      query: "",
      results: [],
      total_results: 0,
      processing_time: processingTime,
      search_type: "chunks",
      error: ErrorHandler.handleError(error),
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
