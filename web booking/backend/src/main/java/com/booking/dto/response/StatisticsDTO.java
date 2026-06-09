package com.booking.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class StatisticsDTO {

    // === SUMMARY CARDS ===
    private BigDecimal totalRevenue;       // Tổng doanh thu (từ Payment SUCCESS)
    private Long totalTicketsSold;         // Tổng vé đã bán
    private Long totalBookings;            // Tổng đơn đặt (PAID)
    private Long totalCustomers;           // Tổng khách hàng distinct

    // === BIỂU ĐỒ DOANH THU THEO THÁNG ===
    private List<MonthlyRevenue> monthlyRevenue;

    // === TOP TUYẾN ĐƯỜNG PHỔ BIẾN ===
    private List<RouteStats> topRoutes;

    // === DOANH THU THEO XE ===
    private List<BusRevenue> busRevenue;

    // --- Inner classes ---
    @Data
    public static class MonthlyRevenue {
        private int month;
        private int year;
        private BigDecimal revenue;
        private Long bookingCount;

        public MonthlyRevenue(int month, int year, BigDecimal revenue, Long bookingCount) {
            this.month = month;
            this.year = year;
            this.revenue = revenue;
            this.bookingCount = bookingCount;
        }
    }

    @Data
    public static class RouteStats {
        private String routeName;
        private Long totalBookings;
        private Long totalTickets;
        private BigDecimal totalRevenue;

        public RouteStats(String routeName, Long totalBookings, Long totalTickets, BigDecimal totalRevenue) {
            this.routeName = routeName;
            this.totalBookings = totalBookings;
            this.totalTickets = totalTickets;
            this.totalRevenue = totalRevenue;
        }
    }

    @Data
    public static class BusRevenue {
        private String licensePlate;
        private String busTypeName;
        private Long totalTrips;
        private Long totalPassengers;
        private BigDecimal totalRevenue;

        public BusRevenue(String licensePlate, String busTypeName, Long totalTrips, Long totalPassengers, BigDecimal totalRevenue) {
            this.licensePlate = licensePlate;
            this.busTypeName = busTypeName;
            this.totalTrips = totalTrips;
            this.totalPassengers = totalPassengers;
            this.totalRevenue = totalRevenue;
        }
    }
}
