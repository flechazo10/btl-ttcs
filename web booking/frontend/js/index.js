document.addEventListener("DOMContentLoaded", function () {
  // 1. KIỂM TRA ĐĂNG NHẬP
  // 1. KIỂM TRA ĐĂNG NHẬP
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentUsername = localStorage.getItem("currentUsername");
  const token = localStorage.getItem("token"); // 🌟 Lấy thêm Token ra kiểm tra

  // 🌟 Đòi hỏi phải có cả Token thì mới cho hiện Tên người dùng
  if (isLoggedIn === "true" && currentUsername && token) {
    document.getElementById("authGuest").style.display = "none";
    document.getElementById("authUser").style.display = "flex";
    document.getElementById("userNameDisplay").innerText = currentUsername;
  }

// 2. ĐĂNG XUẤT trong index.js
document.getElementById("btnLogout")?.addEventListener("click", (e) => {
    e.preventDefault(); // 🌟 THÊM DÒNG NÀY ĐỂ CHẶN NHẢY TRANG #
    
    console.log("Đang đăng xuất..."); 
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUsername");
    localStorage.removeItem("userId"); 
    localStorage.removeItem("token"); // 🌟 Xóa sạch Token
    localStorage.removeItem("role");  // 🌟 Xóa luôn quyền

    window.location.href = "index.html"; 
});

// 3. LOAD TỈNH THÀNH VÀ BẾN XE CHO DROPDOWN TÙY CHỈNH
  async function loadLocations() {
    try {
        // 1. Lấy danh sách Tỉnh (API này của bạn đang chạy tốt nên chắc chắn sẽ có Tỉnh)
        const resProv = await fetch("http://localhost:8080/api/provinces");
        const provinces = await resProv.json();

        // 2. Lấy danh sách Bến xe (Dùng try-catch riêng biệt để nếu lỗi thì web vẫn không bị sập)
        let stations = [];
        try {
            const resStat = await fetch("http://localhost:8080/api/stations");
            if (resStat.ok) {
                stations = await resStat.json();
            } else {
                console.warn("API Bến xe bị lỗi (Có thể chưa có data hoặc lỗi code Backend).");
            }
        } catch (e) {
            console.warn("Chưa gọi được API Bến xe:", e);
        }

        // 3. Gom bến xe vào từng tỉnh tương ứng
        const groupedData = {};
        provinces.forEach(p => groupedData[p.name] = []); // Mở sẵn các "thư mục" Tỉnh
        
        stations.forEach(s => {
            // Đảm bảo khớp với DTO StationResponse của Backend
            const pName = s.provinceName || (s.province && s.province.name);
            if (pName && groupedData[pName]) {
                groupedData[pName].push(s);
            }
        });

        // 4. Hàm sinh mã HTML cho danh sách phân cấp (Tỉnh -> Bến xe)
        function buildListHtml(targetHeaderId, targetInputId, targetDropdownId) {
            let html = '';
            for (const [provinceName, stationList] of Object.entries(groupedData)) {
                html += `
                <div class="dropdown-group">
                    <div class="group-header" onclick="toggleAccordion(this)">
                        <span style="flex-grow: 1">
                            ${provinceName}
                        </span>
                        <span style="padding: 0 10px;">
                            <i class="fa-solid fa-chevron-down"></i>
                        </span>
                    </div>
                    
                    <div class="group-items">
                        ${stationList.length > 0 
                            ? stationList.map(st => `
                                <div class="item" onclick="selectLocation('${targetInputId}', '${targetHeaderId}', '${targetDropdownId}', '${provinceName}', '${st.name}')">
                                    ${st.name}
                                </div>
                            `).join("")
                            : `<div class="item" style="color:#aaa; cursor:default; font-size:13px; font-style:italic;">Chưa có bến xe</div>`
                        }
                    </div>
                </div>`;
            }
            return html;
        }

        // 5. Đổ dữ liệu HTML vừa tạo vào 2 hộp Dropdown (Điểm đi & Điểm đến)
        document.getElementById("startList").innerHTML = buildListHtml('startHeader', 'startProvince', 'startDropdown');
        document.getElementById("endList").innerHTML = buildListHtml('endHeader', 'endProvince', 'endDropdown');

    } catch (err) {
        console.error("Lỗi nghiêm trọng khi tải danh sách Tỉnh:", err);
    }
  }

  // Kích hoạt hàm ngay khi trang web vừa tải xong
  loadLocations();
  // 4. LOAD TUYẾN XE PHỔ BIẾN
  fetch("http://localhost:8080/api/trips")
    .then((r) => r.json())
    .then((trips) => {
      const popularList = document.getElementById("popularList");
      const seen = new Set();
      
      const uniqueRoutes = trips.filter((t) => {
        // 🌟 Ưu tiên dùng tên Bến xe, nếu chuyến nào chưa gán bến thì lùi về dùng tên Tỉnh
        const startName = t.startStationName || t.startProvinceName;
        const endName = t.endStationName || t.endProvinceName;
        
        const key = `${startName}-${endName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        
        // Lưu lại tên hiển thị vào object để lúc render tái sử dụng
        t.displayStartName = startName;
        t.displayEndName = endName;
        return true;
      });

      if (!uniqueRoutes.length) {
        popularList.innerHTML = '<p style="color:#888;text-align:center">Chưa có tuyến xe nào.</p>';
        return;
      }

      const defaultImages = [
        "https://bizweb.dktcdn.net/100/512/250/files/z5768108137147-045345ce0bd57739faa1645d4c59f596.jpg?v=1724659700457",
        "https://bizweb.dktcdn.net/100/512/250/files/z5768108137147-045345ce0bd57739faa1645d4c59f596.jpg?v=1724659700457",
        "https://bizweb.dktcdn.net/100/512/250/files/z5768108137147-045345ce0bd57739faa1645d4c59f596.jpg?v=1724659700457",
        "https://bizweb.dktcdn.net/100/512/250/files/z5768108137147-045345ce0bd57739faa1645d4c59f596.jpg?v=1724659700457",
      ];

      const today = new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      popularList.innerHTML = uniqueRoutes
        .map((t, i) => {
          const img = t.imageUrl || defaultImages[i % defaultImages.length];
          return `
        <div class="popular-card" onclick="quickSearch('${t.displayStartName}', '${t.displayEndName}')">
          <div class="popular-card__img">
            <img src="${img}" alt="${t.displayStartName} → ${t.displayEndName}" />
          </div>
          <div class="popular-card__body">
            <div class="popular-card__route">${t.displayStartName} → ${t.displayEndName}</div>
            <div class="popular-card__date">
              <span class="popular-card__date-label">Ngày đi</span>
              <span class="popular-card__date-value">📅 ${today}</span>
            </div>
            <button class="btn-book popular-card__btn">Đặt vé ngay</button>
          </div>
        </div>
      `;
        })
        .join("");
    })
    .catch((err) => console.error("Lỗi load tuyến:", err));

  // 5. TÌM KIẾM
document
    .getElementById("searchForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const start = document.getElementById("startProvince").value;
      const end = document.getElementById("endProvince").value;
      const date = document.getElementById("departureDate").value;

      // 🌟 Nhắc nhở nếu khách quên chưa chọn
      if (!start) {
          alert("Vui lòng chọn Điểm đi!");
          return;
      }
      if (!end) {
          alert("Vui lòng chọn Điểm đến!");
          return;
      }

      // Vượt qua kiểm tra thì mới tiến hành tìm kiếm
      await doSearch(start, end, date);
      document
        .getElementById("resultsSection")
        .scrollIntoView({ behavior: "smooth" });
    });
  });

// 6. TÌM KIẾM NHANH TỪ CARD PHỔ BIẾN
function quickSearch(start, end) {
  const startEl = document.getElementById("startProvince");
  const endEl = document.getElementById("endProvince");
  const dateEl = document.getElementById("departureDate");
  
  // 1. Gán giá trị vào thẻ input ẩn để submit form
  startEl.value = start;
  endEl.value = end;

  // 2. 🌟 CẬP NHẬT MẶT CHỮ CHO DROPDOWN TÙY CHỈNH
  document.getElementById("startHeader").innerText = start;
  document.getElementById("startHeader").style.fontWeight = "bold";
  document.getElementById("startHeader").style.color = "#333";
  
  document.getElementById("endHeader").innerText = end;
  document.getElementById("endHeader").style.fontWeight = "bold";
  document.getElementById("endHeader").style.color = "#333";

  // 3. Thực thi tìm kiếm
  if (!dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
  doSearch(start, end, dateEl.value).then(() => {
    document
      .getElementById("resultsSection")
      .scrollIntoView({ behavior: "smooth" });
  });
}

// 7. RESET
function resetSearch() {
  document.getElementById("startProvince").value = "";
  document.getElementById("endProvince").value = "";
  document.getElementById("departureDate").value = "";
  document.getElementById("resultsSection").style.display = "none";
  document.getElementById("tripList").innerHTML = "";
}

// 8. HÀM SEARCH CHÍNH
let allTripsCache = [];
let currentSearch = { start: "", end: "", date: "" };

async function doSearch(start, end, date) {
  currentSearch = { start, end, date };

  const section = document.getElementById("resultsSection");
  section.style.display = "block";
  document.getElementById("resultsLoading").style.display = "flex";
  document.getElementById("tripList").innerHTML = "";
  document.getElementById("resultsEmpty").style.display = "none";
  document.getElementById("filterPanel").style.display = "block";

  try {
    const trips = await fetch("http://localhost:8080/api/trips").then((r) =>
      r.json(),
    );
    allTripsCache = trips;

    document.getElementById("resultsLoading").style.display = "none";
    document.getElementById("resultsTitle").textContent = `${start} → ${end}`;

    renderDateTabs(date, start, end);
    renderBusTypeFilter(trips);
    applyFilters();
  } catch (err) {
    console.error("Lỗi:", err);
    document.getElementById("resultsLoading").style.display = "none";
    document.getElementById("resultsEmpty").style.display = "block";
  }
}

// 9. RENDER TAB NGÀY
function renderDateTabs(selectedDate, start, end) {
  const tabContainer = document.getElementById("dateTabs");
  const days = [
    "CN",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const base = new Date(selectedDate);
  let html = "";

  for (let i = 0; i < 4; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = days[d.getDay()];
    const dateLabel = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    const active = dateStr === selectedDate ? "active" : "";
    html += `<button class="date-tab ${active}" onclick="changeDate('${dateStr}')">${dayName}, ${dateLabel}</button>`;
  }

  tabContainer.innerHTML = html;
}

// 10. ĐỔI NGÀY QUA TAB
function changeDate(date) {
  currentSearch.date = date;
  document.getElementById("departureDate").value = date;

  document.querySelectorAll(".date-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("onclick").includes(date));
  });

  applyFilters();
}

// 11. RENDER BỘ LỌC LOẠI XE
function renderBusTypeFilter(trips) {
  const busTypes = [...new Set(trips.map((t) => t.busTypeName))];
  const container = document.getElementById("busTypeFilter");
  container.innerHTML = busTypes
    .map(
      (type) => `
    <label class="filter-checkbox">
      <input type="checkbox" value="${type}" onchange="applyFilters()"> ${type}
    </label>
  `,
    )
    .join("");
}

// 12. ÁP DỤNG BỘ LỌC
function applyFilters() {
  const { start, end, date } = currentSearch;

  const checkedTypes = [
    ...document.querySelectorAll("#busTypeFilter input:checked"),
  ].map((i) => i.value);

  const minHour = parseInt(document.getElementById("rangeHourMin")?.value ?? 0);
  const maxHour = parseInt(
    document.getElementById("rangeHourMax")?.value ?? 23,
  );
  const minSeats = parseInt(document.getElementById("rangeSeats")?.value ?? 0);

let filtered = allTripsCache.filter((t) => {
    const tripDate = t.departureTime.slice(0, 10);
    const tripHour = parseInt(t.departureTime.slice(11, 13));
    
    // 🌟 SỬA DÒNG NÀY: Khớp nếu bằng Tên Tỉnh HOẶC bằng Tên Bến Xe
    const matchRoute =
      (t.startProvinceName === start || t.startStationName === start) &&
      (t.endProvinceName === end || t.endStationName === end);

    const matchDate = tripDate === date;
    const matchType = checkedTypes.length === 0 || checkedTypes.includes(t.busTypeName);
    const matchHour = tripHour >= minHour && tripHour <= maxHour;
    const matchSeats = t.availableSeats >= minSeats;
    
    return matchRoute && matchDate && matchType && matchHour && matchSeats;
  });
  const tripList = document.getElementById("tripList");
  const resultsCount = document.getElementById("resultsCount");
  const resultsEmpty = document.getElementById("resultsEmpty");

  if (!filtered.length) {
    tripList.innerHTML = "";
    resultsEmpty.style.display = "block";
    resultsCount.textContent = "";
    return;
  }

  resultsEmpty.style.display = "none";
  resultsCount.textContent = `${filtered.length} chuyến`;
  tripList.innerHTML = filtered
    .map(
      (trip) => `
    <div class="trip-card2 ${trip.availableSeats <= 0 ? "trip-card2--full" : ""}">
      <div class="trip-card2__logo">
        <img src="images/logo.png" alt="Logo">
        <span class="trip-card2__name">NHÀ XE TSH</span>
      </div>
      <div class="trip-card2__info">
        <div class="trip-card2__type">${trip.busTypeName}</div>
        <div class="trip-card2__route">
          <span class="trip-card2__time">${trip.departureTime.slice(11, 16)}</span>
          <span class="trip-card2__duration">→</span>
          <span class="trip-card2__time">${trip.arrivalTime.slice(11, 16)}</span>
        </div>
        <div class="trip-card2__depart">🕐 Khởi hành ${trip.departureTime.slice(11, 16)}</div>
      </div>
      <div class="trip-card2__seats">
        Còn <span class="${trip.availableSeats <= 0 ? "red" : "orange"}">${trip.availableSeats}/${trip.totalSeats}</span> chỗ
      </div>
      <div class="trip-card2__right">
        <div class="trip-card2__price">${trip.price.toLocaleString("vi-VN")}đ</div>
        <button class="btn-book" ${trip.availableSeats <= 0 ? "disabled" : ""}
          onclick="handleBooking(${trip.id})">
          ${trip.availableSeats <= 0 ? "Hết vé" : "Đặt vé"}
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

// 13. ĐẶT VÉ
function handleBooking(tripId) {
  // 🌟 KIỂM TRA CÓ TOKEN KHÔNG THAY VÌ CHỈ CHECK ISLOGGEDIN
  const token = localStorage.getItem("token");
  if (!token || localStorage.getItem("isLoggedIn") !== "true") {
    alert("Bạn cần đăng nhập để đặt vé!");
    window.location.href = "login.html";
    return;
  }
  window.location.href = `booking.html?tripId=${tripId}`;
}

function updateRangeLabel(type, value) {
  if (type === "hourMin")
    document.getElementById("labelHourMin").textContent =
      `${String(value).padStart(2, "0")}:00`;
  if (type === "hourMax")
    document.getElementById("labelHourMax").textContent =
      `${String(value).padStart(2, "0")}:59`;
  if (type === "seats")
    document.getElementById("labelSeats").textContent = value;
}

function resetFilters() {
  document
    .querySelectorAll("#busTypeFilter input")
    .forEach((i) => (i.checked = false));
  document.getElementById("rangeHourMin").value = 0;
  document.getElementById("rangeHourMax").value = 23;
  document.getElementById("rangeSeats").value = 0;
  document.getElementById("labelHourMin").textContent = "00:00";
  document.getElementById("labelHourMax").textContent = "23:59";
  document.getElementById("labelSeats").textContent = "0";
  applyFilters();
}

// ==========================================
// CÁC HÀM HỖ TRỢ CHO DROPDOWN TÌM KIẾM MỚI
// ==========================================

// Bật/tắt menu to
function toggleDropdown(dropdownId) {
  document.querySelectorAll('.custom-dropdown-body').forEach(el => {
      if(el.id !== dropdownId) el.style.display = 'none'; // Đóng các hộp khác
  });
  const el = document.getElementById(dropdownId);
  el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

// Bật/tắt Accordion (Xổ bến xe con ra khi bấm mũi tên)
function toggleAccordion(element) {
  // element bây giờ chính là thẻ div.group-header
  const itemsDiv = element.nextElementSibling; // Lấy thẻ div.group-items ngay dưới nó
  
  // Đóng/mở
  itemsDiv.style.display = itemsDiv.style.display === 'block' ? 'none' : 'block';
}

// Khi khách hàng bấm chọn Tỉnh hoặc Bến xe
// Thay vì gán provinceName, chúng ta gán chính xác displayValue (chữ hiển thị)
function selectLocation(inputId, headerId, dropdownId, provinceName, displayValue) {
  const headerEl = document.getElementById(headerId);
  headerEl.innerText = displayValue;
  headerEl.style.fontWeight = "bold";
  headerEl.style.color = "#333";
  
  // 🌟 SỬA DÒNG NÀY: Lưu chính xác Tên Tỉnh hoặc Tên Bến xe khách vừa chọn
  document.getElementById(inputId).value = displayValue; 
  
  document.getElementById(dropdownId).style.display = 'none';
}

// Lọc tìm kiếm khi gõ chữ vào ô input của Dropdown
function filterDropdown(input, listId) {
  const filter = input.value.toLowerCase();
  const groups = document.getElementById(listId).getElementsByClassName('dropdown-group');
  
  for (let i = 0; i < groups.length; i++) {
      const text = groups[i].innerText.toLowerCase();
      if (text.includes(filter)) {
          groups[i].style.display = "";
      } else {
          groups[i].style.display = "none";
      }
  }
}

// Tự động đóng hộp chọn nếu click chuột ra ngoài vùng trống của web
document.addEventListener('click', function(event) {
  if (!event.target.closest('.custom-dropdown-container')) {
      document.querySelectorAll('.custom-dropdown-body').forEach(el => el.style.display = 'none');
  }
});

// Cập nhật lại Hàm Xóa (Phần 7) để nó Reset luôn cả mặt chữ của Dropdown
const oldResetSearch = resetSearch; // Lưu đè hàm cũ
resetSearch = function() {
  oldResetSearch(); // Gọi logic xóa cũ
  // Trả lại mặt chữ mặc định cho hộp Dropdown
  document.getElementById("startHeader").innerText = "Chọn điểm đi";
  document.getElementById("startHeader").style.fontWeight = "500";
  document.getElementById("endHeader").innerText = "Chọn điểm đến";
  document.getElementById("endHeader").style.fontWeight = "500";
};

document.addEventListener("DOMContentLoaded", function() {
    flatpickr("#departureDate", {
        // 🌟 Định dạng ngầm để hệ thống JS và Backend đọc (Năm-Tháng-Ngày)
        dateFormat: "Y-m-d", 
        
        // 🌟 Bật chế độ "mặt nạ" để khách hàng nhìn thấy dạng Ngày/Tháng/Năm
        altInput: true,      
        altFormat: "d/m/Y",  
        
        locale: "vn",        
        defaultDate: "today", // 🌟 Tự động hiển thị ngày hôm nay khi mới vào web
        allowInput: true     
    });
});

        //minDate: "today",    // 🌟 Tiện thể: Chặn không cho khách chọn ngày trong quá khứ!
