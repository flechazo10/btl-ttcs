package com.booking.controller;

import java.util.HashMap;
import java.util.Map;

import com.booking.dto.request.LoginRequest; // Đã thêm import để hết báo đỏ
import com.booking.dto.request.UserRequest;
import com.booking.entity.User;
import com.booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.booking.service.EmailService;
import com.booking.dto.response.UserResponse;
import com.booking.config.JwtUtils;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Mở cửa cho Frontend gọi
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private JwtUtils jwtUtils;

    // --- API ĐĂNG KÝ ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRequest request) {
        try {
            userService.registerUser(request);
            return ResponseEntity.ok("Đăng ký thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

   @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // 1. Gọi Service xác thực
            User user = userService.loginUser(request);
            
            // 2. Tạo Token
            String token = jwtUtils.generateJwtToken(user.getUsername());
            
            // 3. Sử dụng UserResponse DTO của bạn cho chuyên nghiệp
            UserResponse userInfo = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus() // 🌟 Thêm trường status vào UserResponse để Frontend biết tài khoản có bị khóa hay không
            );

            // 4. Gộp Token và UserInfo vào một Map để gửi về Frontend
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", userInfo); // Frontend sẽ nhận được object user bên trong

            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // API Kiểm tra username có tồn tại hay không
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        if (userService.checkUsernameExists(username)) {
            return ResponseEntity.ok().build(); // HTTP 200 OK nếu tồn tại
        } else {
            return ResponseEntity.badRequest().body("Tên đăng nhập chưa từng tồn tại!"); // HTTP 400 nếu không có
        }
    }
    // API Đổi mật khẩu
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, 
                                           @RequestParam String otp, 
                                           @RequestParam String newPassword) {
        // 1. Nhờ EmailService kiểm tra xem mã OTP có đúng không
        boolean isOtpValid = emailService.verifyOtp(email, otp);
        if (!isOtpValid) {
            return ResponseEntity.badRequest().body("Mã OTP không chính xác hoặc đã hết hạn!");
        }

        // 2. Nếu OTP đúng -> Cho phép đổi mật khẩu
        try {
            userService.resetPassword(email, newPassword);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // API Kiểm tra Email có khớp với Username
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String username, @RequestParam String email) {
        if (userService.checkEmailMatchesUsername(username, email)) {
            return ResponseEntity.ok().build(); 
        } else {
            return ResponseEntity.badRequest().body("Email không đúng với tài khoản này!"); 
        }
    }
    // API Kiểm tra OTP ở Bước 2
    @GetMapping("/check-otp")
    public ResponseEntity<?> checkOtp(@RequestParam String email, @RequestParam String otp) {
        if (emailService.checkOtpWithoutDelete(email, otp)) {
            return ResponseEntity.ok("OTP hợp lệ");
        } else {
            return ResponseEntity.badRequest().body("Mã OTP không chính xác hoặc đã hết hạn!");
        }
    }
}