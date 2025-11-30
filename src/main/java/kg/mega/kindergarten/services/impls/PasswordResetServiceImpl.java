package kg.mega.kindergarten.services.impls;

import kg.mega.kindergarten.models.PasswordResetCode;
import kg.mega.kindergarten.repositories.AppUserRepo;
import kg.mega.kindergarten.repositories.PasswordResetCodeRepo;
import kg.mega.kindergarten.services.EmailService;
import kg.mega.kindergarten.services.PasswordResetService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {
    private final AppUserRepo userRepo;
    private final PasswordResetCodeRepo codeRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    public PasswordResetServiceImpl(AppUserRepo userRepo, PasswordResetCodeRepo codeRepo,
                                    EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.codeRepo = codeRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public String sendResetCode(String email) {
        if (userRepo.findByEmail(email).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь с таким email не найден");
        }

        // Удаляем старые коды для этого email
        codeRepo.deleteByEmail(email);

        // Генерируем новый код
        String code = String.format("%06d", random.nextInt(1000000));
        
        PasswordResetCode resetCode = new PasswordResetCode();
        resetCode.setEmail(email);
        resetCode.setCode(code);
        resetCode.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        resetCode.setUsed(false);
        
        codeRepo.save(resetCode);
        emailService.sendPasswordResetCode(email, code);
        
        return code;
    }

    @Override
    @Transactional
    public void resetPassword(String email, String code, String newPassword) {
        Optional<PasswordResetCode> resetCodeOpt = codeRepo.findByEmailAndCodeAndUsedFalse(email, code);
        
        if (resetCodeOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Неверный код или код уже использован");
        }

        PasswordResetCode resetCode = resetCodeOpt.get();
        
        if (resetCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Код истек");
        }

        var userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден");
        }

        var user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetCode.setUsed(true);
        codeRepo.save(resetCode);
    }
}

