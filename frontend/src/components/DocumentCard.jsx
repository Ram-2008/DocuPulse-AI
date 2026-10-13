import React from 'react';
import { Link } from 'react-router-dom';
import ValidationBadge from './ValidationBadge';
import ConfidenceGauge from './ConfidenceGauge';
import {
  FileText,
  FileCheck,
  Receipt,
  HeartPulse,
  TrendingUp,
  FileCode,
  ArrowRight,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';

const getDocTypeConfig = (type) => {
  switch (type) {
    case 'INVOICE':
      return {
        label: 'Commercial Invoice',
        icon: Receipt,
        badgeStyle: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80',
        glow: 'hover:border-emerald-700/50',
      };
    case 'CONTRACT':
      return {
        label: 'Legal Contract / NDA',
        icon: FileCheck,
        badgeStyle: 'bg-purple-950/70 text-purple-300 border-purple-800/80',
        glow: 'hover:border-purple-700/50',
      };
    case 'MEDICAL_RECORD':
      return {
        label: 'Clinical Diagnostic',
        icon: HeartPulse,
        badgeStyle: 'bg-blue-950/70 text-blue-300 border-blue-800/80',
        glow: 'hover:border-blue-700/50',
      };
    case 'FINANCIAL_REPORT':
      return {
        label: 'Financial Statement',
        icon: TrendingUp,
        badgeStyle: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/80',
        glow: 'hover:border-cyan-700/50',
      };
    default:
      return {
        label: type || 'Document',
        icon: FileText,
        badgeStyle: 'bg-slate-800 text-slate-300 border-slate-700',
        glow: 'hover:border-slate-700',
      };
  }
};

export default function DocumentCard({ doc, onDelete }) {
  const typeConfig = getDocTypeConfig(doc.documentType);
  const Icon = typeConfig.icon;
  const fieldsCount = Object.keys(doc.extractedData?.fields || {}).length;
  const flagsCount = Array.isArray(doc.validationFlags) ? doc.validationFlags.length : 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 border border-slate-800/90 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group ${typeConfig.glow}`}
    >
      <div>
        {/* Top Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${typeConfig.badgeStyle}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {typeConfig.label}
            </span>
          </div>
          <ValidationBadge status={doc.validationStatus} flagsCount={flagsCount} />
        </div>

        {/* Title */}
        <Link to={`/documents/${doc.id}`} className="block group-hover:text-cyan-300 transition-colors">
          <h3 className="text-base font-semibold text-slate-100 line-clamp-1 mb-1.5">{doc.title}</h3>
        </Link>

        {/* Original File & Date */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span className="truncate max-w-[150px]">{doc.originalFilename}</span>
          <span>•</span>
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(doc.createdAt)}
          </span>
        </div>

        {/* Executive Summary Snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {doc.summary || 'Document extracted and classified into structured fields.'}
        </p>

        {/* Key Metrics Strip */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">AI Confidence</p>
            <ConfidenceGauge score={doc.confidenceScore} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Entities Parsed</p>
            <span className="text-xs font-semibold text-slate-200">
              {fieldsCount} fields {doc.extractedData?.tables?.length ? `• ${doc.extractedData.tables.length} table(s)` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <Link
          to={`/documents/${doc.id}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>Open Extraction Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {onDelete && (
          <button
            onClick={() => onDelete(doc.id, doc.title)}
            title="Delete document"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
