require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const app = express();

morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});

app.use(cors());

app.use(express.json());

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.use(express.static("build"));

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info for ${person.length} people</p><p>${new Date()}</p>`
  );
});

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

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  Person.findById(id).then((person) => {
    res.json(person);
  });
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
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name or number is missing",
    });
  }

  const person = new Person({
    name,
    number,
  });

  person.save().then((savedPerson) => {
    res.status(201).json(savedPerson);
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
