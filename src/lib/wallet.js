// src/lib/wallet.js
import { AppConfig, showConnect, UserSession, openSTXTransfer } from '@stacks/connect';
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function safeLoadUser() {
  try { return userSession.loadUserData(); } catch (e) { console.warn('loadUserData failed', e); return null; }
}

export function getUserData() {
  return safeLoadUser();
}

export function isSignedIn() {
  try { return userSession.isUserSignedIn(); } catch (e) { return false; }
}

export async function connectWallet() {
  console.log('[wallet] connectWallet() origin=', window.location.origin);
  return new Promise((resolve, reject) => {
    try {
      showConnect({
        appDetails: { name: 'STX Portfolio Tracker', icon: window.location.origin + '/icon.png' },
        onFinish: () => {
          try {
            const u = safeLoadUser();
            console.log('[wallet] onFinish user:', u);
            resolve(u);
          } catch (err) {
            console.error('[wallet] onFinish load error', err);
            reject(err);
          }
        },
        onCancel: () => {
          console.warn('[wallet] user cancelled connect');
          reject(new Error('User cancelled connect'));
        },
        onSignOut: () => {
          console.log('[wallet] onSignOut triggered');
          resolve(null);
        }
      });
    } catch (err) {
      console.error('[wallet] showConnect threw', err);
      reject(err);
    }
  });
}

export function signOut() {
  try { userSession.signUserOut(window.location.origin); } catch (e) { console.warn('signOut error', e); }
}

export function getUserAddressSafe() {
  const u = safeLoadUser();
  if (!u) return null;
  // support different shapes returned by connect across versions
  return (u?.profile?.stxAddress?.mainnet) || (u?.profile?.stxAddress) || (u?.profile?.stxAddress?.address) || null;
}

export async function openTransfer({ recipient, amount, memo }) {
  const amt = Number(amount);
  if (Number.isNaN(amt) || amt <= 0) throw new Error('Invalid amount');
  const from = getUserAddressSafe();
  const postConditions = from ? [
    makeStandardSTXPostCondition(from, FungibleConditionCode.LessEqual, BigInt(Math.round(amt * 1_000_000)))
  ] : [];

  try {
    return await openSTXTransfer({
      recipient,
      amount: String(amt),
      memo: memo || '',
      network: undefined,
      postConditions
    });
  } catch (e) {
    console.error('[wallet] openSTXTransfer error', e);
    throw e;
  }
}