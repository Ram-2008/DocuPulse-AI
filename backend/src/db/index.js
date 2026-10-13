import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'docupulse.db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB Schema
const defaultData = {
  users: [],
  documents: [],
  auditLogs: [],
  chats: [],
};

// In-memory cache + file sync
let dbData = { ...defaultData };

const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(raw);
      // Ensure all collections exist
      dbData.users = dbData.users || [];
      dbData.documents = dbData.documents || [];
      dbData.auditLogs = dbData.auditLogs || [];
      dbData.chats = dbData.chats || [];
    } else {
      saveDatabase();
    }
  } catch (error) {
    logger.error('Failed to read database file, initializing default', { error: error.message });
    dbData = { ...defaultData };
    saveDatabase();
  }
};

const saveDatabase = () => {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbData, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    logger.error('Failed to write database file', { error: error.message });
  }
};

// Initial load
loadDatabase();

export const db = {
  users: {
    findUnique: async ({ where }) => {
      loadDatabase();
      if (where.id) return dbData.users.find((u) => u.id === where.id) || null;
      if (where.email) return dbData.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
      return null;
    },
    findById: async (id) => {
      loadDatabase();
      return dbData.users.find((u) => u.id === id) || null;
    },
    create: async ({ data }) => {
      loadDatabase();
      const user = {
        id: data.id || uuidv4(),
        email: data.email.toLowerCase(),
        password: data.password,
        name: data.name,
        role: data.role || 'analyst',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbData.users.push(user);
      saveDatabase();
      return user;
    },
    findMany: async () => {
      loadDatabase();
      return [...dbData.users];
    },
  },

  documents: {
    findUnique: async ({ where }) => {
      loadDatabase();
      const doc = dbData.documents.find((d) => d.id === where.id);
      if (!doc) return null;
      // Attach related audit logs and chats
      const auditLogs = dbData.auditLogs
        .filter((a) => a.documentId === doc.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const chats = dbData.chats
        .filter((c) => c.documentId === doc.id)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return { ...doc, auditLogs, chats };
    },
    findMany: async ({ where = {}, orderBy = { createdAt: 'desc' } } = {}) => {
      loadDatabase();
      let docs = [...dbData.documents];

      if (where.userId) {
        docs = docs.filter((d) => d.userId === where.userId);
      }
      if (where.status) {
        docs = docs.filter((d) => d.status === where.status);
      }
      if (where.documentType) {
        docs = docs.filter((d) => d.documentType === where.documentType);
      }
      if (where.search) {
        const query = where.search.toLowerCase();
        docs = docs.filter(
          (d) =>
            d.title.toLowerCase().includes(query) ||
            d.originalFilename.toLowerCase().includes(query) ||
            (d.summary && d.summary.toLowerCase().includes(query))
        );
      }

      if (orderBy.createdAt === 'desc') {
        docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (orderBy.createdAt === 'asc') {
        docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      return docs;
    },
    create: async ({ data }) => {
      loadDatabase();
      const doc = {
        id: data.id || uuidv4(),
        userId: data.userId,
        title: data.title,
        originalFilename: data.originalFilename,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        filePath: data.filePath,
        status: data.status || 'PENDING',
        documentType: data.documentType || 'UNKNOWN',
        confidenceScore: data.confidenceScore || 0.0,
        summary: data.summary || '',
        rawText: data.rawText || '',
        extractedData: data.extractedData || null,
        validationFlags: data.validationFlags || [],
        validationStatus: data.validationStatus || 'PENDING',
        processingTimeMs: data.processingTimeMs || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbData.documents.push(doc);
      saveDatabase();
      return doc;
    },
    update: async ({ where, data }) => {
      loadDatabase();
      const index = dbData.documents.findIndex((d) => d.id === where.id);
      if (index === -1) return null;

      const current = dbData.documents[index];
      const updated = {
        ...current,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      dbData.documents[index] = updated;
      saveDatabase();
      return updated;
    },
    delete: async ({ where }) => {
      loadDatabase();
      const index = dbData.documents.findIndex((d) => d.id === where.id);
      if (index === -1) return false;

      const [removed] = dbData.documents.splice(index, 1);
      // Clean up cascades
      dbData.auditLogs = dbData.auditLogs.filter((a) => a.documentId !== where.id);
      dbData.chats = dbData.chats.filter((c) => c.documentId !== where.id);
      saveDatabase();
      return removed;
    },
  },

  auditLogs: {
    create: async ({ data }) => {
      loadDatabase();
      const log = {
        id: data.id || uuidv4(),
        documentId: data.documentId,
        action: data.action,
        details: typeof data.details === 'object' ? JSON.stringify(data.details) : data.details,
        performedBy: data.performedBy || 'SYSTEM',
        timestamp: new Date().toISOString(),
      };
      dbData.auditLogs.push(log);
      saveDatabase();
      return log;
    },
    findMany: async ({ where = {} } = {}) => {
      loadDatabase();
      let logs = [...dbData.auditLogs];
      if (where.documentId) {
        logs = logs.filter((l) => l.documentId === where.documentId);
      }
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return logs;
    },
  },

  chats: {
    create: async ({ data }) => {
      loadDatabase();
      const chat = {
        id: data.id || uuidv4(),
        userId: data.userId,
        documentId: data.documentId || null,
        role: data.role,
        message: data.message,
        sources: data.sources || null,
        createdAt: new Date().toISOString(),
      };
      dbData.chats.push(chat);
      saveDatabase();
      return chat;
    },
    findMany: async ({ where = {} } = {}) => {
      loadDatabase();
      let chats = [...dbData.chats];
      if (where.documentId) {
        chats = chats.filter((c) => c.documentId === where.documentId);
      }
      if (where.userId) {
        chats = chats.filter((c) => c.userId === where.userId);
      }
      chats.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return chats;
    },
  },
};

export default db;
