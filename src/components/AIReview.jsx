import React, { useState, useEffect } from 'react';
import { analyzeSingleTrade, analyzeWeeklyTrades, isAiDemoMode } from '../services/openrouter';
import { BrainCircuit, Play, Sparkles, ChevronRight, CheckSquare, Award, AlertTriangle, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';

export default function AIReview({ trades = [], activities = [], initialSelectedTrade = null }) {
  const [activeSubTab, setActiveSubTab] = useState('single'); // 'single' or 'weekly'
  const [selectedTradeId, setSelectedTradeId] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState('');
  const [auditError, setAuditError] = useState('');

  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState(null);
  const [weeklyError, setWeeklyError] = useState('');

  // 1. Get closed trades
  const closedTrades = trades.filter(t => t.outcome === 'Take Profit' || t.outcome === 'Stop Loss');

  // Set initial selected trade if passed from parent
  useEffect(() => {
    if (initialSelectedTrade) {
      setSelectedTradeId(initialSelectedTrade.id);
      setActiveSubTab('single');
      handleRunAudit(initialSelectedTrade);
    } else if (closedTrades.length > 0 && !selectedTradeId) {
      setSelectedTradeId(closedTrades[0].id);
    }
  }, [initialSelectedTrade, trades]);

  const handleRunAudit = async (tradeToAudit = null) => {
    const targetTrade = tradeToAudit || closedTrades.find(t => t.id === selectedTradeId);
    if (!targetTrade) {
      setAuditError('Select a trade for analysis');
      return;
    }

    setAuditLoading(true);
    setAuditError('');
    setAuditResult('');

    try {
      const review = await analyzeSingleTrade(targetTrade);
      setAuditResult(review);
    } catch (err) {
      setAuditError(err.message || 'Failed to generate audit. Check your API credentials.');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRunWeekly = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter trades in the last 7 days
    const recentTrades = trades.filter(t => new Date(t.date_closed) >= sevenDaysAgo);
    const recentActivities = activities.filter(a => new Date(a.activity_date) >= sevenDaysAgo);

    if (recentTrades.length === 0 && recentActivities.length === 0) {
      setWeeklyError('No trades or Web3 activities found in the last 7 days to analyze.');
      return;
    }

    setWeeklyLoading(true);
    setWeeklyError('');
    setWeeklyResult(null);

    try {
      const report = await analyzeWeeklyTrades(recentTrades, recentActivities);
      setWeeklyResult(report);
    } catch (err) {
      setWeeklyError(err.message || 'Failed to generate weekly retrospective.');
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Helper to parse simple markdown to JSX safely
  const parseInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-slate-100 font-bold font-sans">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Quotes
      if (line.trim().startsWith('>')) {
        const content = line.trim().substring(1).trim();
        return (
          <blockquote key={idx} className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-500/5 text-slate-300 rounded-r-xl italic text-xs leading-relaxed">
            {parseInline(content)}
          </blockquote>
        );
      }
      // H3
      if (line.startsWith('###')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-200 mt-5 mb-2 uppercase tracking-wider premium-title flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
            {parseInline(line.substring(3).trim())}
          </h4>
        );
      }
      // H2
      if (line.startsWith('##')) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-100 mt-6 mb-3 premium-title">
            {parseInline(line.substring(2).trim())}
          </h3>
        );
      }
      // Lists - or *
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const content = line.trim().substring(1).trim();
        return (
          <li key={idx} className="ml-5 list-disc my-1.5 text-slate-300 text-xs">
            {parseInline(content)}
          </li>
        );
      }
      // Numbered lists
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={idx} className="flex gap-2.5 my-3 items-start text-xs text-slate-300">
            <span className="font-bold text-emerald-400 bg-emerald-500/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">
              {numMatch[1]}
            </span>
            <div className="leading-relaxed">{parseInline(numMatch[2])}</div>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="my-2 text-xs text-slate-300 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-700/50 w-fit rounded-xl">
        <button
          onClick={() => setActiveSubTab('single')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'single'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Post-Mortem Audit
        </button>
        <button
          onClick={() => setActiveSubTab('weekly')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'weekly'
              ? 'bg-slate-800 text-emerald-400 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Weekly Retrospective
        </button>
      </div>

      {isAiDemoMode && (
        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-400/90 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            OpenRouter API Key not configured. Enabled simulated AI coach reviews.
          </div>
        </div>
      )}

      {/* Mode A: Single Trade Audit */}
      {activeSubTab === 'single' && (
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/30">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold premium-title text-slate-100">Single Trade Audit (Post-Mortem)</h3>
          </div>

          {closedTrades.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              You do not have any closed trades yet. Add a trade and set the outcome to "Take Profit" or "Stop Loss" to run an audit.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Select a closed position</label>
                  <select
                    value={selectedTradeId}
                    onChange={(e) => setSelectedTradeId(e.target.value)}
                    disabled={auditLoading}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                  >
                    {closedTrades.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.token_name} ({t.direction}) — {formatDateShort(t.date_closed)} | PNL: ${t.pnl} | Outcome: {t.outcome}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleRunAudit()}
                  disabled={auditLoading || !selectedTradeId}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {auditLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                  <span>Run Trade Audit</span>
                </button>
              </div>

              {auditError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{auditError}</span>
                </div>
              )}

              {/* Skeleton Loader during Audit */}
              {auditLoading && <AuditSkeleton />}

              {/* Audit Content Result */}
              {auditResult && (
                <div className="glass-card p-6 border-slate-700/40 glow-card-emerald relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 right-0 p-3 text-slate-700 pointer-events-none">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="prose prose-invert max-w-none text-slate-300">
                    {renderMarkdown(auditResult)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode B: Weekly Retrospective */}
      {activeSubTab === 'weekly' && (
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/30">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold premium-title text-slate-100">Weekly Retrospective</h3>
                <p className="text-[10px] text-slate-400">Batch AI analysis of trading behavior and systemic errors over the last 7 days</p>
              </div>
            </div>
            <button
              onClick={handleRunWeekly}
              disabled={weeklyLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50"
            >
              {weeklyLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Weekly Report</span>
            </button>
          </div>

          {weeklyError && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{weeklyError}</span>
            </div>
          )}

          {/* Skeleton Loader during Weekly Report */}
          {weeklyLoading && <WeeklySkeleton />}

          {/* Weekly Retro Result Panels */}
          {weeklyResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {/* 1. Strong Side Card */}
              <div className="glass-card p-5 border-emerald-500/20 glow-card-emerald relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-3.5 border-b border-slate-700/30 pb-2.5 text-emerald-400">
                  <Award className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider font-sans">🔥 Core Strength</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed flex-1">
                  {weeklyResult.strongSide}
                </p>
              </div>

              {/* 2. Main Vulnerability Card */}
              <div className="glass-card p-5 border-rose-500/20 glow-card-rose relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-3.5 border-b border-slate-700/30 pb-2.5 text-rose-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider font-sans">⚠️ Main Vulnerability</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed flex-1">
                  {weeklyResult.vulnerability}
                </p>
              </div>

              {/* 3. Checklist Rules Card */}
              <div className="glass-card p-5 border-indigo-500/20 relative overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 mb-3.5 border-b border-slate-700/30 pb-2.5 text-indigo-400">
                  <CheckSquare className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider font-sans">📋 Weekly Checklist</span>
                </div>
                <div className="space-y-3 flex-1">
                  {weeklyResult.checklist?.map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-start text-xs text-slate-300">
                      <span className="font-bold text-indigo-400 bg-indigo-500/10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!weeklyResult && !weeklyLoading && (
            <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-700/30 rounded-2xl bg-slate-950/20">
              <Lightbulb className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              Click the "Generate Weekly Report" button above to analyze your trade history over the past 7 days.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sub Helpers
function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
}

// Skeleton loaders
function AuditSkeleton() {
  return (
    <div className="glass-card p-6 border-slate-700/30 animate-skeleton space-y-4">
      <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-800/80 rounded w-full"></div>
        <div className="h-3.5 bg-slate-800/80 rounded w-5/6"></div>
      </div>
      <div className="h-4 bg-slate-700/50 rounded w-1/3 mt-4"></div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-800/80 rounded w-full"></div>
        <div className="h-3.5 bg-slate-800/80 rounded w-4/5"></div>
      </div>
      <div className="h-4 bg-slate-700/50 rounded w-1/5 mt-4"></div>
      <div className="h-8 bg-slate-800/50 rounded border-l-4 border-indigo-500/30 w-full"></div>
    </div>
  );
}

function WeeklySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-5 border-slate-700/30 animate-skeleton space-y-4">
          <div className="h-3.5 bg-slate-700/50 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-800/80 rounded w-full"></div>
            <div className="h-3 bg-slate-800/80 rounded w-5/6"></div>
            <div className="h-3 bg-slate-800/80 rounded w-4/5"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
