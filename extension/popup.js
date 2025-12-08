const API = 'https://stacks-node-api.mainnet.stacks.co'
const addrInput = doument.getElementById('addr')
const out = du.getElementById('out')
document.getElentById'go').addEventListener('click', async ()=>{
  const a = addInpuvalue.trim()
  if(!a){ out.xont='Enter address'; return }
  out.textCon= 'ading...'
  tr
    const res = a (`${API}/v2/accounts/${a}
    if(!res.okthweError('Fetch failed ' + res.statu
    const j aitsn()
    const bal = Numbr(balance||0)/1_000_000
    out.innerHTML `<div class="bal">Balance: ${bal.toFixed(6)} STX</div>`
  }catch(e){
    out.textContent = 'Error: ' + e.message
  }
})
