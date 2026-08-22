import React from 'react';
import { FileText, Calendar, DollarSign, Trash2, Eye, Sparkles } from 'lucide-react';
import { ReceiptDocument } from '../../types';
import { formatCurrency, formatDate, formatFileSize } from '../../utils/formatters';

interface ReceiptCardProps {
  receipt: ReceiptDocument;
  onView: (receipt: ReceiptDocument) => void;
  onDelete: (id: string) => void;
  currency?: string;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  onView,
  onDelete,
  currency = 'USD',
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md hover:border-indigo-500/40 transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors truncate max-w-[180px]">
                {receipt.merchant || receipt.originalName}
              </h4>
              <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{receipt.originalName}</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Sparkles className="w-2.5 h-2.5" />
            RAG Indexed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-gray-900/50 rounded-xl border border-gray-800/60 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Amount
            </span>
            <p className="font-bold text-white mt-0.5">
              {formatCurrency(receipt.totalAmount || 0, currency)}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date
            </span>
            <p className="text-gray-300 mt-0.5">{formatDate(receipt.invoiceDate || receipt.createdAt)}</p>
          </div>
        </div>

        {receipt.items && receipt.items.length > 0 && (
          <p className="text-[11px] text-indigo-400/90 font-medium mb-3">
            {receipt.items.length} itemized item{receipt.items.length > 1 ? 's' : ''} extracted
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-800/60 text-xs text-gray-400">
        <span className="text-[10px]">{formatFileSize(receipt.fileSize)}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(receipt)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-indigo-600 hover:text-white text-gray-300 text-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete receipt "${receipt.originalName}"?`)) {
                onDelete(receipt.id);
              }
            }}
            className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
            title="Delete receipt"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
