// Logger utility for structured logging
// Shared with process-document for consistency

export interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class Logger {
  private context: string;

  constructor(context: string = "retrieve-similar-chunks") {
    this.context = context;
  }

  private log(level: LogEntry["level"], message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    const logMessage = `[${entry.timestamp}] [${this.context}] [${level.toUpperCase()}] ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      console.log(logMessage, JSON.stringify(metadata, null, 2));
    } else {
      console.log(logMessage);
    }
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log("info", message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log("warn", message, metadata);
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log("error", message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log("debug", message, metadata);
  }
}
