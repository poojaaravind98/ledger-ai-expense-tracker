import { formatReceiptForRag } from './documentLoader';
import { splitTextIntoChunks } from './chunker';
import { embeddingService } from '../embeddings/embeddingService';
import { vectorStore } from '../vectorstore/memoryVectorStore';
import { VectorDocument } from '../vectorstore/vectorStore';
import { logger } from '../../utils/logger';

export class RAGPipeline {
  async indexReceipt(
    userId: string,
    receipt: {
      id: string;
      filename: string;
      originalName: string;
      rawText?: string | null;
      parsedData?: string | null;
      totalAmount?: number | null;
      currency?: string | null;
      merchant?: string | null;
      invoiceDate?: Date | null;
    }
  ): Promise<number> {
    try {
      // Remove old chunks if any
      await vectorStore.deleteDocumentChunks(userId, receipt.id);

      const formatted = formatReceiptForRag(receipt);
      const textChunks = splitTextIntoChunks(formatted.text, { chunkSize: 350, chunkOverlap: 60 });

      if (textChunks.length === 0) {
        return 0;
      }

      const embeddings = await embeddingService.getBatchEmbeddings(textChunks);

      const vectorDocs: VectorDocument[] = textChunks.map((chunk, idx) => ({
        id: `${receipt.id}_chunk_${idx}`,
        userId,
        documentId: receipt.id,
        text: chunk,
        metadata: {
          ...formatted.metadata,
          chunkIndex: idx,
          totalChunks: textChunks.length,
        },
        embedding: embeddings[idx],
      }));

      await vectorStore.addDocuments(vectorDocs);
      logger.info(`Successfully indexed receipt ${receipt.id} with ${vectorDocs.length} vector chunks`);

      return vectorDocs.length;
    } catch (error) {
      logger.error(`Failed to index receipt ${receipt.id} into RAG:`, error);
      return 0;
    }
  }

  async removeReceiptIndex(userId: string, receiptId: string): Promise<void> {
    await vectorStore.deleteDocumentChunks(userId, receiptId);
  }
}

export const ragPipeline = new RAGPipeline();
