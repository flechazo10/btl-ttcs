package com.booking.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRequest {
    private String username;       // Tên đăng nhập
    private String password;       // Mật khẩu
    private String fullName;       // Họ và tên
    private String email;          // Email
    private String phone;          // Số điện thoại
}