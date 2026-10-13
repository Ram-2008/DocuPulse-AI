import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentAPI } from '../services/api';
import ValidationBadge from '../components/ValidationBadge';
import ConfidenceGauge from '../components/ConfidenceGauge';
import {
  FileText,
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Sparkles,
  MessageSquareCode,
  Send,
  Save,
  Trash2,
  Table,
  Cpu,
  Layers,
  History,
  Tag,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editable fields state
  const [editedFields, setEditedFields] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Tab controls
  const [leftTab, setLeftTab] = useState('raw'); // 'raw' | 'audit'
  const [rightTab, setRightTab] = useState('fields'); // 'fields' | 'tables' | 'validation' | 'chat'

  // Interactive Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [isChatSending, setIsChatSending] = useState(false);

  const fetchDocument = async () => {
    try {
      const res = await documentAPI.getById(id);
      if (res.success && res.document) {
        setDocument(res.document);
        setEditedFields(res.document.extractedData?.fields || {});
        setChats(res.document.chats || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const handleFieldChange = (key, val) => {
    setEditedFields((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSaveChanges = async (markApproved = false) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updatedExtractedData = {
        ...document.extractedData,
        fields: editedFields,
      };

      const res = await documentAPI.updateExtractedData(id, {
        extractedData: updatedExtractedData,
        markAsApproved: markApproved,
      });

      if (res.success && res.document) {
        setDocument(res.document);
        setEditedFields(res.document.extractedData?.fields || {});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to save changes: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatSending) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setIsChatSending(true);

    // Optimistically add user chat
    const tempUserChat = {
      id: `temp-${Date.now()}`,
      role: 'user',
      message: userMsg,
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => [...prev, tempUserChat]);

    try {
      const res = await documentAPI.chat(id, userMsg);
      if (res.success && res.chat) {
        setChats((prev) => [...prev, res.chat]);
      }
    } catch (err) {
      setChats((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          message: 'Error communicating with Gemini Copilot: ' + (err.response?.data?.error || err.message),
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'csv') {
        const blobData = await documentAPI.exportData(id, 'csv');
        const url = window.URL.createObjectURL(new Blob([blobData]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_extracted.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        const jsonData = await documentAPI.exportData(id, 'json');
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonData, null, 2));
        const link = document.createElement('a');
        link.href = dataStr;
        link.setAttribute('download', `${document.title.replace(/[^a-zA-Z0-9]/g, '_')}_extracted.json`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
    } catch (err) {
      alert('Failed to export document');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Permanently delete "${document.title}"?`)) {
      try {
        await documentAPI.delete(id);
        navigate('/dashboard');
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading extraction studio...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto my-12 border border-slate-800">
        <AlertOctagon className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">Failed to load document</h3>
        <p className="text-xs text-slate-400 mb-6">{error || 'Document not found'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-cyan-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const flagsCount = Array.isArray(document.validationFlags) ? document.validationFlags.length : 0;
  const tables = document.extractedData?.tables || [];
  const entities = document.extractedData?.entities || [];
  const keyInsights = document.extractedData?.keyInsights || [];

  return (
    <div className="space-y-6 pb-12">
      {/* TOP ACTION HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all shrink-0 mt-0.5 sm:mt-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{document.title}</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {document.documentType}
              </span>
              <ValidationBadge status={document.validationStatus} flagsCount={flagsCount} size="lg" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Original: {document.originalFilename}</span>
              <span>•</span>
              <span>{(document.fileSize / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span>AI Confidence:</span>
                <ConfidenceGauge score={document.confidenceScore} />
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved &amp; Re-validated
            </span>
          )}

          <button
            onClick={() => handleSaveChanges(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            {isSaving ? 'Re-validating...' : 'Save Edits'}
          </button>

          {document.status === 'REVIEW_REQUIRED' && (
            <button
              onClick={() => handleSaveChanges(true)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              Approve Document
            </button>
          )}

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => handleExport('json')}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title="Export Extracted JSON"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              title="Export Extracted CSV"
            >
              CSV
            </button>
          </div>

          <button
            onClick={handleDelete}
            title="Delete Document"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-900/60 text-slate-400 hover:text-rose-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY STRIP */}
      {document.summary && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950 border border-slate-800">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                AI Executive Summary
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{document.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* SPLIT SCREEN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: RAW DOCUMENT / AUDIT TRAIL (5 COLS) */}
        <div className="lg:col-span-5 glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[700px]">
          {/* Left Column Tabs Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLeftTab('raw')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  leftTab === 'raw'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Document Text View
              </button>
              <button
                onClick={() => setLeftTab('audit')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  leftTab === 'audit'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3 h-3" />
                Audit Trail ({document.auditLogs?.length || 0})
              </button>
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-mono">
              {document.rawText ? `${document.rawText.length} chars` : 'OCR Parsed'}
            </span>
          </div>

          {/* Left Column Body */}
          <div className="p-4 flex-1 overflow-y-auto">
            {leftTab === 'raw' ? (
              document.rawText ? (
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                  {document.rawText}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <FileText className="w-10 h-10 mb-2 opacity-50 text-cyan-400" />
                  <p className="text-xs font-medium text-slate-300">Multimodal Direct Parsing</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    This document was analyzed directly via Google Gemini multimodal image/PDF tokenizer.
                  </p>
                </div>
              )
            ) : (
              /* Audit Trail Timeline */
              <div className="space-y-4">
                {document.auditLogs?.map((log, idx) => (
                  <div key={log.id || idx} className="flex gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-slate-800">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 leading-snug">{log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">By: {log.performedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INTELLIGENT EXTRACTION STUDIO (7 COLS) */}
        <div className="lg:col-span-7 glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[700px]">
          {/* Right Column Navigation Tabs */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setRightTab('fields')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  rightTab === 'fields'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Key-Value Fields ({Object.keys(editedFields).length})
              </button>

              <button
                onClick={() => setRightTab('validation')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                  rightTab === 'validation'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rule Checks
                {flagsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                    {flagsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setRightTab('tables')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                  rightTab === 'tables'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tables ({tables.length})
              </button>

              <button
                onClick={() => setRightTab('chat')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                  rightTab === 'chat'
                    ? 'bg-purple-950 text-purple-300 border border-purple-800/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                AI Q&amp;A Copilot
              </button>
            </div>
          </div>

          {/* Right Column Body */}
          <div className="p-5 flex-1 overflow-y-auto">
            {/* TAB 1: EDITABLE FIELDS */}
            {rightTab === 'fields' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400">
                    Human-in-the-Loop review: You can click and adjust any extracted value below.
                  </p>
                  <button
                    onClick={() => handleSaveChanges(false)}
                    disabled={isSaving}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Edits
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.entries(editedFields).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <label className="block text-[11px] font-mono text-cyan-300 mb-1 capitalize truncate">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="text"
                        value={value !== null && value !== undefined ? String(value) : ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>

                {/* Named Entities chips */}
                {entities.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 mt-6">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cyan-400" />
                      Named Entities Discovered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {entities.map((ent, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-200"
                        >
                          <span className="text-[10px] font-bold text-cyan-400 uppercase">{ent.type}:</span>
                          <span>{ent.value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: RULE VALIDATION INSPECTOR */}
            {rightTab === 'validation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Automated Business Rules &amp; Anomaly Log
                  </h3>
                  <ValidationBadge status={document.validationStatus} flagsCount={flagsCount} />
                </div>

                {flagsCount === 0 ? (
                  <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-emerald-300">All Business Rules Passed</h4>
                    <p className="text-xs text-emerald-400/80 max-w-sm mx-auto mt-1">
                      Math reconciliation passed, mandatory attributes verified, and no contractual liability risks detected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {document.validationFlags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-start gap-3 ${
                          flag.severity === 'HIGH'
                            ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                            : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                        }`}
                      >
                        {flag.severity === 'HIGH' ? (
                          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold uppercase tracking-wider font-mono text-[10px]">
                              {flag.code}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                flag.severity === 'HIGH' ? 'bg-rose-900 text-rose-100' : 'bg-amber-900 text-amber-100'
                              }`}
                            >
                              {flag.severity} RISK
                            </span>
                          </div>
                          <p className="leading-relaxed mt-0.5">{flag.message}</p>
                          {flag.field && (
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">
                              Associated Field: <span className="text-cyan-300">{flag.field}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TABLES VIEW */}
            {rightTab === 'tables' && (
              <div className="space-y-6">
                {tables.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Table className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-xs">No multi-row itemized tables found in this document.</p>
                  </div>
                ) : (
                  tables.map((t, tIdx) => (
                    <div key={tIdx} className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Table className="w-3.5 h-3.5 text-cyan-400" />
                        {t.name || `Table ${tIdx + 1}`}
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
                              {t.headers?.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5 font-semibold">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-300">
                            {t.rows?.map((r, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-900/40">
                                {t.headers?.map((h, cIdx) => (
                                  <td key={cIdx} className="p-2.5">
                                    {r[h] ?? Object.values(r)[cIdx] ?? '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: INTERACTIVE AI Q&A COPILOT */}
            {rightTab === 'chat' && (
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 mb-4">
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 text-xs text-purple-200">
                    <p className="font-bold flex items-center gap-1 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Document Knowledge Copilot
                    </p>
                    <p className="text-[11px] text-purple-300/80">
                      Ask any questions about this document (e.g. &ldquo;What are the payment terms?&rdquo;, &ldquo;Is there a liability cap?&rdquo;).
                    </p>
                  </div>

                  {chats.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl text-xs ${
                        c.role === 'user'
                          ? 'bg-slate-900 ml-8 border border-slate-800 text-white'
                          : 'bg-gradient-to-r from-purple-950/40 to-slate-900 mr-8 border border-purple-800/60 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                        <span className="font-bold uppercase tracking-wider">
                          {c.role === 'user' ? 'You' : 'Gemini Copilot'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{c.message}</p>
                    </div>
                  ))}

                  {isChatSending && (
                    <div className="p-3 rounded-xl bg-slate-900/80 text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Analyzing document context...
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask a question about this document..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim() || isChatSending}
                    className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
