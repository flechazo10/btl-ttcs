package com.booking.service;

import com.booking.config.VNPayConfig;
import com.booking.entity.Booking;
import com.booking.repository.BookingRepository;
import com.booking.repository.PaymentRepository;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String secretKey;

    @Value("${vnpay.payUrl}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    public String createPaymentUrl(String bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!booking.getStatus().equals("PENDING")) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán hoặc bị hủy!");
        }

        long amount = booking.getTotalAmount().longValue() * 100;
        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);
        String vnp_IpAddr = VNPayConfig.getIpAddress(request);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        
        vnp_Params.put("vnp_OrderInfo", "Thanh_toan_don_hang_" + bookingId);
        
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl + "?bookingId=" + bookingId);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        try {
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()).replace("+", "%20");
                    String encodedName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());

                    hashData.append(encodedName).append('=').append(encodedValue);
                    query.append(encodedName).append('=').append(encodedValue);
                    
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(secretKey, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnp_PayUrl + "?" + queryUrl;
    }

    // =========================================================================
    // 👇 ĐÂY LÀ ĐOẠN HÀM MỚI ĐƯỢC THÊM VÀO ĐỂ LƯU KẾT QUẢ THANH TOÁN VÀO DB 👇
    // =========================================================================
    // =========================================================================
    // 👇 ĐÃ SỬA LỖI ĐỎ: Dùng payment.setBooking(booking) thay cho setBookingId 👇
    // =========================================================================
    public void updatePaymentStatus(String bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        
        // Nếu VNPAY trả về 00 (Thành công) và Đơn hàng đang ở trạng thái PENDING
        if ("00".equals(vnp_ResponseCode) && "PENDING".equals(booking.getStatus())) {
            
            // 1. Cập nhật trạng thái Booking thành PAID (Đã thanh toán)
            booking.setStatus("PAID");
            bookingRepository.save(booking);

            // 2. Lưu biên lai vào bảng Payment
            com.booking.entity.Payment payment = new com.booking.entity.Payment();
            
            // 💡 CHÍNH LÀ CHỖ NÀY: Truyền thẳng object 'booking' vào thay vì truyền chuỗi ID
            payment.setBooking(booking); 
            
            // VNPAY trả về số tiền nhân 100, nên ta phải chia 100 để về giá trị thật
            String amountStr = request.getParameter("vnp_Amount");
            long realAmount = Long.parseLong(amountStr) / 100;
            payment.setAmount(new java.math.BigDecimal(realAmount));
            
            payment.setTransactionNo(request.getParameter("vnp_TransactionNo"));
            payment.setPaymentTime(java.time.LocalDateTime.now());
            payment.setStatus("SUCCESS");
            
            paymentRepository.save(payment);
        }
    }
}