document.addEventListener("DOMContentLoaded", function () {
    // Lấy các tham số từ URL do Spring Boot đá sang
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const bookingId = urlParams.get('bookingId');
    const amount = urlParams.get('amount');

    if (status === 'success') {
        // Hiện khung thành công
        document.getElementById('successCard').style.display = 'block';
        
        // Điền dữ liệu
        document.getElementById('resBookingId').textContent = bookingId || "Không xác định";
        
        if (amount) {
            const formattedAmount = Number(amount).toLocaleString('vi-VN') + ' VNĐ';
            document.getElementById('resAmount').textContent = formattedAmount;
        }

        // Dọn dẹp giỏ hàng lưu tạm ở LocalStorage (nếu có)
        localStorage.removeItem('lastBooking');

    } else {
        // Hiện khung thất bại
        document.getElementById('failCard').style.display = 'block';
    }
});