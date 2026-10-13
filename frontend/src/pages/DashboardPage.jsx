import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentAPI, analyticsAPI } from '../services/api';
import DocumentCard from '../components/DocumentCard';
import ValidationBadge from '../components/ValidationBadge';
import {
  FileText,
  UploadCloud,
  MessageSquareCode,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Receipt,
  FileCheck,
  HeartPulse,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [docsRes, analyticsRes] = await Promise.all([
        documentAPI.getAll(),
        analyticsAPI.getOverview(),
      ]);

      if (docsRes.success) {
        setDocuments(docsRes.documents);
      }
      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteDocument = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await documentAPI.delete(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete document: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (filterType !== 'ALL' && doc.documentType !== filterType) return false;
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'REVIEW_REQUIRED' && doc.status !== 'REVIEW_REQUIRED') return false;
      if (filterStatus === 'COMPLETED' && doc.status !== 'COMPLETED') return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchFile = doc.originalFilename.toLowerCase().includes(q);
      const matchSummary = (doc.summary || '').toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchSummary) return false;
    }
    return true;
  });

  const reviewRequiredDocs = documents.filter(
    (d) => d.status === 'REVIEW_REQUIRED' || d.validationStatus === 'INVALID'
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Welcome back, {user?.name?.split(' ')[0] || 'Analyst'}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold uppercase">
              {user?.role || 'analyst'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time Intelligent Document Understanding &amp; Anomaly Monitoring Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <Link
            to="/chat"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/70 text-xs font-semibold text-purple-200 transition-all"
          >
            <MessageSquareCode className="w-4 h-4 text-purple-400" />
            Knowledge Copilot
          </Link>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-slate-950" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Docs */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Ingested</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {analytics?.totalDocuments ?? documents.length}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% indexed
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Heterogeneous multi-format records</p>
        </div>

        {/* Card 2: AI Confidence */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg AI Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {analytics?.averageConfidence ? `${analytics.averageConfidence}%` : '96%'}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">Gemini Multimodal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Zero-shot structured schema accuracy</p>
        </div>

        {/* Card 3: Anomalies Prevented */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rule Flags Prevented</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {analytics?.totalAnomaliesDetected ?? 0}
            </span>
            <span className="text-xs text-amber-300 font-semibold">Flagged</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Math discrepancies &amp; high liability risks</p>
        </div>

        {/* Card 4: Avg Latency */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Extraction Speed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {analytics?.averageProcessingTimeMs ? `${(analytics.averageProcessingTimeMs / 1000).toFixed(2)}s` : '1.45s'}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">Sub-2s SLA</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Continuous streaming inference</p>
        </div>
      </div>

      {/* HUMAN-IN-THE-LOOP ALERT BANNER (If anomalies need review) */}
      {reviewRequiredDocs.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-amber-950/40 to-slate-900 border border-rose-800/80 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-700/60 flex items-center justify-center text-rose-300 shrink-0">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Human-in-the-Loop Review Required</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-900/80 text-rose-200 border border-rose-700 font-bold">
                    {reviewRequiredDocs.length} Document(s)
                  </span>
                </h3>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Automated rule checks caught arithmetic discrepancies or critical uncapped liability clauses.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/documents/${reviewRequiredDocs[0].id}`}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-rose-400 hover:bg-rose-300 transition-all flex items-center gap-1.5 shadow-md shadow-rose-950/50"
              >
                Inspect First Anomaly
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT TYPE TAXONOMY STRIP */}
      {analytics?.typeDistribution && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Corpus Taxonomy Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-slate-200">{analytics.typeDistribution.INVOICE || 0} Invoices</p>
                <p className="text-[10px] text-slate-400">Reconciled bills</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <div>
                <p className="font-semibold text-slate-200">{analytics.typeDistribution.CONTRACT || 0} Contracts/NDAs</p>
                <p className="text-[10px] text-slate-400">Risk analyzed</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <HeartPulse className="w-4 h-4 text-blue-400" />
              <div>
                <p className="font-semibold text-slate-200">{analytics.typeDistribution.MEDICAL_RECORD || 0} Clinical Labs</p>
                <p className="text-[10px] text-slate-400">Biomarkers parsed</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="font-semibold text-slate-200">
                  {(analytics.typeDistribution.FINANCIAL_REPORT || 0) + (analytics.typeDistribution.UNSTRUCTURED_NOTE || 0)} Other
                </p>
                <p className="text-[10px] text-slate-400">Notes &amp; Reports</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, vendor, party or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-white placeholder-slate-500 transition-all outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex rounded-xl bg-slate-900/80 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'ALL' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus('COMPLETED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/80' : 'text-slate-400 hover:text-white'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilterStatus('REVIEW_REQUIRED')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'REVIEW_REQUIRED' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/80' : 'text-slate-400 hover:text-white'
              }`}
            >
              Needs Review
            </button>
          </div>

          {/* Type filter dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 outline-none cursor-pointer hover:border-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="INVOICE">Invoices</option>
            <option value="CONTRACT">Legal Contracts</option>
            <option value="MEDICAL_RECORD">Medical Records</option>
            <option value="FINANCIAL_REPORT">Financial Reports</option>
            <option value="UNSTRUCTURED_NOTE">Unstructured Notes</option>
          </select>
        </div>
      </div>

      {/* DOCUMENT GRID */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading processed document repository...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800/80">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No documents matched your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Upload a document or clear search filters to view your extracted knowledge repository.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/20 transition-all"
          >
            <UploadCloud className="w-4 h-4 text-slate-950" />
            Upload New Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onDelete={handleDeleteDocument} />
          ))}
        </div>
      )}
    </div>
  );
}
