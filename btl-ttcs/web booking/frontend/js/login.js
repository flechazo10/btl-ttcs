// --- js/login.js ---

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngăn load lại trang

    // 1. Lấy dữ liệu từ form
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    const requestData = {
        username: usernameInput,
        password: passwordInput
    };

    // 2. Gọi API Backend
    fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Đọc dữ liệu User trả về từ Backend
        } else {
            return response.text().then(text => { throw new Error(text) });
        }
    })
    .then(userData => {
        // 3. Đăng nhập thành công -> Lưu trạng thái vào LocalStorage của trình duyệt
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUsername', userData.username);
        localStorage.setItem('userId', userData.id);
        
        // 4. Chuyển thẳng về trang chủ (index.html)
        window.location.href = 'index.html';
    })
    .catch(error => {
        // Hiển thị lỗi nếu sai mật khẩu/tài khoản
        alert('Lỗi: ' + error.message);
    });
});