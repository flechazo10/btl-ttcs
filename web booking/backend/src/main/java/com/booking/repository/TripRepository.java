package com.booking.repository;

import com.booking.entity.Route;
import com.booking.entity.Trip;
import com.booking.dto.response.TripAIContextDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    Optional<Trip> findByRouteAndDepartureTimeAndStatus(Route route, LocalDateTime departureTime, String status);

    List<Trip> findByDepartureTimeBetweenAndStatus(LocalDateTime startOfDay, LocalDateTime endOfDay, String status);

    @Query("SELECT new com.booking.dto.response.TripAIContextDTO(" +
           "sp.name, ss.name, ep.name, es.name, " +
           "t.departureTime, t.arrivalTime, t.price, " +
           "bt.totalSeats, t.bookedSeats) " +
           "FROM Trip t " +
           "JOIN t.route r " +
           "JOIN r.startStation ss " +
           "JOIN ss.province sp " +
           "JOIN r.endStation es " +
           "JOIN es.province ep " +
           "JOIN t.bus b " +
           "JOIN b.busType bt " +
           "WHERE t.status = 'ACTIVE' AND t.departureTime >= :from " +
           "ORDER BY t.departureTime ASC")
    List<TripAIContextDTO> getTripDataForAI(@Param("from") LocalDateTime from);
}