// Embedding generator utility for retrieval
// Uses the same mock implementation as process-document for consistency

export class EmbeddingGenerator {
  private static readonly DEFAULT_DIMENSIONS = 384; // gte-small dimensions

  /**
   * Generate embedding for text
   * Uses mock implementation (hash-based) for consistency with process-document
   * TODO: Replace with actual embedding service integration when Supabase issue is resolved
   */
  static async generateEmbedding(
    text: string,
    dimensions: number = this.DEFAULT_DIMENSIONS
  ): Promise<number[]> {
    // Mock implementation - generates deterministic embeddings based on text hash
    // This matches the implementation in process-document for consistency
    
    // Simple hash-based deterministic embedding
    const hash = this.simpleHash(text);
    const embedding: number[] = [];
    
    for (let i = 0; i < dimensions; i++) {
      // Generate pseudo-random but deterministic values
      const seed = (hash + i) % 10000;
      const value = (Math.sin(seed) * 10000) % 1;
      embedding.push(value);
    }

    // Normalize the vector
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map((val) => val / magnitude);
  }

  /**
   * Simple hash function for deterministic embeddings
   */
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
