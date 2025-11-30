package kg.mega.kindergarten.services;

public interface PasswordResetService {
    void sendResetCode(String email);
    void resetPassword(String email, String code, String newPassword);
}

