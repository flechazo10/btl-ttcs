const API_BASE = "http://localhost:8080/api";
const TEMPLATE_DATE = "2026-01-01"; // Ngày gốc mặc định cho dữ liệu mẫu

document.addEventListener("DOMContentLoaded", function () {
    // 1. CẤU HÌNH LỊCH CHO LỊCH TRÌNH THỰC TẾ
    flatpickr("#filterDateReal", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        defaultDate: "today", 
        locale: "vn",
        onChange: function(selectedDates, dateStr) {
            loadRealTrips(dateStr); // Tải lại bảng khi chọn ngày khác
        }
    });

    // 2. CẤU HÌNH LỊCH NHÂN BẢN (CHỈ Ở TAB MẪU)
    flatpickr("#cloneDates", {
        mode: "multiple",     
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        minDate: "today",     
        locale: "vn",
        placeholder: "Chọn các ngày nhân bản..."
    });

    // 3. TẢI DỮ LIỆU LẦN ĐẦU KHI MỞ TRANG
    const todayStr = new Date().toISOString().split('T')[0];
    loadRealTrips(todayStr); // Tải chuyến hôm nay
    loadTemplateTrips();     // Tải chuyến mẫu
    loadAllUsers();          // Tải danh sách khách
});

// Chuyển đổi giữa các Tab ở Sidebar
function switchTab(tabId, element) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// ==========================================
// 🌟 QUẢN LÝ CHUYẾN XE (THỰC TẾ & MẪU)
// ==========================================

// Hàm gọi API lấy chuyến xe theo 1 ngày cụ thể
async function fetchTripsByDate(dateStr) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/admin/trips/by-date?date=${dateStr}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Lỗi tải danh sách chuyến xe");
    return await res.json();
}

