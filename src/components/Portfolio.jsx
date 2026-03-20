import React, { useEffect, useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getAccountInfo, getTxsForAddress } from '../lib/api'

const COLORS = ['#f97316', '#334155', '#64748b', '#fbbf24', '#475569'];

export default function Portfolio({ addresses, removeAddress, price }) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      if (!addresses.length) { setData({}); return }
      setLoading(true)
      const results = await Promise.all(
        addresses.map(async (addr) => {
          try {
            const info = await getAccountInfo(addr)
            const txs = await getTxsForAddress(addr, 8) // Fetch last 8 transactions
            return { addr, ...info, txs }
          } catch (e) {
            return { addr, balance: 0, tokens: {}, txs: [], error: true }
          }
        })
      )
      if (!cancelled) {
        const next = {}; results.forEach(r => next[r.addr] = r)
        setData(next); setLoading(false)
      }
    }
    fetchAll()
    const interval = setInterval(fetchAll, 30000); // Refresh every 30s
    return () => { cancelled = true; clearInterval(interval); }
  }, [addresses])

  const chartData = useMemo(() => {
    return Object.values(data).map(d => ({
      name: d.addr.slice(0, 5) + '...',
      value: d.balance || 0
    })).filter(d => d.value > 0)
  }, [data])

  const totalStx = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="space-y-8">
      {/* 1. ALLOCATION & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Total Net Worth</p>
            <h2 className="text-4xl font-black text-white">{totalStx.toLocaleString()} <span className="text-xl text-orange-500">STX</span></h2>
            <p className="text-2xl font-bold text-slate-400 mt-1">
                ${(totalStx * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
        
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-3xl h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={10} dataKey="value" stroke="none">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 2. DETAILED ADDRESS CARDS */}
      <div className="grid grid-cols-1 gap-8">
        {addresses.map((addr, idx) => {
          const d = data[addr]
          return (
            <div key={addr} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-slate-700">
              {/* Card Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-gradient-to-r from-slate-900 to-slate-900/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <code className="text-xs text-slate-400 font-mono tracking-tighter">{addr}</code>
                  </div>
                  <div className="flex gap-2">
                    {d?.isWhale && <span className="bg-orange-500 text-black text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Whale 🐋</span>}
                    <span className="bg-slate-800 text-slate-400 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                        {d?.firstActivity ? `Active since ${new Date(d.firstActivity).getFullYear()}` : 'New Wallet'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-white">{(d?.balance || 0).toLocaleString()} STX</div>
                    <button onClick={() => removeAddress(addr)} className="text-red-900 hover:text-red-500 text-[10px] font-bold uppercase transition-colors">Untrack</button>
                </div>
              </div>

              {/* Card Body: Split into Tokens and Transactions */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* TOKEN DISCOVERY SECTION */}
                <div className="p-6 border-r border-slate-800">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">SIP-010 Tokens</h5>
                    <div className="space-y-3">
                        {d?.tokens && Object.keys(d.tokens).length > 0 ? (
                            Object.entries(d.tokens).map(([id, token]) => (
                                <div key={id} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-xl border border-slate-800">
                                    <span className="text-xs font-bold text-white uppercase italic">{id.split('::')[1]}</span>
                                    <span className="text-xs font-mono text-orange-400">{(Number(token.balance) / 10**8).toLocaleString()}</span>
                                </div>
                            ))
                        ) : <p className="text-xs text-slate-600 italic">No assets detected.</p>}
                    </div>
                </div>

                {/* FEATURE: TRANSACTION LEDGER */}
                <div className="p-6 bg-slate-950/30">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">On-Chain History</h5>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                        {d?.txs?.length > 0 ? d.txs.map(tx => (
                            <div key={tx.tx_id} className="flex justify-between items-center text-[10px] group">
                                <div className="flex flex-col">
                                    <span className="text-slate-300 font-mono group-hover:text-orange-400 transition-colors">{tx.tx_id.slice(0, 12)}...</span>
                                    <span className="text-slate-600 uppercase font-bold">{tx.tx_type.replace('_', ' ')}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${tx.tx_status === 'success' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                        {tx.tx_status.toUpperCase()}
                                    </span>
                                    <div className="text-slate-500 mt-0.5">{new Date(tx.burn_block_time_iso).toLocaleDateString()}</div>
                                </div>
                            </div>
                        )) : <p className="text-xs text-slate-600 italic">No recent history.</p>}
                    </div>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
