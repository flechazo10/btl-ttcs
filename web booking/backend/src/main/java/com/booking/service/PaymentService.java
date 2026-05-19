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

    @Autowired private BookingRepository bookingRepository;
    @Autowired private PaymentRepository paymentRepository;

    @Value("${vnpay.tmnCode}")   private String vnp_TmnCode;
    @Value("${vnpay.hashSecret}") private String secretKey;
    @Value("${vnpay.payUrl}")    private String vnp_PayUrl;
    @Value("${vnpay.returnUrl}") private String vnp_ReturnUrl;

    public String createPaymentUrl(String bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!booking.getStatus().equals("PENDING")) {
            throw new RuntimeException("Đơn hàng đã thanh toán hoặc bị hủy!");
        }

        long amount = booking.getTotalAmount().longValue() * 100;
        String vnp_TxnRef = VNPayConfig.getRandomNumber(8);

        String vnp_IpAddr = VNPayConfig.getIpAddress(request);
        if (vnp_IpAddr == null || vnp_IpAddr.equals("0:0:0:0:0:0:0:1") || vnp_IpAddr.equals("::1")) {
            vnp_IpAddr = "127.0.0.1";
        }

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version",  "2.1.0");
        vnp_Params.put("vnp_Command",  "pay");
        vnp_Params.put("vnp_TmnCode",  vnp_TmnCode);
        vnp_Params.put("vnp_Amount",   String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef",   vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo","Thanh toan don hang " + bookingId); // dấu cách, không gạch dưới
        vnp_Params.put("vnp_OrderType","other");
        vnp_Params.put("vnp_Locale",   "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr",   vnp_IpAddr);

        TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        Calendar cld = Calendar.getInstance(tz);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(tz);

        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // Sắp xếp key theo alphabet
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query    = new StringBuilder();

        try {
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName  = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && fieldValue.length() > 0) {

                    // ✅ ĐÚNG theo sample chính thức VNPay:
                    // hashData và query đều dùng URLEncoder chuẩn (giữ nguyên '+' cho dấu cách)
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString());

                    hashData.append(fieldName).append('=').append(encodedValue);
                    query.append(fieldName).append('=').append(encodedValue);

                    if (itr.hasNext()) {
                        hashData.append('&');
                        query.append('&');
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        String vnp_SecureHash = VNPayConfig.hmacSHA512(secretKey, hashData.toString());
        String queryUrl = query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;        
           


        return vnp_PayUrl + "?" + queryUrl;
    }

    public void updatePaymentStatus(HttpServletRequest request) {
        String vnp_OrderInfo = request.getParameter("vnp_OrderInfo");
        String bookingId = vnp_OrderInfo.replace("Thanh toan don hang ", "").trim();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");

        if ("00".equals(vnp_ResponseCode) && "PENDING".equals(booking.getStatus())) {
            booking.setStatus("PAID");
            bookingRepository.save(booking);

            com.booking.entity.Payment payment = new com.booking.entity.Payment();
            payment.setBooking(booking);

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