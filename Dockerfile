# Используйте официальный образ Node.js
FROM node:14

# Установите рабочую директорию
WORKDIR /usr/src/app

# Копируйте package.json и package-lock.json
COPY package*.json ./

# Установите зависимости
RUN npm install

# Копируйте остальные файлы
COPY . .

# Откройте порт
EXPOSE 3000

# Команда для запуска приложения
CMD ["node", "server.js"]
