import React, { useEffect, useState } from 'react'
import { getAccountInfo, getTxsForAddress } from '../lib/api'

export default function Portfolio({ addresses, removeAddress, price }) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    
    async function fetchAll() {
      if (!addresses || addresses.length === 0) {
        setData({})
        return
      }
      
      setLoading(true)
      
      try {
        // Fetch everything in parallel for maximum speed
        const results = await Promise.all(
          addresses.map(async (addr) => {
            try {
              const [account, txs] = await Promise.all([
                getAccountInfo(addr),
                getTxsForAddress(addr, 5)
              ])
              return { addr, account, txs, error: null }
            } catch (e) {
              return { addr, account: null, txs: [], error: e.message }
            }
          })
        )

        if (!cancelled) {
          const newData = {}
          results.forEach(res => { newData[res.addr] = res })
          setData(newData)
        }
      } catch (err) {
        console.error("Bulk fetch error", err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    // Refresh data every 60 seconds
    const interval = setInterval(fetchAll, 60000)
    
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [addresses])

  // Helper to safely calculate totals
  const totalStx = Object.values(data).reduce((acc, item) => {
    return acc + (item?.account?.balance || 0)
  }, 0)

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-bold text-slate-200">Watchlist</h2>
        {loading && <span className="text-xs text-orange-400 animate-pulse font-mono">SYNCING ON-CHAIN DATA...</span>}
      </div>

      {addresses.length === 0 && (
        <div className="bg-slate-800/50 border border-dashed border-slate-700 p-8 rounded-xl text-center text-slate-500">
          No addresses tracked. Add an address above to begin.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {addresses.map(addr => {
          const d = data[addr]
          const balance = d?.account?.balance ?? 0
          
          return (
            <div key={addr} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="truncate pr-4">
                  <div className="text-xs font-mono text-slate-400 truncate w-full mb-1">{addr}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(addr)}
                      className="text-[10px] bg-slate-700 px-2 py-0.5 rounded hover:bg-slate-600 transition"
                    >
                      COPY
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black text-white">{balance.toLocaleString()} STX</div>
                  <div className="text-sm text-green-400 font-medium">
                    {price ? `$${(balance * price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 pb-1">
                  Recent Activity
                </div>
                {d?.txs?.length > 0 ? (
                  d.txs.map(tx => (
                    <div key={tx.tx_id} className="flex justify-between items-center py-1">
                      <span className="text-[10px] font-mono text-slate-400">{tx.tx_id.slice(0, 12)}...</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-orange-300 uppercase italic">
                        {tx.tx_type.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-slate-600 italic">No recent transactions found.</div>
                )}
              </div>

              <button 
                className="w-full mt-4 py-2 text-xs font-bold text-red-400/70 hover:text-red-400 border border-red-900/30 hover:bg-red-950/30 rounded-lg transition"
                onClick={() => removeAddress(addr)}
              >
                STOP TRACKING
              </button>
            </div>
          )
        })}
      </div>

      {addresses.length > 0 && (
        <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-6 rounded-2xl shadow-xl shadow-orange-900/20">
          <h3 className="text-sm font-bold text-orange-100 uppercase tracking-tighter mb-1">Portfolio Summary</h3>
          <div className="flex justify-between items-baseline">
            <div className="text-4xl font-black text-white">{totalStx.toLocaleString()} <span className="text-xl font-normal opacity-80">STX</span></div>
            <div className="text-2xl font-bold text-white/90">
              {price ? `$${(totalStx * price).toLocaleString()}` : '—'}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
