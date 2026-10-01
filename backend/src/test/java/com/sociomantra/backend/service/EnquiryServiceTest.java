package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.common.PagedResponse;
import com.sociomantra.backend.dto.enquiry.EnquiryDtos.EnquiryRequest;
import com.sociomantra.backend.dto.enquiry.EnquiryDtos.EnquiryResponse;
import com.sociomantra.backend.entity.Enquiry;
import com.sociomantra.backend.entity.EnquiryStatus;
import com.sociomantra.backend.exception.ApiException;
import com.sociomantra.backend.exception.ResourceNotFoundException;
import com.sociomantra.backend.repository.EnquiryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnquiryServiceTest {

    @Mock
    private EnquiryRepository enquiryRepository;

    private EnquiryService enquiryService;

    @BeforeEach
    void setUp() {
        enquiryService = new EnquiryService(enquiryRepository);
    }

    @Test
    void create_defaultsSourceToWebsiteWhenBlank() {
        EnquiryRequest request = new EnquiryRequest();
        request.setName("Priya Singh");
        request.setPhone("9876543210");
        request.setEmail("priya@example.com");
        request.setCourse("UPSC Foundation");
        request.setSource("");

        when(enquiryRepository.save(any(Enquiry.class))).thenAnswer(invocation -> {
            Enquiry e = invocation.getArgument(0);
            e.setId(1L);
            return e;
        });

        EnquiryResponse response = enquiryService.create(request);

        assertThat(response.getSource()).isEqualTo("Website");
        assertThat(response.getStatus()).isEqualTo("New");
    }

    @Test
    void updateStatus_mapsHumanReadableLabelToEnum() {
        Enquiry enquiry = Enquiry.builder()
                .id(5L)
                .name("Amit Kumar")
                .phone("9988776655")
                .email("amit@example.com")
                .status(EnquiryStatus.NEW)
                .build();

        when(enquiryRepository.findById(5L)).thenReturn(Optional.of(enquiry));
        when(enquiryRepository.save(any(Enquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EnquiryResponse response = enquiryService.updateStatus(5L, "In Progress");

        assertThat(response.getStatus()).isEqualTo("In Progress");
    }

    @Test
    void updateStatus_rejectsInvalidStatus() {
        Enquiry enquiry = Enquiry.builder().id(6L).status(EnquiryStatus.NEW).build();
        when(enquiryRepository.findById(6L)).thenReturn(Optional.of(enquiry));

        assertThatThrownBy(() -> enquiryService.updateStatus(6L, "Not A Real Status"))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void updateStatus_throwsWhenEnquiryMissing() {
        when(enquiryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> enquiryService.updateStatus(99L, "Contacted"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void search_treatsAllAsNoStatusFilter() {
        Enquiry enquiry = Enquiry.builder().id(1L).name("Test").status(EnquiryStatus.NEW).build();
        when(enquiryRepository.search(isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(enquiry), PageRequest.of(0, 10), 1));

        PagedResponse<EnquiryResponse> result = enquiryService.search("All", null, 0, 10);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void search_clampsPageSizeToMaximum() {
        when(enquiryRepository.search(any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        // An oversized page size should be clamped to MAX_PAGE_SIZE (100)
        // rather than passed straight through to the database.
        enquiryService.search(null, null, 0, 999);

        org.mockito.ArgumentCaptor<org.springframework.data.domain.Pageable> captor =
                org.mockito.ArgumentCaptor.forClass(org.springframework.data.domain.Pageable.class);
        org.mockito.Mockito.verify(enquiryRepository).search(isNull(), isNull(), captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(100);
    }
}
