import { ParsedReceiptData } from '../../types';

export interface FormattedDocument {
  text: string;
  metadata: Record<string, unknown>;
}

export const formatReceiptForRag = (
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
): FormattedDocument => {
  let parsed: Partial<ParsedReceiptData> = {};
  if (receipt.parsedData) {
    try {
      parsed = JSON.parse(receipt.parsedData);
    } catch {
      parsed = {};
    }
  }

  const itemsList = parsed.items && parsed.items.length > 0
    ? parsed.items.map(it => `- ${it.description}: ${it.quantity} x $${it.unitPrice.toFixed(2)} = $${it.totalPrice.toFixed(2)} [${it.category || 'General'}]`).join('\n')
    : 'No itemized line items recorded.';

  const formattedText = `
DOCUMENT TYPE: Receipt / Financial Invoice
DOCUMENT ID: ${receipt.id}
FILE NAME: ${receipt.originalName}
MERCHANT / VENDOR: ${receipt.merchant || parsed.merchant || 'Unknown Vendor'}
DATE: ${receipt.invoiceDate ? receipt.invoiceDate.toISOString().split('T')[0] : (parsed.date || 'Unknown Date')}
TOTAL AMOUNT: ${receipt.currency || 'USD'} $${(receipt.totalAmount || parsed.totalAmount || 0).toFixed(2)}
CATEGORY: ${parsed.category || 'Miscellaneous'}
TAX AMOUNT: $${(parsed.taxAmount || 0).toFixed(2)}
PAYMENT METHOD: ${parsed.paymentMethod || 'Credit Card'}

ITEMIZED BREAKDOWN:
${itemsList}

RAW OCR EXCERPT:
${receipt.rawText ? receipt.rawText.substring(0, 1000) : 'N/A'}
`.trim();

  return {
    text: formattedText,
    metadata: {
      documentId: receipt.id,
      filename: receipt.originalName,
      merchant: receipt.merchant || parsed.merchant || 'Unknown Vendor',
      totalAmount: receipt.totalAmount || parsed.totalAmount || 0,
      currency: receipt.currency || 'USD',
      invoiceDate: receipt.invoiceDate ? receipt.invoiceDate.toISOString().split('T')[0] : parsed.date,
      category: parsed.category || 'Miscellaneous',
    },
  };
};
