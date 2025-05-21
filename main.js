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
    <p><strong>Member No:</strong> ${user.MemberNo}</p>
    <p><strong>User Name:</strong> ${user.Name}</p>
    <p><strong>Email Address:</strong> ${user.EmailAddress}</p>
    <p><strong>Mobile Phone:</strong> ${user.MobilePhone}</p>
    <p><strong>Point:</strong> ${user.Point}</p>
    <p><strong>Now Time:</strong> ${now}</p>
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
