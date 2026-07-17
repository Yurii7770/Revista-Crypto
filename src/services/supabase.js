import { createClient } from '@supabase/supabase-js';
import { mockDb } from './mockDb';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl === "YOUR_SUPABASE_URL" || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY";

// Initialize client only if we have credentials
export const supabase = !isDemoMode ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Auth service proxy
export const authService = {
  getUser: async () => {
    if (isDemoMode) {
      return { data: { user: mockDb.getUser() }, error: null };
    }
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { data: { user }, error };
    } catch (err) {
      return { data: { user: null }, error: err };
    }
  },

  signUp: async (email, password) => {
    if (isDemoMode) {
      return mockDb.signUp(email, password);
    }
    return supabase.auth.signUp({ email, password });
  },

  signIn: async (email, password) => {
    if (isDemoMode) {
      return mockDb.signIn(email, password);
    }
    return supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    if (isDemoMode) {
      return mockDb.signOut();
    }
    return supabase.auth.signOut();
  },

  // Simulated or real subscription to auth updates
  onAuthStateChange: (callback) => {
    if (isDemoMode) {
      // Mock auth changes can be triggered manually by listening to storage changes or app updates
      const handler = () => {
        const user = mockDb.getUser();
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
      };
      window.addEventListener('clp_auth_changed', handler);
      // Trigger initial
      handler();
      return {
        data: {
          subscription: {
            unsubscribe: () => window.removeEventListener('clp_auth_changed', handler)
          }
        }
      };
    } else {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
      });
      return { data: { subscription } };
    }
  },

  triggerMockAuthChanged: () => {
    if (isDemoMode) {
      window.dispatchEvent(new Event('clp_auth_changed'));
    }
  }
};

// Database service proxy
export const dbService = {
  getTrades: async () => {
    if (isDemoMode) {
      return { data: mockDb.getTrades(), error: null };
    }
    try {
      const { data, error } = await supabase
        .from('futures_trades')
        .select('*')
        .order('date_closed', { ascending: false });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  addTrade: async (trade) => {
    if (isDemoMode) {
      return mockDb.addTrade(trade);
    }
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        return { data: null, error: userErr || new Error("User session not found. Please sign in again.") };
      }
      const { data, error } = await supabase
        .from('futures_trades')
        .insert([{ ...trade, user_id: user.id }])
        .select();
      return { data: data ? data[0] : null, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  deleteTrade: async (id) => {
    if (isDemoMode) {
      return mockDb.deleteTrade(id);
    }
    try {
      const { error } = await supabase
        .from('futures_trades')
        .delete()
        .eq('id', id);
      return { error };
    } catch (err) {
      return { error: err };
    }
  },

  getActivities: async () => {
    if (isDemoMode) {
      return { data: mockDb.getActivities(), error: null };
    }
    try {
      const { data, error } = await supabase
        .from('other_activities')
        .select('*')
        .order('activity_date', { ascending: false });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  addActivity: async (activity) => {
    if (isDemoMode) {
      return mockDb.addActivity(activity);
    }
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        return { data: null, error: userErr || new Error("User session not found. Please sign in again.") };
      }
      const { data, error } = await supabase
        .from('other_activities')
        .insert([{ ...activity, user_id: user.id }])
        .select();
      return { data: data ? data[0] : null, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  deleteActivity: async (id) => {
    if (isDemoMode) {
      return mockDb.deleteActivity(id);
    }
    try {
      const { error } = await supabase
        .from('other_activities')
        .delete()
        .eq('id', id);
      return { error };
    } catch (err) {
      return { error: err };
    }
  },

  getBalances: async () => {
    if (isDemoMode) {
      return { data: mockDb.getBalances(), error: null };
    }
    try {
      const { data, error } = await supabase
        .from('exchange_balances')
        .select('*')
        .order('exchange_name', { ascending: true });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  updateBalance: async (exchangeName, balance) => {
    if (isDemoMode) {
      return mockDb.updateBalance(exchangeName, balance);
    }
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        return { data: null, error: userErr || new Error("User session not found. Please sign in again.") };
      }
      
      const { data, error } = await supabase
        .from('exchange_balances')
        .upsert([{ 
          exchange_name: exchangeName, 
          balance: Number(balance), 
          user_id: user.id,
          updated_at: new Date().toISOString()
        }], { onConflict: 'user_id, exchange_name' })
        .select();
        
      return { data: data ? data[0] : null, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // API Configuration Management
  getApiKeys: async () => {
    if (isDemoMode) {
      return { data: mockDb.getApiKeys(), error: null };
    }
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*');
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  saveApiKey: async (exchangeName, apiKey, apiSecretEncrypted, iv) => {
    if (isDemoMode) {
      return mockDb.saveApiKey(exchangeName, apiKey, apiSecretEncrypted, iv);
    }
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        throw new Error("User session not found");
      }
      const { data, error } = await supabase
        .from('user_api_keys')
        .upsert([{
          exchange_name: exchangeName,
          api_key: apiKey,
          api_secret: apiSecretEncrypted,
          iv: iv,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }], { onConflict: 'user_id, exchange_name' })
        .select();
      return { data: data ? data[0] : null, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  deleteApiKey: async (exchangeName) => {
    if (isDemoMode) {
      return mockDb.deleteApiKey(exchangeName);
    }
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('exchange_name', exchangeName);
      return { error };
    } catch (err) {
      return { error: err };
    }
  },

  encryptSecret: async (rawSecret) => {
    try {
      const res = await fetch('/api/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawSecret })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to encrypt API Secret');
      }
      return await res.json(); // returns { encrypted, iv }
    } catch (err) {
      console.error("Encryption error:", err);
      throw err;
    }
  },

  syncExchangeData: async (exchangeName, apiKey, apiSecretEncrypted, iv) => {
    if (isDemoMode) {
      // Simulate sync delay and mock data
      await new Promise(resolve => setTimeout(resolve, 1200));
      return {
        data: {
          balance: 8450.75,
          positions: [
            {
              symbol: 'BTCUSDT',
              positionAmt: 0.125,
              entryPrice: 89620.00,
              markPrice: 90150.50,
              unRealizedProfit: 66.31,
              leverage: 10,
              marginType: 'cross'
            },
            {
              symbol: 'ETHUSDT',
              positionAmt: -1.5,
              entryPrice: 3120.00,
              markPrice: 3075.20,
              unRealizedProfit: 67.20,
              leverage: 5,
              marginType: 'isolated'
            }
          ]
        },
        error: null
      };
    }

    try {
      const res = await fetch('/api/sync-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange_name: exchangeName,
          api_key: apiKey,
          api_secret_encrypted: apiSecretEncrypted,
          iv: iv
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Exchange sync server error');
      }
      
      const syncResult = await res.json();
      return { data: syncResult, error: null };
    } catch (err) {
      console.error("Exchange sync client error:", err);
      return { data: null, error: err.message || err };
    }
  }
};
