document.addEventListener("DOMContentLoaded", function() {
    // Tạm thời lấy userId từ localStorage (giả định bạn đã lưu khi đăng nhập)
    const userId = localStorage.getItem("userId") || 1; 
    const container = document.getElementById("historyContainer");

    fetch(`http://localhost:8080/api/bookings/history/${userId}`)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = ""; // Xóa dòng chữ "Đang tải"

            // Kiểm tra nếu không có dữ liệu
            if (Object.keys(data).length === 0) {
                container.innerHTML = `<div class="no-data">Bạn chưa có lịch sử đặt vé nào thành công.</div>`;
                return;
            }

            // Duyệt qua từng Ngày trong Map (Key của Map là Ngày)
            for (const date in data) {
                let groupHtml = `
                    <div class="history-group">
                        <div class="date-header">
                            <i class="fa-regular fa-calendar-check"></i> Ngày ${date}
                        </div>
                `;

                // Duyệt qua danh sách các vé của ngày đó
                data[date].forEach(ticket => {
                    groupHtml += `
                        <div class="ticket-card">
                            <div class="ticket-info">
                                <h3>${ticket.routeName}</h3>
                                <div class="ticket-details">
                                    <span><i class="fa-solid fa-qrcode"></i> Mã: <b>${ticket.bookingId}</b></span>
                                    <span><i class="fa-solid fa-ticket"></i> SL: ${ticket.totalTickets} vé</span>
                                </div>
                                <div style="margin-top:8px">
                                    <span class="status-badge">Đã thanh toán</span>
                                </div>
                            </div>
                            <div class="ticket-price">
                                <span class="amount">${ticket.totalAmount.toLocaleString('vi-VN')} đ</span>
                            </div>
                        </div>
                    `;
                });

                groupHtml += `</div>`; // Đóng group ngày
                container.innerHTML += groupHtml;
            }
        })
        .catch(error => {
            console.error("Lỗi:", error);
            container.innerHTML = `<div class="no-data">Không thể tải dữ liệu. Vui lòng thử lại sau!</div>`;
        });
});