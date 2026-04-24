package com.booking.controller;

import com.booking.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
    import java.io.IOException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // FE gọi API này để lấy link URL sang trang VNPAY
    @GetMapping("/create-url")
    public ResponseEntity<?> createPaymentUrl(@RequestParam String bookingId, HttpServletRequest request) {
        try {
            String vnpayUrl = paymentService.createPaymentUrl(bookingId, request);
            
            // Trả về dạng JSON cho Frontend dễ xử lý
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", vnpayUrl);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Đón khách hàng từ VNPAY trở về và ĐÁ VỀ FRONTEND
    @GetMapping("/vnpay-return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String bookingId = request.getParameter("bookingId");
        
        // ⚠️ Đổi cổng 5500 thành cổng Live Server VS Code của bạn nếu khác nhé
        String frontendUrl = "http://127.0.0.1:5500/success.html";

        if ("00".equals(vnp_ResponseCode)) {
            // 1. Cập nhật DB
            paymentService.updatePaymentStatus(bookingId, request);
            
            // 2. Lấy số tiền thật (VNPAY nhân 100 nên phải chia 100)
            String amountStr = request.getParameter("vnp_Amount");
            long realAmount = Long.parseLong(amountStr) / 100;

            // 3. Đá về trang success.html kèm tham số
            response.sendRedirect(frontendUrl + "?status=success&bookingId=" + bookingId + "&amount=" + realAmount);
        } else {
            // Nếu hủy hoặc lỗi thì đá về kèm status failed
            response.sendRedirect(frontendUrl + "?status=failed&bookingId=" + bookingId);
        }
    }
    }
    
