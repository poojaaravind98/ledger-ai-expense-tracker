import OpenAI from 'openai';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

export class EmbeddingService {
  private openai: OpenAI | null = null;
  private readonly dimensions = 256;

  constructor() {
    if (config.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    if (this.openai && config.openaiApiKey) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text.replace(/\n/g, ' '),
        });
        return response.data[0].embedding;
      } catch (error) {
        logger.warn('OpenAI embedding failed, falling back to local deterministic embedding:', error);
      }
    }

    return this.generateDeterministicEmbedding(text);
  }

  async getBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (this.openai && config.openaiApiKey) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: texts.map(t => t.replace(/\n/g, ' ')),
        });
        return response.data.map(d => d.embedding);
      } catch (error) {
        logger.warn('OpenAI batch embedding failed, using local embedding:', error);
      }
    }

    return texts.map(t => this.generateDeterministicEmbedding(t));
  }

  /**
   * Deterministic semantic hash embedding generator for zero-config offline environments.
   * Produces normalized N-dimensional vector based on n-grams and token frequencies.
   */
  private generateDeterministicEmbedding(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const words = clean.split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) {
      vector[0] = 1;
      return vector;
    }

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Unigram hash
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash << 5) - hash + word.charCodeAt(j);
        hash |= 0;
      }
      const idx = Math.abs(hash) % this.dimensions;
      vector[idx] += 1.0;

      // Bigram hash
      if (i < words.length - 1) {
        const bigram = word + '_' + words[i + 1];
        let biHash = 0;
        for (let j = 0; j < bigram.length; j++) {
          biHash = (biHash << 5) - biHash + bigram.charCodeAt(j);
          biHash |= 0;
        }
        const biIdx = Math.abs(biHash) % this.dimensions;
        vector[biIdx] += 0.5;
      }
    }

    // L2 Normalize
    let sumSq = 0;
    for (let i = 0; i < this.dimensions; i++) {
      sumSq += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSq) || 1;
    for (let i = 0; i < this.dimensions; i++) {
      vector[i] = vector[i] / norm;
    }

    return vector;
  }
}

export const embeddingService = new EmbeddingService();
