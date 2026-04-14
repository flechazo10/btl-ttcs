package com.booking.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StationRequest {
    private String name;           // Tên bến xe (VD: Bến xe Mỹ Đình)
    private String address;        // Địa chỉ chi tiết
    private Long provinceId;       // Thuộc tỉnh nào
}
