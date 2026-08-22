import { IVectorStore, VectorDocument, SimilaritySearchResult } from './vectorStore';
import { cosineSimilarity } from '../embeddings/similarity';
import { logger } from '../../utils/logger';

export class MemoryVectorStore implements IVectorStore {
  private store: Map<string, VectorDocument> = new Map();

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    for (const doc of documents) {
      this.store.set(doc.id, doc);
    }
    logger.info(`Added ${documents.length} document chunks to vector store. Total chunks: ${this.store.size}`);
  }

  async similaritySearch(
    userId: string,
    queryEmbedding: number[],
    limit = 5,
    filter?: Partial<VectorDocument['metadata']>
  ): Promise<SimilaritySearchResult[]> {
    const results: SimilaritySearchResult[] = [];

    for (const doc of this.store.values()) {
      // Must belong to user
      if (doc.userId !== userId) {
        continue;
      }

      // Check metadata filters if specified
      if (filter) {
        let matches = true;
        for (const [key, value] of Object.entries(filter)) {
          if (doc.metadata[key] !== value) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
      }

      if (!doc.embedding || doc.embedding.length === 0) {
        continue;
      }

      const score = cosineSimilarity(queryEmbedding, doc.embedding);
      results.push({ document: doc, score });
    }

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  async deleteUserDocuments(userId: string): Promise<void> {
    for (const [id, doc] of this.store.entries()) {
      if (doc.userId === userId) {
        this.store.delete(id);
      }
    }
  }

  async deleteDocumentChunks(userId: string, documentId: string): Promise<void> {
    for (const [id, doc] of this.store.entries()) {
      if (doc.userId === userId && doc.documentId === documentId) {
        this.store.delete(id);
      }
    }
  }

  getSize(): number {
    return this.store.size;
  }
}

export const vectorStore = new MemoryVectorStore();
