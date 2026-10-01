package com.sociomantra.backend.dto.enquiry;

import com.sociomantra.backend.entity.Enquiry;
import com.sociomantra.backend.entity.EnquiryStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

public class EnquiryDtos {

    @Data
    public static class EnquiryRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Email is required")
        private String email;

        private String course;
        private String source;
        private String message;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;
    }

    @Data
    public static class EnquiryResponse {
        private Long id;
        private String name;
        private String phone;
        private String email;
        private String course;
        private String source;
        private String message;
        private String status;
        private LocalDateTime enquiryDate;

        public static EnquiryResponse from(Enquiry e) {
            EnquiryResponse r = new EnquiryResponse();
            r.id = e.getId();
            r.name = e.getName();
            r.phone = e.getPhone();
            r.email = e.getEmail();
            r.course = e.getCourse();
            r.source = e.getSource();
            r.message = e.getMessage();
            r.status = displayLabel(e.getStatus() != null ? e.getStatus() : EnquiryStatus.NEW);
            r.enquiryDate = e.getEnquiryDate();
            return r;
        }

        private static String displayLabel(EnquiryStatus status) {
            String[] words = status.name().split("_");
            StringBuilder sb = new StringBuilder();
            for (String w : words) {
                if (sb.length() > 0) sb.append(' ');
                sb.append(w.charAt(0)).append(w.substring(1).toLowerCase());
            }
            return sb.toString();
        }
    }
}
