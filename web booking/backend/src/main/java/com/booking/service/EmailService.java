package com.booking.service;

import com.booking.entity.Trip;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ==========================================
    // PHẦN 1: LOGIC OTP (QUÊN MẬT KHẨU)
    // ==========================================
    private Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public void sendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Mã OTP Khôi phục mật khẩu - Nhà xe TSH");
        message.setText("Xin chào,\n\nMã OTP để khôi phục mật khẩu của bạn là: " + otp + "\n\nVui lòng không chia sẻ mã này cho bất kỳ ai. Mã này sẽ dùng để xác minh tài khoản của bạn.");

        mailSender.send(message);
    }

    public boolean verifyOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email); 
            return true;
        }
        return false;
    }

    public boolean checkOtpWithoutDelete(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        return storedOtp != null && storedOtp.equals(otp);
    }

    // ==========================================
    // PHẦN 2: LOGIC HỦY CHUYẾN (ADMIN)
    // ==========================================
    public void sendTripCancellationEmail(String toEmail, String passengerName, Trip trip) {
        String routeName = trip.getRoute().getStartStation().getName() + " - " + trip.getRoute().getEndStation().getName();
        String time = trip.getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("THÔNG BÁO HỦY CHUYẾN XE - NHÀ XE TSH");
        message.setText("Chào " + passengerName + ",\n\n"
                + "Nhà xe TSH thành thật xin lỗi vì sự bất tiện này. "
                + "Chuyến xe của bạn đã bị HỦY do sự cố vận hành ngoài ý muốn.\n\n"
                + "- Tuyến: " + routeName + "\n"
                + "- Thời gian dự kiến: " + time + "\n"
                + "- Biển số xe: " + trip.getBus().getLicensePlate() + "\n\n"
                + "Trạng thái vé của bạn đã được chuyển sang [ĐANG XỬ LÝ HOÀN TIỀN]. "
                + "Nhân viên tổng đài sẽ liên hệ với bạn trong vòng 24h tới để hướng dẫn đổi vé hoặc hoàn tiền 100%.\n\n"
                + "Trân trọng,\nHệ thống Đặt Vé TSH.");

        mailSender.send(message);
    }
}