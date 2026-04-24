document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // 🌟 Ẩn thông báo lỗi cũ đi mỗi khi bấm Đăng nhập lại
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorDiv.style.display = 'none';

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    const requestData = {
        username: usernameInput,
        password: passwordInput
    };

    fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); 
        } else {
            return response.text().then(text => { 
                throw new Error(text || `Máy chủ từ chối (Mã HTTP: ${response.status})`); 
            });
        }
    })
    .then(data => {
        // Lưu LocalStorage
        localStorage.setItem('token', data.token); 
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUsername', data.user.username);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('role', data.user.role);
        
        // Điều hướng
        if (data.user.role === 'ADMIN') {
            window.location.href = 'admin/admin.html';
        } else {
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        // 🌟 XỬ LÝ HIỂN THỊ LỖI LÊN GIAO DIỆN
        const errorMsg = error.message.toLowerCase();
        
        // Nếu Backend trả về lỗi chứa chữ "khóa" hoặc "cấm"
        if (errorMsg.includes('khóa') || errorMsg.includes('cấm')) {
            errorText.innerText = 'Đăng nhập thất bại: Tài khoản đã bị cấm';
        } else {
            // Các lỗi sai tài khoản, sai mật khẩu
            errorText.innerText = 'Đăng nhập thất bại: Tài khoản hoặc mật khẩu bị sai';
        }

        // Bật hiển thị cái khung đỏ lên
        errorDiv.style.display = 'flex';
    });
});