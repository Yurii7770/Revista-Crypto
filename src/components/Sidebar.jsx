import React from 'react';
import { BookOpen, Globe, BrainCircuit, LogOut, ShieldCheck, User } from 'lucide-react';
import { isDemoMode } from '../services/supabase';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'futures', label: 'Futures Journal', icon: BookOpen },
    { id: 'web3', label: 'Web3 Activity', icon: Globe },
    { id: 'ai', label: 'AI Review (Trading Coach)', icon: BrainCircuit },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700/40 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-700/30 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-wide premium-title text-slate-100 leading-none">
              Ledger Pro
            </h2>
            <span className="text-[10px] text-emerald-400/80 font-medium tracking-widest uppercase">
              Crypto Journal
            </span>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] w-fit font-medium bg-slate-800/80 border border-slate-700/50">
          <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
          <span className="text-slate-400">
            {isDemoMode ? 'Demo Mode (Local)' : 'Supabase Connected'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border-l-2 border-emerald-400 shadow-md shadow-emerald-500/5'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-700/30 bg-slate-950/20">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/30 border border-slate-700/20 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.user_metadata?.name || 'Trader'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {user?.email || 'trade@ledger.pro'}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-700/40 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
