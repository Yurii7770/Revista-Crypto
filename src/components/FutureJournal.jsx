import React, { useState } from 'react';
import { Calendar, Filter, ArrowUpDown, Plus, Trash2, BrainCircuit, Search, Info } from 'lucide-react';
import TradeModal from './TradeModal';

export default function FutureJournal({ trades = [], onAddTrade, onDeleteTrade, onTriggerAudit }) {
  const [filterDirection, setFilterDirection] = useState('All');
  const [filterExchange, setFilterExchange] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false); // Default latest first
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredRationale, setHoveredRationale] = useState(null);

  // 1. Filter trades
  const filteredTrades = trades.filter(t => {
    const matchesDirection = filterDirection === 'All' || t.direction === filterDirection;
    const matchesExchange = filterExchange === 'All' || t.exchange === filterExchange;
    const matchesSearch = t.token_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.rationale && t.rationale.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDirection && matchesExchange && matchesSearch;
  });

  // 2. Sort trades
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const dateA = new Date(a.date_closed).getTime();
    const dateB = new Date(b.date_closed).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-panel p-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-700/30">
        <div>
          <h2 className="text-xl font-bold premium-title text-slate-100 flex items-center gap-2">
            Futures Trading Journal
          </h2>
          <p className="text-xs text-slate-400 mt-1">Track and analyze leveraged crypto positions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by token or rationale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500/80 text-slate-200"
          />
        </div>

        {/* Filter Direction */}
        <div>
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-300"
          >
            <option value="All">All Directions</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </div>

        {/* Filter Exchange */}
        <div>
          <select
            value={filterExchange}
            onChange={(e) => setFilterExchange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-300"
          >
            <option value="All">All Exchanges</option>
            <option value="Binance">Binance</option>
            <option value="Bybit">Bybit</option>
            <option value="OKX">OKX</option>
            <option value="BingX">BingX</option>
            <option value="DEX / Other">DEX / Other</option>
          </select>
        </div>
      </div>

      {/* Grid Container / Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/30">
        <table className="w-full border-collapse text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950/40 border-b border-slate-700/30 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Token</th>
              <th className="py-3 px-4">Direction</th>
              <th className="py-3 px-4">Size (USD)</th>
              <th className="py-3 px-4">Exchange</th>
              <th className="py-3 px-4">Outcome</th>
              <th className="py-3 px-4">PNL (USD)</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors focus:outline-none"
                >
                  <span>Date Closed</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="py-3 px-4">Setup</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {sortedTrades.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500">
                  No trades found. Adjust filters or add a new position.
                </td>
              </tr>
            ) : (
              sortedTrades.map((trade) => {
                const isLong = trade.direction === 'Long';
                const isProfit = Number(trade.pnl) >= 0;
                
                return (
                  <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Token */}
                    <td className="py-3 px-4 font-bold text-slate-100 tracking-wide text-sm">
                      {trade.token_name}
                    </td>
                    
                    {/* Direction */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide ${
                        isLong 
                          ? 'text-emerald-400 bg-emerald-500/10' 
                          : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {trade.direction}
                      </span>
                    </td>
                    
                    {/* Position Size */}
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      ${Number(trade.position_size).toLocaleString()}
                    </td>
                    
                    {/* Exchange */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700/50 text-[10px] font-semibold text-slate-400">
                        {trade.exchange}
                      </span>
                    </td>
                    
                    {/* Outcome */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                        trade.outcome === 'Take Profit' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          trade.outcome === 'Take Profit' ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}></span>
                        {trade.outcome}
                      </span>
                    </td>
                    
                    {/* PNL */}
                    <td className={`py-3 px-4 font-bold ${
                      isProfit ? 'text-emerald-400 glow-emerald' : 'text-rose-400 glow-rose'
                    }`}>
                      {isProfit ? '+' : ''}${Number(trade.pnl).toLocaleString()}
                    </td>
                    
                    {/* Date Closed */}
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(trade.date_closed)}
                    </td>
                    
                    {/* Rationale Info Hover */}
                    <td className="py-3 px-4 relative">
                      {trade.rationale ? (
                        <div 
                          className="flex items-center gap-1 text-indigo-400 cursor-help hover:text-indigo-300 transition-colors"
                          onMouseEnter={() => setHoveredRationale(trade.id)}
                          onMouseLeave={() => setHoveredRationale(null)}
                        >
                          <Info className="w-4 h-4" />
                          <span className="truncate max-w-[100px] block text-xs">Details</span>
                          
                          {/* Tooltip */}
                          {hoveredRationale === trade.id && (
                            <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 shadow-xl text-xs font-normal whitespace-normal leading-relaxed">
                              {trade.rationale}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Trigger AI Audit directly */}
                        <button
                          onClick={() => onTriggerAudit(trade)}
                          title="AI Trade Audit"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-600 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete trade */}
                        <button
                          onClick={() => onDeleteTrade(trade.id)}
                          title="Delete"
                          className="p-1.5 bg-slate-850 hover:bg-rose-500/10 border border-slate-700/40 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500">
        <span>Showing {sortedTrades.length} of {trades.length} positions</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>All times are shown in your local timezone</span>
        </span>
      </div>

      {/* Trade Modal Form */}
      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddTrade}
      />
    </div>
  );
}
