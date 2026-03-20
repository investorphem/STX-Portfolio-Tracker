import React, { useEffect, useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { getAccountInfo, getTxsForAddress } from '../lib/api'

// STX Brand Palette for 2026
const COLORS = ['#f97316', '#334155', '#64748b', '#fbbf24', '#0f172a'];

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
            const [acc, txs] = await Promise.all([getAccountInfo(addr), getTxsForAddress(addr, 5)])
            return { addr, acc, txs }
          } catch (e) {
            return { addr, acc: { balance: 0 }, txs: [] }
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
        value: d.acc?.balance || 0
      }))
      .filter(d => d.value > 0)
  }, [data])

  const totalStx = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="space-y-6">
      {/* Visual Chart Card */}
      {chartData.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Portfolio Allocation</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f97316', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Banner */}
      {addresses.length > 0 && (
        <div className="bg-orange-600 p-6 rounded-2xl shadow-xl shadow-orange-900/20">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-orange-200 text-xs font-bold uppercase mb-1">Total Balance</p>
              <h2 className="text-4xl font-black text-white">{totalStx.toLocaleString()} STX</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">
                {price ? `$${(totalStx * price).toLocaleString()}` : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr, idx) => {
          const d = data[addr];
          const bal = d?.acc?.balance ?? 0;
          return (
            <div key={addr} className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="truncate pr-4">
                  <div className="text-[10px] font-mono text-slate-500 truncate mb-1">{addr}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-lg font-bold">{bal.toLocaleString()} STX</span>
                  </div>
                </div>
                <button onClick={() => removeAddress(addr)} className="text-slate-600 hover:text-red-400 text-xs">REMOVE</button>
              </div>
              
              <div className="border-t border-slate-700 pt-3 space-y-1">
                {d?.txs?.slice(0, 2).map(tx => (
                  <div key={tx.tx_id} className="flex justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">{tx.tx_id.slice(0, 10)}...</span>
                    <span className="text-orange-400 uppercase">{tx.tx_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
