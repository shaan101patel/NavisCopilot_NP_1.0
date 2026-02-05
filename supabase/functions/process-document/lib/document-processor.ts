// Document processor for text extraction and chunking

export interface Chunk {
  content: string;
  index: number;
  startIndex: number;
  endIndex: number;
}

export class DocumentProcessor {
  /**
   * Extract text from a file buffer based on file type
   */
  static async extractText(
    fileBuffer: Uint8Array,
    fileType: string,
    fileName: string
  ): Promise<string> {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const mimeType = fileType.toLowerCase();

    // Handle text files
    if (mimeType.includes("text/plain") || extension === "txt") {
      return new TextDecoder("utf-8").decode(fileBuffer);
    }

    // Handle PDF files
    if (mimeType.includes("pdf") || extension === "pdf") {
      try {
        // Use pdf.js-dist for PDF extraction in Deno Edge Functions
        // Import from CDN with proper worker configuration
        const pdfjsLib = await import("https://esm.sh/pdfjs-dist@3.11.174");
        
        // Set up worker (required for pdf.js)
        if (typeof globalThis !== "undefined" && !globalThis.pdfjsWorker) {
          // For Deno, we need to handle worker differently
          // Use the build without worker for edge functions
          const pdfjs = pdfjsLib;
          
          // Load the PDF document
          const loadingTask = pdfjs.getDocument({
            data: fileBuffer,
            useSystemFonts: true,
            verbosity: 0, // Suppress warnings
          });
          
          const pdfDocument = await loadingTask.promise;
          let fullText = "";

          // Extract text from each page
          for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Combine text items from the page, preserving some structure
            const pageText = textContent.items
              .map((item: any) => {
                // Handle text items with proper spacing
                if (item.hasEOL) {
                  return item.str + "\n";
                }
                return item.str + " ";
              })
              .join("")
              .replace(/\s+/g, " ") // Normalize spaces
              .trim();
            
            if (pageText.length > 0) {
              fullText += pageText + "\n\n";
            }
          }

          if (!fullText || fullText.trim().length === 0) {
            throw new Error("No text could be extracted from PDF. The PDF may be image-based or encrypted.");
          }

          return fullText.trim();
        } else {
          throw new Error("PDF.js worker not available in this environment");
        }
      } catch (error) {
        // Fallback: try to extract text from PDF as plain text (works for some PDFs)
        try {
          const textDecoder = new TextDecoder("utf-8", { fatal: false });
          const decoded = textDecoder.decode(fileBuffer);
          
          // Look for readable text patterns in the PDF
          // PDFs often have text in streams or as plain text
          const textPatterns = [
            /\(([^)]+)\)/g, // Text in parentheses (common in PDFs)
            /\/Text\s*\(([^)]+)\)/g, // Text objects
            /BT\s*\(([^)]+)\)\s*ET/g, // Text blocks
          ];
          
          let extractedText = "";
          for (const pattern of textPatterns) {
            const matches = decoded.matchAll(pattern);
            for (const match of matches) {
              if (match[1] && match[1].length > 3) {
                extractedText += match[1] + " ";
              }
            }
          }
          
          if (extractedText.trim().length > 50) {
            return extractedText.trim();
          }
          
          throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}. Please ensure the PDF contains extractable text or convert to TXT format.`);
        } catch (fallbackError) {
          throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}. Please convert PDF to TXT format or use a PDF with extractable text.`);
        }
      }
    }

    // Handle DOCX files
    if (
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      extension === "docx"
    ) {
      // DOCX is a ZIP file containing XML
      // For now, return a placeholder - in production, use a DOCX parsing library
      throw new Error("DOCX extraction not yet implemented. Please use TXT files for now.");
    }

    // Handle PPTX files
    if (
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) ||
      extension === "pptx"
    ) {
      // PPTX is a ZIP file containing XML
      // For now, return a placeholder - in production, use a PPTX parsing library
      throw new Error("PPTX extraction not yet implemented. Please use TXT files for now.");
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  }

  /**
   * Chunk text for embeddings with testing-focused parameters.
   *
   * Parameters:
   * - max_chunk_chars = 220
   * - overlap_chars = 60
   * - Priority: paragraph → sentence → whitespace → hard cut (never mid-word)
   *
   * Root-cause note (2026-02): previously, overlap started at `endIndex - overlapSize` without snapping
   * to a word boundary, producing mid-word fragments like "ment Deployment...".
   *
   * Requirements:
   * - chunk_index starts at 0 and increments sequentially
   * - startChar/endChar offsets map to the cleaned text (stored in content_text)
   * - content_length must match stored chunk length
   * - Overlap: next chunk begins ~60 chars before previous chunk ends (adjusted to safe boundary)
   */
  static chunkText(
    text: string,
    targetChunks: number = 3, // Legacy param, ignored for text files
    chunkOverlapPercent: number = 15 // Legacy param, ignored for text files
  ): Chunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    // Clean and normalize text while preserving paragraph structure
    // Note: offsets will be relative to this cleaned text (which is stored in content_text)
    const cleanedText = this.cleanText(text);
    
    // Testing-focused parameters
    const maxChunkChars = 220;
    const overlapChars = 60;

    // Use boundary-aware chunking with fixed parameters
    return this.chunkByBoundariesWithPriority(cleanedText, maxChunkChars, overlapChars);
  }

  /**
   * Split text into paragraphs while preserving structure.
   * NOTE: currently not used for index math (we chunk directly over the full string),
   * but kept for possible future use and readability.
   */
  private static splitIntoParagraphs(text: string): string[] {
    // Split by double newlines, but also handle single newlines that indicate paragraphs
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    // If no clear paragraphs, try splitting by single newlines for structured text
    if (paragraphs.length === 1 && text.includes('\n')) {
      return text
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 20) // Filter out very short lines (likely not paragraphs)
        .map(p => p + '.'); // Add period for sentence boundary detection
    }
    
    return paragraphs;
  }

  /**
   * Chunk by paragraphs - one chunk per paragraph, respecting paragraph boundaries.
   * This is ideal for test documents with clear paragraph structure.
   * Ensures the returned `content` matches `text.slice(startIndex, endIndex)` exactly.
   */
  private static chunkByParagraphs(
    text: string,
    paragraphs: string[]
  ): Chunk[] {
    const chunks: Chunk[] = [];
    let currentPos = 0;
    let chunkIndex = 0;

    // Split text by paragraph boundaries while tracking positions
    const paraBoundaries: Array<{ start: number; end: number; content: string }> = [];
    const paraSplitRegex = /\n\s*\n/;
    let lastEnd = 0;

    // Find all paragraph boundaries
    let match;
    const regex = new RegExp(paraSplitRegex.source, 'g');
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastEnd) {
        const paraContent = text.slice(lastEnd, match.index).trim();
        if (paraContent.length > 0) {
          // Find exact trimmed boundaries
          const slice = text.slice(lastEnd, match.index);
          const trimmedStart = lastEnd + slice.search(/\S/);
          const trimmedEnd = match.index - (slice.match(/\s*$/) || [''])[0].length;
          paraBoundaries.push({
            start: trimmedStart,
            end: trimmedEnd,
            content: paraContent,
          });
        }
      }
      lastEnd = match.index + match[0].length;
    }

    // Handle last paragraph
    if (lastEnd < text.length) {
      const paraContent = text.slice(lastEnd).trim();
      if (paraContent.length > 0) {
        const slice = text.slice(lastEnd);
        const trimmedStart = lastEnd + slice.search(/\S/);
        const trimmedEnd = text.length - (slice.match(/\s*$/) || [''])[0].length;
        paraBoundaries.push({
          start: trimmedStart,
          end: trimmedEnd,
          content: paraContent,
        });
      }
    }

    // Create chunks from paragraph boundaries
    for (const boundary of paraBoundaries) {
      chunks.push({
        content: boundary.content,
        index: chunkIndex,
        startIndex: boundary.start,
        endIndex: boundary.end,
      });
      chunkIndex++;
    }

    return chunks;
  }

  /**
   * Chunk by boundaries with priority-based splitting (testing-focused).
   * Priority: paragraph → sentence → whitespace → hard cut (never mid-word).
   * 
   * Parameters:
   * - maxChunkChars: maximum chunk size (220)
   * - overlapChars: overlap size (60)
   * 
   * Ensures the returned `content` matches `text.slice(startIndex, endIndex)` exactly.
   */
  private static chunkByBoundariesWithPriority(
    text: string,
    maxChunkChars: number,
    overlapChars: number
  ): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    // Snap initial start to a non-whitespace boundary (keep 0 as-is)
    start = this.snapStartForward(text, start);

    while (start < text.length) {
      let end = Math.min(start + maxChunkChars, text.length);

      // If not at end, find best break point using priority
      if (end < text.length) {
        end = this.findBestBreakPoint(text, start, end, maxChunkChars);
      }

      // Ensure minimum progress / no empty chunk
      end = Math.max(end, Math.min(text.length, start + 50)); // Minimum 50 chars
      end = Math.min(end, text.length);

      const content = text.slice(start, end);
      if (content.length > 0) {
        chunks.push({
          content,
          index: chunkIndex,
          startIndex: start,
          endIndex: end,
        });
        chunkIndex += 1;
      }

      if (end >= text.length) {
        break;
      }

      // Next start = end - overlap, snapped forward to safe boundary
      // Overlap: next chunk begins ~overlapChars before previous chunk ends
      const nextStartCandidate = Math.max(0, end - overlapChars);
      const minForwardProgress = start + Math.floor(maxChunkChars * 0.3); // Ensure forward progress
      start = Math.max(nextStartCandidate, minForwardProgress);
      start = this.snapStartForward(text, start);

      // Safety: always move forward
      if (chunks.length > 0 && start <= chunks[chunks.length - 1].startIndex) {
        start = chunks[chunks.length - 1].endIndex;
        start = this.snapStartForward(text, start);
      }

      // Final safety: if we haven't moved forward enough, force progress
      if (chunks.length > 0 && start <= chunks[chunks.length - 1].endIndex - overlapChars) {
        start = chunks[chunks.length - 1].endIndex - overlapChars;
        start = this.snapStartForward(text, start);
      }
    }

    return chunks;
  }

  /**
   * Find best break point using priority: paragraph → sentence → whitespace → hard cut
   */
  private static findBestBreakPoint(
    text: string,
    start: number,
    target: number,
    maxChunkChars: number
  ): number {
    // Search window: look backward from target, up to ~40% of chunk size
    const searchWindow = Math.floor(maxChunkChars * 0.4);
    const winStart = Math.max(start, target - searchWindow);
    const winEnd = Math.min(text.length, target + 50); // Small forward tolerance
    const window = text.slice(winStart, winEnd);

    // Priority 1: Paragraph boundary (\n\n)
    const paraIdx = window.lastIndexOf("\n\n");
    if (paraIdx !== -1) {
      const abs = winStart + paraIdx + 2;
      // Only use if it's not too close to start (at least 50% of chunk size)
      if (abs >= start + Math.floor(maxChunkChars * 0.5)) {
        return abs;
      }
    }

    // Priority 2: Sentence boundary (. ! ? followed by space/newline)
    const sentenceRe = /[.!?]+[\s\n]+/g;
    let match: RegExpExecArray | null;
    let lastSentence = -1;
    let lastSentenceAbs = -1;
    
    // Reset regex lastIndex
    sentenceRe.lastIndex = 0;
    while ((match = sentenceRe.exec(window)) !== null) {
      lastSentence = match.index;
      lastSentenceAbs = winStart + match.index + match[0].length;
    }
    
    if (lastSentenceAbs !== -1 && lastSentenceAbs >= start + Math.floor(maxChunkChars * 0.5)) {
      return lastSentenceAbs;
    }

    // Priority 3: Whitespace boundary (space, tab, newline)
    const whitespaceRe = /[\s\n]+/g;
    whitespaceRe.lastIndex = 0;
    let lastWhitespace = -1;
    let lastWhitespaceAbs = -1;
    
    while ((match = whitespaceRe.exec(window)) !== null) {
      if (match.index + winStart <= target) {
        lastWhitespace = match.index;
        lastWhitespaceAbs = winStart + match.index + match[0].length;
      } else {
        break;
      }
    }
    
    if (lastWhitespaceAbs !== -1 && lastWhitespaceAbs >= start + 50) {
      return lastWhitespaceAbs;
    }

    // Priority 4: Hard cut, but ensure we don't cut mid-word
    // Fall back to snapping backward to word boundary
    return this.snapEndBackward(text, start, target);
  }

  /**
   * Chunk by boundaries (paragraph → sentence → word), with safe overlap.
   * Ensures the returned `content` matches `text.slice(startIndex, endIndex)` exactly.
   */
  private static chunkByBoundaries(
    text: string,
    chunkSize: number,
    overlapSize: number
  ): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    // Snap initial start to a non-whitespace boundary (keep 0 as-is).
    start = this.snapStartForward(text, start);

    while (start < text.length) {
      let end = Math.min(start + chunkSize, text.length);

      // If not at end, prefer breaking at natural boundaries near `end`.
      if (end < text.length) {
        const preferred = this.findBestEnd(text, start, end, chunkSize);
        if (preferred > start + 200) {
          end = preferred;
        } else {
          // Fallback: ensure we don't cut mid-word.
          end = this.snapEndBackward(text, start, end);
        }
      }

      // Ensure minimum progress / no empty chunk.
      end = Math.max(end, Math.min(text.length, start + 200));
      end = Math.min(end, text.length);

      const content = text.slice(start, end);
      if (content.length > 0) {
        chunks.push({ content, index: chunkIndex, startIndex: start, endIndex: end });
        chunkIndex += 1;
      }

      if (end >= text.length) {
        break;
      }

      // Next start = end - overlap, but snapped forward to a safe boundary so we never begin mid-word.
      const nextStartCandidate = Math.max(0, end - overlapSize);
      const minForwardProgress = start + Math.floor(chunkSize * 0.5);
      start = Math.max(nextStartCandidate, minForwardProgress);
      start = this.snapStartForward(text, start);

      // Safety: always move forward.
      if (start <= chunks[chunks.length - 1].startIndex) {
        start = chunks[chunks.length - 1].endIndex;
        start = this.snapStartForward(text, start);
      }
    }

    return chunks;
  }

  /**
   * Choose best end boundary near `target`.
   */
  private static findBestEnd(text: string, start: number, target: number, chunkSize: number): number {
    // Search window: last ~35% of the chunk plus a little forward tolerance.
    const winStart = Math.max(start, target - Math.floor(chunkSize * 0.35));
    const winEnd = Math.min(text.length, target + 250);
    const window = text.slice(winStart, winEnd);

    // 1) Paragraph break (double newline) – highest priority for coherence.
    const paraIdx = window.lastIndexOf("\n\n");
    if (paraIdx !== -1) {
      const abs = winStart + paraIdx + 2;
      if (abs >= start + Math.floor(chunkSize * 0.6)) return abs;
    }

    // 2) Sentence boundary near the end (., !, ?) followed by whitespace/newline.
    const sentenceRe = /[.!?]+[\s\n]+/g;
    let match: RegExpExecArray | null;
    let lastSentence = -1;
    while ((match = sentenceRe.exec(window)) !== null) {
      lastSentence = winStart + match.index + match[0].length;
    }
    if (lastSentence !== -1 && lastSentence >= start + Math.floor(chunkSize * 0.6)) {
      return lastSentence;
    }

    // 3) Word boundary (whitespace/punct) – ensure we don't cut mid-token.
    return this.snapEndBackward(text, start, target);
  }

  private static snapStartForward(text: string, idx: number): number {
    if (idx <= 0) return 0;
    let i = idx;
    // If we're already on a boundary, keep it.
    if (this.isBoundaryChar(text.charAt(i - 1))) return i;
    // Move forward to next boundary within a small window; otherwise fall back to original idx.
    const maxForward = Math.min(text.length, idx + 80);
    while (i < maxForward && !this.isBoundaryChar(text.charAt(i - 1))) i++;
    return Math.min(i, text.length);
  }

  private static snapEndBackward(text: string, start: number, idx: number): number {
    if (idx >= text.length) return text.length;
    let i = idx;
    // Move backward to a boundary char so we don't end mid-word.
    const minBack = Math.max(start + 200, idx - 120);
    while (i > minBack && !this.isBoundaryChar(text.charAt(i - 1))) i--;
    return Math.max(i, start + 1);
  }

  private static isBoundaryChar(ch: string): boolean {
    // Boundary = whitespace or common punctuation separating words/sentences.
    return /\s|[.,;:!?()\[\]{}"'\-]/.test(ch);
  }

  private static clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
  }

  /**
   * Clean and normalize text while preserving paragraph structure
   */
  static cleanText(text: string): string {
    return text
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n")
      .replace(/\n{4,}/g, "\n\n\n") // Limit excessive newlines but preserve paragraph breaks
      .replace(/[ \t]{2,}/g, " ") // Normalize multiple spaces to single space
      .replace(/[ \t]+\n/g, "\n") // Remove trailing spaces before newlines
      .replace(/\n[ \t]+/g, "\n") // Remove leading spaces after newlines
      .trim();
  }
}
