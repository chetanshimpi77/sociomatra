package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.settings.SettingsDtos.SettingsRequest;
import com.sociomantra.backend.dto.settings.SettingsDtos.SettingsResponse;
import com.sociomantra.backend.entity.AcademySettings;
import com.sociomantra.backend.repository.AcademySettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final AcademySettingsRepository settingsRepository;

    // Not read-only: on a fresh database (before DataSeeder has run) this can
    // lazily create the default settings row via getOrCreateDefault().
    @Transactional
    public SettingsResponse get() {
        return SettingsResponse.from(getOrCreateDefault());
    }

    @Transactional
    public SettingsResponse update(SettingsRequest request) {
        AcademySettings settings = getOrCreateDefault();

        if (request.getAcademyName() != null) settings.setAcademyName(request.getAcademyName());
        if (request.getPhone() != null) settings.setPhone(request.getPhone());
        if (request.getEmail() != null) settings.setEmail(request.getEmail());
        if (request.getAddress() != null) settings.setAddress(request.getAddress());
        if (request.getFacebookUrl() != null) settings.setFacebookUrl(request.getFacebookUrl());
        if (request.getYoutubeUrl() != null) settings.setYoutubeUrl(request.getYoutubeUrl());
        if (request.getInstagramUrl() != null) settings.setInstagramUrl(request.getInstagramUrl());
        if (request.getTelegramUrl() != null) settings.setTelegramUrl(request.getTelegramUrl());
        if (request.getLinkedinUrl() != null) settings.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getSeoTitle() != null) settings.setSeoTitle(request.getSeoTitle());
        if (request.getSeoDescription() != null) settings.setSeoDescription(request.getSeoDescription());
        if (request.getHeroHeadline() != null) settings.setHeroHeadline(request.getHeroHeadline());
        if (request.getHeroSubheadline() != null) settings.setHeroSubheadline(request.getHeroSubheadline());

        return SettingsResponse.from(settingsRepository.save(settings));
    }

    private AcademySettings getOrCreateDefault() {
        return settingsRepository.findById(1L).orElseGet(() -> settingsRepository.save(
                AcademySettings.builder()
                        .id(1L)
                        .academyName("SocioMantra IAS Academy")
                        .phone("+91 98765 43210")
                        .email("info@sociomantrias.com")
                        .address("MukharjeeNagar, Delhi")
                        .seoTitle("SocioMantra IAS Academy | Learn. Think. Succeed.")
                        .seoDescription("SocioMantra IAS Academy - Guiding aspirants, building future bureaucrats. UPSC CSE coaching for Prelims, Mains and Interview.")
                        .heroHeadline("Your Dream. Our Mission.")
                        .heroSubheadline("Crack UPSC with the right guidance, strategy & support.")
                        .build()
        ));
    }
}
