import { apiClient } from '../api/axiosInstance';
import { ReceiptDocument, ParsedReceiptData, Expense } from '../types';

export interface UploadReceiptResponse {
  receipt: ReceiptDocument;
  parsedData: ParsedReceiptData;
  createdExpense?: Expense | null;
}

export const receiptService = {
  async uploadReceipt(file: File, autoCreateExpense = true): Promise<UploadReceiptResponse> {
    const formData = new FormData();
    formData.append('receipt', file);
    formData.append('autoCreateExpense', String(autoCreateExpense));

    const res = await apiClient.post('/receipts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data.data;
  },

  async getReceipts(): Promise<ReceiptDocument[]> {
    const res = await apiClient.get('/receipts');
    return res.data.data;
  },

  async getReceiptById(id: string): Promise<ReceiptDocument> {
    const res = await apiClient.get(`/receipts/${id}`);
    return res.data.data;
  },

  async deleteReceipt(id: string): Promise<{ id: string }> {
    const res = await apiClient.delete(`/receipts/${id}`);
    return res.data.data;
  },
};
