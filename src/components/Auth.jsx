import React, { useState } from 'react';
import { authService, isDemoMode } from '../services/supabase';
import { Shield, Key, Mail, Lock, AlertTriangle, AlertCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Auth({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const user = await authService.signUp(email, password);
        onAuthSuccess(user);
      } else {
        const user = await authService.signIn(email, password);
        onAuthSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 relative z-10 shine-effect">
        {/* Banner for Demo mode */}
        {isDemoMode && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Demo Mode (Local Storage)</span>
              Supabase credentials not set. You can enter any email/password to test. Data will be saved locally.
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-1 bg-slate-800 border border-slate-700/60 rounded-2xl mb-4 shadow-inner w-14 h-14 overflow-hidden">
            <img src={logoImg} className="w-full h-full object-contain" alt="Revista Crypto Logo" />
          </div>
          <h1 className="text-2xl font-bold premium-title tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Revista Crypto
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Elite Professional Trading Journal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trade@revista.crypto"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500/80 text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/50 rounded-xl text-sm focus:outline-none focus:border-emerald-500/80 text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Elite Account' : 'Sign In to Journal'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
