import axios from "axios";
import { STACKS_API_MAINNET } from "../config.js";

export async function getBalances(address) {
  const res = await axios.get(
    `${STACKS_API_MAINNET}/extended/v1/address/${address}/balances`
  );

  return res.data;
}

export async function getTransactions(address) {
  const res = await axios.get(
    `${STACKS_API_MAINNET}/extended/v1/address/${address}/transactions`
  );

  return res.data.results;
}