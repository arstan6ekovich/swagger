const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 2007;

const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf8"));

let users = [];

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post("/api/v1/register", async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send("Имя и пароль обязательны");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { name, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({ message: "Пользователь зарегистрирован" });
});

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

let items = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
];

app.get("/api/v1/items", (req, res) => {
  res.json(items);
});

app.get("/api/v1/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    return res.status(404).send("Элемент не найден");
  }
});

app.post("/api/v1/items", (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/v1/items/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (item) {
    item.name = req.body.name;
    res.json(item);
  } else {
    res.status(404).send("Элемент не найден");
  }
});

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

app.delete("/api/v1/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index !== -1) {
    const deletedItem = items.splice(index, 1);
    res.json(deletedItem);
  } else {
    res.status(404).send("Элемент не найден");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/api-docs`);
});
