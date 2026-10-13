import express from 'express';
import {
  uploadAndProcess,
  getDocuments,
  getDocumentById,
  updateExtractedData,
  chatWithDocument,
  exportDocumentData,
  deleteDocument,
} from '../controllers/documentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All document routes require authentication
router.use(authenticateToken);

router.post('/upload', uploadSingle, uploadAndProcess);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateExtractedData);
router.post('/:id/chat', chatWithDocument);
router.get('/:id/export', exportDocumentData);
router.delete('/:id', deleteDocument);

export default router;
