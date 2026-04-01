import React, { useEffect, useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getAccountInfo, getTxsForAddress } from '../lib/api'

// We use raw hex codes to ensure Recharts can read them properly
const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];

export default function Portfolio({ addresses, removeAddress, price }) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  // --- FEATURE: PERSISTENT WALLET NAMES ---
  const [walletNames, setWalletNames] = useState(() => {
    // Load saved names from localStorage on initial render
    const saved = localStorage.getItem('stx_wallet_names');
    return saved ? JSON.parse(saved) : {};
  });
  const [editingName, setEditingName] = useState(null); 

  const saveWalletName = (addr, newName) => {
    const updatedNames = { ...walletNames, [addr]: newName };
    setWalletNames(updatedNames);
    localStorage.setItem('stx_wallet_names', JSON.stringify(updatedNames)); 
    setEditingName(null); 
  };

  // --- THE BULLETPROOF COLOR FUNCTION ---
  const getWalletColor = (index) => COLORS[index % COLORS.length];

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
            return { addr, balance: 0, tokens: [], txs: [], error: true }
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

  const exportToCSV = () => {
    const rows = [
      ["Wallet Name", "Address", "STX Balance", "USD Value", "First Active", "Whale Status"]
    ];

    Object.values(data).forEach(d => {
      const bal = d.balance || 0;
      const customName = walletNames[d.addr] || "Unnamed Wallet";
      rows.push([
        customName,
        d.addr,
        bal.toFixed(4),
        (bal * (price || 0)).toFixed(2),
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

  // Build the chart data using the strict color function and custom names
  const chartData = useMemo(() => {
    return addresses.map((addr, idx) => {
      const d = data[addr] || {};
      const displayName = walletNames[addr] || addr.slice(0, 5) + '...';
      return {
        name: displayName,
        value: d.balance || 0,
        colorHex: getWalletColor(idx) 
      }
    }).filter(d => d.value > 0) 
  }, [data, addresses, walletNames])

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
                ${(totalStx * (price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-3xl h-48 shadow-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={10} dataKey="value" stroke="none">
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.colorHex} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
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
              <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-gradient-to-r from-slate-900 to-slate-950">
                
                {/* --- EDITABLE WALLET NAME SECTION --- */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getWalletColor(idx) }} />
                    
                    {editingName === addr ? (
                      <input 
                        autoFocus
                        defaultValue={walletNames[addr] || ''}
                        placeholder="Name this wallet..."
                        onBlur={(e) => saveWalletName(addr, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveWalletName(addr, e.target.value)}
                        className="bg-slate-950 text-white text-sm font-bold px-3 py-1 rounded border border-orange-500 outline-none w-48 shadow-inner"
                      />
                    ) : (
                      <div 
                        onClick={() => setEditingName(addr)}
                        className="group cursor-pointer flex items-center gap-2"
                        title="Click to rename"
                      >
                        <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                          {walletNames[addr] || 'Unnamed Wallet'}
                        </span>
                        <span className="text-[10px] opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity">✏️ Edit</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Keep the actual raw address visible just below the name */}
                  <div className="flex items-center gap-2 pl-5">
                    <code className="text-[10px] text-slate-500 font-mono tracking-tighter">{addr}</code>
                  </div>

                  <div className="flex gap-2 pl-5">
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

              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-800">
                <div className="p-6">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">SIP-010 Inventory</h5>
                    <div className="grid grid-cols-2 gap-2">
                        {d?.tokens && d.tokens.length > 0 ? (
                            d.tokens.slice(0, 4).map((token, i) => (
                                <div key={i} className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col">
                                    <span className="text-[10px] font-bold text-white italic truncate">{token.symbol}</span>
                                    <span className="text-xs font-mono text-orange-400">
                                      {token.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))
                        ) : <p className="text-[10px] text-slate-700">No secondary assets detected.</p>}
                    </div>
                </div>

                <div className="p-6 bg-slate-950/20">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Recent Transactions</h5>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                        {/* --- THE FIX: CLICKABLE TRANSACTIONS --- */}
                        {d?.txs?.length > 0 ? d.txs.map(tx => (
                            <a 
                                key={tx.tx_id} 
                                href={`https://explorer.hiro.so/txid/${tx.tx_id}?chain=mainnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex justify-between items-center text-[10px] group border-b border-slate-800/50 pb-2 hover:bg-slate-800/30 p-1.5 -mx-1.5 rounded transition-colors cursor-pointer block"
                                title="View on Stacks Explorer"
                            >
                                <div className="flex flex-col">
                                    <span className="text-slate-500 font-mono group-hover:text-orange-400 transition-colors">{tx.tx_id.slice(0, 10)}...</span>
                                    <span className="text-[9px] text-slate-400 uppercase font-black mt-0.5">{tx.tx_type.replace('_', ' ')}</span>
                                </div>
                                <div className="text-right">
                                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${tx.tx_status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.tx_status.toUpperCase()}
                                    </span>
                                </div>
                            </a>
                        )) : <p className="text-[10px] text-slate-700 mt-2">Ledger empty.</p>}
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
