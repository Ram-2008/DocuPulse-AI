import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Cpu,
  Database,
  Search,
  CheckCircle,
  AlertTriangle,
  Layers,
  Lock,
  GitBranch,
  Terminal,
} from 'lucide-react';

export default function LandingPage() {
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handle1ClickDemo = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Background ambient glowing orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Intelligent Document Processing (IDP) Challenge Submission
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Transform Unstructured Business Documents into{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
              Actionable Intelligence
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
            Powered by <strong>Google Gemini Multimodal AI</strong> &amp; an enterprise rule engine. Automate
            understanding, classification, schema extraction, mathematical anomaly detection, and interactive knowledge
            discovery with Human-in-the-Loop review.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={handle1ClickDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              1-Click Instant Demo
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-center"
            >
              Sign In to Workspace
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            No signup or API key required to test • Pre-seeded sample invoices, NDAs &amp; clinical records included
          </p>
        </section>

        {/* HACKATHON BRIEF / PROBLEM STATEMENT & SOLUTION SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Problem Statement Card */}
            <div className="glass-card rounded-3xl p-8 border border-rose-900/40 bg-gradient-to-br from-slate-900/90 via-slate-950 to-rose-950/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/80 text-xs font-bold uppercase mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Problem Statement
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">The Unstructured Document Crisis</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Organizations process thousands of invoices, clinical records, contracts, and tax forms weekly. Over 80%
                of this enterprise data is trapped in heterogeneous formats (scans, PDFs, images).
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Costly Human Bottlenecks:</strong> Manual transcription takes 4-7 days per document batch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Undetected Financial &amp; Legal Discrepancies:</strong> 15% rate of overlooked math calculation errors and uncapped liabilities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Dark Data Silos:</strong> Cross-document questions cannot be searched or queried without tedious manual reading.</span>
                </li>
              </ul>
            </div>

            {/* Solution Description Card */}
            <div className="glass-card rounded-3xl p-8 border border-cyan-800/60 bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950/20">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 text-xs font-bold uppercase mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Solution Architecture
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">DocuPulse AI Intelligent Processing</h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                An end-to-end Intelligent Document Processing platform combining Google Gemini multimodal understanding,
                automated rule verification, and Human-in-the-Loop governance.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>Multimodal Understanding:</strong> Zero-shot classification and schema extraction from PDFs, images, and text.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>Automated Anomaly Detection:</strong> Mathematical reconciliation (Subtotal + Tax vs Total) and high-risk contract clause detection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span><strong>Conversational Knowledge Copilot:</strong> Interactive Q&amp;A across documents with field citations and instant CSV/JSON exports.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4 CORE CAPABILITIES SHOWCASE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Enterprise-Grade Document Processing Pipeline</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              From ingestion to downstream operational systems, every stage is audited, validated, and verified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-cyan-700/60 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">1. Ingestion &amp; Classification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accepts multi-page PDFs, scans, and images. Automatically identifies document taxonomy (Invoices, Legal NDAs, Medical Labs).
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-blue-700/60 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">2. Multimodal AI Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google Gemini API extracts key-value fields, itemized line tables, and named entities with confidence scoring per field.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-amber-700/60 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">3. Rule Guard &amp; Validation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Runs math checks, cross-field integrity, date sequence checks, and liability risk detection, flagging anomalies for Human-in-the-Loop review.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-purple-700/60 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-400 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">4. Knowledge Discovery &amp; Q&amp;A</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask conversational questions to interrogate your document repository, receive field citations, and export to CSV or JSON.
              </p>
            </div>
          </div>
        </section>

        {/* TECH STACK VERIFICATION BAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/80">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Aligned with Hackathon Submission Tech Stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Layers className="w-4 h-4 text-cyan-400" /> React 19 &amp; Vite
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Terminal className="w-4 h-4 text-emerald-400" /> Node.js &amp; Express
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Lock className="w-4 h-4 text-amber-400" /> JWT &amp; bcrypt
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Database className="w-4 h-4 text-blue-400" /> SQLite / PostgreSQL (Prisma)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <Sparkles className="w-4 h-4 text-purple-400" /> Google Gemini API
            </span>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="glass-card rounded-3xl p-10 border border-cyan-800/60 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Intelligent Document Processing?</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8">
              Explore the live extraction studio with preloaded sample invoices, contracts, and medical lab reports.
            </p>
            <button
              onClick={handle1ClickDemo}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-xl shadow-cyan-500/30 transition-all transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              Launch Live Application Demo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
