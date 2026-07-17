// Mock database layer using LocalStorage with robust error parsing.

const SAMPLE_TRADES = [
  {
    id: "mock-trade-1",
    user_id: "mock-user-123",
    token_name: "BTC",
    position_size: 15000,
    exchange: "Binance",
    direction: "Long",
    outcome: "Take Profit",
    pnl: 1250,
    rationale: "Bullish divergence on 4H chart. Bounced off key support at $92,000. Trend line breakout retest was successful.",
    date_opened: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    date_closed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-trade-2",
    user_id: "mock-user-123",
    token_name: "PEPE",
    position_size: 5000,
    exchange: "Bybit",
    direction: "Short",
    outcome: "Stop Loss",
    pnl: -450,
    rationale: "Tried to short the local top on memecoin hype. Price broke above resistance level with high volume, triggering stop loss.",
    date_opened: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    date_closed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-trade-3",
    user_id: "mock-user-123",
    token_name: "ETH",
    position_size: 10000,
    exchange: "OKX",
    direction: "Long",
    outcome: "Take Profit",
    pnl: 820,
    rationale: "Ethereum consolidation break. EMA ribbon crossing bullish on the 1H timeframe. Take profit hit near next major resistance.",
    date_opened: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(),
    date_closed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-trade-4",
    user_id: "mock-user-123",
    token_name: "SOL",
    position_size: 8000,
    exchange: "Binance",
    direction: "Short",
    outcome: "Take Profit",
    pnl: 550,
    rationale: "Overextended on the daily RSI (>85). Confirmed double top pattern on the 15m chart. Scalp short to local EMA 50 support.",
    date_opened: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1.5 * 60 * 60 * 1000).toISOString(),
    date_closed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const SAMPLE_ACTIVITIES = [
  {
    id: "mock-act-1",
    user_id: "mock-user-123",
    activity_name: "Arbitrage",
    exchange_platform: "Jupiter DEX",
    pnl: 340,
    rationale: "Exploited price discrepancy of SOL/USDC pool between Jupiter and Orca. Clean execution via instant router.",
    activity_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-act-2",
    user_id: "mock-user-123",
    activity_name: "Retrodrop",
    exchange_platform: "Starknet Ecosystem",
    pnl: 1850,
    rationale: "Received allocation of tokens for early liquidity provision and contract interactions. Claimed and sold on DEX.",
    activity_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-act-3",
    user_id: "mock-user-123",
    activity_name: "Staking",
    exchange_platform: "Binance Earn",
    pnl: 75,
    rationale: "Accrued interest on locked BNB staking over the past 30 days. Reinvested directly into BNB.",
    activity_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  }
];

const SAMPLE_BALANCES = [
  { exchange_name: "Binance", balance: 5000 },
  { exchange_name: "Bybit", balance: 3500 },
  { exchange_name: "OKX", balance: 1200 },
  { exchange_name: "BingX", balance: 800 },
  { exchange_name: "DEX / Other", balance: 2500 }
];

const MOCK_USER = {
  id: "mock-user-123",
  email: "demo@cryptoledger.pro",
  user_metadata: { name: "Pro Trader (Demo)" }
};

export const mockDb = {
  // Auth Simulation
  getUser: () => {
    try {
      const session = localStorage.getItem("clp_mock_session");
      if (!session) return null;
      if (session === "undefined") {
        localStorage.removeItem("clp_mock_session");
        return null;
      }
      return JSON.parse(session);
    } catch (e) {
      console.warn("Failed to parse mock session, clearing it", e);
      localStorage.removeItem("clp_mock_session");
      return null;
    }
  },

  signIn: (email, password) => {
    const user = { ...MOCK_USER, email };
    localStorage.setItem("clp_mock_session", JSON.stringify(user));
    return { data: { user }, error: null };
  },

  signUp: (email, password) => {
    const user = { ...MOCK_USER, email };
    localStorage.setItem("clp_mock_session", JSON.stringify(user));
    return { data: { user }, error: null };
  },

  signOut: () => {
    localStorage.removeItem("clp_mock_session");
    return { error: null };
  },

  // Trades CRUD
  getTrades: () => {
    try {
      const data = localStorage.getItem("clp_mock_trades");
      if (!data || data === "undefined") {
        localStorage.setItem("clp_mock_trades", JSON.stringify(SAMPLE_TRADES));
        return SAMPLE_TRADES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to parse mock trades, resetting default list", e);
      localStorage.setItem("clp_mock_trades", JSON.stringify(SAMPLE_TRADES));
      return SAMPLE_TRADES;
    }
  },

  addTrade: (trade) => {
    const trades = mockDb.getTrades();
    const newTrade = {
      ...trade,
      id: "mock-trade-" + Math.random().toString(36).substr(2, 9),
      user_id: MOCK_USER.id,
      position_size: Number(trade.position_size),
      pnl: Number(trade.pnl),
    };
    trades.unshift(newTrade);
    localStorage.setItem("clp_mock_trades", JSON.stringify(trades));
    return { data: newTrade, error: null };
  },

  deleteTrade: (id) => {
    const trades = mockDb.getTrades();
    const filtered = trades.filter(t => t.id !== id);
    localStorage.setItem("clp_mock_trades", JSON.stringify(filtered));
    return { error: null };
  },

  // Activities CRUD
  getActivities: () => {
    try {
      const data = localStorage.getItem("clp_mock_activities");
      if (!data || data === "undefined") {
        localStorage.setItem("clp_mock_activities", JSON.stringify(SAMPLE_ACTIVITIES));
        return SAMPLE_ACTIVITIES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to parse mock activities, resetting default list", e);
      localStorage.setItem("clp_mock_activities", JSON.stringify(SAMPLE_ACTIVITIES));
      return SAMPLE_ACTIVITIES;
    }
  },

  addActivity: (activity) => {
    const activities = mockDb.getActivities();
    const newAct = {
      ...activity,
      id: "mock-act-" + Math.random().toString(36).substr(2, 9),
      user_id: MOCK_USER.id,
      pnl: Number(activity.pnl),
    };
    activities.unshift(newAct);
    localStorage.setItem("clp_mock_activities", JSON.stringify(activities));
    return { data: newAct, error: null };
  },

  deleteActivity: (id) => {
    const activities = mockDb.getActivities();
    const filtered = activities.filter(a => a.id !== id);
    localStorage.setItem("clp_mock_activities", JSON.stringify(filtered));
    return { error: null };
  },

  // Balances CRUD
  getBalances: () => {
    try {
      const data = localStorage.getItem("clp_mock_balances");
      if (!data || data === "undefined") {
        localStorage.setItem("clp_mock_balances", JSON.stringify(SAMPLE_BALANCES));
        return SAMPLE_BALANCES;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to parse mock balances, resetting defaults", e);
      localStorage.setItem("clp_mock_balances", JSON.stringify(SAMPLE_BALANCES));
      return SAMPLE_BALANCES;
    }
  },

  updateBalance: (exchangeName, balance) => {
    const balances = mockDb.getBalances();
    const index = balances.findIndex(b => b.exchange_name === exchangeName);
    const updatedBalance = {
      exchange_name: exchangeName,
      balance: Number(balance),
      updated_at: new Date().toISOString()
    };
    
    if (index !== -1) {
      balances[index] = { ...balances[index], ...updatedBalance };
    } else {
      balances.push(updatedBalance);
    }
    
    localStorage.setItem("clp_mock_balances", JSON.stringify(balances));
    return { data: updatedBalance, error: null };
  },

  // Mock API Credentials Storage
  getApiKeys: () => {
    try {
      const data = localStorage.getItem("clp_mock_api_keys");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveApiKey: (exchangeName, apiKey, apiSecretEncrypted, iv) => {
    const keys = mockDb.getApiKeys();
    const index = keys.findIndex(k => k.exchange_name === exchangeName);
    const newKey = {
      id: "mock-key-" + Math.random().toString(36).substr(2, 9),
      exchange_name: exchangeName,
      api_key: apiKey,
      api_secret: apiSecretEncrypted,
      iv: iv,
      updated_at: new Date().toISOString()
    };
    
    if (index !== -1) {
      keys[index] = newKey;
    } else {
      keys.push(newKey);
    }
    localStorage.setItem("clp_mock_api_keys", JSON.stringify(keys));
    return { data: newKey, error: null };
  },

  deleteApiKey: (exchangeName) => {
    const keys = mockDb.getApiKeys();
    const filtered = keys.filter(k => k.exchange_name !== exchangeName);
    localStorage.setItem("clp_mock_api_keys", JSON.stringify(filtered));
    return { error: null };
  }
};
