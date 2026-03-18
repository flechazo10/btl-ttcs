package com.booking.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StationResponse {
    private Long id;
    private String name;
    private String address;
    private String provinceName; // Chỉ cần trả về Tên tỉnh thay vì cả 1 object Tỉnh
}