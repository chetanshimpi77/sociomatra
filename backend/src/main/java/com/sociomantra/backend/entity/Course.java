package com.sociomantra.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    // Slug-style id, e.g. "foundation", "prelims" - matches the frontend routes.
    private String id;

    @Column(nullable = false)
    private String name;

    private String tagline;

    private String duration;

    private String mode;

    private Integer subjects;

    private String hours;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String color;

    // Comma-separated list of bullet points shown as "Key Features" on the curriculum page.
    @Column(name = "key_features", columnDefinition = "TEXT")
    private String keyFeatures;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CurriculumSubject> curriculumSubjects = new ArrayList<>();
}
