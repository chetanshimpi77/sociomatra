package com.sociomantra.backend.controller;

import com.sociomantra.backend.dto.faculty.FacultyDtos.FacultyRequest;
import com.sociomantra.backend.dto.faculty.FacultyDtos.FacultyResponse;
import com.sociomantra.backend.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    // Public - Faculty listing page.
    @GetMapping
    public ResponseEntity<List<FacultyResponse>> getAll() {
        return ResponseEntity.ok(facultyService.getAll());
    }

    // Public - tapping a faculty card opens this profile.
    @GetMapping("/{id}")
    public ResponseEntity<FacultyResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getById(id));
    }

    // Admin-only - add a faculty profile.
    @PostMapping
    public ResponseEntity<FacultyResponse> create(@Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.ok(facultyService.create(request));
    }

    // Admin-only - edit a faculty profile.
    @PutMapping("/{id}")
    public ResponseEntity<FacultyResponse> update(@PathVariable Long id, @Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.ok(facultyService.update(id, request));
    }

    // Admin-only - remove a faculty profile.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        facultyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
