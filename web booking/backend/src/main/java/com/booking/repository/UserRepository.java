package com.booking.repository;

import com.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; 

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 🌟 Bọc chữ User vào trong Optional<>
    Optional<User> findByUsername(String username);
    
    // Tiện tay thì bọc luôn cho hàm findByEmail để sau này làm quên mật khẩu cho an toàn
    Optional<User> findByEmail(String email);
}