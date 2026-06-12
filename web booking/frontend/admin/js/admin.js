const API_BASE = "http://localhost:8080/api";
const TEMPLATE_DATE = "2026-01-01"; // Ngày gốc mặc định cho dữ liệu mẫu

// ==========================================
// 🎨 HỆ THỐNG THÔNG BÁO TÙY CHỈNH (Custom Modal)
// Thay thế alert() và confirm() mặc định của trình duyệt
// ==========================================

// Icon map cho từng loại thông báo
const MODAL_ICONS = {
    success: '<i class="fa-solid fa-check"></i>',
    error: '<i class="fa-solid fa-xmark"></i>',
    warning: '<i class="fa-solid fa-exclamation"></i>',
    info: '<i class="fa-solid fa-info"></i>',
    confirm: '<i class="fa-solid fa-question"></i>'
};

const MODAL_TITLES = {
    success: 'Thành công!',
    error: 'Có lỗi xảy ra!',
    warning: 'Cảnh báo!',
    info: 'Thông báo',
    confirm: 'Xác nhận'
};

/**
 * Hiển thị thông báo dạng modal (thay thế alert)
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: 'success' | 'error' | 'warning' | 'info'
 * @returns {Promise} - Resolve khi người dùng bấm OK
 */
function showAlert(message, type = 'info') {
    return new Promise((resolve) => {
        // Tạo overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        overlay.innerHTML = `
            <div class="custom-modal-box">
                <div class="custom-modal-icon icon-${type}">
                    ${MODAL_ICONS[type] || MODAL_ICONS.info}
                </div>
                <div class="custom-modal-title">${MODAL_TITLES[type] || 'Thông báo'}</div>
                <div class="custom-modal-message">${message}</div>
                <div class="custom-modal-buttons">
                    <button class="custom-modal-btn custom-modal-btn-primary" id="customModalOk">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Trigger animation
        requestAnimationFrame(() => overlay.classList.add('show'));

        // Đóng modal
        const closeModal = () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 300);
        };

        overlay.querySelector('#customModalOk').addEventListener('click', closeModal);

        // Click ra ngoài cũng đóng
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    });
}

/**
 * Hiển thị hộp thoại xác nhận dạng modal (thay thế confirm)
 * @param {string} message - Nội dung câu hỏi xác nhận
 * @param {object} options - Tùy chọn { type, confirmText, cancelText, isDanger }
 * @returns {Promise<boolean>} - true nếu bấm Xác nhận, false nếu bấm Hủy
 */
function showConfirm(message, options = {}) {
    const {
        type = 'confirm',
        title = MODAL_TITLES[type] || 'Xác nhận',
        confirmText = 'Xác nhận',
        cancelText = 'Hủy',
        isDanger = false
    } = options;

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';

        const btnClass = isDanger ? 'custom-modal-btn-danger' : 'custom-modal-btn-primary';

        overlay.innerHTML = `
            <div class="custom-modal-box">
                <div class="custom-modal-icon icon-${type}">
                    ${MODAL_ICONS[type] || MODAL_ICONS.confirm}
                </div>
                <div class="custom-modal-title">${title}</div>
                <div class="custom-modal-message">${message}</div>
                <div class="custom-modal-buttons">
                    <button class="custom-modal-btn custom-modal-btn-cancel" id="customModalCancel">${cancelText}</button>
                    <button class="custom-modal-btn ${btnClass}" id="customModalConfirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('show'));

        const closeModal = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                resolve(result);
            }, 300);
        };

        overlay.querySelector('#customModalConfirm').addEventListener('click', () => closeModal(true));
        overlay.querySelector('#customModalCancel').addEventListener('click', () => closeModal(false));

        // Click ra ngoài => Hủy
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(false);
        });
    });
}

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

    // 4. KHỞI TẠO SELECT NĂM CHO THỐNG KÊ
    initStatsYearSelect();
});

// Chuyển đổi giữa các Tab ở Sidebar
function switchTab(tabId, element) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';

    // Tự động tải thống kê khi chuyển sang tab Thống kê
    if (tabId === 'statsTab') {
        loadStatistics();
    }
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
    const confirmed = await showConfirm("Hành động này sẽ <b>XÓA VĨNH VIỄN</b> chuyến xe mẫu. Bạn có chắc chắn không?", {
        type: 'warning',
        title: 'Cảnh báo!',
        confirmText: 'Xóa vĩnh viễn',
        isDanger: true
    });
    if (confirmed) {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/admin/trips/${tripId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                await showAlert(data.message, 'success');
                loadTemplateTrips();
            } else {
                showAlert("Lỗi: " + (data.error || "Không thể xóa"), 'error');
            }
        } catch (error) {
            showAlert("Lỗi kết nối máy chủ!", 'error');
        }
    }
}

// 3. Hủy chuyến (Cho lịch trình thực tế)
async function cancelTrip(tripId) {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn <b>hủy chuyến xe</b> này?<br>Hệ thống sẽ tự động hoàn tiền cho khách!", {
        type: 'warning',
        confirmText: 'Hủy chuyến',
        isDanger: true
    });
    if (confirmed) {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/admin/trips/${tripId}/cancel`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                await showAlert(data.message, 'success');
                const currentDate = document.getElementById("filterDateReal").value || new Date().toISOString().split('T')[0];
                loadRealTrips(currentDate); 
            } else {
                showAlert("Lỗi: " + (data.error || "Không thể hủy chuyến"), 'error');
            }
        } catch (error) {
            showAlert("Lỗi kết nối máy chủ!", 'error');
        }
    }
}

