package com.sociomantra.backend.dto.settings;

import com.sociomantra.backend.entity.AcademySettings;
import lombok.Data;

public class SettingsDtos {

    @Data
    public static class SettingsRequest {
        private String academyName;
        private String phone;
        private String email;
        private String address;
        private String facebookUrl;
        private String youtubeUrl;
        private String instagramUrl;
        private String telegramUrl;
        private String linkedinUrl;
        private String seoTitle;
        private String seoDescription;
        private String heroHeadline;
        private String heroSubheadline;
    }

    @Data
    public static class SettingsResponse {
        private String academyName;
        private String phone;
        private String email;
        private String address;
        private SocialLinks social;
        private Website website;

        @Data
        public static class SocialLinks {
            private String facebook;
            private String youtube;
            private String instagram;
            private String telegram;
            private String linkedin;
        }

        @Data
        public static class Website {
            private String seoTitle;
            private String seoDescription;
            private String heroHeadline;
            private String heroSubheadline;
        }

        public static SettingsResponse from(AcademySettings s) {
            SettingsResponse r = new SettingsResponse();
            r.academyName = s.getAcademyName();
            r.phone = s.getPhone();
            r.email = s.getEmail();
            r.address = s.getAddress();

            SocialLinks links = new SocialLinks();
            links.facebook = s.getFacebookUrl();
            links.youtube = s.getYoutubeUrl();
            links.instagram = s.getInstagramUrl();
            links.telegram = s.getTelegramUrl();
            links.linkedin = s.getLinkedinUrl();
            r.social = links;

            Website website = new Website();
            website.seoTitle = s.getSeoTitle();
            website.seoDescription = s.getSeoDescription();
            website.heroHeadline = s.getHeroHeadline();
            website.heroSubheadline = s.getHeroSubheadline();
            r.website = website;

            return r;
        }
    }
}
