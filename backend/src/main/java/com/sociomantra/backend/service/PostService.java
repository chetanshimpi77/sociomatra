package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.post.PostDtos.PostRequest;
import com.sociomantra.backend.dto.post.PostDtos.PostResponse;
import com.sociomantra.backend.entity.Post;
import com.sociomantra.backend.exception.ResourceNotFoundException;
import com.sociomantra.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;

    public List<PostResponse> getAllPublished() {
        return postRepository.findAllByPublishedTrueOrderByCreatedAtDesc().stream()
                .map(PostResponse::from)
                .toList();
    }

    public List<PostResponse> getAllForAdmin() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PostResponse::from)
                .toList();
    }

    public PostResponse getById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id " + id));
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse create(PostRequest request) {
        String excerpt = request.getExcerpt();
        if (excerpt == null || excerpt.isBlank()) {
            excerpt = request.getContent().length() > 160
                    ? request.getContent().substring(0, 160) + "..."
                    : request.getContent();
        }

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .excerpt(excerpt)
                .tag(request.getTag())
                .imageUrl(request.getImageUrl())
                .author("Admin")
                .published(request.getPublished() == null || request.getPublished())
                .build();

        return PostResponse.from(postRepository.save(post));
    }

    @Transactional
    public PostResponse update(Long id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id " + id));

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        if (request.getExcerpt() != null && !request.getExcerpt().isBlank()) {
            post.setExcerpt(request.getExcerpt());
        }
        post.setTag(request.getTag());
        if (request.getImageUrl() != null) post.setImageUrl(request.getImageUrl());
        if (request.getPublished() != null) post.setPublished(request.getPublished());

        return PostResponse.from(postRepository.save(post));
    }

    @Transactional
    public void delete(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("Post not found with id " + id);
        }
        postRepository.deleteById(id);
    }
}
