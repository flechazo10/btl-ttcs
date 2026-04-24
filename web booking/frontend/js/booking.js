(function () {
  const API_BASE = "http://localhost:8080/api";
  const STORAGE_KEY = "bookingSelectedTrip";

  let currentTrip = null;
  let unitPrice = 0;

  /** @type {{ min: number; max: number; test?: (d: string) => boolean; err?: string } | null} */
  const PHONE_RULES = {
    "+84": {
      min: 9,
      max: 10,
      test: (d) => {
        const x = d.startsWith("0") ? d : `0${d}`;
        return x.length === 10 && /^0(3|5|7|8|9)\d{8}$/.test(x);
      },
      err: "Số di động VN: 10 số (bắt đầu 03/05/07/08/09) hoặc 9 số không gồm 0 đầu.",
    },
    "+1": {
      min: 10,
      max: 10,
      test: (d) => /^[2-9]\d{9}$/.test(d),
      err: "Số Hoa Kỳ/Canada: 10 chữ số, mã vùng không bắt đầu bằng 0 hoặc 1.",
    },
    "+44": {
      min: 10,
      max: 11,
      test: (d) => d.replace(/^0/, "").length >= 10,
      err: "Số Anh: thường 10–11 chữ số (có thể bỏ số 0 đầu).",
    },
    "+33": {
      min: 9,
      max: 9,
      test: (d) => /^[1-9]\d{8}$/.test(d),
      err: "Số Pháp: 9 chữ số (không gồm 0 đầu).",
    },
    "+49": { min: 10, max: 12, err: "Số Đức: 10–12 chữ số." },
    "+39": { min: 9, max: 11, err: "Số Ý: 9–11 chữ số." },
    "+34": { min: 9, max: 9, err: "Số Tây Ban Nha: 9 chữ số." },
    "+31": { min: 9, max: 9, err: "Số Hà Lan: 9 chữ số." },
    "+32": { min: 9, max: 9, err: "Số Bỉ: 9 chữ số." },
    "+41": { min: 9, max: 9, err: "Số Thụy Sĩ: 9 chữ số." },
    "+43": { min: 10, max: 13, err: "Số Áo: 10–13 chữ số." },
    "+45": { min: 8, max: 8, err: "Số Đan Mạch: 8 chữ số." },
    "+46": { min: 9, max: 10, err: "Số Thụy Điển: 9–10 chữ số." },
    "+47": { min: 8, max: 8, err: "Số Na Uy: 8 chữ số." },
    "+358": { min: 9, max: 12, err: "Số Phần Lan: 9–12 chữ số." },
    "+48": { min: 9, max: 9, err: "Số Ba Lan: 9 chữ số." },
    "+420": { min: 9, max: 9, err: "Số Séc: 9 chữ số." },
    "+36": { min: 9, max: 9, err: "Số Hungary: 9 chữ số." },
    "+40": { min: 9, max: 9, err: "Số Romania: 9 chữ số." },
    "+30": { min: 10, max: 10, err: "Số Hy Lạp: 10 chữ số." },
    "+351": { min: 9, max: 9, err: "Số Bồ Đào Nha: 9 chữ số." },
    "+353": { min: 9, max: 10, err: "Số Ireland: 9–10 chữ số." },
    "+7": {
      min: 10,
      max: 10,
      test: (d) => /^9\d{9}$/.test(d),
      err: "Số Nga di động: 10 chữ số, bắt đầu 9.",
    },
    "+380": { min: 9, max: 9, err: "Số Ukraine: 9 chữ số." },
    "+90": { min: 10, max: 10, err: "Số Thổ Nhĩ Kỳ: 10 chữ số." },
    "+972": { min: 9, max: 9, err: "Số Israel: 9 chữ số." },
    "+971": { min: 9, max: 9, err: "Số UAE: 9 chữ số." },
    "+966": { min: 9, max: 9, err: "Số Ả Rập Xê Út: 9 chữ số." },
    "+20": { min: 10, max: 10, err: "Số Ai Cập: 10 chữ số." },
    "+27": { min: 9, max: 9, err: "Số Nam Phi: 9 chữ số." },
    "+91": {
      min: 10,
      max: 10,
      test: (d) => /^[6-9]\d{9}$/.test(d),
      err: "Số Ấn Độ: 10 chữ số, bắt đầu 6–9.",
    },
    "+92": { min: 10, max: 10, err: "Số Pakistan: 10 chữ số." },
    "+880": { min: 10, max: 11, err: "Số Bangladesh: 10–11 chữ số." },
    "+94": { min: 9, max: 9, err: "Số Sri Lanka: 9 chữ số." },
    "+86": {
      min: 11,
      max: 11,
      test: (d) => /^1\d{10}$/.test(d),
      err: "Số Trung Quốc di động: 11 chữ số, bắt đầu 1.",
    },
    "+852": { min: 8, max: 8, err: "Số Hồng Kông: 8 chữ số." },
    "+853": { min: 8, max: 8, err: "Số Ma Cao: 8 chữ số." },
    "+886": {
      min: 9,
      max: 9,
      test: (d) => /^9\d{8}$/.test(d),
      err: "Số Đài Loan: 9 chữ số, di động thường bắt đầu 9.",
    },
    "+81": {
      min: 10,
      max: 11,
      err: "Số Nhật: 10–11 chữ số (bỏ số 0 đầu tiên nếu có).",
    },
    "+82": { min: 9, max: 11, err: "Số Hàn Quốc: 9–11 chữ số." },
    "+65": {
      min: 8,
      max: 8,
      test: (d) => /^[689]\d{7}$/.test(d),
      err: "Số Singapore: 8 chữ số, bắt đầu 6/8/9.",
    },
    "+60": { min: 9, max: 10, err: "Số Malaysia: 9–10 chữ số." },
    "+66": {
      min: 9,
      max: 9,
      test: (d) => /^[689]\d{8}$/.test(d),
      err: "Số Thái Lan: 9 chữ số, bắt đầu 6/8/9.",
    },
    "+63": {
      min: 10,
      max: 10,
      test: (d) => /^9\d{9}$/.test(d),
      err: "Số Philippines: 10 chữ số, di động thường bắt đầu 9.",
    },
    "+62": { min: 10, max: 13, err: "Số Indonesia: 10–13 chữ số." },
    "+855": { min: 8, max: 9, err: "Số Campuchia: 8–9 chữ số." },
    "+856": { min: 8, max: 10, err: "Số Lào: 8–10 chữ số." },
    "+95": { min: 8, max: 10, err: "Số Myanmar: 8–10 chữ số." },
    "+61": {
      min: 9,
      max: 9,
      test: (d) => /^4\d{8}$/.test(d),
      err: "Số Úc di động: 9 chữ số, bắt đầu 4.",
    },
    "+64": { min: 8, max: 10, err: "Số New Zealand: 8–10 chữ số." },
    "+52": { min: 10, max: 10, err: "Số Mexico: 10 chữ số." },
    "+55": { min: 10, max: 11, err: "Số Brazil: 10–11 chữ số." },
    "+54": { min: 10, max: 11, err: "Số Argentina: 10–11 chữ số." },
    "+56": { min: 9, max: 9, err: "Số Chile: 9 chữ số." },
    "+57": { min: 10, max: 10, err: "Số Colombia: 10 chữ số." },
  };

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function parseTripFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveTripToStorage(trip) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch (_) {}
  }

  function formatDateVi(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function formatTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  function formatMoney(n) {
    const num = Number(n);
    if (Number.isNaN(num)) return "0";
    return `${num.toLocaleString("vi-VN")} đ`;
  }

  function routeLabel(trip) {
    if (!trip) return "—";
    const a = trip.startProvinceName || "";
    const b = trip.endProvinceName || "";
    return `${a} - ${b}`.trim() || "—";
  }

  function showError(msg) {
    const el = document.getElementById("bookingError");
    const layout = document.getElementById("bookingLayout");
    const loading = document.getElementById("bookingLoading");
    if (loading) loading.style.display = "none";
    if (layout) layout.style.display = "none";
    if (el) {
      el.textContent = msg;
      el.style.display = "block";
    }
  }

  function hideError() {
    const el = document.getElementById("bookingError");
    if (el) el.style.display = "none";
  }

  function setStaleBanner(show) {
    const b = document.getElementById("staleDataBanner");
    if (!b) return;
    if (show) {
      b.hidden = false;
      b.textContent =
        "Không tải được dữ liệu mới từ máy chủ. Đang dùng thông tin đã lưu trên trình duyệt — số ghế trống có thể đã thay đổi.";
    } else {
      b.hidden = true;
      b.textContent = "";
    }
  }

  function clearFieldErrors() {
    ["errFullName", "errPhone", "errSeats"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.hidden = true;
        el.textContent = "";
      }
    });
    document
      .querySelectorAll(".form-input--invalid")
      .forEach((n) => n.classList.remove("form-input--invalid"));
    document
      .querySelectorAll(".form-select--invalid")
      .forEach((n) => n.classList.remove("form-select--invalid"));
  }

  function setFieldError(inputId, errId, msg, isSelect) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) {
      input.classList.add(
        isSelect ? "form-select--invalid" : "form-input--invalid",
      );
    }
    if (err) {
      err.textContent = msg;
      err.hidden = false;
    }
  }

  function validateNationalPhone(code, raw) {
    const d = raw.replace(/\D/g, "");
    if (!d) {
      return { ok: false, msg: "Vui lòng nhập số điện thoại." };
    }

    const rule = PHONE_RULES[code];
    if (!rule) {
      const ok = d.length >= 8 && d.length <= 15;
      return {
        ok,
        msg: ok ? "" : "Số điện thoại cần 8–15 chữ số.",
      };
    }

    if (d.length < rule.min || d.length > rule.max) {
      return {
        ok: false,
        msg: `Với mã ${code}, nhập ${rule.min}–${rule.max} chữ số (chỉ phần số trong nước).`,
      };
    }

    if (rule.test && !rule.test(d)) {
      return { ok: false, msg: rule.err || "Số điện thoại không hợp lệ." };
    }

    return { ok: true, msg: "" };
  }

  function buildPhone() {
    const code = document.getElementById("phoneCode").value.trim();
    const num = document.getElementById("phoneNumber").value.replace(/\s/g, "");
    if (!num) return "";
    const digits = num.replace(/\D/g, "");
    if (code === "+84" && digits.startsWith("0")) {
      return `${code}${digits.slice(1)}`;
    }
    return `${code}${digits}`;
  }

  function getAvailableSeats(trip) {
    const n = Number(trip && trip.availableSeats);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  }

  function renderTrip(trip) {
    currentTrip = trip;
    unitPrice = Number(trip.price) || 0;

    document.getElementById("sumRoute").textContent = routeLabel(trip);
    document.getElementById("sumDate").textContent = formatDateVi(
      trip.departureTime,
    );
    document.getElementById("sumDepart").textContent = formatTime(
      trip.departureTime,
    );
    document.getElementById("sumPlate").textContent = trip.licensePlate || "—";

    const avail = getAvailableSeats(trip);
    const seatsInput = document.getElementById("seatQty");
    const btn = document.getElementById("btnContinue");

    const urlSeats = getQueryParam("seats");
    if (urlSeats) {
      const parsed = parseInt(urlSeats, 10);
      if (!Number.isNaN(parsed) && parsed >= 1) {
        seatsInput.value = String(parsed);
      }
    }

    if (avail <= 0) {
      seatsInput.min = "0";
      seatsInput.max = "0";
      seatsInput.value = "0";
      seatsInput.disabled = true;
      if (btn) btn.disabled = true;
      document.getElementById("sumSeatNote").textContent =
        "Còn 0 ghế trống — không thể đặt thêm.";
    } else {
      seatsInput.disabled = false;
      seatsInput.min = "1";
      seatsInput.max = String(avail);
      if (btn) btn.disabled = false;
      let q = parseInt(seatsInput.value, 10);
      if (Number.isNaN(q) || q < 1) q = 1;
      if (q > avail) q = avail;
      seatsInput.value = String(q);
      document.getElementById("sumSeatNote").textContent =
        `Còn ${avail} ghế trống`;
    }

    updateTotals();
  }

  function updateTotals() {
    const avail = currentTrip ? getAvailableSeats(currentTrip) : 0;
    let qty = parseInt(document.getElementById("seatQty").value, 10);
    if (Number.isNaN(qty) || qty < 1) qty = 1;
    if (avail > 0 && qty > avail) qty = avail;
    if (avail <= 0) qty = 0;

    const subtotal = avail <= 0 ? 0 : unitPrice * qty;
    document.getElementById("lineUnitDetail").textContent =
      avail <= 0 ? "—" : `${formatMoney(unitPrice)} × ${qty}`;
    document.getElementById("subtotalLine").textContent = formatMoney(subtotal);
    document.getElementById("grandTotal").textContent = formatMoney(subtotal);
  }

  function validateSeatQty() {
    const avail = currentTrip ? getAvailableSeats(currentTrip) : 0;
    const raw = document.getElementById("seatQty").value;
    const qty = parseInt(raw, 10);

    if (avail <= 0) {
      return { ok: false, msg: "Chuyến này không còn ghế trống." };
    }
    if (raw === "" || Number.isNaN(qty)) {
      return { ok: false, msg: "Nhập số lượng ghế hợp lệ." };
    }
    if (qty < 1 || !Number.isInteger(qty)) {
      return { ok: false, msg: "Số ghế phải là số nguyên ≥ 1." };
    }
    if (qty > avail) {
      return {
        ok: false,
        msg: `Chỉ còn ${avail} ghế trống — không thể đặt ${qty} ghế.`,
      };
    }
    return { ok: true, msg: "", qty };
  }

  function validateForm() {
    clearFieldErrors();
    let ok = true;

    const name = document.getElementById("fullName").value.trim();
    if (!name) {
      setFieldError("fullName", "errFullName", "Vui lòng nhập họ tên.");
      ok = false;
    }

    const phoneRaw = document.getElementById("phoneNumber").value;
    const code = document.getElementById("phoneCode").value;
    const phoneCheck = validateNationalPhone(code, phoneRaw);
    if (!phoneCheck.ok) {
      setFieldError("phoneNumber", "errPhone", phoneCheck.msg);
      document
        .getElementById("phoneCode")
        .classList.add("form-select--invalid");
      ok = false;
    }

    const seatRes = validateSeatQty();
    if (!seatRes.ok) {
      document.getElementById("seatQty").classList.add("form-input--invalid");
      const errSeats = document.getElementById("errSeats");
      if (errSeats) {
        errSeats.textContent = seatRes.msg;
        errSeats.hidden = false;
      }
      ok = false;
    }

    return ok ? { ok: true, qty: seatRes.qty } : { ok: false };
  }

  async function loadTrip() {
    const urlId = getQueryParam("tripId");
    if (!urlId) {
      showError(
        "Thiếu thông tin chuyến (tripId). Vui lòng chọn chuyến từ trang chủ.",
      );
      return;
    }

    document.getElementById("bookingLoading").style.display = "block";
    document.getElementById("bookingLayout").style.display = "none";
    setStaleBanner(false);

    const stored = parseTripFromStorage();

    try {
      const res = await fetch(`${API_BASE}/trips`);
      if (!res.ok) throw new Error("HTTP");
      const trips = await res.json();
      const trip = trips.find((t) => String(t.id) === String(urlId));
      if (!trip) {
        showError("Không tìm thấy chuyến xe đã chọn.");
        return;
      }
      saveTripToStorage(trip);
      document.getElementById("bookingLoading").style.display = "none";
      document.getElementById("bookingLayout").style.display = "grid";
      hideError();
      renderTrip(trip);
    } catch (e) {
      console.error(e);
      if (stored && String(stored.id) === String(urlId)) {
        document.getElementById("bookingLoading").style.display = "none";
        document.getElementById("bookingLayout").style.display = "grid";
        hideError();
        setStaleBanner(true);
        renderTrip(stored);
      } else {
        showError(
          "Không kết nối được máy chủ (đảm bảo Spring Boot đang chạy cổng 8080).",
        );
      }
    }
  }

  async function submitBooking(e) {
    e.preventDefault();
    if (!currentTrip) return;

    // 🌟 1. LẤY TOKEN VÀ ID NGƯỜI DÙNG TỪ BỘ NHỚ TRÌNH DUYỆT
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    // 🌟 2. KIỂM TRA ĐĂNG NHẬP TRƯỚC KHI GỬI
    if (!token || !userId) {
      alert("Vui lòng đăng nhập trước khi thực hiện đặt vé!");
      window.location.href = "login.html";
      return;
    }

    const validation = validateForm();
    if (!validation.ok) return;

    const btn = document.getElementById("btnContinue");
    const qty = validation.qty;

    const payload = {
      userId: userId, // Dùng đúng userId đã lưu
      tripId: currentTrip.id,
      passengerName: document.getElementById("fullName").value.trim(),
      passengerPhone: buildPhone(),
      customerEmail: null,
      totalTickets: qty,
      pickupLocation: document.getElementById("pickupDetail").value.trim(),
      dropoffLocation: document.getElementById("dropoffDetail").value.trim(),
      note: document.getElementById("noteField").value.trim(),
    };

    btn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // 🌟 3. TRÌNH VÉ TOKEN CHO SPRING BOOT DUYỆT
        },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!res.ok) {
        // Nếu Backend báo lỗi (hết vé, lỗi token...), hiện thông báo
        alert(typeof data === "string" ? data : "Đặt vé thất bại (Phiên đăng nhập có thể đã hết hạn).");
        btn.disabled = false;
        return;
      }

      // Đặt vé thành công -> Chuyển sang VNPAY
      localStorage.setItem("lastBooking", JSON.stringify(data));
      const id = data && data.id ? encodeURIComponent(data.id) : "";
      window.location.href = id
        ? `payment.html?bookingId=${id}`
        : "payment.html";
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi gửi đơn đặt vé.");
      btn.disabled = false;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("seatQty")?.addEventListener("input", () => {
      document.getElementById("errSeats").hidden = true;
      updateTotals();
    });
    document
      .getElementById("seatQty")
      ?.addEventListener("change", updateTotals);
    document
      .getElementById("bookingForm")
      ?.addEventListener("submit", submitBooking);
    loadTrip();
  });
})();
