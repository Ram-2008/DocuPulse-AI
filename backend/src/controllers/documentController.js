import path from 'path';
import fs from 'fs';
import db from '../db/index.js';
import { logger } from '../utils/logger.js';
import { extractRawTextFromFile } from '../services/extractorService.js';
import { processDocumentWithGemini, queryDocumentKnowledge } from '../services/geminiService.js';
import { validateExtractedData } from '../services/ruleValidationService.js';

/**
 * Upload and run end-to-end IDP pipeline
 */
export const uploadAndProcess = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No document file uploaded. Please provide a file under field "document".',
      });
    }

    const file = req.file;
    const userId = req.user ? req.user.id : 'anonymous';
    const originalFilename = file.originalname;
    const title = req.body.title || originalFilename.replace(/\.[^/.]+$/, '');
    const mimeType = file.mimetype;
    const fileSize = file.size;
    const filePath = file.path;

    // 1. Create document record
    const document = await db.documents.create({
      data: {
        userId,
        title,
        originalFilename,
        mimeType,
        fileSize,
        filePath,
        status: 'PROCESSING',
      },
    });

    await db.auditLogs.create({
      data: {
        documentId: document.id,
        action: 'UPLOAD',
        details: `Uploaded ${originalFilename} (${(fileSize / 1024).toFixed(1)} KB)`,
        performedBy: req.user ? req.user.email : 'SYSTEM',
      },
    });

    // 2. Extract text
    const rawText = await extractRawTextFromFile(filePath, mimeType);

    // 3. Process with AI (Gemini Multimodal / Heuristic fallback)
    const aiResult = await processDocumentWithGemini({
      filePath,
      mimeType,
      originalFilename,
      rawTextHint: rawText,
    });

    // 4. Run rule validation engine
    const validationResult = validateExtractedData(
      aiResult.documentType,
      aiResult.extractedData,
      aiResult.confidenceScore
    );

    // 5. Determine final status
    let finalStatus = 'COMPLETED';
    if (validationResult.validationStatus === 'INVALID') {
      finalStatus = 'REVIEW_REQUIRED';
    } else if (aiResult.confidenceScore < 0.75) {
      finalStatus = 'REVIEW_REQUIRED';
    }

    // 6. Update document
    const updatedDoc = await db.documents.update({
      where: { id: document.id },
      data: {
        status: finalStatus,
        documentType: aiResult.documentType,
        confidenceScore: aiResult.confidenceScore,
        summary: aiResult.summary,
        rawText: rawText || '',
        extractedData: aiResult.extractedData,
        validationFlags: validationResult.flags,
        validationStatus: validationResult.validationStatus,
        processingTimeMs: aiResult.processingTimeMs,
      },
    });

    // 7. Audit logs
    await db.auditLogs.create({
      data: {
        documentId: document.id,
        action: 'CLASSIFY_AND_EXTRACT',
        details: `Classified as ${aiResult.documentType} with confidence ${(aiResult.confidenceScore * 100).toFixed(1)}% via ${aiResult.provider}`,
        performedBy: 'GEMINI_AI',
      },
    });

    if (validationResult.flags.length > 0) {
      await db.auditLogs.create({
        data: {
          documentId: document.id,
          action: 'VALIDATE_RULES',
          details: `Validation status: ${validationResult.validationStatus}. ${validationResult.flags.length} rule flags recorded.`,
          performedBy: 'RULE_ENGINE',
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed successfully',
      document: updatedDoc,
    });
  } catch (error) {
    logger.error('Document upload and processing error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to process document: ' + error.message,
    });
  }
};

/**
 * Get all documents for current user
 */
export const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, documentType, search, sort = 'desc' } = req.query;

    const where = { userId };
    if (status && status !== 'ALL') where.status = status;
    if (documentType && documentType !== 'ALL') where.documentType = documentType;
    if (search) where.search = search;

    const documents = await db.documents.findMany({
      where,
      orderBy: { createdAt: sort },
    });

    return res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    logger.error('Failed to get documents', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve documents',
    });
  }
};

/**
 * Get document by ID with audit logs & chats
 */
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await db.documents.findUnique({ where: { id } });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Check user ownership or allow admin
    if (document.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this document',
      });
    }

    return res.json({
      success: true,
      document,
    });
  } catch (error) {
    logger.error('Failed to get document by ID', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve document',
    });
  }
};

