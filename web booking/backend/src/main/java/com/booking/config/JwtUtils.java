package com.booking.config; // 🌟 ĐÃ ĐỔI SANG PACKAGE CONFIG

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    // Chìa khóa bí mật để ký Token (Phải dài ít nhất 256-bit). Trong thực tế nên để trong file application.properties
    private final String jwtSecret = "DayLaMotMatKhauCucKyBaoMatCuaNhaXeTSH123456789"; 
    // Thời gian sống của Token: 24 giờ (tính bằng mili giây)
    private final int jwtExpirationMs = 86400000; 

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Hàm tạo Token khi đăng nhập thành công
    public String generateJwtToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Hàm lấy username từ Token
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // Hàm kiểm tra Token có hợp lệ không (có bị sửa đổi hay hết hạn không)
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException e) {
            System.err.println("Token không hợp lệ hoặc đã hết hạn: " + e.getMessage());
        }
        return false;
    }
}