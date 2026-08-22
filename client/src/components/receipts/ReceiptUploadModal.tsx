import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Dropzone } from '../common/Dropzone';
import { Button } from '../common/Button';
import { receiptService } from '../../services/receiptService';
import { Sparkles, CheckCircle, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReceiptUploadModal: React.FC<ReceiptUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [autoCreateExpense, setAutoCreateExpense] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const data = await receiptService.uploadReceipt(file, autoCreateExpense);
      setResult(data);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch {}
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to process receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Receipt / Statement"
      description="Extract financial line items using AI OCR and index into your RAG vector store."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {result ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white">Receipt Parsed & Indexed Successfully!</h4>
                <p className="text-xs text-emerald-400/80">
                  Data extracted and vector chunks indexed into RAG document store.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/60 rounded-xl border border-gray-800 text-xs">
              <div>
                <span className="text-gray-500">Merchant:</span>
                <p className="font-semibold text-white mt-0.5">{result.parsedData?.merchant || 'Vendor'}</p>
              </div>
              <div>
                <span className="text-gray-500">Extracted Total:</span>
                <p className="font-semibold text-emerald-400 mt-0.5">
                  ${result.parsedData?.totalAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="text-gray-300 mt-0.5">{result.parsedData?.date || 'Today'}</p>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <p className="text-gray-300 mt-0.5">{result.parsedData?.category || 'General'}</p>
              </div>
            </div>

            {result.parsedData?.items && result.parsedData.items.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-2">Itemized Items ({result.parsedData.items.length}):</p>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {result.parsedData.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-gray-900/40 rounded-lg">
                      <span className="text-gray-300 truncate max-w-[200px]">{item.description}</span>
                      <span className="font-mono text-white">${item.totalPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            <Dropzone
              onFileSelect={(f) => setFile(f)}
              isLoading={isProcessing}
            />

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs text-gray-300">Automatically create linked expense transaction</span>
              </div>
              <input
                type="checkbox"
                checked={autoCreateExpense}
                onChange={(e) => setAutoCreateExpense(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <Button variant="ghost" size="md" onClick={handleClose} disabled={isProcessing}>
                Cancel
              </Button>
              <Button
                variant="glow"
                size="md"
                onClick={handleUpload}
                disabled={!file || isProcessing}
                isLoading={isProcessing}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {isProcessing ? 'Extracting & Indexing...' : 'Parse with AI & Index'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
