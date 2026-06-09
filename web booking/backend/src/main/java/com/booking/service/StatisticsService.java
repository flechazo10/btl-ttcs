package com.booking.service;

import com.booking.dto.response.StatisticsDTO;
import com.booking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatisticsService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Lấy toàn bộ dữ liệu thống kê cho Dashboard Admin.
     * @param year Năm cần thống kê (ví dụ: 2026)
     */
    public StatisticsDTO getStatistics(int year) {
        StatisticsDTO dto = new StatisticsDTO();

        // 1. SUMMARY CARDS
        dto.setTotalRevenue(getTotalRevenue(year));
        dto.setTotalTicketsSold(getTotalTicketsSold(year));
        dto.setTotalBookings(getTotalBookings(year));
        dto.setTotalCustomers(getTotalCustomers(year));

        // 2. DOANH THU THEO THÁNG
        dto.setMonthlyRevenue(getMonthlyRevenue(year));

        // 3. TOP TUYẾN ĐƯỜNG PHỔ BIẾN
        dto.setTopRoutes(getTopRoutes(year));

        // 4. DOANH THU THEO XE
        dto.setBusRevenue(getBusRevenue(year));

        return dto;
    }

    // ======= 1. TỔNG DOANH THU (CHỈ BOOKING ĐÃ PAID) =======
    private BigDecimal getTotalRevenue(int year) {
        String sql = "SELECT COALESCE(SUM(p.amount), 0) FROM payment p " +
                     "JOIN booking b ON p.booking_id = b.id " +
                     "WHERE p.status = 'SUCCESS' AND b.status = 'PAID' " +
                     "AND YEAR(p.payment_time) = :year";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("year", year);
        Object result = query.getSingleResult();
        return result != null ? new BigDecimal(result.toString()) : BigDecimal.ZERO;
    }

    // ======= 2. TỔNG VÉ ĐÃ BÁN =======
    private Long getTotalTicketsSold(int year) {
        String sql = "SELECT COALESCE(SUM(b.total_tickets), 0) FROM booking b " +
                     "WHERE b.status = 'PAID' AND YEAR(b.booking_time) = :year";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("year", year);
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).longValue() : 0L;
    }

    // ======= 3. TỔNG ĐƠN ĐẶT =======
    private Long getTotalBookings(int year) {
        String sql = "SELECT COUNT(b.id) FROM booking b " +
                     "WHERE b.status = 'PAID' AND YEAR(b.booking_time) = :year";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("year", year);
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).longValue() : 0L;
    }

    // ======= 4. TỔNG KHÁCH HÀNG =======
    private Long getTotalCustomers(int year) {
        String sql = "SELECT COUNT(DISTINCT b.user_id) FROM booking b " +
                     "WHERE b.status = 'PAID' AND YEAR(b.booking_time) = :year";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("year", year);
        Object result = query.getSingleResult();
        return result != null ? ((Number) result).longValue() : 0L;
    }

    // ======= 5. DOANH THU THEO THÁNG (CHỈ BOOKING ĐÃ PAID) =======
    private List<StatisticsDTO.MonthlyRevenue> getMonthlyRevenue(int year) {
        String sql = "SELECT MONTH(p.payment_time) as m, " +
                     "COALESCE(SUM(p.amount), 0) as revenue, " +
                     "COUNT(DISTINCT p.booking_id) as booking_count " +
                     "FROM payment p " +
                     "JOIN booking b ON p.booking_id = b.id " +
                     "WHERE p.status = 'SUCCESS' AND b.status = 'PAID' " +
                     "AND YEAR(p.payment_time) = :year " +
                     "GROUP BY MONTH(p.payment_time) " +
                     "ORDER BY m";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("year", year);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        // Tạo danh sách 12 tháng, tháng nào không có dữ liệu thì để 0
        List<StatisticsDTO.MonthlyRevenue> monthlyList = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            monthlyList.add(new StatisticsDTO.MonthlyRevenue(i, year, BigDecimal.ZERO, 0L));
        }

        // Ghi đè dữ liệu thực vào tháng tương ứng
        for (Object[] row : results) {
            int month = ((Number) row[0]).intValue();
            BigDecimal revenue = new BigDecimal(row[1].toString());
            Long bookingCount = ((Number) row[2]).longValue();
            monthlyList.set(month - 1, new StatisticsDTO.MonthlyRevenue(month, year, revenue, bookingCount));
        }

        return monthlyList;
    }

    // ======= 6. TOP TUYẾN ĐƯỜNG =======
    private List<StatisticsDTO.RouteStats> getTopRoutes(int year) {
        String sql = "SELECT CONCAT(s1.name, ' → ', s2.name) as route_name, " +
                     "COUNT(DISTINCT b.id) as total_bookings, " +
                     "COALESCE(SUM(b.total_tickets), 0) as total_tickets, " +
                     "COALESCE(SUM(b.total_amount), 0) as total_revenue " +
                     "FROM booking b " +
                     "JOIN trip tr ON b.trip_id = tr.id " +
                     "JOIN route r ON tr.route_id = r.id " +
                     "JOIN station s1 ON r.start_station_id = s1.id " +
                     "JOIN station s2 ON r.end_station_id = s2.id " +
                     "WHERE b.status = 'PAID' AND YEAR(b.booking_time) = :year " +
                     "GROUP BY r.id, s1.name, s2.name " +
                     "ORDER BY total_bookings DESC " +
                     "LIMIT 5";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("year", year);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<StatisticsDTO.RouteStats> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(new StatisticsDTO.RouteStats(
                (String) row[0],
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue(),
                new BigDecimal(row[3].toString())
            ));
        }
        return list;
    }

    // ======= 7. DOANH THU THEO XE =======
    private List<StatisticsDTO.BusRevenue> getBusRevenue(int year) {
        String sql = "SELECT bus.license_plate, bt.name as bus_type_name, " +
                     "COUNT(DISTINCT tr.id) as total_trips, " +
                     "COALESCE(SUM(b.total_tickets), 0) as total_passengers, " +
                     "COALESCE(SUM(b.total_amount), 0) as total_revenue " +
                     "FROM booking b " +
                     "JOIN trip tr ON b.trip_id = tr.id " +
                     "JOIN bus ON tr.bus_id = bus.id " +
                     "JOIN bus_type bt ON bus.bus_type_id = bt.id " +
                     "WHERE b.status = 'PAID' AND YEAR(b.booking_time) = :year " +
                     "GROUP BY bus.id, bus.license_plate, bt.name " +
                     "ORDER BY total_revenue DESC";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("year", year);

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();

        List<StatisticsDTO.BusRevenue> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(new StatisticsDTO.BusRevenue(
                (String) row[0],
                (String) row[1],
                ((Number) row[2]).longValue(),
                ((Number) row[3]).longValue(),
                new BigDecimal(row[4].toString())
            ));
        }
        return list;
    }
}
