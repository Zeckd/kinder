package kg.mega.kindergarten.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

public record ForgotPasswordDto(
        @NotBlank(message = "Email обязателен")
        @Email(message = "Email должен быть валидным")
        @Schema(description = "Email", example = "user@example.com", required = true)
        String email
) {}

