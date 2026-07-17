import React from 'react';
import { BookOpen, Globe, BrainCircuit, LogOut, Wallet, User } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const menuItems = [
    { id: 'futures', label: 'Futures Journal', icon: BookOpen },
    { id: 'web3', label: 'Web3 Activity', icon: Globe },
    { id: 'balance', label: 'Portfolio Balance', icon: Wallet },
    { id: 'ai', label: 'AI Review (Trading Coach)', icon: BrainCircuit },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700/40 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-700/30 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-slate-950/20 border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center w-10 h-10 shrink-0">
            <img src={logoImg} className="w-full h-full object-contain" alt="Revista Crypto Logo" />
          </div>
          <div>
            <h2 className="font-bold text-base tracking-wide premium-title text-slate-100 leading-none">
              Revista Crypto
            </h2>
            <span className="text-[10px] text-emerald-400/80 font-medium tracking-widest uppercase">
              Trading Journal
            </span>
          </div>
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

      {/* User Session Info */}
      {user && (
        <div className="p-4 border-t border-slate-700/30 bg-slate-950/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-355">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-200 block truncate">
                {user.email}
              </span>
              <span className="text-[9px] text-slate-500 block truncate font-medium">
                Active Session
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-rose-950/10 hover:text-rose-400 hover:border-rose-950/30 border border-slate-700/30 text-slate-400 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
