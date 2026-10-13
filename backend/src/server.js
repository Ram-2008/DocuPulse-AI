import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { initDemoUser } from './controllers/authController.js';
import { logger } from './utils/logger.js';
import db from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads folder
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'DocuPulse AI - Intelligent Document Processing Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Seed initial sample documents if none exist
const seedInitialDocuments = async () => {
  try {
    const existing = await db.documents.findMany();
    if (existing.length === 0) {
      const demoUser = await db.users.findUnique({ where: { email: 'demo@docupulse.ai' } });
      const userId = demoUser ? demoUser.id : 'demo-user-id';

      // 1. Seed Sample Invoice
      const invDoc = await db.documents.create({
        data: {
          userId,
          title: 'Apex Cloud Enterprise Invoice #INV-2026-089',
          originalFilename: 'apex_cloud_invoice.pdf',
          mimeType: 'application/pdf',
          fileSize: 184520,
          filePath: '',
          status: 'COMPLETED',
          documentType: 'INVOICE',
          confidenceScore: 0.98,
          summary: 'Cloud compute and database consumption invoice issued by Apex Cloud Technologies to Global Enterprise Solutions.',
          rawText: 'INVOICE INV-2026-089\nApex Cloud Technologies Inc.\nBilled to: Global Enterprise Solutions LLC\nDate: 2026-03-15\nDue Date: 2026-04-15\nSubtotal: $12,450.00\nTax (10%): $1,245.00\nTotal Amount: $13,695.00',
          extractedData: {
            fields: {
              invoiceNumber: 'INV-2026-089',
              invoiceDate: '2026-03-15',
              dueDate: '2026-04-15',
              vendorName: 'Apex Cloud Technologies Inc.',
              customerName: 'Global Enterprise Solutions LLC',
              subtotal: '$12,450.00',
              taxAmount: '$1,245.00',
              totalAmount: '$13,695.00',
              paymentTerms: 'Net 30 Days',
              currency: 'USD',
            },
            tables: [
              {
                name: 'Itemized Cloud Infrastructure',
                headers: ['Description', 'Qty', 'Unit Price', 'Total'],
                rows: [
                  { Description: 'Enterprise AI Cloud Compute (Cluster A)', Qty: '100 hrs', 'Unit Price': '$45.00', Total: '$4,500.00' },
                  { Description: 'Managed Database Ingestion Service', Qty: '1 month', 'Unit Price': '$3,950.00', Total: '$3,950.00' },
                  { Description: 'Technical Support & SLA Maintenance', Qty: '1 month', 'Unit Price': '$4,000.00', Total: '$4,000.00' },
                ],
              },
            ],
            entities: [
              { type: 'ORGANIZATION', value: 'Apex Cloud Technologies Inc.', confidence: 0.98 },
              { type: 'ORGANIZATION', value: 'Global Enterprise Solutions LLC', confidence: 0.96 },
              { type: 'MONEY', value: '$13,695.00', confidence: 0.99 },
            ],
            keyInsights: [
              'Math validation passed: Subtotal + Tax perfectly equals Total Amount.',
              'Payment due within 30 days via automated ACH transfer.',
            ],
          },
          validationFlags: [],
          validationStatus: 'VALID',
          processingTimeMs: 1420,
        },
      });

      await db.auditLogs.create({
        data: {
          documentId: invDoc.id,
          action: 'CLASSIFY_AND_EXTRACT',
          details: 'Classified as INVOICE with 98.0% confidence score',
          performedBy: 'GEMINI_AI',
        },
      });

      // 2. Seed Sample Contract with Warning Flag
      const contractDoc = await db.documents.create({
        data: {
          userId,
          title: 'Master Vendor & Non-Disclosure Agreement',
          originalFilename: 'master_services_nda.pdf',
          mimeType: 'application/pdf',
          fileSize: 421090,
          filePath: '',
          status: 'REVIEW_REQUIRED',
          documentType: 'CONTRACT',
          confidenceScore: 0.92,
          summary: 'Mutual non-disclosure and intellectual property protection agreement between CyberScale Corp and DataSync Global Inc.',
          rawText: 'MUTUAL NON-DISCLOSURE AGREEMENT\nEffective Date: 2026-02-01\nParties: CyberScale Corp & DataSync Global Inc.\nGoverning Law: State of Delaware\nLimitation of Liability: Uncapped liabilities for indirect damages.',
          extractedData: {
            fields: {
              parties: 'CyberScale Corp & DataSync Global Inc.',
              effectiveDate: '2026-02-01',
              expirationDate: '2028-02-01',
              governingLaw: 'State of Delaware',
              limitationOfLiability: 'Unlimited liability for indirect and consequential damages',
              indemnification: 'Mutual indemnification for third-party patent claims',
              terminationClause: '30 days written notice',
              confidentialityPeriod: '3 years post-termination',
            },
            tables: [],
            entities: [
              { type: 'ORGANIZATION', value: 'CyberScale Corp', confidence: 0.97 },
              { type: 'ORGANIZATION', value: 'DataSync Global Inc.', confidence: 0.95 },
              { type: 'CLAUSE', value: 'Limitation of Liability', confidence: 0.93 },
            ],
            keyInsights: [
              'Identified high-risk liability clause: uncapped exposure for consequential damages.',
              'Delaware jurisdiction with mutual 30-day termination period.',
            ],
          },
          validationFlags: [
            {
              code: 'HIGH_RISK_LIABILITY_UNCAPPED',
              severity: 'HIGH',
              message: 'CRITICAL LEGAL RISK: Limitation of liability clause appears uncapped or unrestricted.',
              field: 'limitationOfLiability',
            },
          ],
          validationStatus: 'INVALID',
          processingTimeMs: 1850,
        },
      });

      await db.auditLogs.create({
        data: {
          documentId: contractDoc.id,
          action: 'VALIDATE_RULES',
          details: 'High-risk uncapped liability flag triggered. Status marked REVIEW_REQUIRED.',
          performedBy: 'RULE_ENGINE',
        },
      });

      // 3. Seed Sample Medical Record
      const medDoc = await db.documents.create({
        data: {
          userId,
          title: 'Patient Clinical Biomarker & Lab Summary',
          originalFilename: 'clinical_lab_report.pdf',
          mimeType: 'application/pdf',
          fileSize: 312840,
          filePath: '',
          status: 'COMPLETED',
          documentType: 'MEDICAL_RECORD',
          confidenceScore: 0.96,
          summary: 'Diagnostic report for patient Eleanor Vance highlighting metabolic blood markers and medication adherence.',
          rawText: 'PATIENT LAB REPORT\nPatient Name: Eleanor Vance\nID: PT-94821\nPhysician: Dr. Marcus Reynolds, MD\nDiagnosis: Type 2 Diabetes Mellitus - Controlled\nBlood Glucose: 138 mg/dL\nHbA1c: 7.1%',
          extractedData: {
            fields: {
              patientName: 'Eleanor Vance',
              patientId: 'PT-94821',
              dateOfService: '2026-03-20',
              doctorName: 'Dr. Marcus Reynolds, MD',
              diagnosis: 'Type 2 Diabetes Mellitus - Controlled; Hypertension Stage 1',
              medications: 'Metformin 500mg BID, Lisinopril 10mg QD',
              vitalSigns: 'BP: 128/82 mmHg, HR: 72 bpm, SpO2: 99%',
              abnormalFindings: 'Elevated Fasting Glucose (138 mg/dL) and HbA1c (7.1%)',
            },
            tables: [
              {
                name: 'Biochemical Lab Panel',
                headers: ['Test Name', 'Result', 'Reference Range', 'Status'],
                rows: [
                  { 'Test Name': 'Fasting Blood Glucose', Result: '138 mg/dL', 'Reference Range': '70-99 mg/dL', Status: 'High' },
                  { 'Test Name': 'HbA1c', Result: '7.1 %', 'Reference Range': '< 5.7 %', Status: 'High' },
                  { 'Test Name': 'Total Cholesterol', Result: '185 mg/dL', 'Reference Range': '< 200 mg/dL', Status: 'Normal' },
                  { 'Test Name': 'Serum Creatinine', Result: '0.9 mg/dL', 'Reference Range': '0.6-1.2 mg/dL', Status: 'Normal' },
                ],
              },
            ],
            entities: [
              { type: 'PERSON', value: 'Eleanor Vance', confidence: 0.99 },
              { type: 'PERSON', value: 'Dr. Marcus Reynolds, MD', confidence: 0.96 },
              { type: 'DATE', value: '2026-03-20', confidence: 0.98 },
            ],
            keyInsights: [
              'Patient shows borderline elevated blood glucose requiring dietary follow-up.',
              'Renal function markers (Creatinine 0.9 mg/dL) within healthy limits.',
            ],
          },
          validationFlags: [
            {
              code: 'ALERT_CLINICAL_ABNORMALITY',
              severity: 'MEDIUM',
              message: 'Clinical alert detected: Elevated Fasting Glucose (138 mg/dL) and HbA1c (7.1%)',
              field: 'abnormalFindings',
            },
          ],
          validationStatus: 'WARNING',
          processingTimeMs: 1610,
        },
      });

      await db.auditLogs.create({
        data: {
          documentId: medDoc.id,
          action: 'CLASSIFY_AND_EXTRACT',
          details: 'Classified as MEDICAL_RECORD. Extracted lab biomarker panel.',
          performedBy: 'GEMINI_AI',
        },
      });

      logger.info('Sample IDP documents initialized successfully.');
    }
  } catch (err) {
    logger.warn('Seed initial documents warning', { error: err.message });
  }
};

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled server error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred',
  });
});

// Start Server
app.listen(PORT, async () => {
  logger.info(`DocuPulse AI Server running on port ${PORT}`);
  await initDemoUser();
  await seedInitialDocuments();
});

export default app;
