package kg.mega.kindergarten.models.dtos;

import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;

public record RegistrationDto(

        @NotBlank(message = "Имя пользователя обязательно")
        @Size(min = 4, max = 20, message = "Имя пользователя должно быть от 4 до 20 символов")
        @Schema(description = "Имя пользователя", example = "user123", required = true)
        String username,

        @NotBlank(message = "Пароль обязателен")
        @Size(min = 6, max = 100, message = "Пароль должен быть от 6 до 100 символов")
        @Schema(description = "Пароль", example = "P@ssw0rd", required = true)
        String password,

        @NotBlank(message = "Email обязателен")
        @Email(message = "Email должен быть валидным")
        @Schema(description = "Email", example = "user@example.com", required = true)
        String email

) {}
