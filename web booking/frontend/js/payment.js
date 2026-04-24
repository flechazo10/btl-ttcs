document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = "http://localhost:8080/api";
    
    // 🌟 KIỂM TRA TOKEN BẢO MẬT TRƯỚC KHI LÀM GÌ ĐÓ
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục thanh toán!");
        window.location.href = "login.html";
        return;
    }

    // 1. Lấy mã Booking ID từ URL (Ví dụ: payment.html?bookingId=BK-1234)
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('bookingId');

    if (!bookingId) {
        alert("Không tìm thấy mã đơn hàng. Vui lòng quay lại trang chủ!");
        window.location.href = "index.html";
        return;
    }

    // 2. Lấy thông tin đơn hàng từ LocalStorage (Được lưu từ bước trước)
    const lastBookingStr = localStorage.getItem("lastBooking");
    if (lastBookingStr) {
        try {
            const bookingData = JSON.parse(lastBookingStr);
            // In ra màn hình
            document.getElementById("displayBookingId").textContent = bookingData.id;
            document.getElementById("displayPassengerName").textContent = bookingData.passengerName;
            document.getElementById("displayTotalAmount").textContent = bookingData.totalAmount.toLocaleString('vi-VN') + " đ";
        } catch (e) {
            console.error("Lỗi parse dữ liệu booking", e);
        }
    } else {
        document.getElementById("displayBookingId").textContent = bookingId;
    }

    // 3. Xử lý sự kiện bấm nút Thanh Toán VNPAY
    const btnPayVnpay = document.getElementById("btnPayVnpay");
    
    btnPayVnpay.addEventListener("click", async function () {
        // Đổi trạng thái nút để báo hiệu đang xử lý
        btnPayVnpay.disabled = true;
        btnPayVnpay.textContent = "Đang chuyển hướng sang VNPAY...";

        try {
            // Gọi API xuống Spring Boot để xin link mã QR
            const response = await fetch(`${API_BASE}/payments/create-url?bookingId=${bookingId}`, {
                method: 'GET',
                // 🌟 THÊM HEADERS CHỨA TOKEN VÀO ĐÂY
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Lỗi tạo giao dịch VNPAY (Vui lòng thử đăng nhập lại)");
            }

            const data = await response.json();

            // Nếu Spring Boot trả về link thành công -> Đá khách hàng sang trang VNPAY
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error("Không nhận được URL thanh toán từ Backend");
            }

        } catch (error) {
            console.error(error);
            alert("Lỗi: " + error.message);
            btnPayVnpay.disabled = false;
            btnPayVnpay.textContent = "Thanh toán qua VNPAY";
        }
    });
});