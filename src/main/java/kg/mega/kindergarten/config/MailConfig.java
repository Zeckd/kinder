package kg.mega.kindergarten.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {
    private static final Logger logger = LoggerFactory.getLogger(MailConfig.class);

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        
        // Устанавливаем учетные данные, если они есть
        boolean hasCredentials = username != null && !username.isEmpty() && !username.trim().isEmpty();
        if (hasCredentials) {
            mailSender.setUsername(username);
            mailSender.setPassword(password != null ? password : "");
            logger.info("📧 Email настроен: {} на {}:{}", username, host, port);
        } else {
            logger.warn("⚠️  Email не настроен. Укажите SPRING_MAIL_USERNAME и SPRING_MAIL_PASSWORD");
        }

        // Настройки для Gmail (используем готовые свойства Spring)
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", host); // Доверяем хосту
        props.put("mail.debug", "false");

        return mailSender;
    }
}

