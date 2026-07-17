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
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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
  }
};
