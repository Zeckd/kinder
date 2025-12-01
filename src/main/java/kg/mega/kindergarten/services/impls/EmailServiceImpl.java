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
        // Всегда логируем код в консоль - это самый простой способ получить код
        logger.info("═══════════════════════════════════════════════════════");
        logger.info("🔐 КОД ВОССТАНОВЛЕНИЯ ПАРОЛЯ");
        logger.info("📧 Email: {}", email);
        logger.info("🔑 Код: {}", code);
        logger.info("⏰ Код действителен 10 минут");
        logger.info("═══════════════════════════════════════════════════════");
        
        // Если email не настроен, просто логируем (это нормально для разработки)
        if (fromEmail == null || fromEmail.isEmpty()) {
            logger.warn("⚠️  Email сервер не настроен. Код доступен только в логах и в ответе API.");
            logger.warn("💡 Для настройки email укажите spring.mail.username и spring.mail.password в application.properties");
            return;
        }
        
        // Пытаемся отправить реальное письмо (если настроено)
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Код восстановления пароля - Kindergarten");
            message.setText("Ваш код для восстановления пароля: " + code + 
                          "\n\nКод действителен в течение 10 минут." +
                          "\n\nЕсли вы не запрашивали восстановление пароля, проигнорируйте это письмо.");
            mailSender.send(message);
            logger.info("✅ Email успешно отправлен на {}", email);
        } catch (Exception e) {
            logger.error("❌ Ошибка отправки email на {}: {}", email, e.getMessage());
            logger.error("💡 Код всё равно доступен в логах выше и в ответе API");
            // Не выбрасываем исключение - код доступен в логах и в ответе API
        }
    }
}

