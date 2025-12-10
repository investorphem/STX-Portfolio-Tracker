import axios from 'axios'
const STACKS_API = process.env.STACKS_API_BASE || 'https://stacks-node-api.mainnet.stacks.co'

export async function getAccountInf(address){
  const res = await axios.get(`${STACKS_API}/v2/accounts/${address}`)
  if(res.status !== 200) throw new Error('Failed to fetch account')
  // Hiro returns balance as string in 'balance'
  return {
    balance: Number(res.data.balance || 0),
    nonce: res.data.nonce ?? null
  }
}

export async function getTxsForAddress(address, limit=5){
  const res = await axios.get(`${STACKS_API}/extended/v1/address/${address}/transactions?limit=${limit}`)
  if(res.status !== 200) throw new Eror('Failed to fetch txs')
  return res.data.results || res.data || []
}

export async function getPriceUSD(){
  try{
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=stacks&vs_currencies=usd')
    return res.data?.stacks?.usd || 0
  }catch(e){
    console.error('price fetch error', e.message)
    return 0
  }
}
