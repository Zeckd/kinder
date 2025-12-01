package kg.mega.kindergarten.controllers;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import kg.mega.kindergarten.enums.RegisterRole;
import kg.mega.kindergarten.models.AppUser;
import kg.mega.kindergarten.models.dtos.*;
import kg.mega.kindergarten.services.AppUserService;
import kg.mega.kindergarten.services.JwtService;
import kg.mega.kindergarten.services.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final PasswordResetService passwordResetService;

    public AuthController(AppUserService userService, AuthenticationManager authenticationManager,
                         JwtService jwtService, UserDetailsService userDetailsService,
                         PasswordResetService passwordResetService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.passwordResetService = passwordResetService;
    }

    @Operation(summary = "Регистрация нового пользователя")
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegistrationDto dto) {
        AppUser appUser = userService.register(dto);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Успешная регистрация! Вам назначена роль PARENT. Теперь вы можете войти в систему.");
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Вход в систему")
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginDto dto) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
            );
            UserDetails userDetails = userDetailsService.loadUserByUsername(dto.username());
            String token = jwtService.generateToken(userDetails);
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Успешный вход");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Неверное имя пользователя или пароль");
            response.put("error", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }

    @Operation(summary = "Запрос кода восстановления пароля")
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordDto dto) {
        try {
            String code = passwordResetService.sendResetCode(dto.email());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Код восстановления отправлен на email. Проверьте также логи сервера, если email не настроен.");
            // Возвращаем код в ответе для отладки (в продакшене убрать)
            response.put("code", code);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            return ResponseEntity.status(500).body(response);
        }
    }

    @Operation(summary = "Восстановление пароля с кодом")
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordDto dto) {
        try {
            passwordResetService.resetPassword(dto.email(), dto.code(), dto.newPassword());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Пароль успешно изменен. Теперь вы можете войти с новым паролем.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            int status = e.getMessage().contains("не найден") ? 404 : 
                        e.getMessage().contains("Неверный") || e.getMessage().contains("истек") ? 400 : 500;
            return ResponseEntity.status(status).body(response);
        }
    }

    @Operation(summary = "Назначить роль пользователю (только для ADMIN)")
    @PutMapping("/admin/set-role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> setRole(@RequestParam Long userId, @RequestParam RegisterRole role) {
        AppUser appUser = userService.changeRole(userId, role);
        return ResponseEntity.ok("Роль успешно назначена");
    }

    @Operation(summary = "Получить список всех пользователей (только для ADMIN)")
    @GetMapping("/admin/getAll")
    public List<AppUser> getAll() {
        return userService.getAll();
    }
}
