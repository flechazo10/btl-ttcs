package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "route")
@Data
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "start_station_id")
    private Station startStation;

    @ManyToOne
    @JoinColumn(name = "end_station_id")
    private Station endStation;
}