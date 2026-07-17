import React, { useState, useEffect } from 'react';
import { authService, dbService, isDemoMode } from './services/supabase';
import Sidebar from './components/Sidebar';
import AnalyticsPanel from './components/AnalyticsPanel';
import FutureJournal from './components/FutureJournal';
import Web3Activity from './components/Web3Activity';
import AIReview from './components/AIReview';
import Auth from './components/Auth';
import { AlertCircle, Terminal, HelpCircle, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('futures');
  const [trades, setTrades] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedTradeForAudit, setSelectedTradeForAudit] = useState(null);
  const [showConfigHelp, setShowConfigHelp] = useState(true);

  // 1. Listen to Auth state changes
  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Load trades and activities when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [tradesRes, activitiesRes] = await Promise.all([
        dbService.getTrades(),
        dbService.getActivities()
      ]);
      
      if (tradesRes.data) setTrades(tradesRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
    } catch (err) {
      console.error("Error loading journal data:", err);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    authService.triggerMockAuthChanged();
    setUser(null);
  };

  // Add / Delete Trades
  const handleAddTrade = async (newTrade) => {
    const { data, error } = await dbService.addTrade(newTrade);
    if (error) throw error;
    if (data) {
      setTrades(prev => [data, ...prev]);
    }
  };

  const handleDeleteTrade = async (id) => {
    const { error } = await dbService.deleteTrade(id);
    if (error) throw error;
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  // Add / Delete Activities
  const handleAddActivity = async (newActivity) => {
    const { data, error } = await dbService.addActivity(newActivity);
    if (error) throw error;
    if (data) {
      setActivities(prev => [data, ...prev]);
    }
  };

  const handleDeleteActivity = async (id) => {
    const { error } = await dbService.deleteActivity(id);
    if (error) throw error;
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Switch to AI tab and select specific trade
  const handleTriggerAudit = (trade) => {
    setSelectedTradeForAudit(trade);
    setActiveTab('ai');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Loading Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="flex bg-slate-900 min-h-screen">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-8 relative">
        {/* Glow ambient background items */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Environment Config Help Notification in Demo mode */}
          {isDemoMode && showConfigHelp && (
            <div className="p-4 bg-slate-800/80 border border-slate-700/60 backdrop-blur-md rounded-2xl flex items-start justify-between gap-4 shadow-xl">
              <div className="flex gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Connect to Real Database &amp; AI Coach</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    The application is currently running on a local mock database (LocalStorage) with pre-populated transactions. 
                    To connect your live Supabase database and analyze trades via OpenRouter, create a <code className="text-amber-300 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">.env</code> file in the root folder with the following variables:
                  </p>
                  <pre className="text-[9px] bg-slate-950/80 text-emerald-400 p-2.5 rounded-xl border border-slate-800 mt-2 font-mono leading-normal select-all">
                    VITE_SUPABASE_URL=your_supabase_url{"\n"}
                    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key{"\n"}
                    VITE_OPENROUTER_API_KEY=your_openrouter_api_key
                  </pre>
                </div>
              </div>
              <button 
                onClick={() => setShowConfigHelp(false)}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Core Analytics Panel */}
          <AnalyticsPanel trades={trades} activities={activities} />

          {/* Router views depending on Active Tab */}
          <div className="transition-all duration-300">
            {activeTab === 'futures' && (
              <FutureJournal
                trades={trades}
                onAddTrade={handleAddTrade}
                onDeleteTrade={handleDeleteTrade}
                onTriggerAudit={handleTriggerAudit}
              />
            )}

            {activeTab === 'web3' && (
              <Web3Activity
                activities={activities}
                onAddActivity={handleAddActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            )}

            {activeTab === 'ai' && (
              <AIReview
                trades={trades}
                activities={activities}
                initialSelectedTrade={selectedTradeForAudit}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
