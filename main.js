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
    <p><strong>UserName:</strong> ${user.UserName}</p>
    <p><strong>Password:</strong> ${user.Password}</p>
    <p><strong>isLoggedIn:</strong> ${user.isLoggedIn}</p>
    <p><strong>CreatedTime:</strong> ${user.CreatedTime}</p>
    <p><strong>CreatedTime:</strong> ${now}</p>
  `;
};

// Refresh app button
window.refreshApp = () => {
  location.reload(); // simple page reload
};

// Logout button
window.logout = () => {
  localStorage.removeItem("loggedInUser");
  window.location.replace("index.html");

};
