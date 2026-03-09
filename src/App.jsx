// src/App.jsx
import React, { useState, useEffect } from 'react'
import Portfolio from './components/Portfolio'
import { getPriceUSD } from './lib/api'
import { connectWallet, getUserData, signOut, getUserAddressSafe, openTransfer } from './lib/wallet'

export default function App() {
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stx_addresses') || '[]') } catch (e) { return [] }
  })
  const [price, setPrice] = useState(null)
  const [user, setUser] = useState(() => {
    try { return getUserData() } catch (e) { return null }
  })

  useEffect(() => {
    async function loadPrice() { setPrice(await getPriceUSD()) }
    loadPrice()
  }, [])

  useEffect(() => {
    localStorage.setItem('stx_addresses', JSON.stringify(addresses))
  }, [addresses])

  async function handleConnect() {
    console.log('[app] handleConnect start')
    try {
      const u = await connectWallet()
      console.log('[app] connectWallet returned:', u)
      setUser(u)
      const addr = getUserAddressSafe()
      if (addr && !addresses.includes(addr)) {
        setAddresses(prev => [addr, ...prev])
      }
    } catch (err) {
      console.error('[app] connect error:', err)
      alert('Wallet connection failed — check console and ensure a compatible wallet extension is installed and popups are allowed.')
    }
  }

  function handleSignOut() {
    try {
      signOut()
      setUser(null)
    } catch (e) {
      console.warn('signOut error', e)
    }
  }

  function addAddress(addr) {
    if (!addr) return
    if (addresses.includes(addr)) return alert('Already added')
    setAddresses(prev => [addr, ...prev])
  }

  function removeAddress(addr) {
    setAddresses(prev => prev.filter(a => a !== addr))
  }

  function addMyAddress() {
    const a = getUserAddressSafe()
    if (!a) return alert('No connected address found')
    addAddress(a)
  }

  async function sendFlow() {
    const recipient = prompt('Recipient STX address:')
    if (!recipient) return
    const amount = prompt('Amount (STX):')
    if (!amount) return
    try {
      await openTransfer({ recipient, amount, memo: 'Sent via STX Portfolio Tracker' })
      alert('Transfer dialog opened in wallet.')
    } catch (e) {
      alert('Error opening transfer: ' + (e?.message || e))
    }
  }

  return (
    <div className="container">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">STX Portfolio Tracker</h1>
        <p className="small mt-1">Track STX addresses, view balances and recent txs. Wallet integration via Stacks Connect.</p>

        <div className="mt-4 flex gap-3">
          {!user ? (
            <button className="btn" onClick={handleConnect}>Connect Wallet</button>
          ) : (
            <>
              <div className="card small">Connected: <code className="addr ml-2">{getUserAddressSafe()}</code></div>
              <button className="btn-ghost" onClick={handleSignOut}>Sign Out</button>
              <button className="btn" onClick={addMyAddress}>Add my address</button>
              <button className="btn" onClick={sendFlow}>Send STX</button>
            </>
          )}
        </div>
      </header>

      <main>
        <div className="mb-4">
          <div className="flex gap-2">
            <input id="newaddr" placeholder="Enter STX address to track" className="p-2 rounded-md bg-slate-800 border border-slate-700 flex-1" />
            <button className="btn" onClick={() => {
              const v = document.getElementById('newaddr').value.trim()
              if (v) { addAddress(v); document.getElementById('newaddr').value = '' }
            }}>Add</button>
          </div>
          <div className="mt-2 small">STX price: {price ? '$' + price.toFixed(4) : 'Loading...'}</div>
        </div>

        <Portfolio addresses={addresses} removeAddress={removeAddress} price={price} />
      </main>

      <footer className="mt-8 small">Built for demo. Data from Stacks API & CoinGecko. No private keys requested.</footer>
    </div>
  )
}