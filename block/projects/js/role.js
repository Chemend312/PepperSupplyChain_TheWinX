// ================= GET ROLE =================
async function getUserRole() {
  const c = window.getContract();
  const acc = window.getAccount();

  if (!c || !acc) return null;

  try {
    if (await c.farmers(acc)) return "farmer";
    if (await c.processors(acc)) return "processor";
    if (await c.distributors(acc)) return "distributor";
    if (await c.certifiers(acc)) return "certifier";
    if (await c.retailers(acc)) return "retailer";
  } catch (err) {
    console.error("❌ Role error:", err);
  }

  return "unknown";
}

// ================= ROLE MAP =================
const ROLE_PAGES = {
  farmer: "farm_01.html",
  processor: "process_01.html",
  distributor: "distribution.html",
  certifier: "cert_01.html",
  retailer: "retail.html"
};

// ================= REDIRECT =================
async function handleRoleRedirect() {
  const role = await getUserRole();

  console.log("📌 ROLE:", role);

  if (!role || role === "unknown") {
    alert("Ví chưa có role");
    return;
  }

  const targetPage = ROLE_PAGES[role];
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage !== targetPage) {
    location.href = targetPage;
  }
}

// ================= GUARD (🔥 QUAN TRỌNG) =================
async function protectPage(expectedRole) {
  const role = await getUserRole();

  console.log("🔐 Protect page | expected:", expectedRole, "| actual:", role);

  if (!role) return;

  // ❌ sai role → đá về đúng page
  if (role !== expectedRole) {
    alert("❌ Bạn không có quyền vào trang này");

    const correctPage = ROLE_PAGES[role];
    if (correctPage) {
      location.href = correctPage;
    } else {
      location.href = "main.html";
    }
  }
}

window.getUserRole = getUserRole;
window.handleRoleRedirect = handleRoleRedirect;
window.protectPage = protectPage;