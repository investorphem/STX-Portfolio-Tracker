import axios from "axios";
import { STACKS_API_MAINNET } from "../config.js";

export async function getNFTs(address) {
  const res = await axios.get(
    `${STACKS_API_MAINNET}/extended/v1/tokens/nft/holdings?principal=${address}`
  );

  return res.data.results;
}