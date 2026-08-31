import { getLLMProvider } from './llm/factory';
import { RECEIPT_PARSER_SYSTEM_PROMPT } from './prompts/systemPrompts';
import { buildReceiptExtractionPrompt } from './prompts/receiptPrompts';
import { ParsedReceiptData } from '../types';
import { logger } from '../utils/logger';

export class ReceiptParser {
  async parseReceiptText(
    rawText: string,
    filename: string
  ): Promise<ParsedReceiptData> {
    const text = rawText || '';
    const lower = `${filename} ${text}`.toLowerCase();

    // Reject obvious CV/resume and other non-receipt documents first.
    if (this.isClearlyNonReceipt(lower)) {
      logger.info(`Rejected non-receipt document: ${filename}`);
      return this.invalidDocument(
        'The uploaded document is not a valid receipt or invoice.'
      );
    }

    const llm = getLLMProvider();
    const prompt = buildReceiptExtractionPrompt(text, filename);

    try {
      const response = await llm.generateCompletion(
        prompt,
        RECEIPT_PARSER_SYSTEM_PROMPT,
        {
          jsonMode: true,
          temperature: 0.1,
        }
      );

      const cleanJson = this.sanitizeJsonString(response);
      const parsed = JSON.parse(cleanJson);

      // Model explicitly rejected the document.
      if (parsed.isValidReceipt === false) {
        return this.invalidDocument(
          parsed.summary || 'The uploaded document is not a valid receipt or invoice.'
        );
      }

      const merchant =
        typeof parsed.merchant === 'string'
          ? parsed.merchant.trim()
          : '';

      const totalAmount =
        typeof parsed.totalAmount === 'number'
          ? parsed.totalAmount
          : parseFloat(parsed.totalAmount as any) || 0;

      // Require explicit receipt classification from the LLM.
      if (parsed.isValidReceipt !== true) {
        return this.invalidDocument(
          'The document could not be verified as a receipt or invoice.'
        );
      }

      // Never accept an invalid merchant or non-positive total.
      if (!merchant || totalAmount <= 0) {
        return this.invalidDocument(
          'Receipt is missing a valid merchant or purchase total.'
        );
      }

      return {
        isValidReceipt: true,
        merchant,
        date:
          typeof parsed.date === 'string'
            ? parsed.date
            : new Date().toISOString().split('T')[0],
        totalAmount,
        currency: parsed.currency || 'USD',
        category: parsed.category || 'Miscellaneous',
        taxAmount:
          typeof parsed.taxAmount === 'number'
            ? parsed.taxAmount
            : 0,
        paymentMethod: parsed.paymentMethod || 'OTHER',
        items: Array.isArray(parsed.items) ? parsed.items : [],
        summary:
          parsed.summary || `Purchase at ${merchant}`,
      };
    } catch (error) {
      logger.error(
        'LLM receipt parsing failed. Using safe fallback parser:',
        error
      );

      return this.fallbackParse(text, filename);
    }
  }

  private sanitizeJsonString(raw: string): string {
    let clean = raw.trim();

    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '');
    }

    return clean.trim();
  }

  private isClearlyNonReceipt(text: string): boolean {
    const nonReceiptSignals = [
      'curriculum vitae',
      'curriculum-vitae',
      'resume',
      'résumé',
      'cover letter',
      'professional summary',
      'work experience',
      'professional experience',
      'technical skills',
      'education',
      'certifications',
      'career objective',
      'employment history',
      'career profile',
      'references',
      'projects',
    ];

    const receiptSignals = [
      'receipt',
      'invoice',
      'subtotal',
      'amount due',
      'unit price',
      'quantity',
      'order number',
      'invoice number',
      'grand total',
      'payment method',
    ];

    const nonReceiptScore = nonReceiptSignals.filter((signal) =>
      text.includes(signal)
    ).length;

    const receiptScore = receiptSignals.filter((signal) =>
      text.includes(signal)
    ).length;

    // Explicit filename protection.
    const suspiciousFilename =
      /(^|[-_\s])(cv|resume|curriculum)([-_\s.]|$)/i.test(text);

    return (
      suspiciousFilename ||
      (nonReceiptScore >= 2 && receiptScore < 2)
    );
  }

  private fallbackParse(
    text: string,
    filename: string
  ): ParsedReceiptData {
    const lower = `${text} ${filename}`.toLowerCase();

    // Never use fallback receipt extraction for obvious non-receipts.
    if (this.isClearlyNonReceipt(lower)) {
      return this.invalidDocument(
        'The uploaded document is not a valid receipt or invoice.'
      );
    }

    // Require genuine receipt evidence.
    const hasReceiptKeyword =
      lower.includes('receipt') ||
      lower.includes('invoice') ||
      lower.includes('subtotal') ||
      lower.includes('amount due') ||
      lower.includes('grand total') ||
      lower.includes('invoice number');

    if (!hasReceiptKeyword) {
      return this.invalidDocument(
        'Could not verify that the uploaded document is a receipt or invoice.'
      );
    }

    let merchant = '';
    let category = 'Miscellaneous';

    if (
      lower.includes('whole foods') ||
      lower.includes('trader joe')
    ) {
      merchant = lower.includes('trader joe')
        ? "Trader Joe's"
        : 'Whole Foods Market';
      category = 'Groceries & Food';
    } else if (
      lower.includes('starbucks') ||
      lower.includes('restaurant') ||
      lower.includes('cafe')
    ) {
      merchant = lower.includes('starbucks')
        ? 'Starbucks'
        : 'Local Restaurant';
      category = 'Dining & Restaurants';
    } else if (
      lower.includes('uber') ||
      lower.includes('lyft')
    ) {
      merchant = lower.includes('uber') ? 'Uber' : 'Lyft';
      category = 'Transportation';
    } else if (
      lower.includes('apple') ||
      lower.includes('best buy') ||
      lower.includes('amazon') ||
      lower.includes('walmart')
    ) {
      merchant = lower.includes('apple')
        ? 'Apple Store'
        : lower.includes('best buy')
          ? 'Best Buy'
          : lower.includes('amazon')
            ? 'Amazon'
            : 'Walmart';

      category = 'Shopping & Retail';
    }

    const matchAmount =
      text.match(
        /(?:grand total|amount due|total)[:\s]*\$?\s*(\d+(?:\.\d{2})?)/i
      ) ||
      text.match(
        /\$\s*(\d+(?:\.\d{2})?)/
      );

    const total = matchAmount
      ? parseFloat(matchAmount[1])
      : 0;

    // No merchant or real amount means INVALID.
    if (!merchant || total <= 0) {
      return this.invalidDocument(
        'Could not verify a valid merchant and purchase total.'
      );
    }

    return {
      isValidReceipt: true,
      merchant,
      date: new Date().toISOString().split('T')[0],
      totalAmount: total,
      currency: 'USD',
      category,
      taxAmount: 0,
      paymentMethod: 'OTHER',
      items: [
        {
          description: `General purchase at ${merchant}`,
          quantity: 1,
          unitPrice: total,
          totalPrice: total,
          category,
        },
      ],
      summary: `Receipt uploaded from ${filename}`,
    };
  }

  private invalidDocument(message: string): ParsedReceiptData {
    return {
      isValidReceipt: false,
      merchant: '',
      date: '',
      totalAmount: 0,
      currency: 'USD',
      category: 'Miscellaneous',
      taxAmount: 0,
      paymentMethod: 'OTHER',
      items: [],
      summary: message,
    };
  }
}

export const receiptParser = new ReceiptParser();