/**
 * Human-in-the-loop review & edit
 */
export const updateExtractedData = async (req, res) => {
  try {
    const { id } = req.params;
    const { extractedData, markAsApproved } = req.body;

    const document = await db.documents.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    if (document.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this document',
      });
    }

    // Re-run validation rules on modified data
    const validationResult = validateExtractedData(
      document.documentType,
      extractedData,
      document.confidenceScore
    );

    let newStatus = document.status;
    if (markAsApproved || validationResult.validationStatus === 'VALID') {
      newStatus = 'COMPLETED';
    } else if (validationResult.validationStatus === 'INVALID') {
      newStatus = 'REVIEW_REQUIRED';
    }

    const updated = await db.documents.update({
      where: { id },
      data: {
        extractedData,
        validationFlags: validationResult.flags,
        validationStatus: validationResult.validationStatus,
        status: newStatus,
      },
    });

    await db.auditLogs.create({
      data: {
        documentId: id,
        action: 'HUMAN_EDIT',
        details: `Extracted fields edited and verified by ${req.user.name} (${req.user.email}). Status: ${newStatus}`,
        performedBy: req.user.email,
      },
    });

    return res.json({
      success: true,
      message: 'Document data updated and re-validated successfully',
      document: updated,
    });
  } catch (error) {
    logger.error('Failed to update document data', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to update document data',
    });
  }
};

/**
 * Interactive Knowledge Chat / Q&A with document
 */
export const chatWithDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message question cannot be empty',
      });
    }

    const document = await db.documents.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Fetch previous chats for context
    const previousChats = await db.chats.findMany({ where: { documentId: id } });

    // Save user message
    await db.chats.create({
      data: {
        userId: req.user.id,
        documentId: id,
        role: 'user',
        message,
      },
    });

    // Query Gemini Knowledge Engine
    const { answer, sources } = await queryDocumentKnowledge({
      question: message,
      documentContext: {
        title: document.title,
        documentType: document.documentType,
        summary: document.summary,
        extractedData: document.extractedData,
        validationFlags: document.validationFlags,
      },
      chatHistory: previousChats,
    });

    // Save AI response
    const assistantChat = await db.chats.create({
      data: {
        userId: req.user.id,
        documentId: id,
        role: 'assistant',
        message: answer,
        sources: sources ? JSON.stringify(sources) : null,
      },
    });

    return res.json({
      success: true,
      chat: assistantChat,
    });
  } catch (error) {
    logger.error('Failed chat with document', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to process document question: ' + error.message,
    });
  }
};

/**
 * Export document data to JSON or CSV
 */
export const exportDocumentData = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;

    const document = await db.documents.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    await db.auditLogs.create({
      data: {
        documentId: id,
        action: 'EXPORT',
        details: `Exported document data as ${format.toUpperCase()}`,
        performedBy: req.user.email,
      },
    });

    if (format === 'csv') {
      const fields = document.extractedData?.fields || {};
      let csvContent = 'Field,Value\n';
      for (const [key, val] of Object.entries(fields)) {
        const cleanVal = String(val).replace(/"/g, '""');
        csvContent += `"${key}","${cleanVal}"\n`;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_extracted.csv"`
      );
      return res.send(csvContent);
    }

    return res.json({
      success: true,
      documentId: document.id,
      title: document.title,
      documentType: document.documentType,
      confidenceScore: document.confidenceScore,
      summary: document.summary,
      extractedData: document.extractedData,
      validationFlags: document.validationFlags,
      validationStatus: document.validationStatus,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Export document failed', { error: error.message });
    return res.status(500).json({ success: false, error: 'Export failed' });
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await db.documents.findUnique({ where: { id } });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    if (document.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this document' });
    }

    // Try deleting physical file
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (err) {
        logger.warn('Could not remove physical file', { path: document.filePath, err: err.message });
      }
    }

    await db.documents.delete({ where: { id } });

    logger.info('Document deleted', { id, title: document.title });

    return res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('Delete document failed', { error: error.message });
    return res.status(500).json({ success: false, error: 'Delete failed' });
  }
};
