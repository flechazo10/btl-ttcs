document.addEventListener("DOMContentLoaded", function() {
    
    // ==========================================
    // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
    // ==========================================
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUsername = localStorage.getItem('currentUsername');

    const authGuest = document.getElementById('authGuest');
    const authUser = document.getElementById('authUser');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (isLoggedIn === 'true' && currentUsername) {
        // Nếu đã đăng nhập: Giấu nút Đăng nhập/Đăng ký, Hiện tên User
        if (authGuest) authGuest.style.display = 'none';
        if (authUser) authUser.style.display = 'flex'; // Dùng flex để các thẻ nằm ngang đẹp mắt
        if (userNameDisplay) userNameDisplay.innerText = currentUsername;
    } else {
        // Nếu chưa đăng nhập: Hiện nút Đăng nhập/Đăng ký, Giấu phần User
        if (authGuest) authGuest.style.display = 'flex';
        if (authUser) authUser.style.display = 'none';
    }

    // ==========================================
    // 2. XỬ LÝ NÚT ĐĂNG XUẤT
    // ==========================================
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            // Xóa dữ liệu phiên đăng nhập
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUsername');
            
            // Tải lại trang (giao diện sẽ tự động quay về trạng thái Chưa đăng nhập)
            window.location.reload();
        });
    }

    // (Nếu file index.js của bạn có code cũ xử lý form tìm vé, bạn cứ để nó ở bên dưới đoạn này nhé)
});