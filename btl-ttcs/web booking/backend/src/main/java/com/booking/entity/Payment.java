package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mối quan hệ N-1: Nhiều giao dịch thanh toán có thể thuộc về 1 đơn hàng (nếu quẹt thẻ lỗi phải quẹt lại)
    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    private BigDecimal amount;

    @Column(name = "transaction_no")
    private String transactionNo;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    // Trạng thái giao dịch VNPAY (SUCCESS, FAILED)
    private String status;
}