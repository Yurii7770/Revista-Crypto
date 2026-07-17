import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import crypto from 'crypto'

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_SALT = process.env.VITE_API_ENCRYPTION_KEY || 'RevistaCryptoEncryptionSaltFallbackKey2026';

// Derive 32-byte key from salt
const getSecretKey = () => {
  return crypto.createHash('sha256').update(ENCRYPTION_SALT).digest();
};

function encryptSecret(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

function decryptSecret(encryptedText, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getSecretKey(), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function signQuery(queryString, apiSecret) {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // 1. Endpoint /api/encrypt
          if (req.url === '/api/encrypt' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { text } = JSON.parse(body);
                if (!text) throw new Error("Missing text parameter");
                const result = encryptSecret(text);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          // 2. Endpoint /api/sync-exchange
          if (req.url === '/api/sync-exchange' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { exchange_name, api_key, api_secret_encrypted, iv } = JSON.parse(body);
                if (!exchange_name || !api_key || !api_secret_encrypted || !iv) {
                  throw new Error("Missing required credentials parameters");
                }
                
                // Decrypt secret
                const apiSecret = decryptSecret(api_secret_encrypted, iv);

                if (exchange_name === 'Binance') {
                  const timestamp = Date.now();
                  const spotQuery = `recvWindow=5000&timestamp=${timestamp}`;
                  const spotSignature = signQuery(spotQuery, apiSecret);
                  
                  // Fetch Spot Balances
                  const spotRes = await fetch(`https://api.binance.com/api/v3/account?${spotQuery}&signature=${spotSignature}`, {
                    headers: { 'X-MBX-APIKEY': api_key }
                  });
                  
                  if (!spotRes.ok) {
                    const errData = await spotRes.json().catch(() => ({}));
                    throw new Error(`Binance Spot API error: ${errData.msg || spotRes.statusText}`);
                  }
                  const spotData = await spotRes.json();

                  // Fetch Futures Balances
                  const futuresQuery = `recvWindow=5000&timestamp=${timestamp}`;
                  const futuresSignature = signQuery(futuresQuery, apiSecret);
                  
                  const futuresRes = await fetch(`https://fapi.binance.com/fapi/v2/account?${futuresQuery}&signature=${futuresSignature}`, {
                    headers: { 'X-MBX-APIKEY': api_key }
                  });
                  
                  let futuresData = null;
                  if (futuresRes.ok) {
                    futuresData = await futuresRes.json();
                  }

                  // Fetch Active Futures Positions
                  const positionsQuery = `recvWindow=5000&timestamp=${timestamp}`;
                  const positionsSignature = signQuery(positionsQuery, apiSecret);
                  const positionsRes = await fetch(`https://fapi.binance.com/fapi/v2/positionRisk?${positionsQuery}&signature=${positionsSignature}`, {
                    headers: { 'X-MBX-APIKEY': api_key }
                  });
                  
                  let positionsData = [];
                  if (positionsRes.ok) {
                    const rawPositions = await positionsRes.json();
                    positionsData = rawPositions.filter(p => Number(p.positionAmt) !== 0).map(p => ({
                      symbol: p.symbol,
                      positionAmt: Number(p.positionAmt),
                      entryPrice: Number(p.entryPrice),
                      markPrice: Number(p.markPrice),
                      unRealizedProfit: Number(p.unRealizedProfit),
                      leverage: Number(p.leverage),
                      marginType: p.marginType
                    }));
                  }

                  // Calculate Spot Asset Balances
                  let binanceBalance = 0;
                  if (spotData.balances) {
                    spotData.balances.forEach(b => {
                      const total = Number(b.free) + Number(b.locked);
                      if (total > 0) {
                        const asset = b.asset.toUpperCase();
                        if (['USDT', 'USDC', 'BUSD', 'FDUSD'].includes(asset)) {
                          binanceBalance += total;
                        } else if (asset === 'BTC') {
                          binanceBalance += total * 90000; // Reference BTC conversion
                        } else if (asset === 'ETH') {
                          binanceBalance += total * 3000;  // Reference ETH conversion
                        }
                      }
                    });
                  }

                  // Add Futures Wallet Balance
                  if (futuresData && futuresData.assets) {
                    futuresData.assets.forEach(a => {
                      const walletBal = Number(a.walletBalance);
                      if (walletBal > 0) {
                        binanceBalance += walletBal;
                      }
                    });
                  }

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    balance: binanceBalance,
                    positions: positionsData
                  }));
                } else {
                  throw new Error(`Unsupported exchange: ${exchange_name}`);
                }
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          next();
        });
      }
    }
  ],
})
