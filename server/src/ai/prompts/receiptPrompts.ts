export const buildReceiptExtractionPrompt = (rawText: string, filename: string): string => {
  return `
TASK: PARSE_RECEIPT
Extract structured financial data from the following receipt / statement text:

FILENAME: ${filename}
CONTENT:
"""
${rawText}
"""

Return a strictly valid JSON object with the following fields:
{
  "merchant": "Merchant or store name (e.g. Whole Foods Market)",
  "date": "YYYY-MM-DD format (if not detected, today's date)",
  "totalAmount": 0.00 (number, total amount paid),
  "currency": "USD" (or EUR, GBP, etc.),
  "category": "Suggested Category (e.g. Groceries & Food, Dining & Restaurants, Housing & Rent, Transportation, Utilities & Bills, Shopping & Retail, Subscriptions & Software, Miscellaneous)",
  "taxAmount": 0.00 (number, sales tax if found, otherwise 0),
  "paymentMethod": "CREDIT_CARD" (or CASH, DEBIT_CARD, BANK_TRANSFER, OTHER),
  "items": [
    {
      "description": "Item name",
      "quantity": 1,
      "unitPrice": 0.00,
      "totalPrice": 0.00,
      "category": "Item Category"
    }
  ],
  "summary": "Brief 1-sentence summary of the receipt purchase"
}
`.trim();
};
