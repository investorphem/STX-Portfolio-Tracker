import { getBalances } from "./stacksApi.js";

export async function getDeFiPositions(address) {
  const balances = await getBalances(address);

  const tokens = balances.fungible_tokens || {};

  const positions = [];

  for (const token in tokens) {
    positions.push({
      token,
      balance: tokens[token].balance
    });
  }

  return positions;
}