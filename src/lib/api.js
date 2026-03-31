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
    const txRes = await axios.get(`${STACKS_API}/extended/v1/address/${address}/transactions?limit=1`)

    const microBalance = balRes.data?.stx?.balance || "0"
    const stxBalance = Number(microBalance) / 1_000_000

    // FEATURE: Token Auto-Discovery (SIP-010 Parser)
    const rawTokens = balRes.data?.fungible_tokens || {}
    const parsedTokens = Object.entries(rawTokens).map(([key, data]) => {
      // Extract the token name from the contract key (e.g., "...::usdc" -> "usdc")
      const rawName = key.split('::')[1] || 'UNKNOWN'
      const symbol = rawName.toUpperCase()
      
      // USDC and most Stacks tokens use 6 decimals.
      // If you add tokens with different decimals later, you can adjust this logic.
      const decimals = 6 
      const actualBalance = Number(data.balance) / (10 ** decimals)

      return {
        symbol,
        balance: actualBalance,
        contractId: key.split('::')[0]
      }
    }).filter(t => t.balance > 0) // Hide tokens with a 0 balance

    return {
      address,
      balance: stxBalance,
      locked: Number(balRes.data?.stx?.locked || 0) / 1_000_000,
      nonce: balRes.data?.stx?.nonce || 0,
      // Pass the cleaned array to the frontend
      tokens: parsedTokens,
      // FEATURE: Time Machine (First activity)
      firstActivity: txRes.data?.results?.[0]?.burn_block_time_iso || null,
      // FEATURE: Whale Flag (True if > 50,000 STX)
      isWhale: stxBalance > 50000 
    }
  } catch (err) {
    console.error(`[api] Deep fetch failed for ${address}:`, err.message)
    // Return an empty array for tokens on failure to prevent UI crashes
    return { balance: 0, locked: 0, tokens: [], isWhale: false } 
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
 * Fetches STX price with a 2026-safe fallback system
 */
export async function getPriceUSD() {
  try {
    // Primary: CoinGecko
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd')
    const price = res.data?.blockstack?.usd || 0

    if (price === 0) throw new Error('CoinGecko returned zero')
    return price
  } catch (e) {
    console.warn('[api] CoinGecko failed, attempting Hiro Price API...')
    try {
      // Secondary Fallback: Hiro API
      const hiroRes = await axios.get('https://api.hiro.so/metadata/v1/stx/price')
      return hiroRes.data?.price || 0
    } catch (err) {
      console.error('[api] All price sources failed.')
      return 0
    }
  }
}

/**
 * FEATURE: Global Whale Watcher
 * Scans the entire network for high-value STX transfers
 */
export async function getGlobalWhaleFeed(limit = 20) {
  try {
    const res = await axios.get(`${STACKS_API}/extended/v1/tx?limit=${limit}`)

    // Process and filter for transactions > 10,000 STX
    return res.data.results
      .filter(tx => {
        const amount = Number(tx.stx_transfer?.amount || 0) / 1_000_000
        return amount >= 10000 && tx.tx_status === 'success'
      })
      .map(tx => ({
        id: tx.tx_id,
        from: tx.sender_address,
        to: tx.stx_transfer?.recipient,
        amount: Number(tx.stx_transfer?.amount || 0) / 1_000_000,
        timestamp: tx.burn_block_time_iso
      }))
  } catch (err) {
    console.error('[api] Global whale feed error:', err.message)
    return []
  }
}

/**
 * FEATURE: Performance Tracker (Historical Price Check)
 * Estimates the price of STX on a specific date for P/L analysis
 */
export async function getHistoricalPrice(isoDate) {
  try {
    // CoinGecko historical endpoint
    const date = new Date(isoDate)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    const formattedDate = `${day}-${month}-${year}` // DD-MM-YYYY
    const res = await axios.get(`https://api.coingecko.com/api/v3/coins/blockstack/history?date=${formattedDate}`)

    return res.data?.market_data?.current_price?.usd || null
  } catch (e) {
    return null
  }
}
