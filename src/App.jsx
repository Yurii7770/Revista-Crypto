import React, { useState, useEffect } from 'react';
import { authService, dbService, isDemoMode } from './services/supabase';
import Sidebar from './components/Sidebar';
import AnalyticsPanel from './components/AnalyticsPanel';
import FutureJournal from './components/FutureJournal';
import Web3Activity from './components/Web3Activity';
import BalanceManager from './components/BalanceManager';
import AIReview from './components/AIReview';
import Auth from './components/Auth';
import { AlertCircle, X, Menu } from 'lucide-react';

// Dynamic background imports for production build assets bundling
import futuresBg from './assets/futures_bg.png';
import web3Bg from './assets/web3_bg.png';
import balanceBg from './assets/balance_bg.png';
import aiBg from './assets/ai_bg.png';
import logoImg from './assets/logo.png';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('futures');
  const [trades, setTrades] = useState([]);
  const [activities, setActivities] = useState([]);
  const [balances, setBalances] = useState([]);
  const [selectedTradeForAudit, setSelectedTradeForAudit] = useState(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [activePositions, setActivePositions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map active tab to subtle CSS geometric pattern classes
  const bgPatterns = {
    futures: 'bg-pattern-futures',
    web3: 'bg-pattern-web3',
    balance: 'bg-pattern-balance',
    ai: 'bg-pattern-ai'
  };
  const activePattern = bgPatterns[activeTab] || 'bg-pattern-futures';

  // Map active tab to background image assets
  const bgImages = {
    futures: futuresBg,
    web3: web3Bg,
    balance: balanceBg,
    ai: aiBg
  };
  const activeBg = bgImages[activeTab] || futuresBg;

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

  // 2. Load trades, activities, and balances when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [tradesRes, activitiesRes, balancesRes] = await Promise.all([
        dbService.getTrades(),
        dbService.getActivities(),
        dbService.getBalances()
      ]);
      
      if (tradesRes.data) setTrades(tradesRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
      if (balancesRes.data) setBalances(balancesRes.data);
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

  // Update Exchange Balances
  const handleUpdateBalance = async (exchangeName, balanceAmount) => {
    const { data, error } = await dbService.updateBalance(exchangeName, balanceAmount);
    if (error) throw error;
    if (data) {
      setBalances(prev => {
        const index = prev.findIndex(b => b.exchange_name === exchangeName);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });
    }
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
    <div className="flex flex-col md:flex-row bg-slate-900 min-h-screen">
      {/* Mobile Sticky Header */}
      <header className="md:hidden bg-slate-950/80 border-b border-slate-800/80 p-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center w-8 h-8">
            <img src={logoImg} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <span className="font-bold text-xs tracking-wider text-slate-100 uppercase">Revista Crypto</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Left Sidebar (Desktop fixed / Mobile sliding drawer) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
        onToggleHelp={() => setShowConfigHelp(prev => !prev)}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto h-screen p-4 sm:p-8 relative transition-all duration-500 ${activePattern}`}>
        {/* Subtle dynamic background image (very low opacity to act as texture) */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-[0.07] mix-blend-overlay pointer-events-none transition-all duration-700"
          style={{ backgroundImage: `url(${activeBg})` }}
        ></div>

        {/* Glow ambient background items */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-slate-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Environment Config Help Notification in Demo mode */}
          {isDemoMode && showConfigHelp && (
            <div className="p-4 bg-slate-800/80 border border-slate-700/60 backdrop-blur-md rounded-2xl flex items-start justify-between gap-4 shadow-xl text-left">
              <div className="flex gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Connect to Real Database &amp; AI Coach</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    The application is currently running on a local mock database (LocalStorage) with pre-populated transactions. 
                    To connect your live Supabase database and analyze trades via OpenRouter, edit the <code className="text-amber-300 font-mono text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">.env</code> file in the root folder with the following variables:
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

          {/* Core Analytics Panel (Only shown on Journal tabs to save space) */}
          {(activeTab === 'futures' || activeTab === 'web3') && (
            <AnalyticsPanel trades={trades} activities={activities} mode={activeTab} />
          )}

          {/* Router views depending on Active Tab */}
          <div className="tab-transition-container" key={activeTab}>
            {activeTab === 'futures' && (
              <FutureJournal
                trades={trades}
                onAddTrade={handleAddTrade}
                onDeleteTrade={handleDeleteTrade}
                onTriggerAudit={handleTriggerAudit}
                activePositions={activePositions}
              />
            )}

            {activeTab === 'web3' && (
              <Web3Activity
                activities={activities}
                onAddActivity={handleAddActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            )}

            {activeTab === 'balance' && (
              <BalanceManager
                balances={balances}
                onUpdateBalance={handleUpdateBalance}
                trades={trades}
                activities={activities}
                activePositions={activePositions}
                setActivePositions={setActivePositions}
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
