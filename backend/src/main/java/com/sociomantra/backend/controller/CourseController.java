package com.sociomantra.backend.controller;

import com.sociomantra.backend.dto.course.CourseDtos.CourseRequest;
import com.sociomantra.backend.dto.course.CourseDtos.CourseResponse;
import com.sociomantra.backend.dto.course.CourseDtos.CurriculumResponse;
import com.sociomantra.backend.service.CourseService;
import com.sociomantra.backend.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final PdfService pdfService;

    // Public - Courses listing / Home page.
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    // Public - Course curriculum page header info.
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    // Public - Course curriculum page tabs (Prelims / Mains / CSAT).
    @GetMapping("/{id}/curriculum")
    public ResponseEntity<CurriculumResponse> getCurriculum(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getCurriculum(id));
    }

    // Public - "Download Curriculum (PDF)" button on the curriculum page.
    @GetMapping("/{id}/curriculum/pdf")
    public ResponseEntity<byte[]> downloadCurriculumPdf(@PathVariable String id) {
        CourseResponse course = courseService.getById(id);
        CurriculumResponse curriculum = courseService.getCurriculum(id);
        byte[] pdf = pdfService.generateCurriculumPdf(course, curriculum);

        String filename = course.getId() + "-curriculum.pdf";
        ContentDisposition disposition = ContentDisposition.attachment().filename(filename).build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(pdf);
    }

    // Admin-only - add a new course from Manage Courses.
    @PostMapping
    public ResponseEntity<CourseResponse> create(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.create(request));
    }

    // Admin-only - edit an existing course from Manage Courses.
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> update(@PathVariable String id, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.update(id, request));
    }

    // Admin-only - remove a course.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
