// connect.js - Full & cải tiến: Tự lower case + dễ quản lý địa chỉ

let currentAccount = null;

// ==================== DANH SÁCH ĐỊA CHỈ VÍ ====================
const roleMap = {
  "0x3A531AaeDb565e49eDb69268d8a1174930820cb4": "admin",
  "0x9D378bb6943291E4e04339F34A5090eeDD636623": "manager",
  "0x99F9d30B5A338c74A024EAA3AdA1EC2dfFF53e6B": "staff",
  "0xb2a13111DB1b55435963b717d725FE46587B30EB": "user",
  "0x9a0fF88Ca83e402f6501bAc3be7a45901e5B3603": "guest",
};

// Chuyển toàn bộ roleMap về chữ thường khi khởi động
const normalizedRoleMap = Object.fromEntries(
  Object.entries(roleMap).map(([address, role]) => [address.toLowerCase(), role])
);

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Vui lòng cài MetaMask để kết nối ví!");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    currentAccount = accounts[0].toLowerCase();

    console.log("🔗 Địa chỉ ví vừa connect:", currentAccount);

    const role = normalizedRoleMap[currentAccount] || "unknown";

    console.log("📌 Role tìm được:", role);

    // Cập nhật nút
    updateWalletButton();

    // Chuyển hướng theo role
    switch (role) {
      case "admin":
        window.location.href = "admin.html";
        break;
      case "manager":
        window.location.href = "manager.html";
        break;
      case "staff":
        window.location.href = "staff.html";
        break;
      case "user":
        window.location.href = "user.html";
        break;
      case "guest":
        window.location.href = "guest.html";
        break;
      default:
        alert(`Tài khoản ${currentAccount.slice(0,6)}...${currentAccount.slice(-4)}\n\nChưa được cấp quyền trong hệ thống!`);
    }

  } catch (error) {
    console.error(error);
    alert("Kết nối ví bị từ chối hoặc xảy ra lỗi!");
  }
}

function updateWalletButton() {
  const btn = document.getElementById("connectWalletBtn");
  if (btn && currentAccount) {
    btn.textContent = `${currentAccount.slice(0,6)}...${currentAccount.slice(-4)}`;
  }
}

// Reset wallet khi quay về trang chính
function resetWalletOnMain() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("main.html") || 
      path.includes("index.html") || 
      path.endsWith("/") || 
      path === "") {
    
    currentAccount = null;
    const btn = document.getElementById("connectWalletBtn");
    if (btn) btn.textContent = "Connect Wallet";
  }
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectWalletBtn");
  if (connectBtn) {
    connectBtn.addEventListener("click", connectWallet);
  }

  resetWalletOnMain();
  window.addEventListener("pageshow", resetWalletOnMain);
});