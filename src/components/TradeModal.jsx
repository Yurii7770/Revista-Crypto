import React, { useState } from 'react';
import { X, Calendar, DollarSign, AlertCircle, Sparkles } from 'lucide-react';

export default function TradeModal({ isOpen, onClose, onSave }) {
  const [tokenName, setTokenName] = useState('');
  const [direction, setDirection] = useState('Long');
  const [positionSize, setPositionSize] = useState('');
  const [exchange, setExchange] = useState('Binance');
  const [outcome, setOutcome] = useState('Take Profit');
  const [pnl, setPnl] = useState('');
  const [rationale, setRationale] = useState('');
  const [dateOpened, setDateOpened] = useState('');
  const [dateClosed, setDateClosed] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const sizeNum = Number(positionSize);
    const pnlNum = Number(pnl);

    if (isNaN(sizeNum) || sizeNum <= 0) {
      setValidationError('Position size must be a positive number');
      return;
    }

    if (isNaN(pnlNum)) {
      setValidationError('PNL value must be a number');
      return;
    }

    const openedTime = new Date(dateOpened).getTime();
    const closedTime = new Date(dateClosed).getTime();

    if (isNaN(openedTime) || isNaN(closedTime)) {
      setValidationError('Please provide valid open and close dates');
      return;
    }

    if (closedTime < openedTime) {
      setValidationError('Close date cannot be earlier than open date');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        token_name: tokenName.toUpperCase().trim(),
        direction,
        position_size: sizeNum,
        exchange,
        outcome,
        pnl: pnlNum,
        rationale: rationale.trim(),
        date_opened: new Date(dateOpened).toISOString(),
        date_closed: new Date(dateClosed).toISOString()
      });
      onClose();
      // Reset form
      setTokenName('');
      setDirection('Long');
      setPositionSize('');
      setExchange('Binance');
      setOutcome('Take Profit');
      setPnl('');
      setRationale('');
      setDateOpened('');
      setDateClosed('');
    } catch (err) {
      setValidationError(err.message || 'Failed to save trade');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Dialog Content */}
      <div className="w-full max-w-lg glass-panel relative z-10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-lg font-bold premium-title text-slate-100">Add Futures Position</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Token Name & Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Token</label>
              <input
                type="text"
                required
                placeholder="e.g. BTC, ETH, PEPE"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    direction === 'Long'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/5'
                      : 'bg-slate-900 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    direction === 'Short'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-md shadow-rose-500/5'
                      : 'bg-slate-900 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Short
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Position Size & Exchange */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Position Size (USD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-xs">$</span>
                <input
                  type="text"
                  required
                  placeholder="1000"
                  value={positionSize}
                  onChange={(e) => setPositionSize(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Exchange</label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
              >
                <option value="Binance">Binance</option>
                <option value="Bybit">Bybit</option>
                <option value="OKX">OKX</option>
                <option value="BingX">BingX</option>
                <option value="DEX / Other">DEX / Other</option>
              </select>
            </div>
          </div>

          {/* Row 3: Outcome & PNL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Outcome</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
              >
                <option value="Take Profit">Take Profit</option>
                <option value="Stop Loss">Stop Loss</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Net PNL (USD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-xs">$</span>
                <input
                  type="text"
                  required
                  placeholder={outcome === 'Take Profit' ? '+250' : '-100'}
                  value={pnl}
                  onChange={(e) => setPnl(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Date Opened</label>
              <input
                type="datetime-local"
                required
                value={dateOpened}
                onChange={(e) => setDateOpened(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Date Closed</label>
              <input
                type="datetime-local"
                required
                value={dateClosed}
                onChange={(e) => setDateClosed(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-400"
              />
            </div>
          </div>

          {/* Row 5: Rationale */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Rationale and Setup</label>
            <textarea
              rows="3"
              required
              placeholder="What were the triggers for entry? Explain the technical setup..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200 resize-none"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 transition-all shadow-md shadow-emerald-500/10"
            >
              {saving ? 'Saving...' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
