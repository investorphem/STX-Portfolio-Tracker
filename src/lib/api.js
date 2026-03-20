import axios from 'axios'

// Vite uses import.meta.env instead of process.env
const STACKS_API = import.meta.env.VITE_STACKS_API || 'https://api.mainnet.hiro.so'

/**
 * Fetches account balance and converts microSTX to STX
 */
export async function getAccountInfo(address) {
  try {
    const res = await axios.get(`${STACKS_API}/extended/v1/address/${address}/balances`)
    
    // Hiro API returns 'stx' object with 'balance' in microSTX
    const microBalance = res.data?.stx?.balance || "0"
    
    return {
      // 1 STX = 1,000,000 microSTX
      balance: Number(microBalance) / 1_000_000,
      locked: Number(res.data?.stx?.locked || 0) / 1_000_000
    }
  } catch (err) {
    console.error(`[api] Failed to fetch account ${address}:`, err.message)
    return { balance: 0, locked: 0 }
  }
}

/**
 * Fetches recent transactions
 */
export async function getTxsForAddress(address, limit = 5) {
  try {
    const res = await axios.get(`${STACKS_API}/extended/v1/address/${address}/transactions?limit=${limit}`)
    return res.data?.results || []
  } catch (err) {
    console.error(`[api] Failed to fetch txs for ${address}:`, err.message)
    return []
  }
}

/**
 * Fetches STX price with a fail-safe
 */
export async function getPriceUSD() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd')
    // Note: CoinGecko uses 'blockstack' as the ID for STX
    return res.data?.blockstack?.usd || res.data?.stacks?.usd || 0
  } catch (e) {
    console.warn('[api] Price fetch failed, using fallback or 0')
    return 0 
  }
}
