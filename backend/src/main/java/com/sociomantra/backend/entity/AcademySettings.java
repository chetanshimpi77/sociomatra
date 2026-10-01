package com.sociomantra.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "academy_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademySettings {

    @Id
    @Builder.Default
    private Long id = 1L;

    private String academyName;
    private String phone;
    private String email;
    private String address;

    private String facebookUrl;
    private String youtubeUrl;
    private String instagramUrl;
    private String telegramUrl;
    private String linkedinUrl;

    // Website tab - basic SEO + homepage banner copy, editable from the admin dashboard.
    private String seoTitle;

    @Column(columnDefinition = "TEXT")
    private String seoDescription;

    private String heroHeadline;

    @Column(columnDefinition = "TEXT")
    private String heroSubheadline;
}
