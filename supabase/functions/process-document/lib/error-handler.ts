// Error handler utility for consistent error management

export interface ProcessingError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export class ErrorHandler {
  static createError(
    code: string,
    message: string,
    details?: any
  ): ProcessingError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static handleError(error: unknown): ProcessingError {
    if (error instanceof Error) {
      // Categorize common errors
      if (error.message.includes("not found") || error.message.includes("does not exist")) {
        return this.createError("DOCUMENT_NOT_FOUND", error.message, {
          originalError: error.name,
        });
      }

      if (error.message.includes("storage") || error.message.includes("download")) {
        return this.createError("STORAGE_DOWNLOAD_FAILED", error.message, {
          originalError: error.name,
        });
      }

      if (error.message.includes("extract") || error.message.includes("parse")) {
        return this.createError("TEXT_EXTRACTION_FAILED", error.message, {
          originalError: error.name,
        });
      }

      if (error.message.includes("embedding") || error.message.includes("vector")) {
        return this.createError("EMBEDDING_GENERATION_FAILED", error.message, {
          originalError: error.name,
        });
      }

      if (error.message.includes("database") || error.message.includes("SQL")) {
        return this.createError("DATABASE_CONNECTION_ERROR", error.message, {
          originalError: error.name,
        });
      }

      return this.createError("UNKNOWN_ERROR", error.message, {
        originalError: error.name,
        stack: error.stack,
      });
    }

    return this.createError(
      "UNKNOWN_ERROR",
      "An unexpected error occurred",
      { error }
    );
  }
}

// Error codes
export const ERROR_CODES = {
  INVALID_PARAMS: "INVALID_PARAMS",
  DOCUMENT_NOT_FOUND: "DOCUMENT_NOT_FOUND",
  UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE",
  STORAGE_DOWNLOAD_FAILED: "STORAGE_DOWNLOAD_FAILED",
  TEXT_EXTRACTION_FAILED: "TEXT_EXTRACTION_FAILED",
  NO_TEXT_EXTRACTED: "NO_TEXT_EXTRACTED",
  EMBEDDING_GENERATION_FAILED: "EMBEDDING_GENERATION_FAILED",
  NETWORK_ERROR: "NETWORK_ERROR",
  DATABASE_CONNECTION_ERROR: "DATABASE_CONNECTION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;