// ---- TAB 1: LỊCH TRÌNH THỰC TẾ ----
async function loadRealTrips(dateStr) {
    try {
        const trips = await fetchTripsByDate(dateStr);
        const tbody = document.getElementById("tripRealTableBody");
        
        if (trips.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">Không có chuyến xe nào trong ngày này.</td></tr>`;
            return;
        }

        tbody.innerHTML = trips.map((t, index) => {
            const timeStart = t.departureTime.slice(11, 16); 
            const timeEnd = t.arrivalTime.slice(11, 16);
            const route = `${t.startStationName || '---'} → ${t.endStationName || '---'}`;
            const isCancelled = t.status === 'CANCELLED';
            
            const statusBadge = isCancelled 
                ? '<span class="badge badge-cancel">Đã hủy</span>' 
                : '<span class="badge badge-active">Hoạt động</span>';
            
            // Nếu đã hủy thì ẩn nút Hủy đi, chỉ hiện nút xem khách
            const btnCancel = isCancelled ? '' : `<button class="btn-danger-outline" onclick="cancelTrip(${t.id})"><i class="fa-solid fa-ban"></i> Hủy chuyến</button>`;
            const btnView = `<button class="btn-info-outline" onclick="viewPassengers(${t.id})"><i class="fa-solid fa-users"></i> Xem khách</button>`;

            return `
                <tr style="${isCancelled ? 'background-color: #fce4e4; opacity: 0.8;' : ''}">
                    <td>#${index + 1}</td>
                    <td style="font-weight: bold;">${route}</td>
                    <td>${timeStart}</td>
                    <td>${timeEnd}</td>
                    <td>${t.licensePlate || "---"}</td>
                    <td><b>${t.bookedSeats}/${t.totalSeats}</b></td>
                    <td>${statusBadge}</td>
                    <td>${btnView} ${btnCancel}</td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        console.error(error);
    }
}

// ---- TAB 2: LỊCH TRÌNH MẪU ----
async function loadTemplateTrips() {
    try {
        const trips = await fetchTripsByDate(TEMPLATE_DATE);
        const tbody = document.getElementById("tripTemplateTableBody");
        
        if (trips.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Chưa có dữ liệu chuyến xe mẫu.</td></tr>`;
            return;
        }

        tbody.innerHTML = trips.map((t, index) => {
            const timeStart = t.departureTime.slice(11, 16); 
            const timeEnd = t.arrivalTime.slice(11, 16);
            const route = `${t.startStationName || '---'} → ${t.endStationName || '---'}`;
            const price = t.price ? t.price.toLocaleString("vi-VN") + "đ" : "---";

            return `
                <tr>
                    <td>#${index + 1}</td>
                    <td style="font-weight: bold;">${route}</td>
                    <td>${timeStart}</td>
                    <td>${timeEnd}</td>
                    <td>${t.licensePlate || "---"}</td>
                    <td style="color: #e54d42; font-weight: bold;">${price}</td>
                    <td>
                        <button class="btn-danger-outline" onclick="deleteTemplateTrip(${t.id})">
                            <i class="fa-solid fa-trash"></i> Xóa vĩnh viễn
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// CÁC HÀNH ĐỘNG CỦA CHUYẾN XE
// ==========================================

// 1. Xem danh sách hành khách (Modal)
async function viewPassengers(tripId) {
    const token = localStorage.getItem("token");
    const tbody = document.getElementById("passengerTableBody");
    
    document.getElementById("passengerModal").style.display = "flex";
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">Đang tải danh sách...</td></tr>`;

    try {
        const res = await fetch(`${API_BASE}/admin/trips/${tripId}/passengers`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const passengers = await res.json();

        if (passengers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">Chuyến xe này hiện chưa có khách nào đặt vé.</td></tr>`;
            return;
        }

        tbody.innerHTML = passengers.map(p => `
            <tr>
                <td style="font-weight:bold;">${p.bookingCode}</td>
                <td><b>${p.passengerName}</b><br><small style="color:#666;">${p.phone}</small></td>
                <td><span style="color:#28a745">Đón:</span> ${p.pickupLocation || 'Bến xe'}<br><span style="color:#dc3545">Trả:</span> ${p.dropoffLocation || 'Bến xe'}</td>
                <td style="color:#e67e22; max-width: 150px; font-style: italic;">${p.note || ''}</td>
                <td style="text-align:center; font-weight:bold;">${p.totalTickets}</td> 
                <td style="font-weight:bold; color:#d9534f;">${p.totalPrice.toLocaleString("vi-VN")}đ</td>
            </tr>
        `).join("");

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Lỗi tải dữ liệu.</td></tr>`;
    }
}

function closePassengerModal() {
    document.getElementById("passengerModal").style.display = "none";
}

// 2. Xóa vĩnh viễn (Chỉ dùng cho chuyến mẫu)
async function deleteTemplateTrip(tripId) {
    if(confirm("CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN chuyến xe mẫu. Bạn có chắc chắn không?")) {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/admin/trips/${tripId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                loadTemplateTrips(); // Tải lại bảng mẫu
            } else {
                alert("Lỗi: " + (data.error || "Không thể xóa"));
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
        }
    }
}

// 3. Hủy chuyến (Cho lịch trình thực tế)
async function cancelTrip(tripId) {
    if(confirm("Bạn có chắc chắn muốn hủy chuyến xe này? Hệ thống sẽ tự động hoàn tiền cho khách!")) {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/admin/trips/${tripId}/cancel`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                // Load lại bảng thực tế của ngày đang xem
                const currentDate = document.getElementById("filterDateReal").value || new Date().toISOString().split('T')[0];
                loadRealTrips(currentDate); 
            } else {
                alert("Lỗi: " + (data.error || "Không thể hủy chuyến"));
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
        }
    }
}

// 4. Nhân bản hàng loạt
async function cloneTrips() {
    const token = localStorage.getItem("token"); 
    const datesToClone = document.getElementById("cloneDates").value; 
    
    if (!datesToClone) {
        alert("Vui lòng chọn ít nhất 1 ngày để nhân bản!");
        return;
    }

    const dateArray = datesToClone.split(", ");
    const payload = {
        sourceDate: TEMPLATE_DATE, // Lấy từ 01/01/2026
        targetDates: dateArray    
    };

    if (confirm(`Hệ thống sẽ sao chép lịch trình gốc sang ${dateArray.length} ngày đã chọn. Tiếp tục?`)) {
        try {
            const res = await fetch(`${API_BASE}/admin/trips/clone-bulk`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message); 
                document.getElementById("cloneDates")._flatpickr.clear(); 
                
                // Cập nhật lại lịch trình thực tế để xem ngay
                const currentDate = document.getElementById("filterDateReal").value || new Date().toISOString().split('T')[0];
                loadRealTrips(currentDate);
            } else {
                alert("Lỗi: " + (data.error || "Không thể nhân bản"));
            }
        } catch (err) {
            alert("Lỗi kết nối máy chủ khi nhân bản!");
        }
    }
}


// ==========================================
// 🌟 QUẢN LÝ USER (CẬP NHẬT ĐƯỜNG DẪN MỚI)
// ==========================================
let allUsersCache = []; 

async function loadAllUsers() {
    const tbody = document.getElementById("userTableBody");
    const token = localStorage.getItem("token");

    try {
        // 🌟 Đã cập nhật đường dẫn sang AdminUserController
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        allUsersCache = await res.json();
        
        const total = allUsersCache.length;
        const active = allUsersCache.filter(u => u.status === 'ACTIVE').length;
        const banned = total - active;

        document.getElementById("totalUser").innerText = total;
        document.getElementById("activeUser").innerText = active;
        document.getElementById("bannedUser").innerText = banned;

        renderUserTable(allUsersCache);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Lỗi tải dữ liệu người dùng!</td></tr>`;
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById("userTableBody");
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Không tìm thấy người dùng phù hợp.</td></tr>`;
        return;
    }
    tbody.innerHTML = users.map((u, index) => {
        const statusBadge = u.status === 'ACTIVE' 
            ? '<span class="badge badge-active">Hoạt động</span>' 
            : '<span class="badge badge-cancel">Đã khóa</span>';
        
        const actionBtn = u.role === 'ADMIN' 
            ? '<span style="color:#aaa; font-style:italic;">Admin</span>' 
            : `<button class="btn-danger-outline" onclick="banUser(${u.id})">
                <i class="fa-solid ${u.status === 'ACTIVE' ? 'fa-lock' : 'fa-unlock'}"></i>
                ${u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
               </button>`;

        return `
        <tr>
            <td>#${index + 1}</td>
            <td style="font-weight: bold;">${u.fullName || "Chưa cập nhật"}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.phone || "---"}</td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
        </tr>`;
    }).join("");
}

function filterUserTable() {
    const keyword = document.getElementById("searchUser").value.toLowerCase();
    const filtered = allUsersCache.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(keyword)) || 
        (u.phone && u.phone.includes(keyword)) || 
        (u.email && u.email.toLowerCase().includes(keyword)) ||
        (u.username && u.username.toLowerCase().includes(keyword))
    );
    renderUserTable(filtered);
}

async function banUser(userId) {
    if(confirm("Xác nhận thay đổi trạng thái tài khoản này?")) {
        const token = localStorage.getItem("token");
        try {
            // 🌟 Đã cập nhật đường dẫn sang AdminUserController
            const res = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                loadAllUsers(); 
            } else {
                alert("Lỗi: " + (data.error || "Không thể thay đổi trạng thái"));
            }
        } catch (error) {
            alert("Lỗi kết nối máy chủ!");
        }
    }
}

// ==========================================
// ĐĂNG XUẤT 
// ==========================================
function logout() { document.getElementById("logoutModal").style.display = "flex"; }
function closeLogoutModal() { document.getElementById("logoutModal").style.display = "none"; }
function executeLogout() {
    localStorage.clear(); 
    window.location.href = "../login.html"; 
}