// Embedding generator utility
// For now, this is a placeholder that generates mock embeddings
// In production, integrate with actual embedding service (OpenAI, Supabase, etc.)

export class EmbeddingGenerator {
  private static readonly DEFAULT_DIMENSIONS = 384; // gte-small dimensions

  /**
   * Generate embedding for text
   * TODO: Replace with actual embedding service integration
   */
  static async generateEmbedding(
    text: string,
    dimensions: number = this.DEFAULT_DIMENSIONS
  ): Promise<number[]> {
    // Mock implementation - generates deterministic embeddings based on text hash
    // In production, replace with actual API call to embedding service
    
    // Simple hash-based deterministic embedding for testing
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

  /**
   * Generate embeddings in batches
   */
  static async generateEmbeddingsBatch(
    texts: string[],
    dimensions: number = this.DEFAULT_DIMENSIONS
  ): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text, dimensions);
      embeddings.push(embedding);
    }
    
    return embeddings;
  }
}
