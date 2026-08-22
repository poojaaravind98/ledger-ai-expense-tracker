import React, { useEffect, useState } from 'react';
import { receiptService } from '../services/receiptService';
import { ReceiptDocument } from '../types';
import { ReceiptCard } from '../components/receipts/ReceiptCard';
import { ReceiptUploadModal } from '../components/receipts/ReceiptUploadModal';
import { ReceiptDetailModal } from '../components/receipts/ReceiptDetailModal';
import { Button } from '../components/common/Button';
import { UploadCloud, Sparkles, Database, FileText } from 'lucide-react';
import { Skeleton } from '../components/common/LoadingSkeleton';

export const ReceiptsPage: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDocument | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const data = await receiptService.getReceipts();
      setReceipts(data);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await receiptService.deleteReceipt(id);
      setReceipts((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete receipt:', err);
    }
  };

  const handleView = (receipt: ReceiptDocument) => {
    setSelectedReceipt(receipt);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Receipts & RAG Knowledge Vault</h2>
          <p className="text-xs text-gray-400 mt-1">
            Uploaded receipts & statements auto-parsed and indexed into personal vector database
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setIsUploadOpen(true)}
          leftIcon={<UploadCloud className="w-4 h-4" />}
        >
          Upload Receipt / Invoice
        </Button>
      </div>

      {/* RAG Information Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Personalized Financial RAG Index
            </h4>
            <p className="text-xs text-gray-300 mt-0.5">
              {receipts.length} document{receipts.length === 1 ? '' : 's'} vectorized. Ask the AI Assistant anything about your line items, warranties, or vendor amounts.
            </p>
          </div>
        </div>
      </div>

      {/* Receipts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#111827]/80 border border-gray-800 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      ) : receipts.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#111827]/60 border border-gray-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Receipts Uploaded Yet</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Upload PDF or image receipts. Our AI OCR parser will automatically extract prices, vendors, dates, and vectorize the content for semantic RAG search.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsUploadOpen(true)}>
            Upload First Receipt
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {receipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ReceiptUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchReceipts}
      />

      <ReceiptDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};
