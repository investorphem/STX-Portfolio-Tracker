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
            const txs = await getTxsForAddress(addr, 10)
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
    const interval = setInterval(fetchAll, 30000)
    return () => { cancelled = true; clearInterval(interval); }
  }, [addresses])

  // --- FEATURE: CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    const rows = [
      ["Address", "STX Balance", "USD Value", "First Active", "Whale Status"]
    ];

    Object.values(data).forEach(d => {
      rows.push([
        d.addr,
        d.balance.toFixed(4),
        (d.balance * price).toFixed(2),
        d.firstActivity || "N/A",
        d.isWhale ? "YES" : "NO"
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `STX_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = useMemo(() => {
    return Object.values(data).map(d => ({
      name: d.addr.slice(0, 5) + '...',
      value: d.balance || 0
    })).filter(d => d.value > 0)
  }, [data])

  const totalStx = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="space-y-8">
      {/* HEADER WITH DOWNLOAD ACTION */}
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Intelligence Grid</h3>
        <button 
          onClick={exportToCSV}
          className="text-[10px] font-bold bg-slate-800 hover:bg-orange-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-700 transition-all flex items-center gap-2"
        >
          <span>📥</span> DOWNLOAD CSV REPORT
        </button>
      </div>

      {/* 1. ALLOCATION & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center text-center shadow-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Total Net Worth</p>
            <h2 className="text-4xl font-black text-white">{totalStx.toLocaleString()} <span className="text-xl text-orange-500 font-light italic">STX</span></h2>
            <p className="text-2xl font-bold text-slate-400 mt-1">
                ${(totalStx * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
        
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-3xl h-48 shadow-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={10} dataKey="value" stroke="none">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 2. DETAILED ADDRESS CARDS (KEEPING EXISTING GRID LOGIC) */}
      <div className="grid grid-cols-1 gap-8">
        {addresses.map((addr, idx) => {
          const d = data[addr]
          return (
            <div key={addr} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-slate-700">
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-gradient-to-r from-slate-900 to-slate-950">
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
                    <button onClick={() => removeAddress(addr)} className="text-red-900 hover:text-red-500 text-[10px] font-bold uppercase transition-colors tracking-tighter">Remove Target</button>
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-800">
                <div className="p-6">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">SIP-010 Inventory</h5>
                    <div className="grid grid-cols-2 gap-2">
                        {d?.tokens && Object.keys(d.tokens).length > 0 ? (
                            Object.entries(d.tokens).slice(0, 4).map(([id, token]) => (
                                <div key={id} className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col">
                                    <span className="text-[10px] font-bold text-white italic truncate">{id.split('::')[1]}</span>
                                    <span className="text-xs font-mono text-orange-400">{(Number(token.balance) / 10**8).toLocaleString()}</span>
                                </div>
                            ))
                        ) : <p className="text-[10px] text-slate-700">No secondary assets detected.</p>}
                    </div>
                </div>

                <div className="p-6 bg-slate-950/20">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Recent Transactions</h5>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto">
                        {d?.txs?.length > 0 ? d.txs.map(tx => (
                            <div key={tx.tx_id} className="flex justify-between items-center text-[10px] group border-b border-slate-800/50 pb-2">
                                <div className="flex flex-col">
                                    <span className="text-slate-500 font-mono group-hover:text-orange-400 transition-colors">{tx.tx_id.slice(0, 10)}...</span>
                                    <span className="text-[9px] text-slate-400 uppercase font-black">{tx.tx_type.replace('_', ' ')}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${tx.tx_status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.tx_status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        )) : <p className="text-[10px] text-slate-700">Ledger empty.</p>}
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
