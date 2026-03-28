let contract = null;
let currentAccount = null;

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ================= INIT =================
function initContract(account) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  contract = new ethers.Contract(CONTRACT_ADDRESS, window.ABI, signer);
  currentAccount = account.toLowerCase();

  localStorage.setItem("connectedWallet", currentAccount);

  console.log("✅ Contract ready:", contract.address);
}

// ================= CONNECT =================
async function connectWallet() {
  if (!window.ethereum) return alert("Cài MetaMask");

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  localStorage.setItem("walletConnected", "true");

  initContract(accounts[0]);

  await handleRoleRedirect();
}

// ================= AUTO =================
async function autoConnect() {
  if (!window.ethereum) return;

  const isConnected = localStorage.getItem("walletConnected");
  if (!isConnected) return;

  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  if (accounts.length === 0) return;

  initContract(accounts[0]);
}

// ================= GET =================
window.getContract = () => contract;
window.getAccount = () => currentAccount;
window.connectWallet = connectWallet;
window.autoConnect = autoConnect;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  await autoConnect();

  const btn = document.getElementById("connectWalletBtn");
  if (btn) btn.onclick = connectWallet;
});

// ================= CHANGE ACCOUNT =================
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) return;

    const newAcc = accounts[0].toLowerCase();

    console.log("🔁 Đổi ví:", newAcc);

    localStorage.setItem("walletConnected", "true");
    localStorage.setItem("connectedWallet", newAcc);

    location.reload();
  });
}