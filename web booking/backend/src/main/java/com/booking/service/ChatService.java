package com.booking.service;

import com.booking.dto.response.TripAIContextDTO;
import com.booking.repository.TripRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Autowired
    private TripRepository tripRepository;

private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";
    // Dùng DTO để tạo ngữ cảnh
    private String generateSystemContext() {
        List<TripAIContextDTO> aiDataList = tripRepository.getTripDataForAI();
        StringBuilder context = new StringBuilder();
        
        context.append("Dưới đây là danh sách dữ liệu lịch trình chuyến xe thực tế đang hoạt động của hệ thống:\n");
        
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        for (TripAIContextDTO dto : aiDataList) {
            String date = dto.getDepartureTime().format(dateFormatter);
            String depTime = dto.getDepartureTime().format(timeFormatter);
            String arrTime = dto.getArrivalTime().format(timeFormatter);

            context.append(String.format(
                "- Chuyến đi từ Tỉnh %s (Bến %s) đến Tỉnh %s (Bến %s). Ngày đi: %s. Giờ xuất phát: %s, Giờ đến dự kiến: %s. Giá vé: %,.0fđ. Số ghế trống hiện tại: %d chỗ.\n",
                dto.getStartProvince(), dto.getStartStation(), 
                dto.getEndProvince(), dto.getEndStation(), 
                date, depTime, arrTime, dto.getPrice(), dto.getAvailableSeats()
            ));
        }
        return context.toString();
    }

    public String callGemini(String userMessage) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = GEMINI_API_URL + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();

        String dynamicDatabaseContext = generateSystemContext();

        // 🌟 Lấy ngày giờ thực tế của hệ thống lúc này
        String today = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        // 🌟 Bơm ngày "Hôm nay" vào não AI
        String finalSystemInstruction = 
            "Bạn là trợ lý ảo tư vấn đặt vé xe thông minh của Nhà xe TSH. " +
            "LƯU Ý QUAN TRỌNG: Hôm nay là ngày " + today + ". Hãy dựa vào ngày này để tính toán chính xác 'hôm nay', 'ngày mai', 'ngày kia' nếu khách hỏi. " +
            "Nhiệm vụ của bạn là giải đáp các thắc mắc về đặt vé, lịch trình. " +
            "Hãy trả lời ngắn gọn, thân thiện dựa vào dữ liệu thực tế được cung cấp dưới đây. " +
            "Nếu khách hỏi ngày giờ, hãy tra cứu kỹ trong danh sách để trả lời có hoặc không. " +
            "Tuyệt đối không tự bịa ra chuyến xe nếu dữ liệu bên dưới không có.\n\n" + 
            dynamicDatabaseContext + "\n\n" +
            "Thông tin liên hệ chung: Hotline 0123 456 789, Website: tshbus.vn.";

        Map<String, Object> systemInstruction = new HashMap<>();
        Map<String, Object> sysPart = new HashMap<>();
        sysPart.put("text", finalSystemInstruction);
        systemInstruction.put("parts", List.of(sysPart));
        requestBody.put("systemInstruction", systemInstruction);

        Map<String, Object> contents = new HashMap<>();
        Map<String, Object> userPart = new HashMap<>();
        userPart.put("text", userMessage);
        contents.put("parts", List.of(userPart));
        requestBody.put("contents", List.of(contents));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(response.getBody());
        
        return rootNode.path("candidates").get(0)
                       .path("content")
                       .path("parts").get(0)
                       .path("text").asText();
    }
}