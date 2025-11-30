package kg.mega.kindergarten.services.impls;

import kg.mega.kindergarten.enums.RegisterRole;
import kg.mega.kindergarten.models.AppUser;
import kg.mega.kindergarten.models.dtos.RegistrationDto;
import kg.mega.kindergarten.repositories.AppUserRepo;
import kg.mega.kindergarten.services.AppUserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AppUserServiceImpl implements AppUserService {
    private final PasswordEncoder passwordEncoder;

    public final AppUserRepo userRepo;

    public AppUserServiceImpl(PasswordEncoder passwordEncoder, AppUserRepo userRepo) {
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;
    }

    @Override
    public AppUser register(RegistrationDto dto) {
        if (userRepo.findByUsername(dto.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }
        if (userRepo.findByEmail(dto.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already taken");
        }

        AppUser user = new AppUser();
        user.setUsername(dto.username());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setEmail(dto.email());
        user.setRole(null);

        return userRepo.save(user);

    }

    @Override
    public AppUser changeRole(Long userId, RegisterRole role) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        user.setRole(role);
        return userRepo.save(user);

    }

    @Override
    public List<AppUser> getAll() {
        return userRepo.findAll();
    }

    @Override
    public AppUser findByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Пользователь не найден"));
    }
}
