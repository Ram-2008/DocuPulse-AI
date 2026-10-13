import fs from 'fs';
import { logger } from '../utils/logger.js';

let pdfParseModule = null;
try {
  // Dynamic import or require for pdf-parse
  const mod = await import('pdf-parse');
  pdfParseModule = mod.default || mod;
} catch (e) {
  logger.warn('pdf-parse not loaded as ES module, attempting fallback', { error: e.message });
}

export const extractRawTextFromFile = async (filePath, mimeType) => {
  try {
    if (!fs.existsSync(filePath)) {
      return '';
    }

    if (mimeType === 'text/plain' || mimeType === 'text/csv' || mimeType === 'application/json') {
      return fs.readFileSync(filePath, 'utf-8');
    }

    if (mimeType === 'application/pdf') {
      if (pdfParseModule) {
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParseModule(dataBuffer);
          return pdfData.text || '';
        } catch (pdfErr) {
          logger.warn('PDF parse encountered error, passing file directly to multimodal Gemini', {
            error: pdfErr.message,
          });
        }
      }
    }

    // For images, raw text is extracted multimodally by Gemini
    return '';
  } catch (error) {
    logger.error('Failed to extract raw text from file', { error: error.message, filePath });
    return '';
  }
};
