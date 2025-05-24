//<!-- main.js -->

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB31qLNXaKh5Eo5ft0GT3FDdqHcTMXvT0s",
  authDomain: "ctinventory-af9f8.firebaseapp.com",
  databaseURL: "https://ctinventory-af9f8-default-rtdb.firebaseio.com",
  projectId: "ctinventory-af9f8",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fetch the latest 10 transactions and render
async function loadTransactionInfo(memberNo) {
  const dbID = localStorage.getItem("dbID");
  const transactionRef = ref(db, `MemberPointChecker/${dbID}/Member/${memberNo}/Transaction`);

  try {
    const snapshot = await get(transactionRef);
    if (!snapshot.exists()) {
      document.getElementById("transactionInfo").innerHTML = `<p>No transactions found.</p>`;
      return;
    }

    const transactions = snapshot.val();

    // Convert to array and sort by timestamp descending
    const transactionArray = Object.entries(transactions)
      .map(([key, value]) => ({ id: key, ...value }))
      .sort((a, b) => new Date(b.Timestamp || b.Date || 0) - new Date(a.Timestamp || a.Date || 0))
      .slice(0, 5);

    // Build HTML
    const html = transactionArray.map(tx => {
      const docNo = tx.DocNo || tx.id;
      const payment = tx.PaymentType || "Unknown";
      const total = tx.FinalTotal ?? 0;
      const time = tx.CreatedTime || "";

      return `
        <div class="transaction-row">
          <div class="transaction-main">
            <span class="transaction-doc">${docNo}</span>
            <span class="transaction-total">${total.toFixed(2)}</span>
          </div>
          <div class="transaction-meta">
            <span class="transaction-payment">${payment}</span>
            <span class="transaction-time">${time}</span>
          </div>
        </div>
      `;
    }).join("");

    document.getElementById("transactionInfo").innerHTML = `
      <div class="transaction-card">
        ${html}
      </div>
    `;
  } catch (error) {
    console.error("Error loading transactions:", error);
    document.getElementById("transactionInfo").innerHTML = `<p>Error loading transactions.</p>`;
  }
}

window.onload = () => {
  const data = localStorage.getItem("loggedInUser");
  if (!data) {
    window.location.href = "index.html";
    return;
  }
  const user = JSON.parse(data);

  // Get current time
  const now = new Date();
  const nowTime = now.toLocaleString();

  // Balance Page
  document.getElementById("balanceInfo").innerHTML = `
    <div class="point-value">${user.Point ?? 0}</div>
    <div class="now-time">Now Time: ${nowTime}</div>
    <div class="user-details-card">
    <div class="user-detail-row">
      <span class="user-detail-label">Member No:</span>
      <span class="user-detail-value">${user.MemberNo ?? ''}</span>
    </div>
    <div class="user-detail-row">
      <span class="user-detail-label">User Name:</span>
      <span class="user-detail-value">${user.Name ?? ''}</span>
    </div>
    <div class="user-detail-row">
      <span class="user-detail-label">Email Address:</span>
      <span class="user-detail-value">${user.EmailAddress ?? ''}</span>
    </div>
    <div class="user-detail-row">
      <span class="user-detail-label">Mobile Phone:</span>
      <span class="user-detail-value">${user.MobilePhone ?? ''}</span>
    </div>
  </div>
  `;

  loadTransactionInfo(user.MemberNo);
};

// Refresh app button
window.refreshApp = async () => {
  const dbID = localStorage.getItem("dbID");
  const stored = localStorage.getItem("loggedInUser");
  if (!stored) return;

  const oldUser = JSON.parse(stored);
  const userRef = ref(db, `MemberPointChecker/${dbID}/Member/${oldUser.MemberNo}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const user = snapshot.val();
      // Update localStorage

      const now = new Date();
      const nowTime = now.toLocaleString();
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      // Update UI
      document.getElementById("balanceInfo").innerHTML = `
        <div class="point-value">${user.Point ?? 0}</div>
        <div class="now-time">Now Time: ${nowTime}</div>
        <div class="user-details-card">
          <div class="user-detail-row">
            <span class="user-detail-label">Member No:</span>
            <span class="user-detail-value">${user.MemberNo ?? ''}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-detail-label">User Name:</span>
            <span class="user-detail-value">${user.Name ?? ''}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-detail-label">Email Address:</span>
            <span class="user-detail-value">${user.EmailAddress ?? ''}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-detail-label">Mobile Phone:</span>
            <span class="user-detail-value">${user.MobilePhone ?? ''}</span>
          </div>
        </div>
      `;

      loadTransactionInfo(user.MemberNo);
    }
  } catch (error) {
    alert("Failed to refresh data.");
  }
};

window.showPage = function (page) {
  document.querySelectorAll('.main-page').forEach(el => el.style.display = 'none');
  document.getElementById(page + 'Page').style.display = '';
  document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('.menu-btn[onclick*="' + page + '"]').classList.add('active');

  if (page === "transaction") {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    loadTransactionInfo(user.MemberNo);
  }
};


// Logout button
window.logout = () => {
  localStorage.removeItem("loggedInUser");
  window.location.replace("index.html");

};
