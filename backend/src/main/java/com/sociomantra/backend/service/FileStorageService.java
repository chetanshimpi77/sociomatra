package com.sociomantra.backend.service;

import com.sociomantra.backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Saves the file to disk under a random, collision-free name and returns
     * the public URL path (served by StaticResourceConfig at /uploads/**).
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("No file was uploaded.", HttpStatus.BAD_REQUEST);
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new ApiException("Only JPG, PNG or WEBP images are allowed.", HttpStatus.BAD_REQUEST);
        }

        try {
            Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(root);

            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
            String extension = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) extension = original.substring(dot);

            String filename = UUID.randomUUID() + extension;
            Path target = root.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new ApiException("Failed to store file. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<String> allowedTypes() {
        return List.copyOf(ALLOWED_CONTENT_TYPES);
    }
}
