// src/lib/wallet.js
import { AppConfig, showConnect, UserSession, openSTXTransfer } from '@stacks/connect';
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function safeLoadUser() {
  try { return userSession.loadUserData(); } catch(e) { console.warn('loadUserData failed', e); return null; }
}

export function getUserData() { return safeLoadUser(); }

export async function connectWallet() {
  if (typeof showConnect !== 'function') {
    throw new Error('showConnect is not a function — check @stacks/connect version');
  }
  return new Promise((resolve, reject) => {
    try {
      showConnect({
        appDetails: { name: 'STX Portfolio Tracker', icon: window.location.origin + '/icon.png' },
        onFinish: () => resolve(safeLoadUser()),
        onCancel: () => reject(new Error('User cancelled connect')),
        onSignOut: () => resolve(null)
      });
    } catch (err) {
      console.error('[wallet] showConnect threw', err);
      reject(err);
    }
  });
}

export function getUserAddressSafe() {
  const u = safeLoadUser();
  return (u?.profile?.stxAddress?.mainnet) || (u?.profile?.stxAddress) || (u?.profile?.stxAddress?.address) || null;
}

export function signOut() {
  try { userSession.signUserOut(window.location.origin) } catch(e) { console.warn('signOut error', e); }
}

export async function openTransfer({ recipient, amount, memo }) {
  const amt = Number(amount);
  if (Number.isNaN(amt) || amt <= 0) throw new Error('Invalid amount');
  const from = getUserAddressSafe();
  const postConditions = from ? [
    makeStandardSTXPostCondition(from, FungibleConditionCode.LessEqual, BigInt(Math.round(amt * 1_000_000)))
  ] : [];
  return openSTXTransfer({ recipient, amount: String(amt), memo: memo || '', network: undefined, postConditions });
}