const API = 'https://api.mainnet.hiro.so';
const syncInput = document.getElementById('syncInput');
const syncBtn = document.getElementById('syncBtn');
const watchlistDiv = document.getElementById('watchlist');
const statusDiv = document.getElementById('status');

// 1. Auto-load saved addresses when you click the extension icon
document.addEventListener('DOMContentLoaded', loadWatchlist);

// 2. Handle the "Paste & Sync" from your Web App
syncBtn.addEventListener('click', () => {
  try {
    const pastedData = syncInput.value.trim();
    // Parse the JSON array copied from the website
    const addresses = JSON.parse(pastedData); 

    if (!Array.isArray(addresses)) throw new Error("Invalid format");

    // Save it to Chrome's local storage
    chrome.storage.local.set({ stx_watchlist: addresses }, () => {
      syncInput.value = ''; // Clear input
      statusDiv.textContent = 'Watchlist Synced Successfully! ✅';
      loadWatchlist(); // Refresh the UI
    });
  } catch (e) {
    statusDiv.textContent = '❌ Invalid data. Please use the Sync button on the website.';
  }
});

// 3. Fetch and display all balances
function loadWatchlist() {
  chrome.storage.local.get(['stx_watchlist'], async (result) => {
    const addresses = result.stx_watchlist || [];

    if (addresses.length === 0) {
      watchlistDiv.innerHTML = '';
      statusDiv.textContent = 'No addresses synced yet. Go to your dashboard to copy them.';
      return;
    }

    statusDiv.textContent = 'Fetching live balances...';
    watchlistDiv.innerHTML = ''; // Clear old list

    for (const addr of addresses) {
      try {
        const res = await fetch(`${API}/v2/accounts/${addr}`);
        if (!res.ok) throw new Error('Fetch failed');

        const data = await res.json();
        const bal = Number(data.balance || 0) / 1_000_000;

        // Truncate address so it fits in the small popup (SP123...4567)
        const shortAddr = `${addr.slice(0, 5)}...${addr.slice(-4)}`;

        // Add the wallet card to the UI
        watchlistDiv.innerHTML += `
          <div class="wallet-card">
            <span class="addr">${shortAddr}</span>
            <span class="bal">${bal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span class="stx-label">STX</span></span>
          </div>
        `;
      } catch (e) {
        console.error('Failed to fetch', addr);
      }
    }
    statusDiv.textContent = 'Live Feed Active 🟢';
  });
}
