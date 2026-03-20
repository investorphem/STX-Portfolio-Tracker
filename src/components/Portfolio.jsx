import React, { useEffect, useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { getAccountInfo, getTxsForAddress } from '../lib/api'

// STX Brand Colors
const COLORS = ['#f97316', '#334155', '#94a3b8', '#fbbf24', '#1e293b'];

export default function Portfolio({ addresses, removeAddress, price }) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      if (!addresses || addresses.length === 0) { setData({}); return }
      setLoading(true)
      try {
        const results = await Promise.all(
          addresses.map(async (addr) => {
            try {
              const [account, txs] = await Promise.all([
                getAccountInfo(addr),
                getTxsForAddress(addr, 5)
              ])
              return { addr, account, txs }
            } catch (e) {
              return { addr, account: { balance: 0 }, txs: [] }
            }
          })
        )
        if (!cancelled) {
          const newData = {}
          results.forEach(res => { newData[res.addr] = res })
          setData(newData)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
  }, [addresses])

  // Prepare chart data: Filter out zero balances and format for Recharts
  const chartData = useMemo(() => {
    return Object.values(data)
      .map(item => ({
        name: item.addr.slice(0, 6) + '...' + item.addr.slice(-4),
        value: item.account?.balance || 0,
        fullAddr: item.addr
      }))
      .filter(item => item.value > 0);
  }, [data]);

  const totalStx = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="space-y-6">
      {/* Visual Chart Section */}
      {addresses.length > 0 && chartData.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Allocation by Address</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fb923c' }}
                  formatter={(value) => [`${value.toLocaleString()} STX`, 'Balance']}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Portfolio Summary Card */}
      {addresses.length > 0 && (
        <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-8 rounded-2xl shadow-2xl shadow-orange-950/20">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-orange-100 font-bold uppercase text-xs tracking-widest mb-1">Total Net Worth</h3>
              <div className="text-5xl font-black text-white">{totalStx.toLocaleString()} <span className="text-2xl font-light opacity-80">STX</span></div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {price ? `$${(totalStx * price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
              </div>
              <div className="text-xs text-orange-200 mt-1 font-mono">1 STX = ${price?.toFixed(3)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr, idx) => {
          const d = data[addr]
          const balance = d?.account?.balance ?? 0
          return (
            <div key={addr} className="bg-slate-800 border border-slate-700 p-5 rounded-xl transition hover:border-orange-500/50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-500 mb-1">{addr}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-lg font-bold text-white">{balance.toLocaleString()} STX</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeAddress(addr)}
                  className="text-slate-500 hover:text-red-400 text-xs p-1"
                >
                  REMOVE
                </button>
              </div>

              {/* Minimal Transaction List */}
              <div className="space-y-1 mt-4 border-t border-slate-700 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase italic">Recent Activity</span>
                {d?.txs?.slice(0, 3).map(tx => (
                  <div key={tx.tx_id} className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-mono">{tx.tx_id.slice(0, 8)}...</span>
                    <span className="bg-slate-900 text-orange-400 px-1.5 py-0.5 rounded">{tx.tx_type}</span>
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
