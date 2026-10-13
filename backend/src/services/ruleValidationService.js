import { logger } from '../utils/logger.js';

/**
 * Validates extracted document data against domain-specific business rules
 * Returns { validationStatus: 'VALID' | 'WARNING' | 'INVALID', flags: Array<{ code, severity, message, field }> }
 */
export const validateExtractedData = (documentType, extractedData, confidenceScore = 1.0) => {
  const flags = [];

  if (!extractedData || typeof extractedData !== 'object') {
    return {
      validationStatus: 'INVALID',
      flags: [
        {
          code: 'ERR_NO_DATA',
          severity: 'HIGH',
          message: 'No structured data could be parsed from the document.',
          field: 'root',
        },
      ],
    };
  }

  // Global check: low AI confidence
  if (confidenceScore < 0.75) {
    flags.push({
      code: 'WARN_LOW_CONFIDENCE',
      severity: 'MEDIUM',
      message: `AI extraction confidence score is low (${Math.round(confidenceScore * 100)}%). Manual review strongly recommended.`,
      field: 'confidenceScore',
    });
  }

  const fields = extractedData.fields || {};
  const tables = extractedData.tables || [];

  switch (documentType) {
    case 'INVOICE':
      validateInvoice(fields, tables, flags);
      break;
    case 'CONTRACT':
      validateContract(fields, flags);
      break;
    case 'MEDICAL_RECORD':
      validateMedicalRecord(fields, flags);
      break;
    case 'FINANCIAL_REPORT':
      validateFinancialReport(fields, flags);
      break;
    default:
      // Generic document validation
      if (Object.keys(fields).length === 0) {
        flags.push({
          code: 'WARN_EMPTY_FIELDS',
          severity: 'LOW',
          message: 'Document processed, but few structured fields were detected.',
          field: 'fields',
        });
      }
      break;
  }

  // Determine overall status
  const hasHighSeverity = flags.some((f) => f.severity === 'HIGH');
  const hasMediumSeverity = flags.some((f) => f.severity === 'MEDIUM');

  let validationStatus = 'VALID';
  if (hasHighSeverity) {
    validationStatus = 'INVALID';
  } else if (hasMediumSeverity || flags.length > 0) {
    validationStatus = 'WARNING';
  }

  return { validationStatus, flags };
};

function validateInvoice(fields, tables, flags) {
  // Required fields check
  const required = ['invoiceNumber', 'invoiceDate', 'totalAmount', 'vendorName'];
  required.forEach((f) => {
    if (!fields[f] || String(fields[f]).trim() === '') {
      flags.push({
        code: `ERR_MISSING_${f.toUpperCase()}`,
        severity: 'HIGH',
        message: `Missing mandatory invoice field: '${f}'`,
        field: f,
      });
    }
  });

  // Math reconciliation: Subtotal + Tax vs Total Amount
  const subtotal = parseNumeric(fields.subtotal || fields.netAmount);
  const tax = parseNumeric(fields.taxAmount || fields.tax || 0);
  const total = parseNumeric(fields.totalAmount || fields.amountDue);

  if (subtotal !== null && total !== null) {
    const expectedTotal = subtotal + (tax || 0);
    const diff = Math.abs(expectedTotal - total);
    // Allow minor floating point rounding (cents)
    if (diff > 0.05) {
      flags.push({
        code: 'ERR_MATH_MISMATCH',
        severity: 'HIGH',
        message: `Invoice arithmetic discrepancy: Subtotal ($${subtotal.toFixed(2)}) + Tax ($${(tax || 0).toFixed(2)}) = $${expectedTotal.toFixed(2)}, which does not match Total Amount ($${total.toFixed(2)}). Variance: $${diff.toFixed(2)}.`,
        field: 'totalAmount',
      });
    }
  }

  // Date reconciliation: Due date should be on or after invoice date
  if (fields.invoiceDate && fields.dueDate) {
    const invDate = new Date(fields.invoiceDate);
    const dueDate = new Date(fields.dueDate);
    if (!isNaN(invDate.getTime()) && !isNaN(dueDate.getTime())) {
      if (dueDate < invDate) {
        flags.push({
          code: 'ERR_INVALID_DUE_DATE',
          severity: 'HIGH',
          message: `Due date (${fields.dueDate}) cannot precede invoice issuance date (${fields.invoiceDate}).`,
          field: 'dueDate',
        });
      }
    }
  }

  // Line items reconciliation
  if (tables && tables.length > 0) {
    const lineItems = tables[0].rows || [];
    let lineItemsSum = 0;
    let hasLinePrices = false;

    lineItems.forEach((row, idx) => {
      const price = parseNumeric(row.amount || row.total || row.price);
      if (price !== null) {
        hasLinePrices = true;
        lineItemsSum += price;
      }
    });

    if (hasLinePrices && subtotal !== null) {
      const diff = Math.abs(lineItemsSum - subtotal);
      if (diff > 0.5) {
        flags.push({
          code: 'WARN_LINE_ITEMS_MISMATCH',
          severity: 'MEDIUM',
          message: `Sum of line items ($${lineItemsSum.toFixed(2)}) differs from recorded Subtotal ($${subtotal.toFixed(2)}).`,
          field: 'lineItems',
        });
      }
    }
  }
}

