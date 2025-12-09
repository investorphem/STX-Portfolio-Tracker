// inside your App component (replace onConnect / connect button handler)
async function handleConnect() {
  console.log('[app] handleConnect start');
  try {
    const u = await connectWallet();
    console.log('[app] connectWallet returned:', u);
    setUser(u);
    // optional: add connected address to list automatically
    const addr = getUserAddressSafe();
    if (addr && !addresses.includes(addr)) {
      setAddresses(prev => [addr, ...prev]);
    }
  } catch (err) {
    console.error('[app] connect error:', err);
    alert('Wallet connection failed — check console for details and ensure a compatible wallet extension is installed and popups are allowed.');
  }
}