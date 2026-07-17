import React, { useState } from 'react';
import { Calendar, Filter, ArrowUpDown, Plus, Trash2, Search, Info } from 'lucide-react';
import ActivityModal from './ActivityModal';

export default function Web3Activity({ activities = [], onAddActivity, onDeleteActivity }) {
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredDescription, setHoveredDescription] = useState(null);

  // 1. Filter
  const filteredActivities = activities.filter(a => {
    const matchesType = filterType === 'All' || a.activity_name === filterType;
    const matchesSearch = (a.exchange_platform && a.exchange_platform.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (a.rationale && a.rationale.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // 2. Sort
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const dateA = new Date(a.activity_date).getTime();
    const dateB = new Date(b.activity_date).getTime();
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
      {/* Header and Log Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-700/30">
        <div>
          <h2 className="text-xl font-bold premium-title text-slate-100 flex items-center gap-2">
            Web3 & Alternate Activities
          </h2>
          <p className="text-xs text-slate-400 mt-1">Retrodrops, arbitrage trades, promo campaigns, and staking yields</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by platform or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500/80 text-slate-200"
          />
        </div>

        {/* Filter Activity Type */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-300"
          >
            <option value="All">All Activity Types</option>
            <option value="Promo Campaign">Promo Campaigns</option>
            <option value="Arbitrage">Arbitrage</option>
            <option value="Retrodrop">Retrodrops</option>
            <option value="Staking">Staking</option>
          </select>
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/30">
        <table className="w-full border-collapse text-left text-xs text-slate-300">
          <thead>
            <tr className="bg-slate-950/40 border-b border-slate-700/30 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Activity</th>
              <th className="py-3 px-4">Platform / DEX</th>
              <th className="py-3 px-4">Net PNL (USD)</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors focus:outline-none"
                >
                  <span>Activity Date</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {sortedActivities.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  No activities found. Click log activity button above to add a new record.
                </td>
              </tr>
            ) : (
              sortedActivities.map((act) => {
                const isProfit = Number(act.pnl) >= 0;
                
                return (
                  <tr key={act.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Activity name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-100 text-sm">
                        {act.activity_name}
                      </span>
                    </td>

                    {/* Platform */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700/50 text-[10px] font-semibold text-slate-400">
                        {act.exchange_platform}
                      </span>
                    </td>

                    {/* PnL */}
                    <td className={`py-3 px-4 font-bold ${
                      isProfit ? 'text-emerald-400 glow-emerald' : 'text-rose-400 glow-rose'
                    }`}>
                      {isProfit ? '+' : ''}${Number(act.pnl).toLocaleString()}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400">
                      {formatDate(act.activity_date)}
                    </td>

                    {/* Rationale description info tooltip */}
                    <td className="py-3 px-4 relative">
                      {act.rationale ? (
                        <div 
                          className="flex items-center gap-1 text-slate-400 cursor-help hover:text-slate-300 transition-colors"
                          onMouseEnter={() => setHoveredDescription(act.id)}
                          onMouseLeave={() => setHoveredDescription(null)}
                        >
                          <Info className="w-4 h-4" />
                          <span className="truncate max-w-[150px] block text-xs">View</span>
                          
                          {hoveredDescription === act.id && (
                            <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 shadow-xl text-xs font-normal whitespace-normal leading-relaxed">
                              {act.rationale}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        title="Delete"
                        className="p-1.5 bg-slate-850 hover:bg-rose-500/10 border border-slate-700/40 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500">
        <span>Showing {sortedActivities.length} of {activities.length} entries</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>All times are shown in your local timezone</span>
        </span>
      </div>

      {/* Modal Activity Form */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddActivity}
      />
    </div>
  );
}
