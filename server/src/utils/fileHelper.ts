import fs from 'fs';
import pdfParse from 'pdf-parse';
import { logger } from './logger';

export const extractTextFromFile = async (filePath: string, mimeType: string): Promise<string> => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text.trim();
    }

    if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'text/csv') {
      return fs.readFileSync(filePath, 'utf-8').trim();
    }

    // For images, we provide basic filename/metadata text or OCR text fallback
    return `Receipt/Document file: ${filePath}`;
  } catch (error) {
    logger.error('Failed to extract text from file:', error);
    return '';
  }
};
