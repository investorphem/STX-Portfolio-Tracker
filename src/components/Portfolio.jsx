import React, { useEffect, useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getAccountInfo, getTxsForAddress } from '../lib/api'

// STX Brand Palette for 2026
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
            // Using the deep account info we added to lib/api.js
            const info = await getAccountInfo(addr)
            const txs = await getTxsForAddress(addr, 5)
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
    return () => { cancelled = true }
  }, [addresses])

  // Process data for the Chart
  const chartData = useMemo(() => {
    return Object.values(data)
      .map(d => ({
        name: d.addr.slice(0, 5) + '...' + d.addr.slice(-4),
        value: d.balance || 0
      }))
      .filter(d => d.value > 0)
  }, [data])

  const totalStx = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="space-y-6">
      {/* 1. VISUAL ALLOCATION CHART */}
      {chartData.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Portfolio Allocation</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. SUMMARY DASHBOARD */}
      {addresses.length > 0 && (
        <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-orange-100 text-[10px] font-bold uppercase">Net Worth</p>
              <h2 className="text-4xl font-black text-white">{totalStx.toLocaleString()} STX</h2>
            </div>
            <div className="text-right text-white">
              <p className="text-2xl font-bold">{price ? `$${(totalStx * price).toLocaleString()}` : '—'}</p>
              <p className="text-[10px] opacity-80">Market Rate: ${price?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTELLIGENCE ADDRESS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr, idx) => {
          const d = data[addr]
          return (
            <div key={addr} className="bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-slate-500 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="truncate">
                  <div className="text-[10px] font-mono text-slate-500 truncate mb-1">{addr}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xl font-bold text-white">{(d?.balance || 0).toLocaleString()} STX</span>
                  </div>
                  {/* FEATURE: WHALE & TIME MACHINE BADGES */}
                  <div className="flex gap-2 mt-2">
                    {d?.isWhale && <span className="bg-orange-950 text-orange-400 text-[9px] px-2 py-0.5 rounded font-black uppercase">🐋 Whale</span>}
                    {d?.firstActivity && (
                      <span className="bg-slate-900 text-slate-400 text-[9px] px-2 py-0.5 rounded">
                        Active since {new Date(d.firstActivity).getFullYear()}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => removeAddress(addr)} className="text-slate-600 hover:text-red-400 text-[10px] font-bold">REMOVE</button>
              </div>

              {/* FEATURE: TOKEN AUTO-DISCOVERY UI */}
              <div className="mt-4 pt-3 border-t border-slate-700/50">
                <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-2 italic">Auto-Discovered Assets</h5>
                <div className="flex flex-wrap gap-2">
                  {d?.tokens && Object.keys(d.tokens).length > 0 ? (
                    Object.entries(d.tokens).slice(0, 4).map(([id, token]) => (
                      <div key={id} className="bg-slate-900 px-2 py-1 rounded border border-slate-700 flex items-center gap-2">
                        <span className="text-[10px] text-white font-bold">{id.split('::')[1]}</span>
                        <span className="text-[9px] text-orange-400">{(Number(token.balance) / 10**8).toFixed(1)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-600">No extra tokens found</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
