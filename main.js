import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB31qLNXaKh5Eo5ft0GT3FDdqHcTMXvT0s",
  authDomain: "ctinventory-af9f8.firebaseapp.com",
  databaseURL: "https://ctinventory-af9f8-default-rtdb.firebaseio.com",
  projectId: "ctinventory-af9f8",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function loadTransactionInfo(memberNo) {
  const dbID = localStorage.getItem("dbID");
  const transactionRef = ref(db, `MemberPointChecker/${dbID}/Member/${memberNo}/Transaction`);

  try {
    const snapshot = await get(transactionRef);
    if (!snapshot.exists()) {
      document.getElementById("transactionInfo").innerHTML = `<p>No transactions found.</p>`;
      return;
    }

    const transactionArray = Object.entries(snapshot.val())
      .map(([key, value]) => ({ id: key, ...value }))
      .sort((a, b) => new Date(b.Timestamp || b.Date || 0) - new Date(a.Timestamp || a.Date || 0))
      .slice(0, 5);

    const html = transactionArray.map(tx => `
      <div class="transaction-row">
        <div class="transaction-main">
          <span class="transaction-doc">${tx.DocNo || tx.id}</span>
          <span class="transaction-total">${(tx.FinalTotal ?? 0).toFixed(2)}</span>
        </div>
        <div class="transaction-meta">
          <span class="transaction-payment">${tx.PaymentType || "Unknown"}</span>
          <span class="transaction-time">${tx.CreatedTime || ""}</span>
        </div>
      </div>
    `).join("");

    document.getElementById("transactionInfo").innerHTML = `<div class="transaction-card">${html}</div>`;
  } catch (error) {
    console.error("Error loading transactions:", error);
    document.getElementById("transactionInfo").innerHTML = `<p>Error loading transactions.</p>`;
  }
}

window.onload = () => {
  const data = localStorage.getItem("loggedInUser");
  if (!data) return location.href = "index.html";

  const user = JSON.parse(data);
  const now = new Date().toLocaleString();

  document.getElementById("balanceInfo").innerHTML = `
    <div class="point-value">${user.Point ?? 0}</div>
    <div class="now-time">Now Time: ${now}</div>
    <div class="user-details-card">
      <div class="user-detail-row"><span class="user-detail-label">Member No:</span><span class="user-detail-value">${user.MemberNo}</span></div>
      <div class="user-detail-row"><span class="user-detail-label">User Name:</span><span class="user-detail-value">${user.Name}</span></div>
      <div class="user-detail-row"><span class="user-detail-label">Email Address:</span><span class="user-detail-value">${user.EmailAddress}</span></div>
      <div class="user-detail-row"><span class="user-detail-label">Mobile Phone:</span><span class="user-detail-value">${user.MobilePhone}</span></div>
    </div>`;

  loadTransactionInfo(user.MemberNo);
  loadAllVouchers();
  loadMyVouchers();
};

window.refreshApp = async () => {
  const dbID = localStorage.getItem("dbID");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const refUser = ref(db, `MemberPointChecker/${dbID}/Member/${user.MemberNo}`);

  try {
    const snapshot = await get(refUser);
    if (!snapshot.exists()) return;

    const freshUser = snapshot.val();
    localStorage.setItem("loggedInUser", JSON.stringify(freshUser));

    const now = new Date().toLocaleString();
    document.getElementById("balanceInfo").innerHTML = `
      <div class="point-value">${freshUser.Point ?? 0}</div>
      <div class="now-time">Now Time: ${now}</div>
      <div class="user-details-card">
        <div class="user-detail-row"><span class="user-detail-label">Member No:</span><span class="user-detail-value">${freshUser.MemberNo}</span></div>
        <div class="user-detail-row"><span class="user-detail-label">User Name:</span><span class="user-detail-value">${freshUser.Name}</span></div>
        <div class="user-detail-row"><span class="user-detail-label">Email Address:</span><span class="user-detail-value">${freshUser.EmailAddress}</span></div>
        <div class="user-detail-row"><span class="user-detail-label">Mobile Phone:</span><span class="user-detail-value">${freshUser.MobilePhone}</span></div>
      </div>`;

    loadTransactionInfo(freshUser.MemberNo);
  } catch (error) {
    alert("Failed to refresh data.");
  }
};

window.logout = () => {
  localStorage.removeItem("loggedInUser");
  location.replace("index.html");
};

async function loadAllVouchers() {
  const dbID = localStorage.getItem("dbID");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const voucherRef = ref(db, `MemberPointChecker/${dbID}/Voucher`);

  try {
    const snapshot = await get(voucherRef);
    if (!snapshot.exists()) {
      document.getElementById("allVoucherTab").innerHTML = "<p>No vouchers found.</p>";
      return;
    }

    const vouchers = snapshot.val();
    let html = "";

    for (const [id, voucher] of Object.entries(vouchers)) {
      html += `
        <div class="voucher-card">
          <h3>${voucher.Description}</h3>
          <p>Redeem for ${voucher.PointToRedeem} points</p>
          <button onclick="redeemVoucher('${id}', ${voucher.PointToRedeem})">Collect</button>
        </div>`;
    }

    document.getElementById("allVoucherTab").innerHTML = html;

  } catch {
    document.getElementById("allVoucherTab").innerHTML = "<p>Error loading vouchers.</p>";
  }
}

async function redeemVoucher(voucherKey, pointRequired) {
  const dbID = localStorage.getItem("dbID");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (user.Point < pointRequired) {
    alert("Not enough points.");
    return;
  }

  const listRef = ref(db, `MemberPointChecker/${dbID}/Voucher/${voucherKey}/VoucherList`);
  const snapshot = await get(listRef);

  const list = snapshot.val();
  const entry = Object.entries(list).find(([_, v]) => v.IsCollected === "F");

  if (!entry) {
    alert("No available voucher.");
    return;
  }

  const [itemKey, voucher] = entry;

  const updates = {
    [`MemberPointChecker/${dbID}/Voucher/${voucherKey}/VoucherList/${itemKey}/IsCollected`]: "T",
    [`MemberPointChecker/${dbID}/Member/${user.MemberNo}/CollectedVouchers/${voucher.VoucherNo}`]: {
      Description: `Collected ${voucher.VoucherNo}`,
      CashValue: pointRequired,
      CollectedTime: new Date().toLocaleString()
    },
    [`MemberPointChecker/${dbID}/Member/${user.MemberNo}/Point`]: user.Point - pointRequired
  };

  await update(ref(db), updates);
  alert("Voucher collected!");
  await refreshApp();
  await loadAllVouchers();
  await loadMyVouchers(); 
}

async function loadMyVouchers() {
  const dbID = localStorage.getItem("dbID");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const refMy = ref(db, `MemberPointChecker/${dbID}/Member/${user.MemberNo}/CollectedVouchers`);

  try {
    const snapshot = await get(refMy);
    if (!snapshot.exists()) {
      document.getElementById("myVoucherTab").innerHTML = "<p>No collected vouchers.</p>";
      return;
    }

    const vouchers = snapshot.val();
    const html = Object.entries(vouchers).map(([k, v]) => `
      <div class="voucher-card">
        <h3>${k}</h3>
        <p>${v.Description}</p>
        <p>Collected at: ${v.CollectedTime}</p>
      </div>`).join("");

    document.getElementById("myVoucherTab").innerHTML = html;
  } catch {
    document.getElementById("myVoucherTab").innerHTML = "<p>Error loading collected vouchers.</p>";
  }
}
window.redeemVoucher = redeemVoucher;
