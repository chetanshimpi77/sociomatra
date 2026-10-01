package com.sociomantra.backend.dto.post;

import com.sociomantra.backend.entity.Post;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

public class PostDtos {

    @Data
    public static class PostRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotBlank(message = "Content is required")
        private String content;

        private String excerpt;
        private String tag;
        private String imageUrl;
        private Boolean published;
    }

    @Data
    public static class PostResponse {
        private Long id;
        private String title;
        private String excerpt;
        private String content;
        private String tag;
        private String author;
        private String imageUrl;
        private boolean published;
        private LocalDateTime date;

        public static PostResponse from(Post p) {
            PostResponse r = new PostResponse();
            r.id = p.getId();
            r.title = p.getTitle();
            r.excerpt = p.getExcerpt();
            r.content = p.getContent();
            r.tag = p.getTag();
            r.author = p.getAuthor();
            r.imageUrl = p.getImageUrl();
            r.published = p.isPublished();
            r.date = p.getCreatedAt();
            return r;
        }
    }
}
