package kg.mega.kindergarten.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

public record ResetPasswordDto(
        @NotBlank(message = "Email обязателен")
        @Email(message = "Email должен быть валидным")
        @Schema(description = "Email", example = "user@example.com", required = true)
        String email,

        @NotBlank(message = "Код обязателен")
        @Schema(description = "Код восстановления", example = "123456", required = true)
        String code,

        @NotBlank(message = "Новый пароль обязателен")
        @Size(min = 6, max = 100, message = "Пароль должен быть от 6 до 100 символов")
        @Schema(description = "Новый пароль", example = "NewP@ssw0rd", required = true)
        String newPassword
) {}

