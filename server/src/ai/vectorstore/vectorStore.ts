export interface VectorDocument {
  id: string;
  userId: string;
  documentId: string;
  text: string;
  metadata: {
    filename?: string;
    merchant?: string;
    totalAmount?: number;
    currency?: string;
    invoiceDate?: string;
    category?: string;
    chunkIndex?: number;
    totalChunks?: number;
    [key: string]: unknown;
  };
  embedding?: number[];
}

export interface SimilaritySearchResult {
  document: VectorDocument;
  score: number;
}

export interface IVectorStore {
  addDocuments(documents: VectorDocument[]): Promise<void>;
  similaritySearch(
    userId: string,
    queryEmbedding: number[],
    limit?: number,
    filter?: Partial<VectorDocument['metadata']>
  ): Promise<SimilaritySearchResult[]>;
  deleteUserDocuments(userId: string): Promise<void>;
  deleteDocumentChunks(userId: string, documentId: string): Promise<void>;
}
