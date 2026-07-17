import React, { useState } from 'react';
import { X, AlertCircle, Award } from 'lucide-react';
import CustomDateTimePicker from './CustomDateTimePicker';

export default function ActivityModal({ isOpen, onClose, onSave }) {
  const [activityName, setActivityName] = useState('Promo Campaign');
  const [customActivityName, setCustomActivityName] = useState('');
  const [exchangePlatform, setExchangePlatform] = useState('');
  const [pnl, setPnl] = useState('');
  const [rationale, setRationale] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const finalActivityName = activityName === 'Other' ? customActivityName.trim() : activityName;
    if (!finalActivityName) {
      setValidationError('Please enter a custom activity name');
      return;
    }

    const pnlNum = Number(pnl);
    if (isNaN(pnlNum)) {
      setValidationError('PNL value must be a number');
      return;
    }

    const dateVal = new Date(activityDate).getTime();
    if (isNaN(dateVal)) {
      setValidationError('Please provide a valid activity date');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        activity_name: finalActivityName,
        exchange_platform: exchangePlatform.trim(),
        pnl: pnlNum,
        rationale: rationale.trim(),
        activity_date: new Date(activityDate).toISOString()
      });
      onClose();
      // Reset
      setActivityName('Promo Campaign');
      setCustomActivityName('');
      setExchangePlatform('');
      setPnl('');
      setRationale('');
      setActivityDate('');
    } catch (err) {
      setValidationError(err.message || 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Dialog */}
      <div className="w-full max-w-lg glass-panel relative z-10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700/40 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Award className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-lg font-bold premium-title text-slate-100">Log Web3 Activity</h3>
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
          {/* Row 1: Activity Name & Exchange Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Activity Type</label>
              <select
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
              >
                <option value="Promo Campaign">Promo Campaign</option>
                <option value="Arbitrage">Arbitrage</option>
                <option value="Retrodrop">Retrodrop</option>
                <option value="Staking">Staking</option>
                <option value="Other">Other</option>
              </select>

              {activityName === 'Other' && (
                <input
                  type="text"
                  required
                  placeholder="Enter custom activity..."
                  value={customActivityName}
                  onChange={(e) => setCustomActivityName(e.target.value)}
                  className="w-full px-3.5 py-2 mt-2 bg-slate-900 border border-slate-700/50 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Platform / DEX</label>
              <input
                type="text"
                required
                placeholder="Jupiter, Uniswap, Bybit"
                value={exchangePlatform}
                onChange={(e) => setExchangePlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
              />
            </div>
          </div>

          {/* Row 2: PNL & Date (Polished Custom DateTimePicker) */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Net PNL (USD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-xs">$</span>
                <input
                  type="text"
                  required
                  placeholder="+500"
                  value={pnl}
                  onChange={(e) => setPnl(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-200"
                />
              </div>
            </div>
            <CustomDateTimePicker
              value={activityDate}
              onChange={setActivityDate}
              label="Activity Date"
            />
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description / Rules</label>
            <textarea
              rows="3"
              required
              placeholder="Describe the details of the activity, rewards structure, or arbitrage parameters..."
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
              {saving ? 'Saving...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
