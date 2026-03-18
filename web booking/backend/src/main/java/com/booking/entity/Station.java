package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "station")
@Data
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String address;

    @ManyToOne
    @JoinColumn(name = "province_id")
    private Province province;
}