import React, { useState, useEffect } from 'react'
import Portfolio from './components/Portfolio'
import { getPriceUSD } from './lib/api'
import { connectWallet, getUserData, signOut, getUserAddressSafe, openTransfer } from './lib/wallet'

export default function App() {
  const [price, setPrice] = useState(null)
  const [user, setUser] = useState(getUserData())
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stx_addresses') || '[]') } catch (e) { return [] }
  })

  useEffect(() => {
    async function init() {
      setPrice(await getPriceUSD())
      // Auto-add the currently connected wallet to the watchlist
      const current = getUserAddressSafe()
      if (current && !addresses.includes(current)) {
        setAddresses(prev => [current, ...prev])
      }
    }
    init()
  }, [])

  useEffect(() => {
    localStorage.setItem('stx_addresses', JSON.stringify(addresses))
  }, [addresses])

  async function handleConnect() {
    try {
      const userData = await connectWallet()
      setUser(userData)
      const addr = getUserAddressSafe()
      if (addr && !addresses.includes(addr)) {
        setAddresses(prev => [addr, ...prev])
      }
    } catch (err) {
      console.warn('User cancelled or failed to connect')
    }
  }

  function handleSignOut() {
    signOut()
    setUser(null)
  }

  return (
    <div className="container p-6 mx-auto max-w-4xl">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-orange-500">STX Portfolio</h1>
        <div className="flex gap-3 mt-4">
          {!user ? (
            <button className="bg-orange-600 px-5 py-2 rounded-lg font-bold" onClick={handleConnect}>
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="bg-slate-800 p-2 rounded text-xs font-mono border border-slate-700">
                {getUserAddressSafe()}
              </div>
              <button className="text-sm underline text-slate-400" onClick={handleSignOut}>Sign Out</button>
              <button className="bg-orange-600 px-4 py-2 rounded-lg text-sm font-bold" onClick={() => openTransfer({ recipient: '', amount: '1' })}>
                Send
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <div className="flex gap-2 mb-4">
          <input 
            id="addrInput" 
            placeholder="SP... address" 
            className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded" 
          />
          <button className="bg-white text-black px-6 py-2 rounded font-bold" onClick={() => {
            const val = document.getElementById('addrInput').value.trim()
            if (val) {
              setAddresses(prev => Array.from(new Set([val, ...prev])))
              document.getElementById('addrInput').value = ''
            }
          }}>Add</button>
        </div>
        
        <div className="text-sm text-green-400 mb-6">
          STX Price: {price ? `$${price.toFixed(4)}` : 'Loading...'}
        </div>

        <Portfolio addresses={addresses} price={price} removeAddress={(a) => setAddresses(prev => prev.filter(x => x !== a))} />
      </main>
    </div>
  )
}
