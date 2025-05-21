//<!-- main.js -->
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Fetch and display user info
function loadUserInfo(user) {
  const container = document.getElementById("userInfo");
  const now = new Date().toLocaleString();

  container.innerHTML = `
    <div class="info-box">
      <div class="label">Point:</div>
      <div class="point-value">${user.Point}</div>

      <div class="label">Member No:</div>
      <div class="value">${user.MemberNo}</div>

      <div class="label">User Name:</div>
      <div class="value">${user.Name}</div>

      <div class="label">Email Address:</div>
      <div class="value">${user.EmailAddress}</div>

      <div class="label">Mobile Phone:</div>
      <div class="value">${user.MobilePhone}</div>

      <div class="label">Now Time:</div>
      <div class="value">${now}</div>
    </div>
  `;
}

// Load user from localStorage or redirect
window.onload = () => {
  const data = localStorage.getItem("loggedInUser");
  if (!data) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(data);
  fetchLatestUserData(user.MemberNo);
};

// Fetch latest user data from Firebase
function fetchLatestUserData(memberNo) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, "MemberPointChecker/Member")).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.MemberNo === memberNo) {
          localStorage.setItem("loggedInUser", JSON.stringify(user));
          loadUserInfo(user);
        }
      });
    }
  }).catch((error) => {
    console.error("Failed to load user data:", error);
  });
}

// Refresh app button
window.refreshApp = () => {
  const data = localStorage.getItem("loggedInUser");
  if (!data) return;
  const user = JSON.parse(data);
  fetchLatestUserData(user.MemberNo);
};

// Logout
window.logout = () => {
  localStorage.removeItem("loggedInUser");
  window.location.replace("index.html");
};

