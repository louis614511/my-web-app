
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";


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

async function loadScrollingAds() {
  const dbID = localStorage.getItem("dbID");
  const adsRef = ref(getDatabase(), `MemberPointChecker/${dbID}/Ads`);

  try {
    const snapshot = await get(adsRef);
    if (!snapshot.exists()) return;

    const ads = snapshot.val();
    const lines = Object.values(ads).filter(line => line && line.trim() !== "");

    if (lines.length === 0) return;

    const combinedText = lines.join("   |   ");
    const adText = document.getElementById("adText");

    adText.textContent = combinedText;

    // Wait for DOM update to calculate full width
    requestAnimationFrame(() => {
      const textWidth = adText.scrollWidth;
      const screenWidth = window.innerWidth;
      const distance = textWidth + screenWidth;
      const speed = 100; // pixels per second
      const duration = distance / speed;

      adText.style.animationDuration = `${duration}s`;
      adText.classList.add("ready");
    });
  } catch (err) {
    console.error("Failed to load ads:", err);
  }
}

function adjustAdScrollSpeed() {
  const adText = document.getElementById("adText");
  const adTrack = document.querySelector(".ad-track");

  if (!adText || !adTrack) return;

  const screenWidth = window.innerWidth;
  const textWidth = adText.offsetWidth;

  // Speed: 100px per 1 second
  const baseSpeed = 100; 
  const duration = (textWidth + screenWidth) / baseSpeed;

  adText.style.animationDuration = `${duration}s`;
}

window.addEventListener('resize', adjustAdScrollSpeed);
window.addEventListener('load', adjustAdScrollSpeed);


window.onload = async () => {
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
  await loadScrollingAds(); 
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
      const list = voucher.VoucherList || {};
      const hasAvailable = Object.values(list).some(v => v.IsCollected === "F");

      html += `
        <div class="voucher-card">
          <h3>${voucher.Description}</h3>
          <p class="voucher-detail">Voucher ID: ${voucher.VoucherID}</p>
          <p class="voucher-detail">Cash Value: RM${voucher.CashValue}</p>
          <p class="voucher-detail">Purchase Amount: RM${voucher.PurchaseAmt}</p>
          <p class="voucher-detail">Valid: ${formatToUSDate(voucher.FromDate)} - ${formatToUSDate(voucher.ToDate)}</p>
          <p class="voucher-detail">Redeem for ${voucher.PointToRedeem} points</p>
          ${
            hasAvailable
              ? `<button onclick="redeemVoucher('${id}', ${voucher.PointToRedeem})">Collect</button>`
              : `<button disabled style="background-color:#ccc; cursor:default;">Fully Collected</button>`
          }
        </div>`;
    }

    document.getElementById("allVoucherTab").innerHTML = html;

  } catch (err) {
    console.error("Error loading vouchers:", err);
    document.getElementById("allVoucherTab").innerHTML = "<p>Error loading vouchers.</p>";
  }
}


function formatToUSDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}


async function redeemVoucher(voucherKey, pointRequired) {
  const dbID = localStorage.getItem("dbID");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userPath = `MemberPointChecker/${dbID}/Member/${user.MemberNo}`;
  const voucherListRef = ref(db, `MemberPointChecker/${dbID}/Voucher/${voucherKey}/VoucherList`);

  const snapshot = await get(voucherListRef);
  const list = snapshot.val();

  const entry = Object.entries(list).find(([_, v]) => v.IsCollected === "F");

  if (!entry) {
    alert("No available voucher.");
    return;
  }

  const freshUserSnap = await get(ref(db, userPath));
  const freshUser = freshUserSnap.val();

  if (freshUser.Point < pointRequired) {
    alert("Not enough points.");
    return;
  }

  const [itemKey, voucher] = entry;
  const afterPoint = user.Point - pointRequired;

  // ✅ Ask user before committing any changes
  const confirmed = confirm(`🎁 Confirm to collect this voucher?\n\nOriginal Points: ${user.Point}\nRemaining: ${afterPoint}`);
  if (!confirmed) return;


  const itemRef = ref(db, `MemberPointChecker/${dbID}/Voucher/${voucherKey}/VoucherList/${itemKey}`);

  try {
    await runTransaction(itemRef, currentData => {
      if (currentData?.IsCollected === "F") {
        // Mark as collected
        currentData.IsCollected = "T";
        return currentData;
      } else {
        return; // Abort transaction
      }
    });

    // Double check point again
    const freshUserSnap = await get(ref(db, userPath));
    const freshUser = freshUserSnap.val();

    if (freshUser.Point < pointRequired) {
      alert("Not enough points after sync.");
      return;
    }

    const afterPoint = freshUser.Point - pointRequired;

    const updates = {
      [`${userPath}/CollectedVouchers/${voucher.VoucherNo}`]: {
        Description: `Collected ${voucher.VoucherNo}`,
        CashValue: pointRequired,
        CollectedTime: new Date().toLocaleString()
      },
      [`${userPath}/Point`]: afterPoint
    };

    await update(ref(db), updates);

    alert("Voucher collected successfully!");
    await refreshApp();
    await loadAllVouchers();
    await loadMyVouchers();

  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Failed to redeem voucher. Try again.");
  }
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
        <p class="voucher-detail">${v.Description}</p>
        <p class="voucher-detail">Collected at: ${v.CollectedTime}</p>
        <button onclick="showQRCode('${k}')">Show QR</button>
      </div>
    `).join("");

    document.getElementById("myVoucherTab").innerHTML = html;

  } catch {
    document.getElementById("myVoucherTab").innerHTML = "<p>Error loading collected vouchers.</p>";
  }
}


window.showQRCode = function(voucherNo) {
  const modal = document.getElementById("qrModal");
  const modalContent = document.getElementById("qrModalContent");
  modalContent.innerHTML = ""; // Clear previous content

  // Calculate dynamic size (e.g. 80% of the smaller screen dimension)
  const maxWidth = Math.min(window.innerWidth, window.innerHeight);
  const qrSize = Math.floor(maxWidth * 0.8); // 80% of screen

  // Create wrapper
  const qrWrapper = document.createElement("div");
  qrWrapper.id = "qrCanvas";
  qrWrapper.style.width = `${qrSize}px`;
  qrWrapper.style.height = `${qrSize}px`;
  qrWrapper.style.margin = "0 auto";

  // Create QR
  new QRCode(qrWrapper, {
    text: voucherNo,
    width: qrSize,
    height: qrSize,
    colorDark: "#000",
    colorLight: "#fff",
    correctLevel: QRCode.CorrectLevel.H
  });

  // VoucherNo text
  const codeText = document.createElement("p");
  codeText.style.marginTop = "1rem";
  codeText.style.fontSize = "1.8rem";
  codeText.style.fontWeight = "bold";
  codeText.style.textAlign = "center";
  codeText.textContent = voucherNo;

  modalContent.appendChild(qrWrapper);
  modalContent.appendChild(codeText);

  modal.style.display = "flex";
};



window.closeQRModal = function() {
  document.getElementById("qrModal").style.display = "none";
  document.getElementById("qrModalContent").innerHTML = "";
};


window.redeemVoucher = redeemVoucher;



