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
        // Всегда логируем код в консоль
        logger.info("═══════════════════════════════════════════════════════");
        logger.info("🔐 КОД ВОССТАНОВЛЕНИЯ ПАРОЛЯ");
        logger.info("📧 Email: {}", email);
        logger.info("🔑 Код: {}", code);
        logger.info("⏰ Код действителен 10 минут");
        logger.info("═══════════════════════════════════════════════════════");
        
        // Проверяем, настроен ли email
        if (fromEmail == null || fromEmail.isEmpty() || fromEmail.trim().isEmpty()) {
            logger.warn("⚠️  Email сервер не настроен. Код доступен в логах и в ответе API.");
            return;
        }
        
        // Отправляем письмо используя готовый метод Spring Mail
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Код восстановления пароля - Kindergarten");
            message.setText("Ваш код для восстановления пароля: " + code + 
                          "\n\nКод действителен в течение 10 минут." +
                          "\n\nЕсли вы не запрашивали восстановление пароля, проигнорируйте это письмо.");
            
            // Используем готовый метод send() из JavaMailSender
            mailSender.send(message);
            logger.info("✅ Email успешно отправлен на {}", email);
        } catch (Exception e) {
            logger.error("❌ Ошибка отправки email на {}: {}", email, e.getMessage(), e);
            logger.error("💡 Код доступен в логах выше и в ответе API");
            // Не выбрасываем исключение - код доступен в логах и в ответе API
        }
    }
}

