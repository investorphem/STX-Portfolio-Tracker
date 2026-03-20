import axios from 'axios'

// Vite uses import.meta.env instead of process.env
const STACKS_API = import.meta.env.VITE_STACKS_API || 'https://api.mainnet.hiro.so'

/**
 * Deep Account Fetch: Gets STX, Token Inventory, and On-chain History
 */
export async function getAccountInfo(address) {
  try {
    // 1. Fetch Balances (STX + SIP-010 Tokens)
    const balRes = await axios.get(`${STACKS_API}/extended/v1/address/${address}/balances`)
    
    // 2. Fetch first transaction to determine "Active Since" date
    // We use limit=1 and order by 'burn_block_time' (ascending) if the API supports it,
    // otherwise we get the very first result from the history.
    const txRes = await axios.get(`${STACKS_API}/extended/v1/address/${address}/transactions?limit=1`)
    
    const microBalance = balRes.data?.stx?.balance || "0"
    const stxBalance = Number(microBalance) / 1_000_000
    
    return {
      address,
      balance: stxBalance,
      locked: Number(balRes.data?.stx?.locked || 0) / 1_000_000,
      nonce: balRes.data?.stx?.nonce || 0,
      // FEATURE: Token Auto-Discovery
      tokens: balRes.data?.fungible_tokens || {},
      // FEATURE: Time Machine (First activity)
      firstActivity: txRes.data?.results?.[0]?.burn_block_time_iso || null,
      // FEATURE: Whale Flag (True if > 50,000 STX)
      isWhale: stxBalance > 50000 
    }
  } catch (err) {
    console.error(`[api] Deep fetch failed for ${address}:`, err.message)
    return { balance: 0, locked: 0, tokens: {}, isWhale: false }
  }
}

/**
 * Fetches recent transactions with enhanced data
 */
export async function getTxsForAddress(address, limit = 5) {
  try {
    const res = await axios.get(`${STACKS_API}/extended/v1/address/${address}/transactions?limit=${limit}`)
    return res.data?.results || []
  } catch (err) {
    console.error(`[api] Failed to fetch txs:`, err.message)
    return []
  }
}

/**
 * Fetches STX price with a 2026-safe fallback
 */
export async function getPriceUSD() {
  try {
    // We check both CoinGecko and a secondary fallback if needed
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd')
    const price = res.data?.blockstack?.usd || 0
    
    if (price === 0) throw new Error('Price not found')
    return price
  } catch (e) {
    console.warn('[api] CoinGecko failed, attempting secondary API...')
    try {
      // Secondary: Hiro Token Price API
      const hiroRes = await axios.get('https://api.hiro.so/metadata/v1/stx/price')
      return hiroRes.data?.price || 0
    } catch (err) {
      return 0
    }
  }
}

/**
 * FEATURE: Global Whale Watcher
 * Fetches the most recent high-value transactions on the network
 */
export async function getGlobalWhaleFeed(limit = 10) {
  try {
    const res = await axios.get(`${STACKS_API}/extended/v1/tx?limit=${limit}`)
    // Filter transactions where STX amount is > 10,000
    return res.data.results.filter(tx => {
      const amount = Number(tx.stx_transfer?.amount || 0) / 1_000_000
      return amount > 10000
    })
  } catch (err) {
    return []
  }
}
