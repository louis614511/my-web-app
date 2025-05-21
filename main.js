window.onload = () => {
  const data = localStorage.getItem("loggedInUser");
  const container = document.getElementById("userInfo");

  if (!data) {
    window.location.href = "index.html"; // not logged in
    return;
  }

  const user = JSON.parse(data);
  container.innerHTML = `
    <p><strong>UserName:</strong> ${user.UserName}</p>
    <p><strong>Password:</strong> ${user.Password}</p>
    <p><strong>isLoggedIn:</strong> ${user.isLoggedIn}</p>
    <p><strong>CreatedTime:</strong> ${user.CreatedTime}</p>
  `;
};

window.logout = () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
};
