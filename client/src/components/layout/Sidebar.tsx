import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Bot,
  BrainCircuit,
  Target,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', path: '/expenses', icon: Receipt },
  { label: 'Receipts & RAG', path: '/receipts', icon: FileText },
  { label: 'AI Assistant', path: '/assistant', icon: Bot },
  { label: 'Agent Reports', path: '/agent-reports', icon: BrainCircuit, badge: 'Multi-Agent' },
  { label: 'Budgets & Goals', path: '/budgets', icon: Target },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0E1322] border-r border-gray-800/80 flex flex-col min-h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
          L
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            ledger <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">AI</span>
          </h1>
          <p className="text-[11px] text-gray-400">Intelligent Finance OS</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Main Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* AI Intelligence Status Card in Sidebar */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-gray-900 border border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Agent Pipeline</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
          Analysis, Budgeting & Recommendation agents ready to evaluate your spending.
        </p>
        <NavLink
          to="/agent-reports"
          className="inline-flex items-center justify-center w-full py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition-colors"
        >
          Run Multi-Agent ➔
        </NavLink>
      </div>
    </aside>
  );
};
