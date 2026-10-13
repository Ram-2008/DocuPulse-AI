import db from '../db/index.js';
import { logger } from '../utils/logger.js';

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const documents = await db.documents.findMany({ where: { userId } });
    const auditLogs = await db.auditLogs.findMany();

    const totalDocs = documents.length;
    let totalConfidence = 0;
    let totalProcessingTime = 0;
    let totalFlagsCount = 0;

    const statusCounts = {
      COMPLETED: 0,
      REVIEW_REQUIRED: 0,
      PROCESSING: 0,
      FAILED: 0,
    };

    const typeCounts = {
      INVOICE: 0,
      CONTRACT: 0,
      MEDICAL_RECORD: 0,
      FINANCIAL_REPORT: 0,
      RESUME: 0,
      UNSTRUCTURED_NOTE: 0,
      UNKNOWN: 0,
    };

    const validationCounts = {
      VALID: 0,
      WARNING: 0,
      INVALID: 0,
      PENDING: 0,
    };

    documents.forEach((doc) => {
      // Confidence
      totalConfidence += doc.confidenceScore || 0;
      totalProcessingTime += doc.processingTimeMs || 0;

      // Status
      statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1;

      // Type
      typeCounts[doc.documentType] = (typeCounts[doc.documentType] || 0) + 1;

      // Validation
      validationCounts[doc.validationStatus] = (validationCounts[doc.validationStatus] || 0) + 1;

      // Flags count
      if (Array.isArray(doc.validationFlags)) {
        totalFlagsCount += doc.validationFlags.length;
      }
    });

    const avgConfidence = totalDocs > 0 ? (totalConfidence / totalDocs) * 100 : 0;
    const avgLatencyMs = totalDocs > 0 ? Math.round(totalProcessingTime / totalDocs) : 0;

    return res.json({
      success: true,
      analytics: {
        totalDocuments: totalDocs,
        averageConfidence: Math.round(avgConfidence),
        averageProcessingTimeMs: avgLatencyMs,
        totalAnomaliesDetected: totalFlagsCount,
        statusDistribution: statusCounts,
        typeDistribution: typeCounts,
        validationDistribution: validationCounts,
        recentActivity: auditLogs.slice(0, 10),
      },
    });
  } catch (error) {
    logger.error('Failed to get analytics', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
    });
  }
};
