import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw, Edit2, Check, X, AlertCircle, Key, Trash2, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';
import PnLChart from './PnLChart';
import { dbService } from '../services/supabase';

export default function BalanceManager({ balances = [], onUpdateBalance, trades = [], activities = [] }) {
  const [editingExchange, setEditingExchange] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // API Integration States
  const [apiKeys, setApiKeys] = useState([]);
  const [activePositions, setActivePositions] = useState([]);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiSecretInput, setApiSecretInput] = useState('');
  const [isConfiguringApi, setIsConfiguringApi] = useState(false);
  const [syncingExchange, setSyncingExchange] = useState(null);

  // Load configured API keys on mount
  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data, error: err } = await dbService.getApiKeys();
      if (!err && data) {
        setApiKeys(data);
      }
    } catch (e) {
      console.error("Failed to load API keys", e);
    }
  };

  const handleSaveApiKeys = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!apiKeyInput.trim() || !apiSecretInput.trim()) {
      setError('Please provide both API Key and API Secret');
      return;
    }

    setLoading(true);
    try {
      // 1. Encrypt API Secret on backend first (returns { encrypted, iv })
      const { encrypted, iv } = await dbService.encryptSecret(apiSecretInput.trim());
      
      // 2. Save encrypted credentials in database
      const { error: saveErr } = await dbService.saveApiKey(
        'Binance', 
        apiKeyInput.trim(), 
        encrypted, 
        iv
      );

      if (saveErr) throw saveErr;

      // Reset form & reload keys
      setApiKeyInput('');
      setApiSecretInput('');
      setIsConfiguringApi(false);
      await fetchApiKeys();
    } catch (err) {
      setError(err.message || 'Failed to save API credentials securely');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (exchangeName) => {
    setError('');
    if (!confirm(`Are you sure you want to disconnect the API key for ${exchangeName}?`)) return;

    setLoading(true);
    try {
      const { error: delErr } = await dbService.deleteApiKey(exchangeName);
      if (delErr) throw delErr;
      
      // Reload keys and clear active positions for that exchange
      setActivePositions([]);
      await fetchApiKeys();
    } catch (err) {
      setError(err.message || 'Failed to remove API configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncExchange = async (exchangeName) => {
    setError('');
    const keyEntry = apiKeys.find(k => k.exchange_name === exchangeName);
    if (!keyEntry) {
      setError(`No API configuration found for ${exchangeName}`);
      return;
    }

    setSyncingExchange(exchangeName);
    try {
      // Trigger secure sync proxy
      const { data, error: syncErr } = await dbService.syncExchangeData(
        exchangeName, 
        keyEntry.api_key, 
        keyEntry.api_secret, 
        keyEntry.iv
      );

      if (syncErr) throw new Error(syncErr);

      if (data) {
        // 1. Update the balance in local state and database
        await onUpdateBalance(exchangeName, data.balance);
        
        // 2. Save positions to display
        if (data.positions) {
          setActivePositions(data.positions);
        }
      }
    } catch (err) {
      setError(err.message || `Failed to sync live data from ${exchangeName}. Please check credentials.`);
    } finally {
      setSyncingExchange(null);
    }
  };

  const standardExchanges = ['Binance', 'Bybit', 'OKX', 'BingX', 'DEX / Other'];

  // Resolve balances array, ensuring all standard exchanges have an entry
  const resolvedBalances = standardExchanges.map(name => {
    const entry = balances.find(b => b.exchange_name === name);
    return {
      exchange_name: name,
      balance: entry ? Number(entry.balance) : 0,
      updated_at: entry ? entry.updated_at : null
    };
  });

  const totalPortfolio = resolvedBalances.reduce((sum, b) => sum + b.balance, 0);

  const handleStartEdit = (exchange) => {
    setEditingExchange(exchange.exchange_name);
    setEditValue(exchange.balance.toString());
    setError('');
  };

  const handleSaveEdit = async (exchangeName) => {
    setError('');
    const amount = Number(editValue);
    if (isNaN(amount) || amount < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    setLoading(true);
    try {
      await onUpdateBalance(exchangeName, amount);
      setEditingExchange(null);
    } catch (err) {
      setError(err.message || 'Failed to update balance');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never updated';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isBinanceConnected = apiKeys.some(k => k.exchange_name === 'Binance');

  return (
    <div className="space-y-6">
      {/* Portfolio Card Header */}
      <div className="glass-panel p-6 relative overflow-hidden shine-effect">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold premium-title text-slate-100 flex items-center gap-2">
              Portfolio Balance Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-1">Manage and track your funds across multiple exchanges</p>
          </div>
          <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-3.5 shadow-inner">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Total Balance</span>
              <span className="text-2xl font-bold premium-title tracking-tight text-slate-100 mt-0.5 block">
                ${totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Balances & Platform Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Exchange balance cards */}
        <div className="lg:col-span-2 space-y-4">
          {resolvedBalances.map((item) => {
            const isEditing = editingExchange === item.exchange_name;
            const allocation = totalPortfolio > 0 ? (item.balance / totalPortfolio) * 100 : 0;
            const isSyncing = syncingExchange === item.exchange_name;
            const hasApi = apiKeys.some(k => k.exchange_name === item.exchange_name);

            return (
              <div 
                key={item.exchange_name} 
                className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-slate-700/50"
              >
                {/* Brand & Last Updated */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-slate-200 text-sm tracking-wide">{item.exchange_name}</h4>
                    {hasApi && (
                      <span className="flex items-center gap-1 text-[8px] bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-400 font-semibold">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span> API Connected
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 block mt-1">
                    Last updated: {formatDate(item.updated_at)}
                  </span>
                </div>

                {/* Inline Editing Control, Display value or Sync button */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">$</span>
                        <input
                          type="text"
                          required
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-28 pl-6 pr-2 py-1.5 bg-slate-900 border border-slate-700 focus:outline-none focus:border-emerald-500 rounded-xl text-xs text-slate-200"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveEdit(item.exchange_name)}
                        disabled={loading}
                        className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-lg transition-all"
                      >
                        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setEditingExchange(null)}
                        className="p-1.5 bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3.5">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-100">
                          ${item.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                          Allocation: {allocation.toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Live API sync button */}
                      {hasApi && (
                        <button
                          onClick={() => handleSyncExchange(item.exchange_name)}
                          disabled={isSyncing}
                          className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-emerald-400 rounded-xl transition-all shadow-[0_0_10px_rgba(0,0,0,0.15)] flex items-center justify-center shrink-0"
                          title="Sync live balance & positions"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/50 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: Allocation Chart (Linear Bars) */}
        <div className="glass-panel p-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider premium-title">Portfolio Allocation</h3>
            <p className="text-[10px] text-slate-500 mt-1">Capital weight distribution by exchange platform</p>
          </div>

          <div className="space-y-4">
            {resolvedBalances.map((item) => {
              const allocation = totalPortfolio > 0 ? (item.balance / totalPortfolio) * 100 : 0;
              return (
                <div key={item.exchange_name} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-slate-400">{item.exchange_name}</span>
                    <span className="text-slate-300">{allocation.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                      style={{ width: `${allocation}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Security API configurations panel */}
      <div className="glass-panel p-5 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-700/30 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider premium-title flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" /> Exchange API Connections
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Securely fetch real-time assets and positions. Keys are encrypted at rest.</p>
          </div>
          {!isBinanceConnected && !isConfiguringApi && (
            <button
              onClick={() => setIsConfiguringApi(true)}
              className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-[10px] transition-all"
            >
              Connect Binance API
            </button>
          )}
        </div>

        {/* Warn about Read-Only scope */}
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-3 text-[10px] text-slate-400 leading-normal">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-400">Security Requirement:</strong> Always enable <strong className="text-slate-200">Read-Only (Enable Reading)</strong> only. Never enable Spot/Futures Trade or Withdrawals on your exchange API key. Your credentials are encrypted on the server using AES-256-CBC and are never exposed to the client.
          </div>
        </div>

        {/* Save API Key form */}
        {isConfiguringApi && (
          <form onSubmit={handleSaveApiKeys} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-4 tab-transition-container" autoComplete="off">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-[10px] font-bold text-slate-300">New Binance API Config</span>
              <button 
                type="button" 
                onClick={() => setIsConfiguringApi(false)} 
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">API Key</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  name="binance_api_key_field"
                  placeholder="Enter Binance API key"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-slate-500 uppercase mb-1">API Secret</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  name="binance_api_secret_field"
                  placeholder="Enter Binance API Secret"
                  value={apiSecretInput}
                  onChange={(e) => setApiSecretInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/60 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfiguringApi(false)}
                className="px-3.5 py-2 border border-slate-700/60 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-[10px] font-bold rounded-xl transition-all"
              >
                {loading ? 'Encrypting...' : 'Save Encrypted'}
              </button>
            </div>
          </form>
        )}

        {/* List configured keys */}
        {apiKeys.length > 0 && (
          <div className="space-y-3">
            {apiKeys.map(k => (
              <div key={k.id} className="flex justify-between items-center p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-slate-200 block">{k.exchange_name} Connection</span>
                    <span className="text-[9px] text-slate-500 block font-mono">Key: {k.api_key.substring(0, 8)}...{k.api_key.substring(k.api_key.length - 4)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSyncExchange(k.exchange_name)}
                    disabled={syncingExchange === k.exchange_name}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-emerald-400 border border-slate-700/50 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncingExchange === k.exchange_name ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                  <button
                    onClick={() => handleDeleteApiKey(k.exchange_name)}
                    disabled={loading}
                    className="p-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-xl transition-all"
                    title="Disconnect Exchange"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Active Positions Panel */}
      {activePositions.length > 0 && (
        <div className="glass-panel p-5 space-y-4 tab-transition-container">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider premium-title flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" /> Active Futures Positions (Binance)
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Real-time open contract positions pulled via API connection</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-wider pb-2">
                  <th className="py-2.5">Symbol</th>
                  <th>Side</th>
                  <th>Size</th>
                  <th>Entry Price</th>
                  <th>Mark Price</th>
                  <th>Margin Type</th>
                  <th className="text-right">Unrealized PNL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs font-medium">
                {activePositions.map((pos, idx) => {
                  const isLong = pos.positionAmt > 0;
                  const absAmt = Math.abs(pos.positionAmt);
                  const isProfit = pos.unRealizedProfit >= 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 font-bold text-slate-200">{pos.symbol}</td>
                      <td>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          isLong 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        }`}>
                          {isLong ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                          {isLong ? 'Long' : 'Short'} ({pos.leverage}x)
                        </span>
                      </td>
                      <td className="text-slate-300 font-mono">{absAmt}</td>
                      <td className="text-slate-400 font-mono">${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-slate-300 font-mono">${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-slate-400 capitalize">{pos.marginType}</td>
                      <td className={`text-right font-mono font-bold ${isProfit ? 'text-emerald-400 glow-emerald' : 'text-rose-400 glow-rose'}`}>
                        {isProfit ? '+' : ''}${pos.unRealizedProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Combined Equity Curve for Portfolio */}
      <PnLChart trades={trades} activities={activities} mode="combined" />
    </div>
  );
}
