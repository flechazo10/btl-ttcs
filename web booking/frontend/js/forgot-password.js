// --- js/forgot-password.js ---

// 1. Từ Bước Nhập Username -> Sang form Nhập Email
function nextStep() {
    const username = document.getElementById('usernameReset').value;
    if(username.trim() === '') {
        alert('Vui lòng nhập tên đăng nhập!');
        return;
    }

    fetch(`http://localhost:8080/api/users/check-username?username=${username}`)
    .then(response => {
        if (response.ok) {
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            document.getElementById('stepSubtitle').innerText = 'Khôi phục mật khẩu';
            localStorage.setItem('resetUsername', username); 
        } else {
            response.text().then(errorMessage => alert(errorMessage));
        }
    })
    .catch(error => alert('Không thể kết nối Backend!'));
}

// 2. Quay lại từ đầu
function prevStep() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    document.getElementById('stepSubtitle').innerText = 'Vui lòng điền tên đăng nhập của bạn';
    
    // Reset lại thanh tiến trình về trạng thái ban đầu
    switchTab('email');
}

// 3. Hàm chuyển đổi hiển thị giữa các bước nhỏ (Email -> OTP -> Pass)
function switchTab(tabName) {
    // Tắt hết active ở chữ
    document.getElementById('tab-email').classList.remove('active');
    document.getElementById('tab-otp').classList.remove('active');
    document.getElementById('tab-pass').classList.remove('active');
    
    // Ẩn hết các form nhập
    document.getElementById('sub-step-email').classList.remove('active');
    document.getElementById('sub-step-otp').classList.remove('active');
    document.getElementById('sub-step-pass').classList.remove('active');

    // Bật form và gạch chân chữ tương ứng
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`sub-step-${tabName}`).classList.add('active');
}

// 4. Xác nhận Email -> Nếu đúng thì gửi OTP và chuyển tab
function verifyEmail() {
    const username = localStorage.getItem('resetUsername');
    const email = document.getElementById('emailVerify').value;
    
    if(email.trim() === '') {
        alert('Vui lòng nhập Email!');
        return;
    }

    const btn = document.getElementById('btnSubmitEmail');
    btn.innerText = 'ĐANG XỬ LÝ...';
    btn.style.pointerEvents = 'none';

    // 1. Check Email có khớp User không
    fetch(`http://localhost:8080/api/users/check-email?username=${username}&email=${email}`)
    .then(response => {
        if (response.ok) {
            // Nếu khớp -> Bắn tiếp API gửi Email thật
            return fetch(`http://localhost:8080/api/email/send-otp?email=${email}`, { method: 'POST' });
        } else {
            // Nếu sai Email -> Bắt nó quăng lỗi ra
            return response.text().then(text => { throw new Error(text); });
        }
    })
    .then(res => {
        if (!res) return; // Chặn nếu bước 1 bị lỗi
        
        if (res.ok) {
            // 2. Gửi OTP thành công -> Chuyển sang form nhập OTP
            switchTab('otp');
            startCountdown(); 
        } else {
            return res.text().then(text => { throw new Error(text); });
        }
    })
    .catch(error => {
        // Hiện thông báo lỗi (sai email, hoặc lỗi gửi mail)
        alert('LỖI: ' + error.message);
    })
    .finally(() => {
        btn.innerText = 'TIẾP THEO';
        btn.style.pointerEvents = 'auto';
    });
}

// 5. Chuyển từ Form OTP sang Form Mật khẩu mới (CÓ KIỂM TRA OTP TRƯỚC)
function goToPasswordStep() {
    const email = document.getElementById('emailVerify').value;
    const otp = document.getElementById('otpCode').value;

    if(otp.trim() === '') {
        alert('Vui lòng nhập mã OTP!');
        return;
    }

    // Gọi Backend kiểm tra xem OTP có chuẩn không rồi mới cho qua
    fetch(`http://localhost:8080/api/users/check-otp?email=${email}&otp=${otp}`)
    .then(response => {
        if (response.ok) {
            // Nếu OTP chuẩn -> Cho phép trượt sang bước Nhập mật khẩu
            switchTab('pass');
        } else {
            // Nếu OTP sai -> Cảnh báo ngay tại chỗ và đứng im!
            response.text().then(errorMessage => alert('Lỗi: ' + errorMessage));
        }
    })
    .catch(error => alert('Không thể kết nối Backend!'));
}

// 6. Gửi dữ liệu lần cuối để Đổi mật khẩu
function changePassword() {
    const email = document.getElementById('emailVerify').value;
    const otpCode = document.getElementById('otpCode').value;
    const newPassword = document.getElementById('newPassword').value;

    if (newPassword.trim() === '') {
        alert('Vui lòng nhập mật khẩu mới!');
        return;
    }

    fetch(`http://localhost:8080/api/users/reset-password?email=${email}&otp=${otpCode}&newPassword=${newPassword}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            alert('Đổi mật khẩu thành công! Bạn có thể đăng nhập lại.');
            localStorage.removeItem('resetUsername'); 
            window.location.href = 'login.html'; 
        } else {
            response.text().then(errorMessage => alert('Lỗi: ' + errorMessage));
        }
    })
    .catch(error => alert('Không thể kết nối Backend!'));
}

// Hàm phụ: Đếm ngược nút Gửi lại OTP
function startCountdown() {
    const btn = document.getElementById('btnSendOtp');
    btn.style.pointerEvents = 'none';
    let timeLeft = 60;
    btn.innerText = `Đã gửi (${timeLeft}s)`;
    
    const timer = setInterval(() => {
        timeLeft--;
        btn.innerText = `Gửi lại (${timeLeft}s)`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            btn.innerText = 'Gửi lại mã';
            btn.style.pointerEvents = 'auto';
        }
    }, 1000);
}

function resendOTP() {
    const email = document.getElementById('emailVerify').value;
    fetch(`http://localhost:8080/api/email/send-otp?email=${email}`, { method: 'POST' })
    .then(() => startCountdown());
}