// 4. Nhân bản hàng loạt
async function cloneTrips() {
    const token = localStorage.getItem("token"); 
    const datesToClone = document.getElementById("cloneDates").value; 
    
    if (!datesToClone) {
        showAlert("Vui lòng chọn ít nhất 1 ngày để nhân bản!", 'warning');
        return;
    }

    const dateArray = datesToClone.split(", ");
    const payload = {
        sourceDate: TEMPLATE_DATE,
        targetDates: dateArray    
    };

    const confirmed = await showConfirm(`Hệ thống sẽ sao chép lịch trình gốc sang <b>${dateArray.length} ngày</b> đã chọn. Tiếp tục?`, {
        type: 'info',
        confirmText: 'Nhân bản',
    });
    if (confirmed) {
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
                await showAlert(data.message, 'success'); 
                document.getElementById("cloneDates")._flatpickr.clear(); 
                
                const currentDate = document.getElementById("filterDateReal").value || new Date().toISOString().split('T')[0];
                loadRealTrips(currentDate);
            } else {
                showAlert("Lỗi: " + (data.error || "Không thể nhân bản"), 'error');
            }
        } catch (err) {
            showAlert("Lỗi kết nối máy chủ khi nhân bản!", 'error');
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
    const confirmed = await showConfirm("Xác nhận thay đổi trạng thái tài khoản này?", {
        type: 'confirm',
        confirmText: 'Xác nhận',
    });
    if (confirmed) {
        const token = localStorage.getItem("token");
        try {
            // 🌟 Đã cập nhật đường dẫn sang AdminUserController
            const res = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                await showAlert(data.message, 'success');
                loadAllUsers(); 
            } else {
                showAlert("Lỗi: " + (data.error || "Không thể thay đổi trạng thái"), 'error');
            }
        } catch (error) {
            showAlert("Lỗi kết nối máy chủ!", 'error');
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

// 1. Thêm chuyến THỰC TẾ (Lấy ngày từ ô lọc lịch)
function openAddRealTripModal() {
    const selectedDate = document.getElementById("filterDateReal").value;
    if(!selectedDate) {
        showAlert("Vui lòng chọn ngày trên lịch trước khi thêm!", 'warning');
        return;
    }
    
    document.getElementById("modalTripTitle").innerText = "Thêm Chuyến Xe Ngày " + selectedDate;
    document.getElementById("tripTargetDate").value = selectedDate; // Gán ngày đang xem
    
    prepareModalData(); // Load danh sách Route và Bus
    document.getElementById("addTripModal").style.display = "flex";
}

// 2. Thêm chuyến MẪU (Mặc định ngày 01/01/2026)
function openAddTemplateTripModal() {
    document.getElementById("modalTripTitle").innerText = "Thêm Chuyến Xe Mẫu (01/01/2026)";
    document.getElementById("tripTargetDate").value = "2026-01-01"; // Gán ngày mẫu cố định
    
    prepareModalData();
    document.getElementById("addTripModal").style.display = "flex";
}

function closeAddTripModal() {
    document.getElementById("addTripModal").style.display = "none";
    document.getElementById("addTripForm").reset();
}

// Hàm này sẽ được gọi mỗi khi Admin bấm nút "Thêm chuyến"
async function prepareModalData() {
    const token = localStorage.getItem("token");
    
    // Tìm các thẻ select trong Modal
    const routeSelect = document.getElementById("routeSelect");
    const busSelect = document.getElementById("busSelect");

    // Hiển thị trạng thái đang tải để Admin biết
    routeSelect.innerHTML = '<option>Đang tải tuyến đường...</option>';
    busSelect.innerHTML = '<option>Đang tải danh sách xe...</option>';

    try {
        // 1. Gọi API lấy Tuyến đường (Route)
        const resRoutes = await fetch(`${API_BASE}/routes`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const routes = await resRoutes.json();

        // 2. Gọi API lấy Xe (Bus)
        const resBuses = await fetch(`${API_BASE}/buses`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const buses = await resBuses.json();

        // 3. Đổ dữ liệu vào Select Tuyến đường
        routeSelect.innerHTML = '<option value="">-- Chọn tuyến đường --</option>' + 
            routes.map(r => `
                <option value="${r.id}">${r.startStationName} → ${r.endStationName}</option>
            `).join("");

        // 4. Đổ dữ liệu vào Select Xe
        busSelect.innerHTML = '<option value="">-- Chọn xe phục vụ --</option>' + 
            buses.map(b => `
                <option value="${b.id}">${b.licensePlate} (${b.busTypeName})</option>
            `).join("");

    } catch (error) {
        console.error("Lỗi khi chuẩn bị dữ liệu Modal:", error);
        showAlert("Không thể tải danh sách Tuyến đường hoặc Xe. Vui lòng kiểm tra lại kết nối Backend!", 'error');
    }
}

async function submitTrip(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    
    // Lấy các giá trị từ Form
    const targetDate = document.getElementById("tripTargetDate").value;
    const depTime = document.getElementById("departureTime").value; 
    const arrTime = document.getElementById("arrivalTime").value; 
    const routeId = document.getElementById("routeSelect").value;
    const busId = document.getElementById("busSelect").value;
    const price = document.getElementById("tripPriceInput").value;

    // Đóng gói theo đúng cấu trúc Entity mà Backend mong đợi
    const payload = {
        departureTime: `${targetDate}T${depTime}:00`,
        arrivalTime: `${targetDate}T${arrTime}:00`,
        price: price,
        status: "ACTIVE", // Mặc định chuyến mới là hoạt động
        route: { id: parseInt(routeId) }, // Chỉ cần gửi ID để JPA tự map
        bus: { id: parseInt(busId) }      // Chỉ cần gửi ID
    };

    try {
        const res = await fetch(`${API_BASE}/admin/trips/createtrip`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            closeAddTripModal();
            await showAlert(data.message, 'success');
            // Tải lại bảng để thấy chuyến xe mới vừa thêm
            if (targetDate === "2026-01-01") loadTemplateTrips();
            else loadRealTrips(targetDate);
        } else {
            showAlert("Lỗi: " + (data.error || "Không thể tạo chuyến xe"), 'error');
        }
    } catch (error) {
        showAlert("Lỗi hệ thống: " + error.message, 'error');
    }
}

// ==========================================
// 📊 THỐNG KÊ DOANH THU (DASHBOARD)
// ==========================================
let monthlyChart = null;
let routesChart = null;

// Khởi tạo Select chọn năm
function initStatsYearSelect() {
    const select = document.getElementById("statsYearSelect");
    const currentYear = new Date().getFullYear();
    let html = '';
    
    // Tạo danh sách từ năm hiện tại + 1 xuống 2024
    for (let y = currentYear + 1; y >= 2024; y--) {
        const selected = (y === currentYear) ? 'selected' : '';
        html += `<option value="${y}" ${selected}>${y}</option>`;
    }
    select.innerHTML = html;
}

// Gọi API và render tất cả thống kê
async function loadStatistics() {
    const token = localStorage.getItem("token");
    const year = document.getElementById("statsYearSelect").value;

    try {
        const res = await fetch(`${API_BASE}/admin/statistics?year=${year}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Lỗi tải dữ liệu thống kê");
        const data = await res.json();

        // 1. Cập nhật Summary Cards
        document.getElementById("statTotalRevenue").innerText = formatCurrency(data.totalRevenue);
        document.getElementById("statTotalTickets").innerText = formatNumber(data.totalTicketsSold);
        document.getElementById("statTotalBookings").innerText = formatNumber(data.totalBookings);
        document.getElementById("statTotalCustomers").innerText = formatNumber(data.totalCustomers);

        // 2. Vẽ biểu đồ doanh thu theo tháng
        renderMonthlyRevenueChart(data.monthlyRevenue);

        // 3. Vẽ biểu đồ top tuyến đường
        renderTopRoutesChart(data.topRoutes);

        // 4. Render bảng doanh thu theo xe
        renderBusRevenueTable(data.busRevenue);

    } catch (error) {
        console.error("Lỗi thống kê:", error);
    }
}

// Format tiền VNĐ
function formatCurrency(value) {
    if (!value || value == 0) return "0đ";
    return Number(value).toLocaleString("vi-VN") + "đ";
}

// Format số
function formatNumber(value) {
    if (!value) return "0";
    return Number(value).toLocaleString("vi-VN");
}

// ======= BIỂU ĐỒ DOANH THU THEO THÁNG =======
function renderMonthlyRevenueChart(monthlyData) {
    const ctx = document.getElementById("monthlyRevenueChart").getContext("2d");
    
    // Hủy biểu đồ cũ nếu có (tránh vẽ đè)
    if (monthlyChart) monthlyChart.destroy();

    const labels = monthlyData.map(m => `T${m.month}`);
    const revenues = monthlyData.map(m => Number(m.revenue));

    // Tạo gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.85)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.35)');

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: revenues,
                backgroundColor: gradient,
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return 'Doanh thu: ' + Number(context.raw).toLocaleString('vi-VN') + 'đ';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'tr';
                            if (value >= 1000) return (value / 1000) + 'k';
                            return value;
                        },
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 12, weight: '600' } }
                }
            }
        }
    });
}

// ======= BIỂU ĐỒ TOP TUYẾN ĐƯỜNG =======
function renderTopRoutesChart(routeData) {
    const ctx = document.getElementById("topRoutesChart").getContext("2d");
    
    if (routesChart) routesChart.destroy();

    if (!routeData || routeData.length === 0) {
        // Không có dữ liệu -> Hiển thị chart trống
        routesChart = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['Chưa có dữ liệu'], datasets: [{ data: [0], backgroundColor: '#dfe6e9' }] },
            options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } } }
        });
        return;
    }

    const labels = routeData.map(r => {
        // Rút gọn tên nếu quá dài
        const name = r.routeName;
        return name.length > 25 ? name.substring(0, 22) + '...' : name;
    });
    const bookings = routeData.map(r => Number(r.totalBookings));

    const colors = [
        'rgba(243, 156, 18, 0.85)',  // Vàng
        'rgba(52, 152, 219, 0.85)',  // Xanh dương
        'rgba(46, 204, 113, 0.85)',  // Xanh lá
        'rgba(231, 76, 60, 0.85)',   // Đỏ
        'rgba(155, 89, 182, 0.85)',  // Tím
    ];

    routesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số đơn đặt',
                data: bookings,
                backgroundColor: colors.slice(0, routeData.length),
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        afterLabel: function(context) {
                            const route = routeData[context.dataIndex];
                            return `Vé bán: ${route.totalTickets}\nDoanh thu: ${Number(route.totalRevenue).toLocaleString('vi-VN')}đ`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { 
                        stepSize: 1,
                        font: { size: 11 } 
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

// ======= BẢNG DOANH THU THEO XE =======
function renderBusRevenueTable(busData) {
    const tbody = document.getElementById("busRevenueTableBody");
    
    if (!busData || busData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: #999;">
            <i class="fa-solid fa-chart-simple" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
            Chưa có dữ liệu doanh thu trong năm này
        </td></tr>`;
        return;
    }

    tbody.innerHTML = busData.map((bus, index) => {
        // Rank badge
        let rankHtml;
        if (index === 0) rankHtml = `<span class="rank-badge rank-1">🥇</span>`;
        else if (index === 1) rankHtml = `<span class="rank-badge rank-2">🥈</span>`;
        else if (index === 2) rankHtml = `<span class="rank-badge rank-3">🥉</span>`;
        else rankHtml = `<span class="rank-badge rank-default">${index + 1}</span>`;

        return `
        <tr>
            <td style="text-align: center;">${rankHtml}</td>
            <td style="font-weight: 700;">${bus.licensePlate}</td>
            <td>${bus.busTypeName}</td>
            <td style="text-align: center;">${bus.totalTrips}</td>
            <td style="text-align: center;">${bus.totalPassengers}</td>
            <td class="revenue-text">${Number(bus.totalRevenue).toLocaleString('vi-VN')}đ</td>
        </tr>`;
    }).join("");
}