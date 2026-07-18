export const getOpenRouterKey = () => {
  const localKey = localStorage.getItem("clp_openrouter_api_key");
  if (localKey) return localKey;
  
  // Fallback to VITE_OPENROUTER_API_KEY in dev environment
  if (import.meta.env.DEV) {
    const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (envKey && envKey !== "YOUR_OPENROUTER_API_KEY") {
      return envKey;
    }
  }
  return "";
};

export const setOpenRouterKey = (key) => {
  if (key) {
    localStorage.setItem("clp_openrouter_api_key", key.trim());
  } else {
    localStorage.removeItem("clp_openrouter_api_key");
  }
};

export const isAiDemoMode = () => {
  return !getOpenRouterKey();
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// A function to call OpenRouter
async function fetchOpenRouter(systemPrompt, userPrompt) {
  try {
    const key = getOpenRouterKey();
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://cryptoledger.pro",
        "X-Title": "Crypto Ledger Pro"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    throw error;
  }
}

// Single Trade Post-Mortem Audit
export const analyzeSingleTrade = async (trade) => {
  const systemPrompt = `You are a highly experienced financial analyst, professional risk manager, and crypto trading advisor. Your task is to provide a concise, elite-level post-mortem review of the trader's closed position.
Communicate like a seasoned hedge fund manager—clear, direct, professional, and completely devoid of robotic boilerplate templates.

Your review MUST be structured in Markdown covering exactly these three areas:
1. **Position Analysis:** A direct, logical assessment of the trade setup and entry reasoning. Was this a calculated, technical play or an emotional FOMO entry?
2. **Weekly & Balance Impact:** Evaluate the relationship between the trade size, outcome (PnL), and the trader's overall portfolio risk. What does this outcome mean for this week's performance?
3. **Actionable Recommendations:** Provide exactly 1-2 concrete, high-level rules or suggestions to optimize this position style in the future.`;

  const userPrompt = `Trade details:
- Token: ${trade.token_name}
- Direction: ${trade.direction}
- Position size: $${trade.position_size}
- Outcome: ${trade.outcome} (PNL: $${trade.pnl})
- Rationale (Trader's text): ${trade.rationale || "No rationale provided."}`;

  if (isAiDemoMode()) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Tailor mock audit response to trade outcome
    const isProfit = Number(trade.pnl) >= 0;
    
    if (isProfit) {
      return `### 📊 Analysis of ${trade.token_name} (${trade.direction}) Trade — PnL: +$${trade.pnl}

1. **Position Analysis:**
   The entry on **${trade.token_name}** shows clear technical justification based on structural trend-following parameters. Waiting for a breakout validation before committing size represents clean execution, avoiding typical premature entry traps.

2. **Weekly & Balance Impact:**
   An added return of **+$${trade.pnl}** on a position size of **$${trade.position_size}** represents a healthy return. This result provides solid equity buffering for the current week, supporting capital preservation goals.

3. **Actionable Recommendations:**
   * **Scale-out strategy:** Implement a tiered exit (take profit in blocks) at key target zones to lock in gains and reduce variance.
   * **Setup consistency:** Backtest this exact breakout setup across 50 historical charts to define its average win rate.`;
    } else {
      return `### 🚨 Analysis of ${trade.token_name} (${trade.direction}) Trade — PnL: -$${Math.abs(trade.pnl)}

1. **Position Analysis:**
   The trade on **${trade.token_name}** exhibits clear signs of counter-trend catching or chasing momentum. Entering a trade based on immediate impulse rather than a defined pivot level increases risk variance significantly.

2. **Weekly & Balance Impact:**
   A drawdown of **-$${Math.abs(trade.pnl)}** is a severe loss relative to typical risk limits. This outcome negatively impacts the weekly balance curve and suggests that risk sizing was either miscalculated or the stop-loss was manually extended.

3. **Actionable Recommendations:**
   * **Hard Stop-Loss Rule:** Never adjust your stop-loss lower once a trade is active. If the original setup logic fails, accept the loss immediately.
   * **Position sizing limits:** Limit max risk per trade to 1.5% of total portfolio balance to ensure longevity.`;
    }
  }

  return fetchOpenRouter(systemPrompt, userPrompt);
};

// Weekly Retrospective
export const analyzeWeeklyTrades = async (trades, activities) => {
  const systemPrompt = `You are a seasoned financial analyst and portfolio advisor. Analyze the trader's trading logs for the week and identify systematic patterns, structural errors, and strengths.
Provide your response in JSON format containing ONLY an object with the following keys:
{
  "strongSide": "Brief, professional description of the trader's strong side this week.",
  "vulnerability": "Brief, professional description of the main portfolio vulnerability identified.",
  "checklist": ["Actionable rule 1", "Actionable rule 2", "Actionable rule 3"]
}
Do not write anything else, output only pure JSON.`;

  const userPrompt = `Trades array for the last 7 days:
${JSON.stringify(trades, null, 2)}

Web3 activities array for the last 7 days:
${JSON.stringify(activities, null, 2)}`;

  if (isAiDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simple analysis of actual data to make it look responsive
    const lossTrades = trades.filter(t => Number(t.pnl) < 0);
    const winTrades = trades.filter(t => Number(t.pnl) > 0);
    const pepeLosses = lossTrades.filter(t => t.token_name.toUpperCase() === 'PEPE' || t.token_name.toUpperCase() === 'MEME');
    const btcWins = winTrades.filter(t => t.token_name.toUpperCase() === 'BTC' || t.token_name.toUpperCase() === 'ETH');
    
    let strongSide = "Solid execution on major crypto assets (BTC/ETH). You demonstrate patience by aligning entries with high-timeframe trend structures.";
    let vulnerability = "High-leverage scalping on speculative meme assets (PEPE) leads to elevated risk exposure and systematic drawdowns.";
    let checklist = [
      "Restrict speculative memecoin trades to a maximum of 1% risk per setup.",
      "Ensure a minimum Risk-to-Reward ratio of 1:2 on all futures positions.",
      "Lock in partial gains at key daily support/resistance levels."
    ];

    if (pepeLosses.length > 0) {
      vulnerability = `Drawdown concentration in memecoins like PEPE. Trading highly volatile assets without clear historical pivots introduces excess variance.`;
    }
    
    if (btcWins.length > 0) {
      strongSide = `Disciplined trend execution on major assets. Your long positions on BTC/ETH show strong entry logic and target alignment.`;
    }

    if (activities.length > 0) {
      const activityPnl = activities.reduce((sum, a) => sum + Number(a.pnl), 0);
      if (activityPnl > 1000) {
        strongSide += ` Yield performance in Web3 activities (Retrodrops/Arbitrage) provides excellent cash flow offsets.`;
      }
    }

    return {
      strongSide,
      vulnerability,
      checklist
    };
  }

  try {
    const rawContent = await fetchOpenRouter(systemPrompt, userPrompt);
    const jsonString = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse AI response. Returning fallback object.", error);
    return {
      strongSide: "Disciplined execution on major trend reversals.",
      vulnerability: "Over-leverage and lack of focus during consolidation phases.",
      checklist: [
        "Avoid opening new positions during range consolidation.",
        "Set strict daily drawdown cap of 2.0% of total capital.",
        "Verify emotional neutrality before executing high-leverage trades."
      ]
    };
  }
};
