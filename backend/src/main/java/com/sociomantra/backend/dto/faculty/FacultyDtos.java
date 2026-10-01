package com.sociomantra.backend.dto.faculty;

import com.sociomantra.backend.entity.Faculty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class FacultyDtos {

    @Data
    public static class FacultyRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Subject is required")
        private String subject;

        private String experience;
        private String qualification;
        private String photoUrl;
        private String email;
        private String bio;
        private List<String> subjectsTaught;
        private List<String> achievements;
    }

    @Data
    public static class FacultyResponse {
        private Long id;
        private String name;
        private String subject;
        private String experience;
        private String qualification;
        private String photoUrl;
        private String email;
        private String bio;
        private List<String> subjectsTaught;
        private List<String> achievements;

        public static FacultyResponse from(Faculty f) {
            FacultyResponse r = new FacultyResponse();
            r.id = f.getId();
            r.name = f.getName();
            r.subject = f.getSubject();
            r.experience = f.getExperience();
            r.qualification = f.getQualification();
            r.photoUrl = f.getPhotoUrl();
            r.email = f.getEmail();
            r.bio = f.getBio();
            r.subjectsTaught = splitOrEmpty(f.getSubjectsTaught());
            r.achievements = splitOrEmpty(f.getAchievements());
            return r;
        }

        private static List<String> splitOrEmpty(String csv) {
            if (csv == null || csv.isBlank()) return new ArrayList<>();
            return Arrays.stream(csv.split("\\|"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }
}
