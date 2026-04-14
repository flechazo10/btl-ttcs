package com.booking.controller;

import com.booking.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email") // Đã đổi đường dẫn cho hợp với tên file
@CrossOrigin(origins = "*")
public class EmailController { // Đã đổi tên Class

    @Autowired
    private EmailService emailService;

    // API: Gửi OTP về Email
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestParam String email) {
        try {
            emailService.sendOtp(email);
            return ResponseEntity.ok("Đã gửi mã OTP thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi email: " + e.getMessage());
        }
    }
    
    // API: Xác thực OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean isValid = emailService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok("Xác thực OTP thành công!");
        } else {
            return ResponseEntity.badRequest().body("Mã OTP không chính xác hoặc đã hết hạn!");
        }
    }
}