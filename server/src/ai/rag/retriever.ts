import { vectorStore } from '../vectorstore/memoryVectorStore';
import { embeddingService } from '../embeddings/embeddingService';
import { SimilaritySearchResult } from '../vectorstore/vectorStore';
import { logger } from '../../utils/logger';

export class RAGRetriever {
  async retrieveContext(
    userId: string,
    query: string,
    limit = 4
  ): Promise<{ contextText: string; sources: SimilaritySearchResult[] }> {
    try {
      const queryEmbedding = await embeddingService.getEmbedding(query);
      const results = await vectorStore.similaritySearch(userId, queryEmbedding, limit);

      if (results.length === 0) {
        return {
          contextText: 'No relevant uploaded receipts or financial documents found in the database.',
          sources: [],
        };
      }

      const contextChunks = results.map((res, index) => {
        return `[SOURCE ${index + 1}: ${res.document.metadata.merchant || res.document.metadata.filename || 'Document'} | Match Score: ${(res.score * 100).toFixed(1)}%]\n${res.document.text}`;
      });

      return {
        contextText: contextChunks.join('\n\n---\n\n'),
        sources: results,
      };
    } catch (error) {
      logger.error('Error during RAG retrieval:', error);
      return {
        contextText: '',
        sources: [],
      };
    }
  }
}

export const ragRetriever = new RAGRetriever();
