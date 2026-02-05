// Supabase Edge Function: upload-document
// Handles file uploads to Supabase Storage and creates document records

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  file: File;
  category?: string;
  description?: string;
  isPublic?: boolean;
  ticketId?: string;
  callId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing Supabase configuration",
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
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "File size exceeds maximum limit of 50MB",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get optional form fields
    // Default to null if not provided or if "All" is selected (valid categories: Training, Marketing, Technical, Branding, Reports)
    const categoryInput = formData.get("category")?.toString();
    const category = categoryInput && categoryInput !== "All" && categoryInput !== "General" ? categoryInput : null;
    const description = formData.get("description")?.toString() || "";
    const isPublic = formData.get("isPublic")?.toString() !== "false";
    const ticketId = formData.get("ticketId")?.toString();
    const callId = formData.get("callId")?.toString();

    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    // Get user profile for uploaded_by_name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const uploadedByName =
      profile?.full_name || profile?.email || "Unknown User";

    // Upload file to Supabase Storage
    const bucketName = Deno.env.get("DOCUMENTS_BUCKET") || "documents";
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    // Create document record in database
    const documentData: any = {
      file_name: fileName,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_extension: fileExtension,
      url: publicUrl,
      storage_path: fileName,
      uploaded_by: user.id,
      uploaded_by_name: uploadedByName,
      category: category,
      description: description || null,
      is_public: isPublic,
      processing_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (ticketId) {
      documentData.ticket_id = ticketId;
    }
    if (callId) {
      documentData.call_id = callId;
    }

    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert(documentData)
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Try to clean up uploaded file if database insert fails
      await supabase.storage.from(bucketName).remove([fileName]);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create document record: ${insertError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Auto-trigger processing for text files
    if (fileExtension === "txt") {
      try {
        const functionsUrl = `${supabaseUrl}/functions/v1/process-document`;
        // Use the user's token (not service role key) since process-document validates user.id
        const processResponse = await fetch(functionsUrl, {
          method: "POST",
          headers: {
            "Authorization": authHeader, // Use the original user auth header
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: document.id,
            userId: user.id,
            bucketName: bucketName,
            chunkSize: 220,
            chunkOverlap: 60,
          }),
        });

        if (!processResponse.ok) {
          const errorText = await processResponse.text();
          console.error("Failed to trigger process-document:", errorText);
          // Don't fail the upload, just log the error
        } else {
          console.log("Successfully triggered process-document for document:", document.id);
        }
      } catch (processError) {
        console.error("Error triggering process-document:", processError);
        // Don't fail the upload, just log the error
      }
    }

    // Normalize document response to match frontend expectations
    const normalizedDocument = {
      id: document.id,
      document_id: document.id,
      fileName: document.file_name,
      file_name: document.file_name,
      originalName: document.original_name,
      original_name: document.original_name,
      fileType: document.file_type,
      file_type: document.file_type,
      mime_type: document.file_type,
      fileSize: document.file_size,
      file_size: document.file_size,
      url: document.url || publicUrl,
      file_url: document.url || publicUrl,
      uploadedBy: document.uploaded_by,
      uploaded_by: document.uploaded_by,
      uploadedByName: document.uploaded_by_name,
      uploaded_by_name: document.uploaded_by_name,
      uploadDate: document.created_at || document.upload_date,
      upload_date: document.created_at || document.upload_date,
      created_at: document.created_at,
      lastModified: document.updated_at || document.last_modified,
      last_modified: document.updated_at || document.last_modified,
      updated_at: document.updated_at,
      category: document.category || "",
      tags: document.tags || [],
      description: document.description || "",
      isPublic: document.is_public ?? true,
      is_public: document.is_public ?? true,
      downloadCount: document.download_count || 0,
      download_count: document.download_count || 0,
      metadata: document.metadata || {},
      processing: {
        status: document.processing_status || "pending",
        progress: 0,
        jobType: "indexing",
      },
    };

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        document: normalizedDocument,
        message: "Document uploaded successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
