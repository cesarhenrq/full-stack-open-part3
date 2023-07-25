const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});

app.use(cors());

app.use(express.json());

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const gereateId = () => Math.floor(Math.random() * 1000000);

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);

  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.statusMessage = `Person with id ${id} not found`;
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);

  const person = persons.find((person) => person.id === id);

  if (person) {
    persons = persons.filter((person) => person.id !== id);
    res.status(204).end();
  } else {
    res.statusMessage = `Person with id ${id} not found`;
    res.status(404).end();
  }
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name or number is missing",
    });
  }

  const alreadyExists = persons.find((person) => person.name === body.name);

  if (alreadyExists) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: gereateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  res.status(201).json(person);
});

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${person.length} people</p><p>${new Date()}</p>`
  );
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
