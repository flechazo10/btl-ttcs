document.addEventListener("DOMContentLoaded", function () {
  // 1. KIỂM TRA ĐĂNG NHẬP
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentUsername = localStorage.getItem("currentUsername");

  if (isLoggedIn === "true" && currentUsername) {
    document.getElementById("authGuest").style.display = "none";
    document.getElementById("authUser").style.display = "flex";
    document.getElementById("userNameDisplay").innerText = currentUsername;
  }

  // 2. ĐĂNG XUẤT
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUsername");
    window.location.reload();
  });

  // 3. LOAD TỈNH THÀNH VÀO SELECT
  fetch("http://localhost:8080/api/provinces")
    .then((r) => r.json())
    .then((provinces) => {
      const startEl = document.getElementById("startProvince");
      const endEl = document.getElementById("endProvince");
      startEl.insertAdjacentHTML(
        "beforeend",
        `<option value="">Chọn điểm đi</option>`,
      );
      endEl.insertAdjacentHTML(
        "beforeend",
        `<option value="">Chọn điểm đến</option>`,
      );
      provinces.forEach((p) => {
        startEl.insertAdjacentHTML(
          "beforeend",
          `<option value="${p.name}">${p.name}</option>`,
        );
        endEl.insertAdjacentHTML(
          "beforeend",
          `<option value="${p.name}">${p.name}</option>`,
        );
      });
    })
    .catch((err) => console.error("Lỗi load tỉnh:", err));

  // 4. LOAD TUYẾN XE PHỔ BIẾN
  fetch("http://localhost:8080/api/trips")
    .then((r) => r.json())
    .then((trips) => {
      const popularList = document.getElementById("popularList");
      const seen = new Set();
      const uniqueRoutes = trips.filter((t) => {
        const key = `${t.startProvinceName}-${t.endProvinceName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      if (!uniqueRoutes.length) {
        popularList.innerHTML =
          '<p style="color:#888;text-align:center">Chưa có tuyến xe nào.</p>';
        return;
      }

      popularList.innerHTML = uniqueRoutes
        .map(
          (t) => `
        <div class="popular-card" onclick="quickSearch('${t.startProvinceName}', '${t.endProvinceName}')">
          <div class="popular-card__img">🚌</div>
          <div class="popular-card__body">
            <div class="popular-card__route">${t.startProvinceName} → ${t.endProvinceName}</div>
            <button class="btn-book">Đặt vé ngay</button>
          </div>
        </div>
      `,
        )
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
      if (!start || !end || !date) return;
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
  startEl.value = start;
  endEl.value = end;
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

    // Render tab ngày (hôm nay + 3 ngày tới)
    renderDateTabs(date, start, end);

    // Render bộ lọc loại xe
    renderBusTypeFilter(trips);

    // Render danh sách với filter hiện tại
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

  // Cập nhật tab active
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

  // Lọc loại xe được chọn
  const checkedTypes = [
    ...document.querySelectorAll("#busTypeFilter input:checked"),
  ].map((i) => i.value);

  // Lọc giờ chạy
  const minHour = parseInt(document.getElementById("rangeHourMin")?.value ?? 0);
  const maxHour = parseInt(
    document.getElementById("rangeHourMax")?.value ?? 23,
  );

  // Lọc ghế trống
  const minSeats = parseInt(document.getElementById("rangeSeats")?.value ?? 0);

  let filtered = allTripsCache.filter((t) => {
    const tripDate = t.departureTime.slice(0, 10);
    const tripHour = parseInt(t.departureTime.slice(11, 13));
    const matchRoute =
      t.startProvinceName === start && t.endProvinceName === end;
    const matchDate = tripDate === date;
    const matchType =
      checkedTypes.length === 0 || checkedTypes.includes(t.busTypeName);
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
  if (localStorage.getItem("isLoggedIn") !== "true") {
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
