package com.sociomantra.backend.controller;

import com.sociomantra.backend.dto.common.PagedResponse;
import com.sociomantra.backend.dto.enquiry.EnquiryDtos.EnquiryRequest;
import com.sociomantra.backend.dto.enquiry.EnquiryDtos.EnquiryResponse;
import com.sociomantra.backend.dto.enquiry.EnquiryDtos.StatusUpdateRequest;
import com.sociomantra.backend.service.EnquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
@RequiredArgsConstructor
public class EnquiryController {

    private final EnquiryService enquiryService;

    // Admin-only (see SecurityConfig) - unpaginated, used for the dashboard's summary stat cards only.
    @GetMapping
    public ResponseEntity<List<EnquiryResponse>> getAll() {
        return ResponseEntity.ok(enquiryService.getAll());
    }

    // Admin-only - paginated + searchable + filterable, used by the Student Enquiries table.
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<EnquiryResponse>> search(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(enquiryService.search(status, q, page, size));
    }

    // Public - Contact and Enroll Now forms submit here.
    @PostMapping
    public ResponseEntity<EnquiryResponse> create(@Valid @RequestBody EnquiryRequest request) {
        return ResponseEntity.ok(enquiryService.create(request));
    }

    // Admin-only - update the status of an enquiry from the dashboard.
    @PatchMapping("/{id}")
    public ResponseEntity<EnquiryResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(enquiryService.updateStatus(id, request.getStatus()));
    }
}
