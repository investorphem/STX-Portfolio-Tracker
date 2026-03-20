import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

/**
 * Returns user data if connected.
 * v8 returns an object: { addresses: { stx: [{address, publicKey}], btc: [...] } }
 */
export function getUserData() {
  return isConnected() ? getLocalStorage() : null;
}

export async function connectWallet() {
  try {
    // connect() triggers the wallet selection and account request
    const response = await connect({
      appDetails: {
        name: 'STX Portfolio Tracker',
        icon: window.location.origin + '/favicon.png',
      },
    });
    return response; 
  } catch (err) {
    console.error('Wallet connection failed:', err);
    throw err;
  }
}

export function getUserAddressSafe() {
  const session = getLocalStorage();
  // v8 structure: session.addresses.stx[0].address
  return session?.addresses?.stx?.[0]?.address || null;
}

export function signOut() {
  disconnect(); // Clears internal session and caches
}

/**
 * Modern v8 STX Transfer
 */
export async function openTransfer({ recipient, amount, memo }) {
  const from = getUserAddressSafe();
  if (!from) throw new Error('Connect wallet first');

  // 1 STX = 1,000,000 microSTX
  const microStx = BigInt(Math.round(Number(amount) * 1_000_000));

  // In v8, we use 'stx_transferStx' with JSON-RPC params
  return await request('stx_transferStx', {
    recipient,
    amount: microStx.toString(),
    memo: memo || '',
    // Note: Simple STX transfers in v8 often handle post-conditions 
    // automatically, but you can pass them if specific control is needed.
  });
}
