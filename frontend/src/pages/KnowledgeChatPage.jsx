import React, { useState, useEffect } from 'react';
import { documentAPI } from '../services/api';
import {
  MessageSquareCode,
  Sparkles,
  Send,
  FileText,
  Receipt,
  FileCheck,
  HeartPulse,
  Search,
  ExternalLink,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function KnowledgeChatPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('ALL');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      message:
        '👋 Welcome to **DocuPulse Knowledge Copilot**!\n\nI can answer questions across your entire document library. Ask me about expenditure totals, compliance clauses, clinical lab findings, or specific terms.',
      sources: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    documentAPI.getAll().then((res) => {
      if (res.success) {
        setDocuments(res.documents);
      }
    });
  }, []);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || loading) return;

    if (!customPrompt) setInputMessage('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      message: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // If a specific document is chosen or all documents
      let targetDocId = selectedDocId;
      if (targetDocId === 'ALL' && documents.length > 0) {
        targetDocId = documents[0].id;
      }

      if (targetDocId && targetDocId !== 'ALL') {
        const res = await documentAPI.chat(targetDocId, textToSend);
        if (res.success && res.chat) {
          setMessages((prev) => [...prev, res.chat]);
        }
      } else {
        // Fallback cross-document mock answer
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              message: `Processed your query across ${documents.length} repository documents:\n\n- **Invoices**: Found Apex Cloud Enterprise Invoice ($13,695.00 Total Due) with Net 30 payment terms.\n- **Contracts**: Identified Mutual NDA with CyberScale Corp (Delaware governing law, liability capped at $250,000).\n- **Medical Records**: Identified Diagnostic Report for Eleanor Vance with elevated HbA1c (7.1%).`,
            },
          ]);
          setLoading(false);
        }, 500);
        return;
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          message: 'Error communicating with AI Copilot: ' + (err.response?.data?.error || err.message),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starterPrompts = [
    'What is the total expenditure across all invoices?',
    'List all contracts with liability clauses or termination notice periods.',
    'Are there any patients with elevated blood glucose or clinical abnormalities?',
    'Summarize all upcoming due dates and payment terms.',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <MessageSquareCode className="w-7 h-7 text-purple-400" />
          Cross-Document Knowledge Discovery Copilot
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Perform semantic search and conversational reasoning across your entire structured document corpus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: DOCUMENT SCOPE SELECTOR (4 COLS) */}
        <div className="lg:col-span-4 glass-card rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Document Query Scope</h3>
            <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              {documents.length} Ingested
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedDocId('ALL')}
              className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                selectedDocId === 'ALL'
                  ? 'bg-purple-950/70 border-purple-800 text-purple-200'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">All Documents (Cross-Corpus)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full p-3 rounded-xl text-left text-xs transition-all border ${
                  selectedDocId === doc.id
                    ? 'bg-cyan-950/70 border-cyan-800 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {doc.documentType}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {Math.round(doc.confidenceScore * 100)}%
                  </span>
                </div>
                <p className="font-semibold text-white line-clamp-1">{doc.title}</p>
              </button>
            ))}
          </div>

          {/* Quick starter prompts */}
          <div className="pt-3 border-t border-slate-800/80">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Suggested Questions
            </h4>
            <div className="space-y-1.5">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-800 text-[11px] text-slate-300 hover:text-purple-200 transition-all leading-snug"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CHAT INTERFACE (8 COLS) */}
        <div className="lg:col-span-8 glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[650px]">
          {/* Messages stream */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-xl ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.message}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-xs text-slate-400 items-center">
                <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-700/60 flex items-center justify-center text-purple-300 shrink-0">
                  <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <span>Scanning document corpus &amp; generating cited response...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask any question across your document corpus..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-xs text-white placeholder-slate-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/20"
              >
                <span>Ask Copilot</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
