package com.booking.service;

import com.booking.dto.request.LoginRequest; // Đã thêm import để hết báo đỏ
import com.booking.dto.request.UserRequest;
import com.booking.entity.User;
import com.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // --- LOGIC ĐĂNG KÝ ---
    public void registerUser(UserRequest request) {
        // 1. Kiểm tra xem username đã tồn tại trong DB chưa
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.");
        }

        // 2. Chuyển dữ liệu từ DTO sang Entity để lưu
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword()); // (Thực tế đi làm sẽ cần mã hóa mật khẩu ở đây)
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole("USER"); // Mặc định ai đăng ký cũng là Khách hàng

        // 3. Lưu vào MySQL
        userRepository.save(user);
    }

    // --- LOGIC ĐĂNG NHẬP MỚI THÊM ---
    public User loginUser(LoginRequest request) {
        // 1. Tìm user trong Database theo username
        User user = userRepository.findByUsername(request.getUsername());
        
        // 2. Nếu không thấy username, thử tìm theo email (vì ng dùng có thể nhập email)
        if (user == null) {
            user = userRepository.findByEmail(request.getUsername());
        }

        // 3. Kiểm tra mật khẩu
        if (user == null || !user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác!");
        }

        // 4. Nếu đúng hết, trả về thông tin user
        return user; 
    }
    public boolean checkUsernameExists(String username) {
        return userRepository.findByUsername(username) != null;
    }
    // Hàm Đổi mật khẩu mới
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Không tìm thấy tài khoản nào đăng ký với Email này!");
        }
        // Cập nhật mật khẩu mới và lưu lại
        user.setPassword(newPassword);
        userRepository.save(user);
    }
    // Hàm kiểm tra Email có khớp với Username không
    public boolean checkEmailMatchesUsername(String username, String email) {
        User user = userRepository.findByUsername(username);
        return user != null && user.getEmail().equals(email);
    }
}