import fs from 'fs';
import { prisma } from '../config/prisma';
import { extractTextFromFile } from '../utils/fileHelper';
import { receiptParser } from '../ai/receipt-parser';
import { ragPipeline } from '../ai/rag/ragPipeline';
import { logger } from '../utils/logger';

export class ReceiptService {
  async processAndSaveReceipt(
    userId: string,
    file: Express.Multer.File,
    autoCreateExpense = true
  ) {
    logger.info(`Processing uploaded receipt: ${file.originalname} for user: ${userId}`);

    // 1. Extract text from file
    let rawText = '';
    try {
      rawText = await extractTextFromFile(file.path, file.mimetype);
    } catch (err) {
      logger.warn('Text extraction error, continuing with metadata text:', err);
      rawText = `Receipt: ${file.originalname}`;
    }

    // 2. Parse structured data using AI receipt parser
    const parsedData = await receiptParser.parseReceiptText(rawText || file.originalname, file.originalname);

    // 3. Save Receipt Document in Database
    const invoiceDate = parsedData.date ? new Date(parsedData.date) : new Date();

    const isValid = !!(parsedData.totalAmount && parsedData.merchant);
    const receiptStatus = isValid ? 'PROCESSED' : 'FAILED';
    const errorMsg = isValid ? undefined : 'Parsing failed: missing total amount or merchant';
    const receipt = await prisma.receiptDocument.create({
      data: {
        userId,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        rawText: rawText || JSON.stringify(parsedData),
        status: receiptStatus,
        errorMessage: errorMsg,
        parsedData: JSON.stringify(parsedData),
        totalAmount: parsedData.totalAmount,
        currency: parsedData.currency || 'USD',
        merchant: parsedData.merchant,
        invoiceDate,
      },
    });

    // 4. Save itemized line items **only for valid receipts**
    let createdExpense = null;
    if (isValid) {
      if (parsedData.items && parsedData.items.length > 0) {
        await prisma.receiptItem.createMany({
          data: parsedData.items.map(item => ({
            receiptId: receipt.id,
            description: item.description || 'Item',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            category: item.category || parsedData.category || 'Miscellaneous',
          })),
        });
      }

      // 5. Ingest into RAG Vector Store
      try {
        const indexedChunks = await ragPipeline.indexReceipt(userId, receipt);
        logger.info(`Receipt ${receipt.id} indexed into RAG with ${indexedChunks} chunks.`);
      } catch (ragErr) {
        logger.error('Failed to index receipt into RAG pipeline:', ragErr);
      }

      // 6. Optionally auto‑create expense record linked to this receipt
      if (autoCreateExpense && parsedData.totalAmount > 0) {
        // Find or match category
        let category = await prisma.category.findFirst({
          where: {
            name: { contains: parsedData.category },
            OR: [{ userId }, { userId: null }],
          },
        });
        if (!category) {
          category = await prisma.category.findFirst({
            where: { OR: [{ userId }, { userId: null }] },
          });
        }
        if (category) {
          createdExpense = await prisma.expense.create({
            data: {
              userId,
              categoryId: category.id,
              title: `${parsedData.merchant || 'Receipt'} Purchase`,
              merchant: parsedData.merchant,
              amount: parsedData.totalAmount,
              currency: parsedData.currency || 'USD',
              date: invoiceDate,
              paymentMethod: parsedData.paymentMethod || 'CREDIT_CARD',
              receiptId: receipt.id,
              notes: `Auto‑extracted from ${file.originalname}. ${parsedData.summary || ''}`,
            },
            include: { category: true },
          });
        }
      }
    }

    const fullReceipt = await prisma.receiptDocument.findUnique({
      where: { id: receipt.id },
      include: {
        items: true,
        expenses: { include: { category: true } },
      },
    });

    return {
      receipt: fullReceipt,
      parsedData,
      createdExpense,
    };
  }

  async getReceipts(userId: string) {
    return prisma.receiptDocument.findMany({
      where: { userId },
      include: {
        items: true,
        expenses: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReceiptById(userId: string, id: string) {
    const receipt = await prisma.receiptDocument.findFirst({
      where: { id, userId },
      include: {
        items: true,
        expenses: {
          include: { category: true },
        },
      },
    });

    if (!receipt) {
      throw new Error('Receipt not found');
    }

    return receipt;
  }

  async setInvalidReceipt(userId: string, receiptId: string, message?: string) {
    const receipt = await this.getReceiptById(userId, receiptId);
    return prisma.receiptDocument.update({
      where: { id: receipt.id },
      data: {
        status: 'FAILED',
        errorMessage: message ?? 'User marked as invalid',
      },
    });
  }
  async deleteReceipt(userId: string, id: string) {
    const receipt = await this.getReceiptById(userId, id);

    // Remove from vectorstore
    await ragPipeline.removeReceiptIndex(userId, id);

    // Delete file from disk if exists
    if (receipt.filePath && fs.existsSync(receipt.filePath)) {
      try {
        fs.unlinkSync(receipt.filePath);
      } catch (err) {
        logger.warn('Failed to delete receipt file from disk:', err);
      }
    }

    return prisma.receiptDocument.delete({
      where: { id },
    });
  }
}



export const receiptService = new ReceiptService();
