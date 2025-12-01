package kg.mega.kindergarten.config;

import kg.mega.kindergarten.services.AppUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final AppUserDetailsService appUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(AppUserDetailsService appUserDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.appUserDetailsService = appUserDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }




    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Разрешаем все статические ресурсы
                        .requestMatchers("/", "/index.html", "/**/*.html", "/**/*.css", "/**/*.js", 
                                "/**/*.png", "/**/*.jpg", "/**/*.jpeg", "/**/*.gif", "/**/*.svg",
                                "/**/*.ico", "/**/*.woff", "/**/*.woff2", "/**/*.ttf", "/**/*.eot")
                        .permitAll()
                        // Health check
                        .requestMatchers("/api/health")
                        .permitAll()
                        // Разрешаем все публичные API эндпоинты
                        .requestMatchers("/api/auth/**")
                        .permitAll()
                        // Swagger
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-resources/**")
                        .permitAll()
                        // Публичные эндпоинты для чтения
                        .requestMatchers("/api/teacher/get-list", "/api/age-group/get-list")
                        .permitAll()
                        // Остальные эндпоинты с проверкой ролей
                        .requestMatchers("/api/child/get-list")
                        .hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/child/find-by-id")
                        .hasAnyRole("TEACHER", "ADMIN", "PARENT")
                        .requestMatchers("/api/parent/create")
                        .hasAnyRole("PARENT", "ADMIN")
                        .requestMatchers("/api/group/get-list", "/api/group/find-by-id")
                        .hasAnyRole("TEACHER", "ADMIN", "PARENT")
                        .requestMatchers("/api/payment/find-by-id")
                        .hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/teacher/create")
                        .hasAnyRole("TEACHER", "ADMIN")
                        .requestMatchers("/api/parent/get-list")
                        .hasAnyRole("TEACHER", "ADMIN")
                        // Все остальные API требуют роль ADMIN
                        .requestMatchers("/api/**")
                        .hasRole("ADMIN")
                        // Все остальные запросы разрешены (для статических файлов)
                        .anyRequest()
                        .permitAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Разрешаем все origins для разработки и продакшена
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("*"));
        configuration.setAllowCredentials(false); // Должно быть false при "*" origins
        configuration.setMaxAge(3600L); // Кешируем preflight на 1 час
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }









    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}