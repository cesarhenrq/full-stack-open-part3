require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

const app = express();

morgan.token('body', function (req) {
  return JSON.stringify(req.body);
});

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms :body'
);

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(requestLogger);

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
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
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Person.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        res.status(204).end();
      }
      res.statusMessage = `Person with id ${id} not found`;
      res.status(404).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body;

  const person = new Person({
    name,
    number
  });

  person
    .save()
    .then((savedPerson) => {
      res.status(201).json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  const { name, number } = req.body;

  const person = {
    name,
    number
  };

  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        res.statusMessage = `Person with id ${id} not found`;
        res.status(404).end();
      }

      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get('/info', (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.send(
        `<p>Phonebook has info for ${
          persons.length
        } people</p><p>${new Date()}</p>`
      );
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
