import React, { useState, useEffect, useRef } from 'react'
import Portfolio from './components/Portfolio'
import { getPriceUSD } from './lib/api'
import { connectWallet, getUserData, signOut, getUserAddressSafe, openTransfer } from './lib/wallet'

export default function App() {
  const inputRef = useRef(null);
  const [price, setPrice] = useState(null)
  const [user, setUser] = useState(() => {
    try { return getUserData() } catch (e) { return null }
  })
  
  const [addresses, setAddresses] = useState(() => {
    try { 
      const saved = localStorage.getItem('stx_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return [] }
  })

  // Sync addresses to localStorage
  useEffect(() => {
    localStorage.setItem('stx_addresses', JSON.stringify(addresses))
  }, [addresses])

  // Fetch price & check for newly connected address
  useEffect(() => {
    async function init() {
      const p = await getPriceUSD();
      setPrice(p);

      // Auto-add the connected address if it's missing (common after redirect)
      const currentAddr = getUserAddressSafe();
      if (currentAddr && !addresses.includes(currentAddr)) {
        setAddresses(prev => [currentAddr, ...prev]);
      }
    }
    init();
  }, []);

  async function handleConnect() {
    try {
      const u = await connectWallet()
      setUser(u)
      const addr = getUserAddressSafe()
      if (addr && !addresses.includes(addr)) {
        setAddresses(prev => [addr, ...prev])
      }
    } catch (err) {
      console.error('[app] connect error:', err)
      alert('Connection failed. Please ensure your wallet is unlocked.')
    }
  }

  function handleAddFromInput() {
    const val = inputRef.current?.value?.trim();
    if (val) {
      addAddress(val);
      inputRef.current.value = '';
    }
  }

  function addAddress(addr) {
    if (addresses.includes(addr)) return alert('Address already in list');
    setAddresses(prev => [addr, ...prev])
  }

  function removeAddress(addr) {
    setAddresses(prev => prev.filter(a => a !== addr))
  }

  return (
    <div className="container">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">STX Portfolio Tracker</h1>
        <p className="small mt-1 text-slate-400">Track balances and transactions via Stacks Connect.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {!user ? (
            <button className="btn" onClick={handleConnect}>Connect Wallet</button>
          ) : (
            <>
              <div className="card small bg-slate-800 p-2 rounded">
                Connected: <code className="text-orange-400">{getUserAddressSafe()}</code>
              </div>
              <button className="btn-ghost" onClick={() => { signOut(); setUser(null); }}>Sign Out</button>
              <button className="btn" onClick={sendFlow}>Send STX</button>
            </>
          )}
        </div>
      </header>

      <main>
        <div className="mb-6">
          <div className="flex gap-2">
            <input 
              ref={inputRef}
              placeholder="Enter STX address (SP...)" 
              className="p-2 rounded-md bg-slate-800 border border-slate-700 flex-1 outline-none focus:border-orange-500" 
            />
            <button className="btn" onClick={handleAddFromInput}>Add to Watchlist</button>
          </div>
          {price && (
            <div className="mt-2 text-sm font-medium text-green-400">
              STX Price: ${price.toLocaleString(undefined, { minimumFractionDigits: 4 })}
            </div>
          )}
        </div>

        <Portfolio addresses={addresses} removeAddress={removeAddress} price={price} />
      </main>
    </div>
  )
}
