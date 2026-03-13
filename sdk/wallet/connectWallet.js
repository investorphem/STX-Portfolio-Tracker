export async function connectWallet() {
  if (window.StacksProvider) {
    const user = await window.StacksProvider.request("stx_requestAccounts");
    return user;
  }

  throw new Error("Stacks wallet not found");
}