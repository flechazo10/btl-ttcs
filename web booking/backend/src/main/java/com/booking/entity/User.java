package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "user")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    private String role;

    // 🌟 MỚI THÊM: Trường trạng thái để Admin khóa tài khoản
    private String status = "ACTIVE";
}