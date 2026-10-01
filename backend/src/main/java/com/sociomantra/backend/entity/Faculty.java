package com.sociomantra.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "faculty")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Primary subject shown on the faculty card, e.g. "History"
    @Column(nullable = false)
    private String subject;

    // e.g. "20+ Years Experience"
    private String experience;

    private String qualification;

    @Column(name = "photo_url")
    private String photoUrl;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // Comma-separated list, e.g. "Ancient History,Medieval History,Art & Culture"
    @Column(columnDefinition = "TEXT")
    private String subjectsTaught;

    // Comma-separated list of achievements/awards
    @Column(columnDefinition = "TEXT")
    private String achievements;
}
