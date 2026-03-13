# stx-portfolio-sdk

![npm](https://img.shields.io/npm/v/stx-portfolio-sdk)
![npm downloads](https://img.shields.io/npm/dw/stx-portfolio-sdk)
![license](https://img.shields.io/npm/l/stx-portfolio-sdk)

**Developer SDK for tracking Stacks (STX) portfolios, DeFi positions,
NFTs, and wallet analytics.**

Build powerful Bitcoin DeFi dashboards, portfolio trackers, and
analytics tools on top of the **Stacks blockchain**.

------------------------------------------------------------------------

## ✨ Features

-   📊 Wallet analytics
-   💰 STX balance tracking
-   🧾 Transaction history
-   🪙 DeFi token positions (SIP‑010 tokens)
-   🖼 NFT holdings tracker
-   📈 Portfolio chart data
-   🔗 Web3 wallet connection (Leather / Xverse compatible)
-   ⚡ Simple developer-friendly API

------------------------------------------------------------------------

# 📦 Installation

``` bash
npm install stx-portfolio-sdk
```

or

``` bash
yarn add stx-portfolio-sdk
```

------------------------------------------------------------------------

# 🚀 Quick Start

``` javascript
import { getPortfolioValue } from "stx-portfolio-sdk";

const wallet = "SP123...";

const portfolio = await getPortfolioValue(wallet);

console.log(portfolio);
```

Example Output

``` json
{
  "stx_balance": 125.32
}
```

------------------------------------------------------------------------

# 📊 Wallet Analytics

Track wallet activity and behavior.

``` javascript
import { getWalletAnalytics } from "stx-portfolio-sdk";

const wallet = "SP123...";

const analytics = await getWalletAnalytics(wallet);

console.log(analytics);
```

Example Output

``` json
{
  "total_transactions": 45,
  "sent": 20,
  "received": 25
}
```

------------------------------------------------------------------------

# 🪙 DeFi Token Positions

Track SIP‑010 token balances.

``` javascript
import { getDeFiPositions } from "stx-portfolio-sdk";

const wallet = "SP123...";

const positions = await getDeFiPositions(wallet);

console.log(positions);
```

Example Output

``` json
[
  {
    "token": "ALEX",
    "balance": "150000000"
  },
  {
    "token": "USDA",
    "balance": "45000000"
  }
]
```

------------------------------------------------------------------------

# 🖼 NFT Holdings

Fetch NFTs owned by a Stacks address.

``` javascript
import { getNFTs } from "stx-portfolio-sdk";

const wallet = "SP123...";

const nfts = await getNFTs(wallet);

console.log(nfts);
```

------------------------------------------------------------------------

# 📈 Portfolio Chart Data

Generate chart-ready data for dashboards.

``` javascript
import { buildPortfolioChart } from "stx-portfolio-sdk";

const data = [
  { asset: "STX", value: 120 },
  { asset: "ALEX", value: 45 }
];

const chart = buildPortfolioChart(data);

console.log(chart);
```

Example Output

``` json
{
  "type": "pie",
  "data": [
    { "asset": "STX", "value": 120 },
    { "asset": "ALEX", "value": 45 }
  ]
}
```

Compatible with:

-   Chart.js
-   Recharts
-   ECharts
-   D3.js

------------------------------------------------------------------------

# 🔗 Connect Web3 Wallet

Supports Stacks browser wallets like **Leather** and **Xverse**.

``` javascript
import { connectWallet } from "stx-portfolio-sdk";

const wallet = await connectWallet();

console.log(wallet);
```

------------------------------------------------------------------------

# 🧱 SDK Architecture

    sdk
     ├── api
     │   ├── stacksApi.js
     │   ├── defi.js
     │   └── nft.js
     │
     ├── analytics
     │   ├── walletAnalytics.js
     │   └── portfolioValue.js
     │
     ├── charts
     │   └── portfolioChart.js
     │
     └── wallet
         └── connectWallet.js

------------------------------------------------------------------------

# 🌍 Use Cases

This SDK can power:

-   Stacks portfolio trackers
-   Bitcoin DeFi dashboards
-   NFT explorers
-   Web3 analytics platforms
-   Crypto tax tools
-   DAO treasury dashboards

------------------------------------------------------------------------

# 🛠 Built For

-   Stacks developers
-   Web3 engineers
-   Bitcoin DeFi builders
-   Crypto portfolio apps

------------------------------------------------------------------------

# 🤝 Contributing

Contributions are welcome.

1.  Fork the repository
2.  Create a feature branch
3.  Commit your changes
4.  Submit a pull request

------------------------------------------------------------------------

# 📜 License

MIT License

------------------------------------------------------------------------

# 👨‍💻 Author

**Oluwafemi Olagoke**

Stacks / Bitcoin DeFi Builder

------------------------------------------------------------------------

# ⭐ Support

If you find this SDK useful:

-   Star the GitHub repo
-   Share with other developers
-   Build something amazing on Stacks
