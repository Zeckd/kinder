# 🌼 Kindergarten Management System

Система управления детским садом с красивым веб-интерфейсом, авторизацией и восстановлением пароля.

## ✨ Возможности

- 🔐 Авторизация с JWT токенами
- 📧 Восстановление пароля через email
- 👥 Управление детьми, родителями и воспитателями
- 💰 Отслеживание платежей
- 📱 Адаптивный дизайн для всех устройств
- 🐳 Docker поддержка

## 🚀 Быстрый старт

### Локальный запуск с Docker

```bash
docker-compose up
```

Приложение будет доступно на `http://localhost:8080`

### Локальный запуск без Docker

1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE db;
```

3. Обновите `application.properties` с вашими настройками БД

4. Запустите:
```bash
mvn spring-boot:run
```

## 🌐 Деплой в облако

### Render.com (Рекомендуется - бесплатно)

1. **Подготовьте репозиторий:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ВАШ_USERNAME/kindergarten.git
git push -u origin main
```

2. **Создайте аккаунт на [Render.com](https://render.com)**

3. **Создайте Web Service:**
   - New + → Web Service
   - Подключите GitHub репозиторий
   - Build Command: `mvn clean package -DskipTests`
   - Start Command: `java -jar target/*.jar`

4. **Создайте PostgreSQL базу данных:**
   - New + → PostgreSQL
   - Скопируйте данные подключения

5. **Добавьте переменные окружения:**
   ```
   DATABASE_URL=jdbc:postgresql://host:5432/dbname
   DATABASE_USERNAME=username
   DATABASE_PASSWORD=password
   SPRING_MAIL_USERNAME=your_email@gmail.com
   SPRING_MAIL_PASSWORD=your_app_password
   JWT_SECRET=your_secret_key
   PORT=8080
   ```

6. **Деплой!** Ваше приложение будет доступно по адресу: `https://your-app.onrender.com`

📖 **Подробная инструкция:** см. [DEPLOY.md](DEPLOY.md)

### Другие платформы

- **Railway.app** - автоматический деплой из GitHub
- **Heroku** - классический вариант (см. Procfile)
- **AWS/GCP/Azure** - для продакшн окружения

## 📧 Настройка Email

Для работы восстановления пароля:

1. Включите двухфакторную аутентификацию в Google
2. Создайте "Пароль приложения": [Google Account](https://myaccount.google.com/apppasswords)
3. Используйте этот пароль в `SPRING_MAIL_PASSWORD`

## 🛠 Технологии

- **Backend:** Spring Boot 3.3.0, Spring Security, JWT
- **Database:** PostgreSQL
- **Frontend:** HTML, CSS, JavaScript
- **Build:** Maven
- **Container:** Docker

## 📁 Структура проекта

```
kindergarten/
├── src/main/java/kg/mega/kindergarten/
│   ├── controllers/      # REST контроллеры
│   ├── services/         # Бизнес-логика
│   ├── models/           # Модели данных
│   ├── repositories/     # Репозитории JPA
│   └── config/           # Конфигурация
├── src/main/resources/
│   ├── static/           # HTML, CSS, JS
│   └── application.properties
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

## 🔑 API Endpoints

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход (получение JWT)
- `POST /api/auth/forgot-password` - Запрос кода восстановления
- `POST /api/auth/reset-password` - Сброс пароля

Все остальные endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <your_token>
```

## 📝 Лицензия

MIT License

## 👨‍💻 Автор

Kindergarten Management System

---

**Готово к использованию!** 🎉

