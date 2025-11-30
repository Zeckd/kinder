package kg.mega.kindergarten.repositories;

import kg.mega.kindergarten.models.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetCodeRepo extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findByEmailAndCodeAndUsedFalse(String email, String code);
    void deleteByEmail(String email);
}

