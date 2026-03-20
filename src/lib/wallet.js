import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect';
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

/**
 * Returns user data if signed in. 
 * In v7+, connect() persists data to localStorage automatically.
 */
export function getUserData() {
  return isConnected() ? getLocalStorage() : null;
}

export async function connectWallet() {
  try {
    // The modern way: returns a promise that resolves after the user selects an account
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
  // New structure: addresses are grouped by type (stx, btc)
  return session?.addresses?.stx?.[0]?.address || null;
}

export function signOut() {
  disconnect(); // Clears internal state and localStorage
}

export async function openTransfer({ recipient, amount, memo }) {
  const stxAddress = getUserAddressSafe();
  if (!stxAddress) throw new Error('Wallet not connected');

  const microStx = BigInt(Math.round(Number(amount) * 1_000_000));

  // The 'stx_transferStx' RPC method is the standard for 2026
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
