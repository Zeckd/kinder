package kg.mega.kindergarten.services;

public interface EmailService {
    void sendPasswordResetCode(String email, String code);
}

