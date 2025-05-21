console.log("Web App Loaded");

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyB31qLNXaKh5Eo5ft0GT3FDdqHcTMXvT0s",
  authDomain: "ctinventory-af9f8.firebaseapp.com",
  databaseURL: "https://ctinventory-af9f8-default-rtdb.firebaseio.com",
  projectId: "ctinventory-af9f8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.login = function () {
  const inputUser = document.getElementById("username").value;
  const inputPass = document.getElementById("password").value;
  const resultEl = document.getElementById("result");

  get(ref(db, "DOChecker/Users")).then((snapshot) => {
    if (snapshot.exists()) {
      let found = false;
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        if (user.UserName === inputUser && user.Password === inputPass) {
          found = true;
          //resultEl.textContent = "Created Time: " + user.CreatedTime;

          // Save to localStorage
          localStorage.setItem("loggedInUser", JSON.stringify(user));
          // Redirect
          window.location.href = "main.html"
        }
      });

      if (!found) {
        resultEl.textContent = "Invalid username or password.";
      }
    } else {
      resultEl.textContent = "No data found.";
    }
  }).catch((error) => {
    console.error(error);
    resultEl.textContent = "Error connecting to database.";
  });
}
