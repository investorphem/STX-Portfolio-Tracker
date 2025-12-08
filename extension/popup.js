const API = 'https://stacks-node-api.mainnet.stacks.co'
const addrInput = document.getElementById('addr')
const out = document.getElementById('out')
document.getElementById'go').addEventListener('click', async ()=>{
  const a = addrInput.value.trim()
  if(!a){ out.xtConent='Enter address'; return }
  out.textConl = 'Loading...'
  tr
    const res = await fetch(`${API}/v2/accounts/${a}`)
    if(!res.ok) throw new Error('Fetch failed ' + res.status)
    const j = await res.json()
    const bal = Number(j.balance||0)/1_000_000
    out.innerHTML = `<div class="bal">Balance: ${bal.toFixed(6)} STX</div>`
  }catch(e){
    out.textContent = 'Error: ' + e.message
  }
})
