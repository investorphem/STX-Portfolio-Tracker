import React, { useState, useEffect } from 'react'
import Portfolio from './components/Portfolio'
import { getPriceUSD } from './lib/api'
import { connectWallet, getUserData, signOut, getUserAddressSafe, openTransfer } from './lib/wallet'

export default function App() {
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stx_addresses') || '[]') } catch (e) { return [] }
  })
  const [price, setPrice] = useState(null)
  const [user, setUser] = useState(getUserData())

  useEffect(() => {
    async function loadPrice() { setPrice(await getPriceUSD()) }
    loadPrice()
    
    // Sync state if user is already logged in
    const activeAddr = getUserAddressSafe();
    if (activeAddr && !addresses.includes(activeAddr)) {
      setAddresses(prev => [activeAddr, ...prev]);
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('stx_addresses', JSON.stringify(addresses))
  }, [addresses])

  async function handleConnect() {
    try {
      const res = await connectWallet();
      setUser(res);
      const addr = getUserAddressSafe();
      if (addr && !addresses.includes(addr)) {
        setAddresses(prev => [addr, ...prev]);
      }
    } catch (err) {
      console.error('Connection failed:', err);
    }
  }

  function handleSignOut() {
    signOut();
    setUser(null);
  }

  // ... (Keep addAddress, removeAddress, addMyAddress, sendFlow as they were)

  return (
    <div className="container p-6 max-w-4xl mx-auto">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-orange-500">STX Tracker</h1>
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          {!user ? (
            <button className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg font-bold transition" onClick={handleConnect}>
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="bg-slate-800 px-4 py-2 rounded text-sm font-mono border border-slate-700">
                {getUserAddressSafe()}
              </div>
              <button className="text-slate-400 hover:text-white underline text-sm" onClick={handleSignOut}>Sign Out</button>
              <button className="bg-slate-700 px-4 py-2 rounded text-sm" onClick={() => {
                const a = getUserAddressSafe();
                if (a && !addresses.includes(a)) setAddresses(prev => [a, ...prev]);
              }}>Add My Address</button>
              <button className="bg-orange-600 px-4 py-2 rounded text-sm font-bold" onClick={() => openTransfer({ recipient: '', amount: '1' })}>Send STX</button>
            </>
          )}
        </div>
      </header>

      <main>
        <div className="flex gap-2 mb-6">
          <input 
            id="newaddr" 
            placeholder="SP..." 
            className="bg-slate-900 border border-slate-700 p-3 rounded flex-1 outline-none focus:ring-2 ring-orange-500" 
          />
          <button className="bg-slate-100 text-black px-6 py-2 rounded font-bold" onClick={() => {
            const v = document.getElementById('newaddr').value.trim();
            if (v) { 
              setAddresses(prev => Array.from(new Set([v, ...prev]))); 
              document.getElementById('newaddr').value = '';
            }
          }}>Track Address</button>
        </div>

        <Portfolio addresses={addresses} removeAddress={(a) => setAddresses(prev => prev.filter(x => x !== a))} price={price} />
      </main>
    </div>
  )
}
