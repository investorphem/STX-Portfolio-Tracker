import { getBalances } from "../api/stacksApi.js";

export async function getPortfolioValue(address) {
  const balances = await getBalances(address);

  const stx = balances.stx.balance / 1000000;

  return {
    stx_balance: stx
  };
}