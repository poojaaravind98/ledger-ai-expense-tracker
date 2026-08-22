import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ReceiptDocument } from '../../types';
import { formatCurrency, formatDate, formatFileSize } from '../../utils/formatters';
import { Sparkles, Database, FileText } from 'lucide-react';

interface ReceiptDetailModalProps {
  receipt: ReceiptDocument | null;
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  isOpen,
  onClose,
  currency = 'USD',
}) => {
  if (!receipt) return null;

  let parsed: any = {};
  try {
    if (receipt.parsedData) {
      parsed = typeof receipt.parsedData === 'string' ? JSON.parse(receipt.parsedData) : receipt.parsedData;
    }
  } catch {}

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={receipt.merchant || 'Receipt Details'}
      description={`Original File: ${receipt.originalName} (${formatFileSize(receipt.fileSize)})`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* RAG status banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
          <Database className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            This document is vectorized in your personal RAG index. You can ask questions about it in the AI Assistant!
          </span>
        </div>

        {/* High-level metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase">Total Amount</span>
            <p className="text-base font-bold text-emerald-400 mt-0.5">
              {formatCurrency(receipt.totalAmount, currency)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase">Invoice Date</span>
            <p className="text-xs font-semibold text-white mt-0.5">
              {formatDate(receipt.invoiceDate || receipt.createdAt)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase">Category</span>
            <p className="text-xs font-semibold text-white mt-0.5">
              {parsed.category || 'Groceries & Food'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-[10px] text-gray-400 uppercase">Tax Amount</span>
            <p className="text-xs font-semibold text-white mt-0.5">
              {formatCurrency(parsed.taxAmount || 0, currency)}
            </p>
          </div>
        </div>

        {/* Itemized list */}
        {receipt.items && receipt.items.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Itemized Line Items ({receipt.items.length})
            </h4>
            <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden bg-gray-900/40">
              {receipt.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-white">{item.description}</p>
                    <p className="text-[10px] text-gray-500">
                      {item.quantity} x {formatCurrency(item.unitPrice, currency)}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(item.totalPrice, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw OCR snippet */}
        {receipt.rawText && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              OCR Text Excerpt
            </h4>
            <pre className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-[11px] font-mono text-gray-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
              {receipt.rawText}
            </pre>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
