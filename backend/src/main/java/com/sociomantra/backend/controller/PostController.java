package com.sociomantra.backend.controller;

import com.sociomantra.backend.dto.post.PostDtos.PostRequest;
import com.sociomantra.backend.dto.post.PostDtos.PostResponse;
import com.sociomantra.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    // Public - Blog listing page.
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAll(
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all
    ) {
        return ResponseEntity.ok(all ? postService.getAllForAdmin() : postService.getAllPublished());
    }

    // Public - Blog detail page.
    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getById(id));
    }

    // Admin-only - publish a new post from the dashboard.
    @PostMapping
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.create(request));
    }

    // Admin-only - edit an existing post.
    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> update(@PathVariable Long id, @Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    // Admin-only - remove a post.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
