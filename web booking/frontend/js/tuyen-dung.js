// Kiểm tra đăng nhập
document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentUsername = localStorage.getItem("currentUsername");

  if (isLoggedIn === "true" && currentUsername) {
    document.getElementById("authGuest").style.display = "none";
    document.getElementById("authUser").style.display = "flex";
    document.getElementById("userNameDisplay").innerText = currentUsername;
  }

  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUsername");
    window.location.reload();
  });
});

// Dữ liệu việc làm chi tiết
const jobDetails = [
  {
    title: "Nhân viên Tư vấn Khách hàng",
    dept: "Phòng Chăm sóc Khách hàng",
    location: "Hồ Chí Minh",
    salary: "8 - 12 triệu/tháng",
    quantity: "3 vị trí",
    type: "Toàn thời gian",
    urgent: true,
    description:
      "Tiếp nhận và tư vấn khách hàng về dịch vụ xe khách, hỗ trợ đặt vé, giải quyết khiếu nại.",
    requirements: [
      "Tốt nghiệp Cao đẳng trở lên (ưu tiên ngành Du lịch, Marketing, Kinh tế)",
      "Giọng nói chuẩn, dễ nghe, thân thiện",
      "Sử dụng thành thạo máy tính và các phần mềm văn phòng",
      "Có kinh nghiệm CSKH là điểm cộng",
      "Chịu được áp lực công việc, làm việc theo ca",
    ],
    benefits: [
      "Lương cứng + hoa hồng theo doanh thu",
      "Đào tạo chuyên nghiệp 2 tuần đầu",
      "Phụ cấp điện thoại, xăng xe",
      "Được xét tăng lương 2 lần/năm",
      "Bảo hiểm đầy đủ sau thử việc",
    ],
  },
  {
    title: "Tài xế Xe khách Đường dài",
    dept: "Phòng Vận hành",
    location: "Hồ Chí Minh, Hà Nội",
    salary: "15 - 25 triệu/tháng",
    quantity: "5 vị trí",
    type: "Toàn thời gian",
    urgent: false,
    description:
      "Lái xe khách đường dài tuyến Bắc - Nam, đảm bảo an toàn hành khách và tài sản.",
    requirements: [
      "Nam, tuổi từ 25 - 45",
      "Bằng lái xe hạng D còn thời hạn",
      "Kinh nghiệm lái xe từ 3 năm trở lên (ưu tiên lái xe khách)",
      "Không có tiền án, tiền sự",
      "Sức khỏe tốt, không mắc các bệnh về tim mạch, thị giác",
    ],
    benefits: [
      "Lương cứng + phụ cấp km",
      "Được nghỉ ngơi theo quy định luật lao động",
      "Cung cấp xe riêng để di chuyển",
      "Đào tạo an toàn giao thông định kỳ",
      "Bảo hiểm tai nạn 24/7",
    ],
  },
  {
    title: "Nhân viên Kế toán Tổng hợp",
    dept: "Phòng Tài chính - Kế toán",
    location: "Hồ Chí Minh",
    salary: "10 - 15 triệu/tháng",
    quantity: "1 vị trí",
    type: "Toàn thời gian",
    urgent: false,
    description:
      "Thực hiện các nghiệp vụ kế toán tổng hợp, lập báo cáo tài chính, quản lý thu chi.",
    requirements: [
      "Tốt nghiệp Đại học chuyên ngành Kế toán, Tài chính",
      "Có chứng chỉ CPA hoặc ACCA là điểm cộng",
      "Kinh nghiệm 2+ năm ở vị trí kế toán tổng hợp",
      "Thành thạo phần mềm kế toán (MISA, FAST)",
      "Cẩn thận, trung thực, có trách nhiệm",
    ],
    benefits: [
      "Lương thỏa thuận theo năng lực",
      "Thưởng cuối năm 1-3 tháng lương",
      "Đào tạo nâng cao chuyên môn",
      "Cơ hội thăng tiến lên Kế toán trưởng",
      "Bảo hiểm cao cấp",
    ],
  },
  {
    title: "Lập trình viên Full-stack (Java/React)",
    dept: "Phòng Công nghệ Thông tin",
    location: "Hồ Chí Minh / Remote",
    salary: "20 - 35 triệu/tháng",
    quantity: "2 vị trí",
    type: "Toàn thời gian",
    urgent: true,
    description: "Phát triển và bảo trì hệ thống quản lý bán vé xe khách.",
    requirements: [
      "Tốt nghiệp Đại học chuyên ngành CNTT",
      "2+ năm kinh nghiệm với Java Spring Boot",
      "Thành thạo React, HTML, CSS, JavaScript",
      "Có kinh nghiệm với MySQL/PostgreSQL",
      "Có khả năng làm việc độc lập hoặc Remote",
    ],
    benefits: [
      "Lương top thị trường, thưởng project",
      "Laptop & thiết bị cao cấp",
      "Work from home linh hoạt",
      "Thời gian làm việc linh hoạt",
      "Cơ hội phát triển sản phẩm thực tế",
    ],
  },
  {
    title: "Nhân viên Vệ sinh & Bảo dưỡng Xe",
    dept: "Phòng Vận hành",
    location: "Hồ Chí Minh",
    salary: "6 - 8 triệu/tháng",
    quantity: "4 vị trí",
    type: "Bán thời gian",
    urgent: false,
    description:
      "Vệ sinh, dọn dẹp nội ngoại thất xe khách; kiểm tra bảo dưỡng định kỳ.",
    requirements: [
      "Nam/Nữ, tuổi từ 20 - 45",
      "Siêng năng, cẩn thận, trung thực",
      "Không yêu cầu kinh nghiệm, sẽ được đào tạo",
      "Có thể làm việc sáng sớm hoặc tối muộn",
      "Sức khỏe tốt, không dị ứng hóa chất",
    ],
    benefits: [
      "Lương theo giờ, thanh toán hàng tuần",
      "Được đào tạo kỹ năng chuyên môn",
      "Môi trường làm việc thân thiện",
      "Có cơ hội chuyển full-time",
      "Phụ cấp đặc biệt ngày lễ",
    ],
  },
];

