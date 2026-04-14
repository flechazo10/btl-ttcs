package com.booking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Chiếc hộp lưu tạm OTP trong RAM của server (Key là Email, Value là mã OTP)
    // (Trong dự án thực tế lớn, người ta sẽ lưu cái này vào Database hoặc Redis có hẹn giờ hủy)
    private Map<String, String> otpStorage = new ConcurrentHashMap<>();

    // Hàm tạo và gửi OTP
    public void sendOtp(String email) {
        // 1. Tạo một mã OTP ngẫu nhiên gồm 6 chữ số
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // 2. Cất OTP vào hộp lưu trữ để lát nữa kiểm tra
        otpStorage.put(email, otp);

        // 3. Soạn nội dung Email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Mã OTP Khôi phục mật khẩu - Nhà xe Tiến Sơn");
        message.setText("Xin chào,\n\nMã OTP để khôi phục mật khẩu của bạn là: " + otp + "\n\nVui lòng không chia sẻ mã này cho bất kỳ ai. Mã này sẽ dùng để xác minh tài khoản của bạn.");

        // 4. Bấm nút gửi!
        mailSender.send(message);
    }

    // Hàm kiểm tra xem người dùng nhập OTP có đúng không
    public boolean verifyOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email); // Xác nhận đúng thì xóa OTP đi cho an toàn
            return true;
        }
        return false;
    }
    // Hàm chỉ kiểm tra OTP chứ không xóa (Dùng cho bước chuyển Tab)
    public boolean checkOtpWithoutDelete(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        return storedOtp != null && storedOtp.equals(otp);
    }
}