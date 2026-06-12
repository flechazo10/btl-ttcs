package com.booking.controller;

import com.booking.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/create-url")
    public ResponseEntity<?> createPaymentUrl(@RequestParam String bookingId, HttpServletRequest request) {
        try {
            String vnpayUrl = paymentService.createPaymentUrl(bookingId, request);
            
            Map<String, String> response = new HashMap<>();
            response.put("paymentUrl", vnpayUrl);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_OrderInfo = request.getParameter("vnp_OrderInfo");
        
        String bookingId = "";
        if (vnp_OrderInfo != null) {
        bookingId = vnp_OrderInfo.replace("Thanh toan don hang ", "").trim();        }
        
        String frontendUrl = "http://127.0.0.1:5501/success.html";

        if ("00".equals(vnp_ResponseCode)) {
            paymentService.updatePaymentStatus(request);
            
            String amountStr = request.getParameter("vnp_Amount");
            long realAmount = 0;
            if (amountStr != null) {
                realAmount = Long.parseLong(amountStr) / 100;
            }

            response.sendRedirect(frontendUrl + "?status=success&bookingId=" + bookingId + "&amount=" + realAmount);
        } else {
            response.sendRedirect(frontendUrl + "?status=failed&bookingId=" + bookingId);
        }
    }
}