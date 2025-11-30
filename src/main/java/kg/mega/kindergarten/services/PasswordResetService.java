package kg.mega.kindergarten.services;

public interface PasswordResetService {
    String sendResetCode(String email);
    void resetPassword(String email, String code, String newPassword);
}

