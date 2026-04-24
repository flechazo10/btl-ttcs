package com.booking.service;

import com.booking.dto.request.LoginRequest;
import com.booking.dto.request.UserRequest;
import com.booking.entity.User;
import com.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional; 
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- LOGIC ĐĂNG KÝ ---
    public void registerUser(UserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email này đã được đăng ký! Vui lòng sử dụng Email khác.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        
        user.setRole("USER"); 
        user.setStatus("ACTIVE"); 

        userRepository.save(user);
    }

    // --- LOGIC ĐĂNG NHẬP (ĐÃ KHÔI PHỤC LẠI CHUẨN SERVICE) ---
    public User loginUser(LoginRequest request) {
        // 1. Tìm user theo Username hoặc Email
        User user = userRepository.findByUsername(request.getUsername())
                .orElseGet(() -> userRepository.findByEmail(request.getUsername()).orElse(null));

        // 2. Dùng PasswordEncoder để so sánh mật khẩu gốc với mật khẩu mã hóa trong DB
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Tài khoản hoặc mật khẩu không chính xác!");
        }

        // 3. Kiểm tra xem tài khoản có bị Admin khóa không
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("Tài khoản này đã bị vi phạm và bị khóa!");
        }

        // 4. Trả về đúng object User cho Controller xử lý tiếp
        return user; 
    }

    public boolean checkUsernameExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản nào đăng ký với Email này!"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public boolean checkEmailMatchesUsername(String username, String email) {
        Optional<User> optUser = userRepository.findByUsername(username);
        return optUser.isPresent() && optUser.get().getEmail().equals(email);
    }
    // Thêm các hàm này vào cuối file UserService.java

    // 1. Lấy toàn bộ danh sách người dùng cho Admin
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // 2. Logic Khóa/Mở khóa tài khoản
    @PreAuthorize("hasRole('ADMIN')")
    public String toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        // Chặn Admin tự khóa chính mình
        if ("ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Không thể thay đổi trạng thái của tài khoản Quản trị viên!");
        }

        if ("ACTIVE".equals(user.getStatus())) {
            user.setStatus("BANNED");
        } else {
            user.setStatus("ACTIVE");
        }

        userRepository.save(user);
        return user.getStatus();
    }
}