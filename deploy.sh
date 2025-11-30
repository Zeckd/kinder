#!/bin/bash

echo "🚀 Начало деплоя Kindergarten Management System"
echo ""

# Проверка наличия Git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен. Установите Git и попробуйте снова."
    exit 1
fi

# Проверка наличия файлов
if [ ! -f "pom.xml" ]; then
    echo "❌ Файл pom.xml не найден. Убедитесь, что вы в корневой директории проекта."
    exit 1
fi

echo "✅ Проверка файлов завершена"
echo ""

# Сборка проекта
echo "📦 Сборка проекта..."
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Ошибка сборки проекта"
    exit 1
fi

echo "✅ Сборка завершена успешно"
echo ""

echo "📝 Следующие шаги:"
echo ""
echo "1. Загрузите код на GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. Зайдите на https://render.com и создайте новый Web Service"
echo ""
echo "3. Подключите ваш GitHub репозиторий"
echo ""
echo "4. Настройки:"
echo "   - Build Command: mvn clean package -DskipTests"
echo "   - Start Command: java -jar target/*.jar"
echo ""
echo "5. Создайте PostgreSQL базу данных в Render"
echo ""
echo "6. Добавьте переменные окружения (см. DEPLOY.md)"
echo ""
echo "✨ Готово! После деплоя ваше приложение будет доступно из любого места!"

