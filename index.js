require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

morgan.token('body', (req) => JSON.stringify(req.body))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/',morgan('tiny'), (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', morgan('tiny'), (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.get('/info',morgan('tiny'), (request, response) => {
  const now = new Date()
  Person.find().count((err, count) => {
    if (err) console.log(err)
    else{
      response.send(`<p>Phonebook has info for ${count} people</p>
      <p>${now.toString()}</p>`)
    }
  })
})

app.get('/api/persons/:id', morgan('tiny'), (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', morgan('tiny'), (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
  
app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :body'), (request, response, next) => {
    const body = request.body

    // if (!body.name || !body.number) {
    //     return response.status(400).json({ 
    //     error: 'missing name or number' 
    //     })
    // }

    // if (persons.map((person) => person.name).includes(body.name)) {
    //     return response.status(400).json({ 
    //     error: 'name must be unique' 
    //     })
    // }

    const person = new Person ({ 
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
    
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})