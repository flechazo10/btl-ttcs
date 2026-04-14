package com.booking.service;

import com.booking.dto.request.BookingRequest;
import com.booking.dto.response.BookingResponse;
import com.booking.entity.Booking;
import com.booking.entity.Trip;
import com.booking.entity.User;
import com.booking.repository.BookingRepository;
import com.booking.repository.TripRepository;
import com.booking.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.booking.dto.response.BookingHistoryDTO;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TripRepository tripRepository;
    @Autowired
    private UserRepository userRepository;

    // Annotation @Transactional giúp đảm bảo nếu có lỗi xảy ra giữa chừng, toàn bộ DB sẽ được rollback lại trạng thái cũ
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
        
        // 1. Tìm chuyến xe khách muốn đặt
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến xe!"));

        // 2. Kiểm tra xem xe còn đủ chỗ không
        int totalSeats = trip.getBus().getBusType().getTotalSeats();
        int availableSeats = totalSeats - trip.getBookedSeats();
        
        if (request.getTotalTickets() > availableSeats) {
            throw new RuntimeException("Rất tiếc, chuyến xe chỉ còn " + availableSeats + " ghế trống!");
        }

        // 3. Tính toán tổng tiền (Giá 1 vé * Số lượng vé)
        BigDecimal totalAmount = trip.getPrice().multiply(new BigDecimal(request.getTotalTickets()));

        // 4. Tạo mã đơn hàng (Ví dụ: BK-20260327-A1B2)
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String bookingId = "BK-" + datePrefix + "-" + randomSuffix;

        // 5. Khởi tạo đối tượng Booking để lưu DB
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setTrip(trip);
        booking.setUser(user);
        booking.setPassengerName(request.getPassengerName());
        booking.setPassengerPhone(request.getPassengerPhone());
        booking.setPickupLocation(request.getPickupLocation());
        booking.setDropoffLocation(request.getDropoffLocation());
        booking.setNote(request.getNote());
        
        booking.setTotalTickets(request.getTotalTickets());
        booking.setTotalAmount(totalAmount);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus("PENDING"); // Chờ thanh toán VNPAY

        // (Lưu ý: Nếu làm phần User đăng nhập, bạn sẽ lấy User đang đăng nhập và set vào đây: booking.setUser(...))

        bookingRepository.save(booking); // Lưu đơn hàng

        // 6. Giữ chỗ (Trừ số ghế trống trên xe đi)
        trip.setBookedSeats(trip.getBookedSeats() + request.getTotalTickets());
        tripRepository.save(trip);

        // 7. Chuyển dữ liệu sang DTO Response để trả về cho Frontend hiển thị
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setPassengerName(booking.getPassengerName());
        response.setPassengerPhone(booking.getPassengerPhone());
        
        // Nối tên Tỉnh Đi - Tỉnh Đến làm Tên Tuyến
        String routeName = trip.getRoute().getStartStation().getProvince().getName() + " - " + 
                           trip.getRoute().getEndStation().getProvince().getName();
        response.setTripRoute(routeName);
        
        response.setDepartureTime(trip.getDepartureTime());
        response.setTotalTickets(booking.getTotalTickets());
        response.setTotalAmount(booking.getTotalAmount().doubleValue());
        response.setStatus(booking.getStatus());
        response.setBookingTime(booking.getBookingTime());

        return response;
    }
    // --- HÀM LẤY LỊCH SỬ ĐẶT VÉ NHÓM THEO NGÀY ---
    public Map<String, List<BookingHistoryDTO>> getBookingHistory(Long userId) {
        // 1. Lấy danh sách vé đã PAID của User, sắp xếp mới nhất lên đầu
        List<Booking> bookings = bookingRepository.findByUserIdAndStatusOrderByBookingTimeDesc(userId, "PAID");

        // 2. Định dạng ngày để làm "Key" cho Map (ví dụ: "10-04-2026")
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

        // 3. Chuyển đổi Entity sang DTO và nhóm lại
        return bookings.stream().map(b -> {
            // Lấy tên tuyến đường (Nhờ có liên kết trip_id bạn vừa sửa trong DB)
            String routeName = b.getTrip().getRoute().getStartStation().getProvince().getName() + " - " +
                               b.getTrip().getRoute().getEndStation().getProvince().getName();
            
            return new BookingHistoryDTO(
                    b.getId(),
                    routeName,
                    b.getTrip().getDepartureTime(),
                    b.getTotalTickets(),
                    b.getTotalAmount(),
                    b.getStatus()
            );
        }).collect(Collectors.groupingBy(dto -> dto.getDepartureTime().format(formatter)));
    }
}