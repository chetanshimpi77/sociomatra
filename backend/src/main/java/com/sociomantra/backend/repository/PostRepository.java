package com.sociomantra.backend.repository;

import com.sociomantra.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findAllByPublishedTrueOrderByCreatedAtDesc();
}
