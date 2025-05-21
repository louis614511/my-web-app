//<!-- main.js -->
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Track current member number globally
let currentMemberNo = null;

// Show user info in HTML
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
      <div class="value">${user.EmailAddress ?? "N/A"}</div>

      <div class="label">Mobile Phone:</div>
      <div class="value">${user.MobilePhone}</div>

      <div class="label">Now Time:</div>
      <div class="value">${now}</div>
    </div>
  `;
}

// Fetch from Firebase and update localStorage
function fetchLatestUserData(memberNo) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, "MemberPointChecker/Member"))
    .then(snapshot => {
      if (snapshot.exists()) {
        let found = false;
        snapshot.forEach(childSnapshot => {
          const user = childSnapshot.val();
          if (user.MemberNo === memberNo) {
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            loadUserInfo(user);
            found = true;
          }
        });

        if (!found) {
          document.getElementById("userInfo").innerHTML = "<p>User not found.</p>";
        }
      } else {
        document.getElementById("userInfo").innerHTML = "<p>No data available.</p>";
      }
    })
    .catch(error => {
      console.error("Fetch failed:", error);
      document.getElementById("userInfo").innerHTML = "<p>Error loading data.</p>";
    });
}

// Load on page ready
window.onload = () => {
  const data = localStorage.getItem("loggedInUser");
  if (!data) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(data);
  currentMemberNo = user.MemberNo;
  fetchLatestUserData(currentMemberNo);
};

// Refresh app
window.refreshApp = () => {
  if (currentMemberNo) {
    fetchLatestUserData(currentMemberNo);
  }
};

// Logout
window.logout = () => {
  localStorage.removeItem("loggedInUser");
  window.location.replace("index.html");
};