function validateContract(fields, flags) {
  const required = ['parties', 'effectiveDate', 'governingLaw'];
  required.forEach((f) => {
    if (!fields[f] || String(fields[f]).trim() === '') {
      flags.push({
        code: `WARN_MISSING_${f.toUpperCase()}`,
        severity: 'MEDIUM',
        message: `Standard legal clause/field missing: '${f}'`,
        field: f,
      });
    }
  });

  // Check for unbounded liability risk
  const liability = String(fields.limitationOfLiability || '').toLowerCase();
  if (liability.includes('unlimited') || liability.includes('no cap') || liability.includes('unrestricted')) {
    flags.push({
      code: 'HIGH_RISK_LIABILITY_UNCAPPED',
      severity: 'HIGH',
      message: 'CRITICAL LEGAL RISK: Limitation of liability clause appears uncapped or unrestricted.',
      field: 'limitationOfLiability',
    });
  }

  // Check for missing termination clause
  if (!fields.terminationClause && !fields.termination) {
    flags.push({
      code: 'WARN_NO_TERMINATION_CLAUSE',
      severity: 'MEDIUM',
      message: 'No clear termination clause or notice period was detected.',
      field: 'terminationClause',
    });
  }
}

function validateMedicalRecord(fields, flags) {
  if (!fields.patientName && !fields.patientId) {
    flags.push({
      code: 'ERR_MISSING_PATIENT_IDENTIFIER',
      severity: 'HIGH',
      message: 'Missing patient identifier (Name or Patient ID).',
      field: 'patientName',
    });
  }

  // Check for abnormal lab value flags
  const abnormalities = fields.abnormalFindings || fields.alerts;
  if (abnormalities) {
    flags.push({
      code: 'ALERT_CLINICAL_ABNORMALITY',
      severity: 'MEDIUM',
      message: `Clinical alert detected: ${abnormalities}`,
      field: 'abnormalFindings',
    });
  }
}

function validateFinancialReport(fields, flags) {
  const assets = parseNumeric(fields.totalAssets);
  const liabilities = parseNumeric(fields.totalLiabilities);
  const equity = parseNumeric(fields.shareholdersEquity || fields.equity);

  if (assets !== null && liabilities !== null && equity !== null) {
    const diff = Math.abs(assets - (liabilities + equity));
    if (diff > 1.0) {
      flags.push({
        code: 'ERR_BALANCE_SHEET_UNBALANCED',
        severity: 'HIGH',
        message: `Balance Sheet equation violated: Assets ($${assets.toLocaleString()}) != Liabilities ($${liabilities.toLocaleString()}) + Equity ($${equity.toLocaleString()}). Discrepancy: $${diff.toLocaleString()}`,
        field: 'totalAssets',
      });
    }
  }
}

function parseNumeric(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}
