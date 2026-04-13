import React, { useState, useEffect } fr
import Portfolio from './components/Portfoli
import { getPriceUSD, getGlobalWhaleFeed } from './lib/ap
import { connectWallet, getUserData, signOut, getUserAddressSafe } from './lib/wallet'

/**
 * LOGO COMPONENT: Concept 1 "The Bitcoin Layer"
 * Scalable SVG representing Stacks (S) as Bitcoin's Layer 2.
 */
const Logo = () => 
  <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    {/* Background Square with rounded edges */}
    <rect width="100" height="100" rx="22" fill="#0f172" />
    {/* The "S" / "2" Negative Space Geometry */}
    <path
      d="M25 30C25 27.2386 27.2386 25 30 25H70C72.7614 23545 35 45V55C35 55 75 35 75 65C75 72.7614 72.7614 75 70 75H30C27.2386 75 252.7614 2 70V3" 
      fill="#f97316" 
    />
    <path 
      d="M45 42L65 58" 
      stroke="#0f172a" 
      strokeWidth="8"
      strokeLinecap="round
    /
  </svg>
)

export default function App() 
  const [user, setUser] = useState(getUserData(
  const [price, setPrice] = useState(
  const [whaleAlert, setWhaleAlert] =
  const [addresses, setAddresses] = useSt
    try { return JSON.parse(localStorage.getItem('stx_addrsses) || '[]') } catch (e) { return [] }
  })

  useEffect(() => {
    async function init() {
      const currentPrice = await getPriceUSD()
      setPrice(currentPrice)

      const whales = await getGlobalWhaleFeed(1)
      if (whales.length > 0) setWhaleAlert(whales[0])

      const current = getUserAddressSafe()
      if (current && !addresses.includes(current)) {
        setAddresses(prev => [...new Set([current, ...prev])])
      }
    }
    init()

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
          {/* HEADER LOGO + TITLE AREA */}
          <div className="flex items-center gap-4">
            <Logo />
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
                STX<span className="text-orange-500">TRACKER</span>
              </h1>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-1">Web3 Intel Hub v8.1</p>
            </div>
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
