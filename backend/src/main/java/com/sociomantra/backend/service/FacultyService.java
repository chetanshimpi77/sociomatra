package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.faculty.FacultyDtos.FacultyRequest;
import com.sociomantra.backend.dto.faculty.FacultyDtos.FacultyResponse;
import com.sociomantra.backend.entity.Faculty;
import com.sociomantra.backend.exception.ResourceNotFoundException;
import com.sociomantra.backend.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FacultyService {

    private final FacultyRepository facultyRepository;

    public List<FacultyResponse> getAll() {
        return facultyRepository.findAll().stream().map(FacultyResponse::from).toList();
    }

    public FacultyResponse getById(Long id) {
        Faculty faculty = findOrThrow(id);
        return FacultyResponse.from(faculty);
    }

    @Transactional
    public FacultyResponse create(FacultyRequest request) {
        Faculty faculty = Faculty.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .experience(request.getExperience())
                .qualification(request.getQualification())
                .photoUrl(request.getPhotoUrl())
                .email(request.getEmail())
                .bio(request.getBio())
                .subjectsTaught(join(request.getSubjectsTaught()))
                .achievements(join(request.getAchievements()))
                .build();

        return FacultyResponse.from(facultyRepository.save(faculty));
    }

    @Transactional
    public FacultyResponse update(Long id, FacultyRequest request) {
        Faculty faculty = findOrThrow(id);

        faculty.setName(request.getName());
        faculty.setSubject(request.getSubject());
        if (request.getExperience() != null) faculty.setExperience(request.getExperience());
        if (request.getQualification() != null) faculty.setQualification(request.getQualification());
        if (request.getPhotoUrl() != null) faculty.setPhotoUrl(request.getPhotoUrl());
        if (request.getEmail() != null) faculty.setEmail(request.getEmail());
        if (request.getBio() != null) faculty.setBio(request.getBio());
        if (request.getSubjectsTaught() != null) faculty.setSubjectsTaught(join(request.getSubjectsTaught()));
        if (request.getAchievements() != null) faculty.setAchievements(join(request.getAchievements()));

        return FacultyResponse.from(facultyRepository.save(faculty));
    }

    @Transactional
    public void delete(Long id) {
        if (!facultyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Faculty not found with id " + id);
        }
        facultyRepository.deleteById(id);
    }

    private Faculty findOrThrow(Long id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id " + id));
    }

    private String join(List<String> items) {
        if (items == null) return null;
        return String.join(" | ", items);
    }
}
