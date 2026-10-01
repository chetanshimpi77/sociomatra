package com.sociomantra.backend.dto.course;

import com.sociomantra.backend.entity.Course;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CourseDtos {

    @Data
    public static class CourseRequest {
        private String id;

        @NotBlank(message = "Course name is required")
        private String name;
        private String tagline;
        private String duration;
        private String mode;
        private Integer subjects;
        private String hours;
        private String description;
        private String color;
        private List<String> keyFeatures;
    }

    @Data
    public static class CourseResponse {
        private String id;
        private String name;
        private String tagline;
        private String duration;
        private String mode;
        private Integer subjects;
        private String hours;
        private String description;
        private String color;
        private List<String> keyFeatures;

        public static CourseResponse from(Course c) {
            CourseResponse r = new CourseResponse();
            r.id = c.getId();
            r.name = c.getName();
            r.tagline = c.getTagline();
            r.duration = c.getDuration();
            r.mode = c.getMode();
            r.subjects = c.getSubjects();
            r.hours = c.getHours();
            r.description = c.getDescription();
            r.color = c.getColor();
            r.keyFeatures = splitOrEmpty(c.getKeyFeatures());
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

    @Data
    public static class CurriculumSubjectResponse {
        private Long id;
        private String name;
        private Integer orderIndex;
    }

    @Data
    public static class CurriculumSectionResponse {
        private Integer totalChapters;
        private String totalHours;
        private List<CurriculumSubjectResponse> subjects;
    }

    @Data
    public static class CurriculumResponse {
        private String courseId;
        private List<String> keyFeatures;
        private CurriculumSectionResponse prelims;
        private CurriculumSectionResponse csat;
        private CurriculumSectionResponse mains;
    }
}
