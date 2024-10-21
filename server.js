const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 2009;

// Загрузка документации Swagger
const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf8"));

let users = [];

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Настройка Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Регистрация пользователя
app.post("/api/v1/register", async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send("Имя и пароль обязательны");
  }

  // Проверка на уникальность имени пользователя
  const existingUser = users.find((u) => u.name === name);
  if (existingUser) {
    return res.status(400).send("Пользователь с таким именем уже существует");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { name, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: "Пользователь зарегистрирован" });
});

// Вход пользователя
app.post("/api/v1/login", async (req, res) => {
  const { name, password } = req.body;

  const user = users.find((u) => u.name === name);
  if (!user) {
    return res.status(400).send("Неверное имя или пароль");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).send("Неверное имя или пароль");
  }

  res.json({ message: "Успешный вход в систему" });
});

// Массив элементов
let items = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
];

// Получение всех элементов
app.get("/api/v1/items", (req, res) => {
  res.json(items);
});

// Получение элемента по ID
app.get("/api/v1/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    return res.status(404).send("Элемент не найден");
  }
});

// Создание нового элемента
app.post("/api/v1/items", (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Обновление элемента по ID
app.put("/api/v1/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (item) {
    item.name = req.body.name;
    res.json(item);
  } else {
    res.status(404).send("Элемент не найден");
  }
});

// Частичное обновление элемента по ID
app.patch("/api/v1/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (item) {
    if (req.body.name) {
      item.name = req.body.name;
    }
    res.json(item);
  } else {
    res.status(404).send("Элемент не найден");
  }
});

// Удаление элемента по ID
app.delete("/api/v1/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index !== -1) {
    const deletedItem = items.splice(index, 1);
    res.json(deletedItem);
  } else {
    res.status(404).send("Элемент не найден");
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Что-то пошло не так!");
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/api-docs`);
});
