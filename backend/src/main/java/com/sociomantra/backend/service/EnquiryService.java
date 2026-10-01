package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.common.PagedResponse;
import com.sociomantra.backend.dto.enquiry.EnquiryDtos.EnquiryRequest;
import com.sociomantra.backend.dto.enquiry.EnquiryDtos.EnquiryResponse;
import com.sociomantra.backend.entity.Enquiry;
import com.sociomantra.backend.entity.EnquiryStatus;
import com.sociomantra.backend.exception.ApiException;
import com.sociomantra.backend.exception.ResourceNotFoundException;
import com.sociomantra.backend.repository.EnquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnquiryService {

    private static final int MAX_PAGE_SIZE = 100;

    private final EnquiryRepository enquiryRepository;

    /** Unpaginated - used by the dashboard's summary stats cards only. */
    public List<EnquiryResponse> getAll() {
        return enquiryRepository.findAllByOrderByEnquiryDateDesc().stream()
                .map(EnquiryResponse::from)
                .toList();
    }

    public PagedResponse<EnquiryResponse> search(String statusLabel, String searchTerm, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "enquiryDate"));

        EnquiryStatus status = parseStatusOrNull(statusLabel);
        String search = (searchTerm == null || searchTerm.isBlank()) ? null : searchTerm.trim();

        Page<Enquiry> results = enquiryRepository.search(status, search, pageable);
        return PagedResponse.from(results.map(EnquiryResponse::from));
    }

    @Transactional
    public EnquiryResponse create(EnquiryRequest request) {
        Enquiry enquiry = Enquiry.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .course(request.getCourse())
                .source(request.getSource() != null && !request.getSource().isBlank() ? request.getSource() : "Website")
                .message(request.getMessage())
                .status(EnquiryStatus.NEW)
                .build();

        return EnquiryResponse.from(enquiryRepository.save(enquiry));
    }

    @Transactional
    public EnquiryResponse updateStatus(Long id, String statusValue) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found with id " + id));

        EnquiryStatus status = parseStatusOrNull(statusValue);
        if (status == null) {
            throw new ApiException("Invalid status value: " + statusValue, HttpStatus.BAD_REQUEST);
        }

        enquiry.setStatus(status);
        return EnquiryResponse.from(enquiryRepository.save(enquiry));
    }

    private EnquiryStatus parseStatusOrNull(String statusValue) {
        if (statusValue == null || statusValue.isBlank() || "All".equalsIgnoreCase(statusValue)) return null;
        try {
            return EnquiryStatus.valueOf(statusValue.trim().toUpperCase().replace(' ', '_'));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
