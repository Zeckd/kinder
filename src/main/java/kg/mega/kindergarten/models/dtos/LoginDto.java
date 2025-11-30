package kg.mega.kindergarten.models.dtos;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

public record LoginDto(
        @NotBlank(message = "Имя пользователя обязательно")
        @Schema(description = "Имя пользователя", example = "user123", required = true)
        String username,

        @NotBlank(message = "Пароль обязателен")
        @Schema(description = "Пароль", example = "P@ssw0rd", required = true)
        String password
) {}

