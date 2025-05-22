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
    // User is not logged in → redirect to login
    window.location.href = "index.html";
    return;
  }

  const container = document.getElementById("userInfo");

  const user = JSON.parse(data);
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


};

// Refresh app button
window.refreshApp = async () => {
  const stored = localStorage.getItem("loggedInUser");
  if (!stored) return;

  const oldUser = JSON.parse(stored);
  const userRef = ref(db, `MemberPointChecker/Member/${oldUser.MemberNo}`); // or use UID if your structure is different

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const newUser = snapshot.val();
      localStorage.setItem("loggedInUser", JSON.stringify(newUser)); // update cached user

      const now = new Date().toLocaleString();
      document.getElementById("userInfo").innerHTML = `
        <div class="info-box">
            <div class="label">Point:</div>
            <div class="point-value">${newUser.Point}</div>

            <div class="label">Member No:</div>
            <div class="value">${newUser.MemberNo}</div>

            <div class="label">User Name:</div>
            <div class="value">${newUser.Name}</div>

            <div class="label">Email Address:</div>
            <div class="value">${newUser.EmailAddress}</div>

            <div class="label">Mobile Phone:</div>
            <div class="value">${newUser.MobilePhone}</div>

            <div class="label">Now Time:</div>
            <div class="value">${now}</div>
        </div>
      `;
    }
  } catch (error) {
    console.error("Failed to refresh data:", error);
  }
};


// Logout button
window.logout = () => {
  localStorage.removeItem("loggedInUser");
  window.location.replace("index.html");

};
