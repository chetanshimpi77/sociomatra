package com.sociomantra.backend.repository;

import com.sociomantra.backend.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    // Atomically claims the token by flipping used=false -> true in a single
    // row-level-locked UPDATE. If two requests race on the same token, only
    // one UPDATE can affect a row (MySQL locks the row for the duration of
    // the statement) - the loser gets 0 affected rows and must be rejected,
    // which closes a TOCTOU window a plain "check then save" would leave open.
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.id = :id AND t.used = false")
    int claimIfUnused(@Param("id") Long id);
}
