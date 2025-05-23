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

  // Details Page
  document.getElementById("detailsInfo").innerHTML = `
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
      document.getElementById("detailsInfo").innerHTML = `
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
    }
  } catch (error) {
    alert("Failed to refresh data.");
  }
};


// Logout button
window.logout = () => {
  localStorage.removeItem("loggedInUser");
  window.location.replace("index.html");

};
