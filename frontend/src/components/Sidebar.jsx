import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  UploadCloud,
  MessageSquareCode,
  ShieldAlert,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    {
      name: 'Analytics Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Document Repository',
      path: '/documents',
      icon: FileSpreadsheet,
      badge: 'Live',
    },
    {
      name: 'Upload & Process',
      path: '/upload',
      icon: UploadCloud,
      badge: 'Gemini',
      badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    },
    {
      name: 'Knowledge Copilot',
      path: '/chat',
      icon: MessageSquareCode,
      badge: 'Q&A',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1 mb-8">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Workspace Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/60 text-cyan-300 border border-cyan-800/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110 text-slate-400 group-hover:text-cyan-400" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* IDP Capabilities Highlight Box */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 shadow-inner">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xs font-semibold text-slate-200">IDP Rule Guard</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Automated cross-field validation, math reconciliation, and legal liability checks.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3 text-emerald-400" /> SQLite / Prisma
          </span>
          <span className="text-emerald-400 font-medium">99.9% Uptime</span>
        </div>
      </div>
    </aside>
  );
}
