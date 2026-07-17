const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY || "";

export const isAiDemoMode = !openrouterKey || openrouterKey === "YOUR_OPENROUTER_API_KEY";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// A function to call OpenRouter
async function fetchOpenRouter(systemPrompt, userPrompt) {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openrouterKey}`,
        "HTTP-Referer": "https://cryptoledger.pro",
        "X-Title": "Crypto Ledger Pro"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
  const systemPrompt = `You are a tough, professional risk manager and crypto coach. Your task is to analyze the trader's closed trade and identify hidden behavioral patterns.
Provide a structured answer in Markdown format covering the following points:
1. **Entry Logic Assessment:** Analyze the trader's rationale. Was it a systematic setup or was the trade executed out of emotion/FOMO?
2. **Risk Management Analysis:** Does the position size match the outcome? Was the risk excessive?
3. **Psychological Marker:** Determine the trader's emotional state based on their description (Confidence, Fear, Greed, Systemic).
4. **Verdict and Rule for the Future:** One concrete rule that the trader must implement based on this specific trade.`;

  const userPrompt = `Trade details:
- Token: ${trade.token_name}
- Direction: ${trade.direction}
- Position size: $${trade.position_size}
- Outcome: ${trade.outcome} (PNL: $${trade.pnl})
- Rationale (Trader's text): ${trade.rationale || "No rationale provided."}`;

  if (isAiDemoMode) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Tailor mock audit response to trade outcome
    const isProfit = Number(trade.pnl) >= 0;
    
    if (isProfit) {
      return `### 📊 Analysis of ${trade.token_name} (${trade.direction}) Trade — Successful Outcome (+$${trade.pnl})

1. **Entry Logic Assessment:**
   The entry on **${trade.token_name}** appears systematic and justified. The rationale *"${trade.rationale || 'Consolidation break retest'}"* indicates you waited for structural confirmation (technical setup) instead of chasing a moving market. This is quality trend-following execution.

2. **Risk Management Analysis:**
   For a position size of **$${trade.position_size}**, the profit is **$${trade.pnl}** (about ${((trade.pnl / trade.position_size) * 100).toFixed(1)}% of size). The risk-reward ratio was executed cleanly, with the stop-loss likely set behind strong support, allowing the trade to play out.

3. **Psychological Marker:**
   🟢 **Systematic & Calmed**. The trade description contains no emotional noise. You acted as a disciplined operator executing a pre-planned strategy.

4. **Verdict and Rule for the Future:**
   > **Rule:** "Profit belongs to the patient." Do not attempt to trade in the middle of a range. Repeat this specific setup (breakout retest / bounce off support) and ignore intermediate market noise.`;
    } else {
      return `### 🚨 Analysis of ${trade.token_name} (${trade.direction}) Trade — Loss Outcome ($${trade.pnl})

1. **Entry Logic Assessment:**
   The entry on **${trade.token_name}** in the direction of **${trade.direction}** shows clear signs of an impulsive decision or counter-trend trading. The rationale *"${trade.rationale || 'Tried to catch top/bottom'}"* reveals a attempt to catch a reversal or acting under FOMO pressure.

2. **Risk Management Analysis:**
   A trade of size **$${trade.position_size}** resulted in a loss of **$${Math.abs(trade.pnl)}**. This is a significant hit. The stop-loss was either missing entirely or dragged in hopes of "holding through" the drawdown, which is forbidden in futures trading.

3. **Psychological Marker:**
   🔴 **Fear / FOMO**. Attempting to revenge trade or buy near local peaks suggests emotional instability. You succumbed to market pressure.

4. **Verdict and Rule for the Future:**
   > **Rule:** "Never enter a trade without a hard stop-loss, and never move your stop against the trade direction." If the price invalidates the setup, take the systematic loss and exit.`;
    }
  }

  return fetchOpenRouter(systemPrompt, userPrompt);
};

// Weekly Retrospective
export const analyzeWeeklyTrades = async (trades, activities) => {
  const systemPrompt = `You are an experienced crypto coach and data analyst. Analyze the array of trader's trades and activities for the week. Your task is to identify hidden systematic patterns, errors, strengths, and provide recommendations.
Provide your response in JSON format containing ONLY an object with the following keys:
{
  "strongSide": "Description of the strong side (what the trader was most effective at)",
  "vulnerability": "Description of the main vulnerability (systemic bug in trading)",
  "checklist": ["Custom rule 1", "Custom rule 2", "Custom rule 3"]
}
Do not write anything else, output only pure JSON.`;

  const userPrompt = `Trades array for the last 7 days:
${JSON.stringify(trades, null, 2)}

Web3 activities array for the last 7 days:
${JSON.stringify(activities, null, 2)}`;

  if (isAiDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simple analysis of actual data to make it look responsive
    const lossTrades = trades.filter(t => Number(t.pnl) < 0);
    const winTrades = trades.filter(t => Number(t.pnl) > 0);
    const pepeLosses = lossTrades.filter(t => t.token_name.toUpperCase() === 'PEPE' || t.token_name.toUpperCase() === 'MEME');
    const btcWins = winTrades.filter(t => t.token_name.toUpperCase() === 'BTC' || t.token_name.toUpperCase() === 'ETH');
    
    let strongSide = "Excellent profitability on major assets (BTC/ETH). You understand the trend on higher timeframes and hold winning positions effectively.";
    let vulnerability = "Attempts to trade high-risk memecoins (PEPE/SOL) on lower timeframes lead to unjustified losses and risk parameter violations.";
    let checklist = [
      "Limit memecoin trading: no more than 1 trade per day with risk cut in half.",
      "Always enter trades with a Risk/Reward ratio of at least 1:2.",
      "Take partial profits upon reaching the first key resistance level."
    ];

    if (pepeLosses.length > 0) {
      vulnerability = `Systemic drawdown on memecoins like PEPE. Trying to catch tops/bottoms on high volatility meme assets is draining profits earned from major coins.`;
    }
    
    if (btcWins.length > 0) {
      strongSide = `Disciplined execution on BTC and ETH. Your core strength lies in taking long positions on fundamental assets with clean technical justifications.`;
    }

    if (activities.length > 0) {
      const activityPnl = activities.reduce((sum, a) => sum + Number(a.pnl), 0);
      if (activityPnl > 1000) {
        strongSide += ` Furthermore, Web3 activities (Retrodrops, Arbitrage) show a phenomenal risk/reward ratio and help offset futures risks.`;
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
      strongSide: "Successful trades on major crypto assets with clear price targets.",
      vulnerability: "Overtrading and emotional entries during spikes in volatility.",
      checklist: [
        "Avoid opening new positions during high-impact news events.",
        "Set a strict daily loss limit of 2% of your total equity.",
        "Evaluate your emotional balance on a scale of 1-10 before opening the terminal."
      ]
    };
  }
};
