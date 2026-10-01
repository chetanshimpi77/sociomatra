package com.sociomantra.backend.controller;

import com.sociomantra.backend.dto.settings.SettingsDtos.SettingsRequest;
import com.sociomantra.backend.dto.settings.SettingsDtos.SettingsResponse;
import com.sociomantra.backend.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    // Public - used to render the footer/contact details on the site.
    @GetMapping
    public ResponseEntity<SettingsResponse> get() {
        return ResponseEntity.ok(settingsService.get());
    }

    // Admin-only - Settings page in the dashboard.
    @PutMapping
    public ResponseEntity<SettingsResponse> update(@RequestBody SettingsRequest request) {
        return ResponseEntity.ok(settingsService.update(request));
    }
}
