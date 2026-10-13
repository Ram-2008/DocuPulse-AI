import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import {
  FileText,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  Zap,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState({ online: true, configured: false });

  useEffect(() => {
    analyticsAPI
      .getHealth()
      .then((res) => {
        setGeminiStatus({
          online: res.status === 'online',
          configured: res.geminiConfigured,
        });
      })
      .catch(() => {
        setGeminiStatus({ online: false, configured: false });
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickDemo = async () => {
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  DocuPulse<span className="text-cyan-400">.ai</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  IDP v2.0
                </span>
              </div>
            </Link>
          </div>

          {/* Center: AI Engine Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <div className={`w-2 h-2 rounded-full ${geminiStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>AI Multimodal Engine:</span>
            <span className="font-semibold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {geminiStatus.configured ? 'Google Gemini 2.5 Flash' : 'Hybrid AI / Rule Engine'}
            </span>
          </div>

          {/* Right Navigation Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/20 transition-all duration-200"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Upload Document
                </Link>

                <div className="h-6 w-px bg-slate-800 mx-1" />

                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-cyan-900/60 border border-cyan-700/50 flex items-center justify-center text-cyan-300 text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-medium text-slate-200 truncate max-w-[120px]">{user?.name || 'Analyst'}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role || 'analyst'}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900/80 border border-transparent hover:border-rose-900/40 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleQuickDemo}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/80 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  1-Click Demo Login
                </button>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md shadow-cyan-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-slate-950/95 border-b border-slate-800">
          {isAuthenticated ? (
            <>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs mb-3">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-slate-400">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-cyan-400 hover:bg-slate-800"
              >
                Upload Document
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-rose-400 hover:bg-slate-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuickDemo();
                }}
                className="w-full text-center px-4 py-2 rounded-lg text-sm font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800"
              >
                1-Click Demo Login
              </button>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-cyan-400 hover:bg-slate-800"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
