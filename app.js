console.log("Web App Loaded");

// Optional: Add more functionality here

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker registered'));
}

// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB31qLNXaKh5Eo5ft0GT3FDdqHcTMXvT0s",
  authDomain: "ctinventory-af9f8.firebaseapp.com",
  databaseURL: "https://ctinventory-af9f8-default-rtdb.firebaseio.com",
  projectId: "ctinventory-af9f8",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function login() {
  const inputUser = document.getElementById("username").value;
  const inputPass = document.getElementById("password").value;
  const resultEl = document.getElementById("result");

  db.ref("DOChecker/Users").once("value", (snapshot) => {
    let found = false;

    snapshot.forEach((child) => {
      const user = child.val();
      if (user.UserName === inputUser && user.Password === inputPass) {
        found = true;
        resultEl.textContent = "Created Time: " + user.CreatedTime;
      }
    });

    if (!found) {
      resultEl.textContent = "Invalid username or password.";
    }
  });
}
