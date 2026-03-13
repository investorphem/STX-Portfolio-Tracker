import { getTransactions } from "../api/stacksApi.js";

export async function getWalletAnalytics(address) {
  const txs = await getTransactions(address);

  let sent = 0;
  let received = 0;

  txs.forEach((tx) => {
    if (tx.tx_type === "token_transfer") {
      if (tx.sender_address === address) sent++;
      if (tx.recipient_address === address) received++;
    }
  });

  return {
    total_transactions: txs.length,
    sent,
    received
  };
}