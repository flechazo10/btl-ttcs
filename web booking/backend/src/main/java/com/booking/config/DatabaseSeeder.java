package com.booking.config;

import com.booking.entity.User;
import com.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem tài khoản 'admin' đã tồn tại chưa
        if (!userRepository.findByUsername("admin").isPresent()) {
            
            User admin = new User();
            admin.setUsername("admin");
            // 🌟 Đây là bí quyết: Mã hóa mật khẩu ngay lúc tạo!
            admin.setPassword(passwordEncoder.encode("admin123")); 
            admin.setFullName("Quản Trị Viên TSH");
            admin.setEmail("admin@tshbus.vn");
            admin.setPhone("0999999999");
            admin.setRole("ADMIN"); // 🌟 Cấp quyền tối cao
            admin.setStatus("ACTIVE");

            userRepository.save(admin);
            System.out.println("=========================================");
            System.out.println("✅ Đã tạo tài khoản Admin mặc định thành công!");
            System.out.println("Tài khoản: admin | Mật khẩu: admin123");
            System.out.println("=========================================");
        }
    }
}