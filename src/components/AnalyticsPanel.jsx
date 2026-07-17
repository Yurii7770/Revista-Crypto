import React from 'react';
import { DollarSign, Percent, BarChart3, Globe2, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsPanel({ trades = [], activities = [] }) {
  // 1. Calculate Total PnL
  const futuresPnL = trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
  const activitiesPnL = activities.reduce((sum, a) => sum + Number(a.pnl || 0), 0);
  const totalPnL = futuresPnL + activitiesPnL;

  // 2. Calculate Win Rate %
  const totalTradesCount = trades.length;
  const winTradesCount = trades.filter(t => t.outcome === 'Take Profit').length;
  const winRate = totalTradesCount > 0 ? (winTradesCount / totalTradesCount) * 100 : 0;

  // 3. Alternate Web3 activities count
  const web3Count = activities.length;

  const isPnlPositive = totalPnL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. Total PNL Widget */}
      <div className={`glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        isPnlPositive ? 'glow-card-emerald border-emerald-500/20' : 'glow-card-rose border-rose-500/20'
      }`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-700/5 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total PNL</span>
            <span className={`text-2xl font-bold premium-title tracking-tight mt-1.5 block ${
              isPnlPositive ? 'text-emerald-400 glow-emerald' : 'text-rose-400 glow-rose'
            }`}>
              {isPnlPositive ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl border ${
            isPnlPositive 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {isPnlPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <span>Futures: <strong className={futuresPnL >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90'}>${futuresPnL.toFixed(0)}</strong></span>
          <span className="text-slate-700">•</span>
          <span>Web3: <strong className={activitiesPnL >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90'}>${activitiesPnL.toFixed(0)}</strong></span>
        </div>
      </div>

      {/* 2. Futures Win Rate Widget */}
      <div className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Futures Win Rate</span>
            <span className="text-2xl font-bold premium-title tracking-tight text-slate-100 mt-1.5 block">
              {winRate.toFixed(1)}%
            </span>
          </div>
          <div className="p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-indigo-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${winRate}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
            {winTradesCount} / {totalTradesCount}
          </span>
        </div>
      </div>

      {/* 3. Total Closed Positions Widget */}
      <div className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Closed Positions</span>
            <span className="text-2xl font-bold premium-title tracking-tight text-slate-100 mt-1.5 block">
              {totalTradesCount}
            </span>
          </div>
          <div className="p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-300">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Futures market positions
        </div>
      </div>

      {/* 4. Alternate Web3 Activities Widget */}
      <div className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Web3 Activity</span>
            <span className="text-2xl font-bold premium-title tracking-tight text-slate-100 mt-1.5 block">
              {web3Count}
            </span>
          </div>
          <div className="p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-emerald-400">
            <Globe2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Staking, retrodrops, arbitrage
        </div>
      </div>
    </div>
  );
}
