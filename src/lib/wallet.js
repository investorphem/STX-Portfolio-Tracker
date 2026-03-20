import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

// v8+ uses getLocalStorage() instead of a manual UserSession
export function getUserData() {
  return isConnected() ? getLocalStorage() : null;
}

export async function connectWallet() {
  try {
    // connect() is the v8 standard. It triggers the wallet picker 
    // and returns the connected addresses/profile.
    const response = await connect({
      appDetails: {
        name: 'STX Portfolio Tracker',
        icon: window.location.origin + '/icon.png',
      },
    });
    return response;
  } catch (err) {
    console.error('[wallet] Connect failed:', err);
    throw err;
  }
}

export function getUserAddressSafe() {
  const session = getLocalStorage();
  // v8 returns addresses in an object: { stx: [...], btc: [...] }
  return session?.addresses?.stx?.[0]?.address || null;
}

export function signOut() {
  disconnect(); // This clears the internal v8 session automatically
}

export async function openTransfer({ recipient, amount, memo }) {
  const stxAddress = getUserAddressSafe();
  if (!stxAddress) throw new Error('Wallet not connected');

  const microStx = BigInt(Math.round(Number(amount) * 1_000_000));

  // In v8, we use 'stx_transferStx' via the request() method
  return await request('stx_transferStx', {
    recipient,
    amount: microStx.toString(),
    memo: memo || '',
    postConditions: [
      makeStandardSTXPostCondition(
        stxAddress,
        FungibleConditionCode.LessEqual,
        microStx
      )
    ]
  });
}
