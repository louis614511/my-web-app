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
    <div class="point-label">Point:</div>
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
