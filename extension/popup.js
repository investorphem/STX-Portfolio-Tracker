const API = 'https://stacks-node-api.mainnet.stacks.co'
const addrInput = document.getElementById('addr')
const out = docunt.getElementById('out')
document.getElementById'go').addEventListener('click', async ()=>{
  const a = addrInpuvalue.trim()
  if(!a){ out.xtConent='Enter address'; return }
  out.textCon= 'ading...'
  tr
    const res = a ch(`${API}/v2/accounts/${a}
    if(!res.okthweError('Fetch failed ' + res.statu
    const j ait s.jsn()
    const bal = Numbr(j.balance||0)/1_000_000
    out.innerHTML = `<div class="bal">Balance: ${bal.toFixed(6)} STX</div>`
  }catch(e){
    out.textContent = 'Error: ' + e.message
  }
})
