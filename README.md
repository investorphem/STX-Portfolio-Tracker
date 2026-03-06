# STX Portfolio Tracker – Web App + Chrome Extension

A full-featured portfolio tracking tool built on the **Stacks blockchain**, enabling users to monitor STX holdings across multiple addresses, view real-time balances, check live market prices, and connect their Stacks wallet seamlessly.  
Includes both a **responsive web app** and a **Chrome extension** for quick access.

---

## 🚀 Overview
**STX Portfolio Tracker** is a lightweight, contract‑free application designed for effortless tracking of Stacks assets.  
It uses:

- Stacks API  
- @stacks/connect  
- Public blockchain endpoints  

No smart contracts or backend servers required.

---

## ✨ Key Features

### 🔗 Stacks Wallet Integration
- One‑click connection via **@stacks/connect**  
- Automatically detects mainnet STX address  
- Fully non‑custodial authentication  


### 📊 Real-Time Portfolio Tracking
- Track balances for multiple STX addresses  
- Shows total STX + USD value  
- Fetches market data via **CoinGecko API**  
- Clean breakdown of individual address statistics  

### 📮 Activity Monitoring
- Displays recent transactions  
- Inbound/outbound STX transfers  
- Uses **Hiro Stacks API** for accurate chain data  

### 🧩 Chrome Extension Included
- Quick-access popup  
- Wallet connect support  
- Same core engine as the web app  

### 🎨 Beautiful UI
- Built with **TailwindCSS**  
- Fully responsive + mobile optimized  

### ⚡ Zero Smart Contracts
Runs 100% on:
- React (client-side)  
- Stacks public APIs  
- Wallet connection  
No Clarity contract required.

---

## 🛠 Tech Stack

- **React + Vite** – Fast modern frontend  
- **TailwindCSS** – UI styling  
- **@stacks/connect** – Wallet integration  
- **Stacks API** – Balances + transactions  
- **CoinGecko API** – Market data  
- **Manifest V3** – Chrome extension  
- **LocalStorage** – Persistent watchlist  

---

## 📦 Project Structure
```
stx-portfolio-tracker/
│── web/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── index.html
│
│── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── icon assets
```

---

## 🔧 How It Works
1. User connects their Stacks wallet  
2. Application fetches their STX address  
3. User adds additional addresses to monitor  
4. Balances + transactions loaded from Stacks API  
5. Price data loaded from CoinGecko  
6. Dashboard aggregates total portfolio view  

---

## 🌐 Deployment

### ✔ Web App
Deploy instantly on:
- **Vercel**
- **Netlify**
- **GitHub Pages**

Client-side only → No backend needed.

### ✔ Chrome Extension
Load the `extension/` folder using:
```
chrome://extensions
→ Enable Developer Mode
→ Load unpacked
```

---

## 📄 License
**MIT License** – Free to use, modify, and build on.

---

## 💡 Future Enhancements
- STX stacking rewards calculator  
- NFT holdings viewer  
- Cloud-synced presets  
- Address tagging + notes  
