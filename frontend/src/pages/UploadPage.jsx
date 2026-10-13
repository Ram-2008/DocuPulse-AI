import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';
import {
  UploadCloud,
  FileText,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  FileUp,
  Receipt,
  FileCheck,
  HeartPulse,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a document to process.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setUploadProgress(15);
    setProcessingStage('Uploading document to secure IDP backend...');

    const formData = new FormData();
    formData.append('document', file);
    if (title) formData.append('title', title);

    try {
      // Simulate progressive stages
      const stageTimer1 = setTimeout(() => {
        setUploadProgress(45);
        setProcessingStage('Multimodal AI extraction & classification via Gemini...');
      }, 700);

      const stageTimer2 = setTimeout(() => {
        setUploadProgress(75);
        setProcessingStage('Running business rule validation & cross-field reconciliation...');
      }, 1500);

      const res = await documentAPI.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 35) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setUploadProgress(100);
      setProcessingStage('Complete! Opening Extraction Studio...');

      setTimeout(() => {
        if (res.success && res.document) {
          navigate(`/documents/${res.document.id}`);
        } else {
          navigate('/dashboard');
        }
      }, 600);
    } catch (err) {
      setIsProcessing(false);
      setError(
        err.response?.data?.error ||
          'Failed to process document. Ensure file type is supported (PDF, PNG, JPG, TXT).'
      );
    }
  };

  // Helper to load sample files with 1 click
  const handleIngestSample = async (sampleType) => {
    let sampleContent = '';
    let sampleFilename = '';
    let sampleTitle = '';

    if (sampleType === 'invoice_clean') {
      sampleTitle = 'Apex Cloud Enterprise Invoicing';
      sampleFilename = 'Sample_Invoice_ApexCloud.txt';
      sampleContent = `================================================================================
APEX CLOUD TECHNOLOGIES INC.
100 Silicon Vista Blvd, Suite 400, San Francisco, CA 94107
Tax ID: US-84-2918471 | billing@apexcloud.io
================================================================================
COMMERCIAL INVOICE
Invoice Number: INV-2026-089
Invoice Date: 2026-03-15
Due Date: 2026-04-15
Payment Terms: Net 30 Days
Currency: USD

BILLED TO:
Global Enterprise Solutions LLC
750 Enterprise Way, Floor 12, New York, NY 10001

ITEMIZED SERVICES:
1. Enterprise AI Cloud Compute (Cluster A)    | 100 hrs  | $45.00     | $4,500.00
2. Managed Database Ingestion Service (TB/mo) | 1 month  | $3,950.00  | $3,950.00
3. Technical Support & 99.99% SLA Package     | 1 month  | $4,000.00  | $4,000.00

SUBTOTAL:       $12,450.00
STATE TAX (10%): $1,245.00
TOTAL DUE:      $13,695.00
Bank: Silicon Valley Commercial Bank | ABA: 121000358 | Acct: 9840291847`;
    } else if (sampleType === 'invoice_anomaly') {
      sampleTitle = 'Vortex Logistics Freight Bill (Arithmetic Discrepancy)';
      sampleFilename = 'Sample_Invoice_Discrepancy.txt';
      sampleContent = `================================================================================
VORTEX LOGISTICS & FREIGHT CORP.
450 Harbor Boulevard, Seattle, WA 98101
================================================================================
FREIGHT & LOGISTICS INVOICE
Invoice Number: VTX-88219
Invoice Date: 2026-03-01
Due Date: 2026-02-15    <-- [ANOMALY: Due Date precedes Invoice Date!]
Customer: Continental Retailers Inc.

LINE ITEMS:
1. Ocean Freight Container 40ft (CN-SEA)    Qty: 2   Unit: $3,200.00   Total: $6,400.00
2. Port Drayage & Handling Fee              Qty: 2   Unit: $650.00     Total: $1,300.00
3. Customs Clearance & Brokerage            Qty: 1   Unit: $850.00     Total: $850.00

RECORDED SUBTOTAL:  $8,550.00
RECORDED TAX (5%):    $427.50
--------------------------------------------------------------------------------
RECORDED TOTAL DUE: $9,850.00   <-- [ANOMALY: Math mismatch! 8550 + 427.50 = 8977.50, but total lists 9850.00]`;
    } else if (sampleType === 'nda_contract') {
      sampleTitle = 'CyberScale Strategic IP Agreement';
      sampleFilename = 'Sample_Vendor_NDA_Agreement.txt';
      sampleContent = `MUTUAL NON-DISCLOSURE AND INTELLECTUAL PROPERTY AGREEMENT
Effective Date: February 1, 2026
Parties: CyberScale Corp (Austin, TX) and DataSync Global Inc. (San Francisco, CA)

1. PURPOSE: Strategic cloud integration and mutual enterprise API rollout.
2. CONFIDENTIAL INFORMATION: Technical source code, weights, and customer data.
3. TERM & TERMINATION: Two (2) years from Effective Date. Either party may terminate upon 30 days written notice. Confidentiality survives 3 years.
4. LIMITATION OF LIABILITY: Neither party liable for indirect damages. Capped at $250,000 or fees paid in preceding 12 months.
5. GOVERNING LAW: State of Delaware, United States.`;
    } else if (sampleType === 'medical_lab') {
      sampleTitle = 'Clinical Diagnostic Panel - Vance E.';
      sampleFilename = 'Sample_Clinical_Lab_Report.txt';
      sampleContent = `METROPOLITAN HEALTHCARE & CLINICAL LABORATORIES
PATIENT DIAGNOSTIC REPORT
Patient Name: Eleanor Vance | ID: PT-94821 | DOB: 1968-06-14 (Age 57)
Date of Service: 2026-03-20 | Physician: Dr. Marcus Reynolds, MD

DIAGNOSES: Type 2 Diabetes Mellitus; Essential Hypertension
MEDICATIONS: Metformin 500mg BID, Lisinopril 10mg QD
VITALS: BP 128/82 mmHg, HR 72 bpm, BMI 27.4

LAB PANEL:
- Fasting Blood Glucose: 138 mg/dL (Ref: 70-99) [HIGH]
- Hemoglobin A1c (HbA1c): 7.1 % (Ref: < 5.7) [HIGH]
- Total Cholesterol: 185 mg/dL (Ref: < 200) [NORMAL]
- Serum Creatinine: 0.9 mg/dL (Ref: 0.6-1.2) [NORMAL]

RECOMMENDATION: Glycemic control borderline. Continuation of Metformin, dietary consultation.`;
    }

    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const sampleFile = new File([blob], sampleFilename, { type: 'text/plain' });

    setFile(sampleFile);
    setTitle(sampleTitle);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-7 h-7 text-cyan-400" />
          Document Ingestion &amp; Intelligence Intake
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload multi-page PDFs, scans, images, or raw text documents for autonomous classification &amp; schema extraction.
        </p>
      </div>

      {/* QUICK PRE-LOADED SAMPLES BAR */}
      <div className="glass-card rounded-2xl p-5 border border-cyan-800/60 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Quick Ingestion: 1-Click Ready Test Documents
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Click any sample document below to immediately load it into the intake pipeline:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => handleIngestSample('invoice_clean')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
          >
            <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate text-xs">
              <p className="font-semibold text-slate-200 group-hover:text-cyan-300">Clean Invoice</p>
              <p className="text-[10px] text-slate-400">$13,695.00 TechCorp</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleIngestSample('invoice_anomaly')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/80 text-left transition-all group"
          >
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="truncate text-xs">
              <p className="font-semibold text-rose-200 group-hover:text-rose-100">Math Discrepancy</p>
              <p className="text-[10px] text-rose-400">Triggers Rule Flag</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleIngestSample('nda_contract')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
          >
            <FileCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="truncate text-xs">
              <p className="font-semibold text-slate-200 group-hover:text-purple-300">Legal Contract</p>
              <p className="text-[10px] text-slate-400">NDA &amp; Liability Cap</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleIngestSample('medical_lab')}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
          >
            <HeartPulse className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="truncate text-xs">
              <p className="font-semibold text-slate-200 group-hover:text-blue-300">Clinical Labs</p>
              <p className="text-[10px] text-slate-400">Biomarker Panel</p>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* DRAG AND DROP ZONE */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 relative ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
              : file
              ? 'border-cyan-600/80 bg-slate-900/60'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.json"
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-cyan-400 shadow-inner">
            <FileUp className="w-8 h-8" />
          </div>

          {file ? (
            <div>
              <p className="text-base font-bold text-white mb-1 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {file.name}
              </p>
              <p className="text-xs text-slate-400">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Text/Document'}
              </p>
              <p className="text-xs text-cyan-400 mt-3 font-semibold">Click to replace file</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Drag &amp; drop document here, or <span className="text-cyan-400">browse file</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                Supports PDF, Images (PNG, JPG, JPEG, WEBP), and Text documents up to 25MB.
              </p>
            </div>
          )}
        </div>

        {/* DOCUMENT TITLE INPUT */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Document Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q1 TechCorp Cloud Invoice or Vendor NDA"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        {/* PROCESSING PROGRESS BAR OVERLAY */}
        {isProcessing && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                {processingStage}
              </span>
              <span className="font-mono font-bold text-white">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!file || isProcessing}
          className="w-full py-4 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <span>Processing with Google Gemini AI...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              Analyze Document &amp; Run IDP Pipeline
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
