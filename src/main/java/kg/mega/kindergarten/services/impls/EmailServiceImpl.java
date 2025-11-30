package kg.mega.kindergarten.services.impls;

import kg.mega.kindergarten.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordResetCode(String email, String code) {
        String fromEmail = ((JavaMailSenderImpl) mailSender).getUsername();

        if (fromEmail == null || fromEmail.isEmpty()) {
            System.out.println("Email не настроен, код: " + code);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Код восстановления пароля");
            message.setText("Ваш код: " + code);
            mailSender.send(message);
            System.out.println("Email успешно отправлен на " + email);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

