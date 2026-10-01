package com.sociomantra.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "curriculum_subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnore
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CurriculumSection section;

    @Column(nullable = false)
    private String name;

    @Column(name = "order_index")
    private Integer orderIndex;

    // Aggregate stats shown at the top of each section (repeated per-row is fine
    // for this scale; kept simple rather than adding another join table).
    @Column(name = "total_chapters")
    private Integer totalChapters;

    @Column(name = "total_hours")
    private String totalHours;
}