function openJobModal(index) {
  const job = jobDetails[index];
  const urgentTag = job.urgent
    ? '<span class="job-tag tag-hot">Tuyển gấp</span>'
    : "";

  document.getElementById("modalContent").innerHTML = `
    <h2>${job.title}</h2>
    <div class="job-dept">${job.dept}</div>

    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px">
      <div class="job-info-item"><span>📍</span> ${job.location}</div>
      <div class="job-info-item"><span>💵</span> ${job.salary}</div>
      <div class="job-info-item"><span>👥</span> ${job.quantity}</div>
    </div>

    <div class="modal-section">
      <h3>Mô tả công việc</h3>
      <p style="color:#555;font-size:0.9rem;line-height:1.6">${job.description}</p>
    </div>

    <div class="modal-section">
      <h3>Yêu cầu ứng viên</h3>
      <ul>
        ${job.requirements.map((req) => `<li>${req}</li>`).join("")}
      </ul>
    </div>

    <div class="modal-section">
      <h3>Quyền lợi</h3>
      <ul>
        ${job.benefits.map((b) => `<li>${b}</li>`).join("")}
      </ul>
    </div>

    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee;display:flex;gap:12px">
      <button class="btn-apply" onclick="applyJob('${job.title}')">Ứng tuyển ngay</button>
      <button class="btn-detail" onclick="closeJobModal()">Đóng</button>
    </div>
  `;

  document.getElementById("jobModal").classList.add("active");
}

function closeJobModal() {
  document.getElementById("jobModal").classList.remove("active");
}

function applyJob(jobTitle) {
  alert(
    `Cảm ơn bạn đã ứng tuyển vị trí "${jobTitle}"!\n\nVui lòng gửi CV qua email: hr@nhaxetsh.vn\nChúng tôi sẽ liên hệ trong vòng 3-5 ngày làm việc.`,
  );
  closeJobModal();
}

// Đóng modal khi click ra ngoài
document.getElementById("jobModal")?.addEventListener("click", function (e) {
  if (e.target === this) {
    closeJobModal();
  }
});
