// Kiểm tra đăng nhập
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentUsername = localStorage.getItem("currentUsername");

  if (isLoggedIn === "true" && currentUsername) {
    document.getElementById("authGuest").style.display = "none";
    document.getElementById("authUser").style.display = "flex";
    document.getElementById("userNameDisplay").innerText = currentUsername;
  }

  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUsername");
    window.location.reload();
  });
});

// Xử lý form liên hệ
document.getElementById("contactForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const subject = document.getElementById("contactSubject").value;
  const message = document.getElementById("contactMessage").value.trim();

  if (!name || !email || !message) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
    return;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Email không hợp lệ!");
    return;
  }

  // Giả lập gửi thành công
  alert(
    `Cảm ơn bạn ${name}! Chúng tôi đã nhận được tin nhắn và sẽ liên hệ lại qua email ${email} trong thời gian sớm nhất.`
  );

  // Reset form
  this.reset();
});
