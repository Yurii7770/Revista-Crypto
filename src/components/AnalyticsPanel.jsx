import React from 'react';
import { Percent, BookOpen, Globe2, BarChart3 } from 'lucide-react';
import PnLChart from './PnLChart';

export default function AnalyticsPanel({ trades = [], activities = [], mode = 'futures' }) {
  const isFuturesMode = mode === 'futures';

  // 1. Futures metrics calculations
  const futuresPnL = trades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);
  const totalTradesCount = trades.length;
  const isFuturesPositive = futuresPnL >= 0;
  const winTradesCount = trades.filter(t => t.outcome === 'Take Profit').length;
  const winRate = totalTradesCount > 0 ? (winTradesCount / totalTradesCount) * 100 : 0;

  // 2. Web3 metrics calculations
  const activitiesPnL = activities.reduce((sum, a) => sum + Number(a.pnl || 0), 0);
  const web3Count = activities.length;
  const isWeb3Positive = activitiesPnL >= 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Grid Layout */}
      {isFuturesMode ? (
        // Futures Journal metrics layout
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Futures PNL */}
          <div className={`glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
            isFuturesPositive ? 'glow-card-emerald border-emerald-500/20' : 'glow-card-rose border-rose-500/20'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-700/5 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Futures PNL</span>
                <span className={`text-2xl font-bold premium-title tracking-tight mt-1.5 block ${
                  isFuturesPositive ? 'text-emerald-400 glow-emerald' : 'text-rose-400 glow-rose'
                }`}>
                  {isFuturesPositive ? '+' : ''}${futuresPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${
                isFuturesPositive 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Total closed positions
            </div>
          </div>

          {/* Futures Win Rate */}
          <div className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Win Rate</span>
                <span className="text-2xl font-bold premium-title tracking-tight text-slate-100 mt-1.5 block">
                  {winRate.toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                {winTradesCount} / {totalTradesCount}
              </span>
            </div>
          </div>

          {/* Closed Positions Count */}
          <div className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Closed Positions</span>
                <span className="text-2xl font-bold premium-title tracking-tight text-slate-100 mt-1.5 block">
                  {totalTradesCount}
                </span>
              </div>
              <div className="p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Futures market setups
            </div>
          </div>
        </div>
      ) : (
        // Web3 Activity metrics layout
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Web3 PNL */}
          <div className={`glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
            isWeb3Positive ? 'glow-card-emerald border-emerald-500/20' : 'glow-card-rose border-rose-500/20'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-700/5 to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Web3 PNL</span>
                <span className={`text-2xl font-bold premium-title tracking-tight mt-1.5 block ${
                  isWeb3Positive ? 'text-emerald-400 glow-emerald' : 'text-rose-400 glow-rose'
                }`}>
                  {isWeb3Positive ? '+' : ''}${activitiesPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${
                isWeb3Positive 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                <Globe2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Arbitrage, retrodrops, and staking earnings
            </div>
          </div>

          {/* Web3 Activities Count */}
          <div className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-slate-700/60">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Activities</span>
                <span className="text-2xl font-bold premium-title tracking-tight text-slate-100 mt-1.5 block">
                  {web3Count}
                </span>
              </div>
              <div className="p-2.5 bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Logged decentralized events
            </div>
          </div>
        </div>
      )}

      {/* SVG Equity Performance Chart filtered by mode */}
      <PnLChart trades={trades} activities={activities} mode={mode} />
    </div>
  );
}
