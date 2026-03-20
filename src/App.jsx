import React, { useState, useEffect } from 'react'
import Portfolio from './components/Portfolio'
import { getPriceUSD, getGlobalWhaleFeed } from './lib/api'
import { connectWallet, getUserData, signOut, getUserAddressSafe } from './lib/wallet'

export default function App() {
  const [user, setUser] = useState(getUserData())
  const [price, setPrice] = useState(null)
  const [whaleAlert, setWhaleAlert] = useState(null)
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stx_addresses') || '[]') } catch (e) { return [] }
  })

  useEffect(() => {
    async function init() {
      // 1. Initial Price
      const currentPrice = await getPriceUSD()
      setPrice(currentPrice)

      // 2. Initial Whale Check
      const whales = await getGlobalWhaleFeed(1)
      if (whales.length > 0) setWhaleAlert(whales[0])

      // 3. Sync connected wallet
      const current = getUserAddressSafe()
      if (current && !addresses.includes(current)) {
        setAddresses(prev => [...new Set([current, ...prev])])
      }
    }
    init()

    // Real-time Pulse: Refresh price and whales every 30s
    const pulse = setInterval(async () => {
      setPrice(await getPriceUSD())
      const feed = await getGlobalWhaleFeed(1)
      if (feed.length > 0) setWhaleAlert(feed[0])
    }, 30000)

    return () => clearInterval(pulse)
  }, [])

  useEffect(() => {
    localStorage.setItem('stx_addresses', JSON.stringify(addresses))
  }, [addresses])

  async function handleConnect() {
    try {
      const session = await connectWallet()
      setUser(session)
      const addr = getUserAddressSafe()
      if (addr && !addresses.includes(addr)) {
        setAddresses(prev => [addr, ...prev])
      }
    } catch (err) {
      console.warn('Connect cancelled')
    }
  }

  const copyForExtension = () => {
    navigator.clipboard.writeText(JSON.stringify(addresses))
    alert("Watchlist copied! Paste this into your STX Quick extension settings.")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* LIVE NETWORK PULSE BANNER */}
      <div className="bg-orange-600/10 border-b border-orange-500/20 px-4 py-2 overflow-hidden">
        <div className="container mx-auto max-w-4xl flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-orange-500">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              STX: ${price?.toFixed(3) || '0.000'}
            </span>
            {whaleAlert && (
              <span className="text-slate-400 animate-in fade-in slide-in-from-right duration-1000">
                LATEST WHALE: {whaleAlert.amount.toLocaleString()} STX moved 🐋
              </span>
            )}
          </div>
          <button onClick={copyForExtension} className="hover:text-white text-orange-500 transition">
            SYNC TO EXTENSION 📲
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <header className="flex justify-between items-center mb-12 py-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              STX<span className="text-orange-500">TRACKER</span>
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Web3 Intel Hub v8.1</p>
          </div>
          
          <div className="flex items-center gap-4">
            {!user ? (
              <button 
                className="bg-orange-600 hover:bg-orange-500 px-6 py-2 rounded-full font-black text-sm transition-all shadow-lg shadow-orange-900/20" 
                onClick={handleConnect}
              >
                CONNECT WALLET
              </button>
            ) : (
              <div className="flex flex-col items-end">
                <code className="text-[10px] text-orange-500 font-mono mb-1">{getUserAddressSafe().slice(0,12)}...</code>
                <button 
                  className="text-[10px] text-slate-500 font-bold hover:text-white uppercase tracking-tighter" 
                  onClick={() => { signOut(); setUser(null); }}
                >
                  [ Disconnect ]
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="space-y-12">
          {/* TRACKER INPUT */}
          <div className="relative">
            <input 
              id="newaddr" 
              placeholder="Paste Stacks Address (SP...)" 
              className="w-full bg-slate-900 border-2 border-slate-800 focus:border-orange-500/50 p-4 rounded-2xl outline-none transition-all font-mono text-sm pr-32" 
            />
            <button 
              className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-xl font-black text-xs hover:bg-orange-500 hover:text-white transition-all"
              onClick={() => {
                const val = document.getElementById('newaddr').value.trim()
                if (val && val.startsWith('SP')) {
                  setAddresses(prev => [...new Set([val, ...prev])])
                  document.getElementById('newaddr').value = ''
                }
              }}
            >
              TRACK WALLET
            </button>
          </div>

          <Portfolio 
            addresses={addresses} 
            price={price} 
            removeAddress={(a) => setAddresses(prev => prev.filter(x => x !== a))} 
          />
        </main>

        <footer className="mt-20 py-10 border-t border-slate-900 text-center">
          <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">
            Powered by Stacks v8.0 & Hiro API • 2026
          </p>
        </footer>
      </div>
    </div>
  )
}
