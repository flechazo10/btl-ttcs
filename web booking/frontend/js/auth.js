/**
 * auth.js - Script dùng chung cho tất cả các trang để đồng bộ trạng thái đăng nhập.
 * 
 * Đọc các key từ localStorage (do login.js lưu):
 *   - isLoggedIn: "true" | null
 *   - currentUsername: string
 *   - token: string (JWT)
 *   - userId: number
 *   - role: string
 *
 * Yêu cầu HTML header có các element với id:
 *   - authGuest: vùng hiển thị khi chưa đăng nhập
 *   - authUser: vùng hiển thị khi đã đăng nhập
 *   - userNameDisplay: span hiển thị tên người dùng
 *   - btnLogout: nút đăng xuất
 */
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentUsername = localStorage.getItem("currentUsername");
  const token = localStorage.getItem("token");

  const authGuest = document.getElementById("authGuest");
  const authUser = document.getElementById("authUser");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const btnLogout = document.getElementById("btnLogout");

  // Chỉ hiện trạng thái đăng nhập khi có đủ cả token lẫn username
  if (isLoggedIn === "true" && currentUsername && token) {
    if (authGuest) authGuest.style.display = "none";
    if (authUser) authUser.style.display = "flex";
    if (userNameDisplay) userNameDisplay.innerText = currentUsername;
  }

  // Xử lý đăng xuất
  if (btnLogout) {
    btnLogout.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUsername");
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "index.html";
    });
  }
});
