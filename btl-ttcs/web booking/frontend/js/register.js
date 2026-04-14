// --- js/register.js ---

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngăn trình duyệt load lại trang

    // 1. Thu thập dữ liệu người dùng nhập
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    // 2. Đóng gói dữ liệu gửi đi (Khớp với UserRequest.java ở Backend)
    const requestData = {
        fullName: fullName,
        username: username,
        email: email,
        phone: phone,
        password: password
    };

    // 3. Bắn dữ liệu xuống API Backend
    fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.ok) {
            // Đăng ký thành công: Chuyển thẳng sang trang đăng nhập ngay lập tức
            window.location.href = 'login.html'; 
        } else {
            // Báo lỗi nếu trùng username/email
            response.text().then(errorMessage => alert('Lỗi: ' + errorMessage));
        }
    })
    .catch(error => {
        console.error('Lỗi kết nối:', error);
        alert('Không thể kết nối đến máy chủ Backend!');
    });
});