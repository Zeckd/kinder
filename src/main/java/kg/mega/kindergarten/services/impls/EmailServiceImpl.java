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
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordResetCode(String email, String code) {
        // Логируем код в консоль для отладки
        logger.info("=== КОД ВОССТАНОВЛЕНИЯ ПАРОЛЯ ===");
        logger.info("Email: {}", email);
        logger.info("Код: {}", code);
        logger.info("================================");
        
        // Если email не настроен, просто логируем
        if (fromEmail == null || fromEmail.isEmpty()) {
            logger.warn("Email не настроен. Код восстановления: {} для email: {}", code, email);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Код восстановления пароля");
            message.setText("Ваш код для восстановления пароля: " + code + "\n\nКод действителен в течение 10 минут.");
            mailSender.send(message);
            logger.info("Email успешно отправлен на {}", email);
        } catch (Exception e) {
            logger.error("Ошибка отправки email на {}: {}", email, e.getMessage());
            // Не выбрасываем исключение, чтобы код все равно был доступен в логах
        }
    }
}

