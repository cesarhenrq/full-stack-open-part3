require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const app = express();

morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});

const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body"
);

app.use(cors());
app.use(express.static("build"));
app.use(express.json());
app.use(requestLogger);

app.get("/api/persons", (req, res) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => {
      res.status(500).end();
    });
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.statusMessage = `Person with id ${id} not found`;
        res.status(404).end();
      }
    })
    .catch((error) => {
      res.status(400).send({ error: "malformatted id" });
    });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  Person.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        res.status(204).end();
      }
      res.statusMessage = `Person with id ${id} not found`;
      res.status(404).end();
    })
    .catch((error) => {
      res.status(400).send({ error: "malformatted id" });
    });
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

app.get("/info", (req, res) => {
  Person.find({})
    .then((persons) => {
      res.send(
        `<p>Phonebook has info for ${
          persons.length
        } people</p><p>${new Date()}</p>`
      );
    })
    .catch((error) => {
      res.status(500).end();
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
