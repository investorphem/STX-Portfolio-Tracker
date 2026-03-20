import React, { useState, useEffect } from 'react'
import Portfolio from './components/Portfolio'
import { getPriceUSD } from './lib/api'
import { connectWallet, getUserData, signOut, getUserAddressSafe, openTransfer } from './lib/wallet'

export default function App() {
  const [user, setUser] = useState(getUserData())
  const [price, setPrice] = useState(null)
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stx_addresses') || '[]') } catch (e) { return [] }
  })

  useEffect(() => {
    async function init() {
      setPrice(await getPriceUSD())
      // Sync connected wallet to watchlist
      const current = getUserAddressSafe()
      if (current && !addresses.includes(current)) {
        setAddresses(prev => [...new Set([current, ...prev])])
      }
    }
    init()
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">STX Tracker</h1>
          <p className="text-slate-400">v8.0.0 Enabled</p>
        </div>
        <div className="flex gap-4">
          {!user ? (
            <button className="bg-orange-600 px-6 py-2 rounded-lg font-bold" onClick={handleConnect}>Connect</button>
          ) : (
            <div className="flex items-center gap-3">
              <code className="text-xs bg-slate-800 p-2 rounded">{getUserAddressSafe()}</code>
              <button className="text-xs text-slate-500 underline" onClick={() => { signOut(); setUser(null); }}>Sign Out</button>
            </div>
          )}
        </div>
      </header>

      <main>
        <div className="flex gap-2 mb-6">
          <input id="newaddr" placeholder="SP..." className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded" />
          <button className="bg-white text-black px-6 py-2 rounded font-bold" onClick={() => {
            const val = document.getElementById('newaddr').value.trim()
            if (val) {
              setAddresses(prev => [...new Set([val, ...prev])])
              document.getElementById('newaddr').value = ''
            }
          }}>Track</button>
        </div>

        <Portfolio addresses={addresses} price={price} removeAddress={(a) => setAddresses(prev => prev.filter(x => x !== a))} />
      </main>
    </div>
  )
}
