# Инструкция по деплою на Render

## Быстрый деплой на Render (5 минут)

### Шаг 1: Подготовка репозитория
1. Создайте аккаунт на [GitHub](https://github.com) (если еще нет)
2. Создайте новый репозиторий
3. Загрузите код:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_USERNAME/kindergarten.git
git push -u origin main
```

### Шаг 2: Деплой на Render
1. Зайдите на [Render.com](https://render.com) и зарегистрируйтесь (можно через GitHub)
2. Нажмите "New +" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Настройки:
   - **Name**: kindergarten-app
   - **Environment**: Java
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
   - **Instance Type**: Free

### Шаг 3: Создание базы данных
1. В Render нажмите "New +" → "PostgreSQL"
2. Настройки:
   - **Name**: kindergarten-db
   - **Database**: kindergarten
   - **User**: kindergarten_user
   - **Region**: выберите ближайший
   - **Plan**: Free
3. После создания скопируйте:
   - Internal Database URL
   - Database Host
   - Database Port
   - Database User
   - Database Password

### Шаг 4: Настройка переменных окружения
В настройках вашего Web Service добавьте:

```
DATABASE_URL=jdbc:postgresql://ВАШ_HOST:5432/kindergarten
DATABASE_USERNAME=kindergarten_user
DATABASE_PASSWORD=ВАШ_ПАРОЛЬ
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=ваш_email@gmail.com
SPRING_MAIL_PASSWORD=ваш_пароль_приложения_gmail
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
PORT=8080
```

**Важно для Gmail:**
1. Включите двухфакторную аутентификацию
2. Создайте "Пароль приложения": [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Используйте этот пароль в `SPRING_MAIL_PASSWORD`

### Шаг 5: Деплой
1. Нажмите "Create Web Service"
2. Render автоматически начнет сборку и деплой
3. Дождитесь завершения (5-10 минут)
4. Ваше приложение будет доступно по адресу: `https://kindergarten-app.onrender.com`

## Альтернативные платформы

### Railway.app (еще проще)
1. Зайдите на [Railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Выберите репозиторий
4. Railway автоматически определит Java проект
5. Добавьте PostgreSQL через "New" → "Database" → "PostgreSQL"
6. Переменные окружения добавятся автоматически

### Heroku (классический вариант)
1. Установите [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Создайте `Procfile`:
```
web: java -jar target/*.jar
```
3. Команды:
```bash
heroku login
heroku create kindergarten-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## Проверка работы
После деплоя откройте:
- Главная: `https://ваш-домен.onrender.com`
- Вход: `https://ваш-домен.onrender.com/login.html`
- Регистрация: `https://ваш-домен.onrender.com/register.html`

## Устранение проблем

### База данных не подключается
- Проверьте, что база данных создана в том же регионе
- Убедитесь, что используете Internal Database URL для Render

### Email не отправляется
- Проверьте пароль приложения Gmail
- Убедитесь, что двухфакторная аутентификация включена
- Попробуйте другой SMTP сервер (например, SendGrid)

### Приложение не запускается
- Проверьте логи в Render Dashboard
- Убедитесь, что все переменные окружения установлены
- Проверьте, что порт установлен правильно (Render использует переменную PORT)

