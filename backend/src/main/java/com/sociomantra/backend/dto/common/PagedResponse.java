package com.sociomantra.backend.dto.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * A trimmed-down view of Spring's Page<T> - just the fields the frontend
 * actually needs - so we're not committing the API's JSON shape to
 * Spring Data's internal Page serialization format.
 */
@Getter
@AllArgsConstructor
public class PagedResponse<T> {
    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
