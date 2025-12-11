import React, {useEffect, useState} from


export default function Portfolio({addresses, removeAddress, price}){
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    let cancelled = false
    async function fetchAll(){
      if(!addresses || addresses.length===0){ setData({}); return }
      setLoading(true)
      const out = {}
      for(const addr of addresses){
        try{
          const acc = await getAccountInfo(addr)
          const txs = await getTxsForAddress(addr, 5)
          out[addr] = { account: acc, txs: txs || [], error: null }
        }catch(e){
          out[addr] = { account: null, txs: [], error: e.message }
        }
      }
      if(!cancelled) setData(out)
      setLoading(false)
    }
    fetchAll()
    return ()=> cancelled = true
  },[addresses])

  function fmt(micro){
    if(micro==null) return '-'
    return (micro / 1_000_000).toFixed(6)
  }

  const totalStx = Object.values(data).reduce((s, item)=>{
    if(!item || !item.account) return s
    return s + Number(item.account.balance || 0)
  }, 0) / 1_000_000

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Tracked Addresses</h2>
      {addresses.length===0 && <div className="card p-4">No addresses tracked yet.</div>}
      {loading && <div className="small">Refreshing...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {addresses.map(addr=>{
          const d = data[addr]
          const bal = d && d.account ? d.account.balance : null
          return (
            <div className="card" key={addr}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="addr">{addr}</div>
                  <div className="small mt-1">Nonce: {d?.account?.nonce ?? '—'}</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-lg font-semibold">{bal!=null ? fmt(bal) + ' STX' : '—'}</div>
                  <div className="small">{price && bal!=null ? '$' + ((bal/1_000_000)*price).toFixed(2) : '—'}</div>
                  <button className="btn-ghost mt-2" onClick={()=> removeAddress(addr)}>Remove</button>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="font-medium">Recent Transactions</h4>
                <ul className="mt-2">
                  {d && d.txs && d.txs.length>0 ? d.txs.map(tx=>{
                    const id = tx.tx_id || tx.tx_id
                    const type = tx.tx_type || tx.type || (tx.tx && tx.tx.type) || 'tx'
                    return <li key={id} className="small border-t border-slate-700 py-2"><div className="font-mono text-xs">{id?.slice?.(0,16)}</div><div className="small">{type}</div></li>
                  }) : <li className="small">No recent txs</li>}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card mt-6">
        <h3 className="font-semibold">Portfolio Summary</h3>
        <div className="mt-2">Total STX: <strong>{totalStx.toFixed(6)}</strong></div>
        <div>Total USD: <strong>{price ? '$' + (totalStx * price).toFixed(2) : '—'}</strong></div>
      </div>
    </section>
  )
}
