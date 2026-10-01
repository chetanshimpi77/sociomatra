-- =============================================================================
-- Reference schema for SocioMantra IAS Academy - MySQL 8.x
-- =============================================================================
-- This file is NOT executed automatically by the application. The app uses
-- Hibernate's `ddl-auto: update` to create/update these tables itself on
-- startup, which is what makes it work out of the box with zero setup.
--
-- This file exists for three reasons:
--   1. Documentation - a single place to see the exact schema.
--   2. Backups/restores - if you ever need to recreate the schema manually
--      (e.g. restoring to a fresh MySQL instance) without booting the app.
--   3. A starting point if you outgrow Hibernate auto-DDL and want to adopt
--      a real migration tool (Flyway/Liquibase) later - this is what your
--      V1 baseline migration would look like.
--
-- Keep this in sync with the JPA entities under src/main/java/.../entity/
-- if you hand-edit it; it is not validated against them automatically.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS sociomantra_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sociomantra_db;

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    UNIQUE KEY uk_reset_token_hash (token_hash),
    CONSTRAINT fk_reset_token_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    source VARCHAR(100),
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    enquiry_date DATETIME NOT NULL,
    INDEX idx_enquiries_status (status),
    INDEX idx_enquiries_date (enquiry_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    tag VARCHAR(100),
    author VARCHAR(255) NOT NULL DEFAULT 'Admin',
    image_url VARCHAR(500),
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    INDEX idx_posts_published (published)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    duration VARCHAR(100),
    mode VARCHAR(100),
    subjects INT,
    hours VARCHAR(50),
    description TEXT,
    color VARCHAR(50),
    key_features TEXT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curriculum_subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL,
    section VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    order_index INT,
    total_chapters INT,
    total_hours VARCHAR(50),
    CONSTRAINT fk_curriculum_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    INDEX idx_curriculum_course_section (course_id, section)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    experience VARCHAR(100),
    qualification VARCHAR(255),
    photo_url VARCHAR(500),
    email VARCHAR(255),
    bio TEXT,
    subjects_taught TEXT,
    achievements TEXT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Single-row table (id is always 1) holding site-wide settings.
CREATE TABLE IF NOT EXISTS academy_settings (
    id BIGINT PRIMARY KEY,
    academy_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address VARCHAR(500),
    facebook_url VARCHAR(500),
    youtube_url VARCHAR(500),
    instagram_url VARCHAR(500),
    telegram_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    seo_title VARCHAR(255),
    seo_description TEXT,
    hero_headline VARCHAR(255),
    hero_subheadline TEXT
) ENGINE=InnoDB;
