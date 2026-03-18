package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "bus_type")
@Data
public class BusType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "total_seats")
    private Integer totalSeats;
}