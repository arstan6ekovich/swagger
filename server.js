const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");

const app = express();
const port = 2003;

const swaggerDocument = yaml.load(fs.readFileSync("./swagger.yaml", "utf8"));

let items = [
  { id: 1, name: "Item 1" },
  { id: 2, name: "Item 2" },
];

app.use(bodyParser.json());

app.get("/api/v1/items", (req, res) => {
  res.json(items);
});

app.get("/api/v1/items", async (req, res) => {
  try {
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
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

app.delete("/api/v1/items/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index !== -1) {
    const deletedItem = items.splice(index, 1);
    res.json(deletedItem);
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
