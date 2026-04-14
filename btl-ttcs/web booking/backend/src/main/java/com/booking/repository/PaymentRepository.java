package com.booking.repository;

import com.booking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Hàm này sau này rất hữu ích để tìm xem một đơn hàng đã được thanh toán chưa
    Payment findByBookingId(String bookingId);
}