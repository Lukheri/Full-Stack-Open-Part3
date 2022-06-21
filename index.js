const express = require('express')
const app = express()
const morgan = require('morgan')

app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))
// app.use(morgan('tiny'))

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

app.get('/api/persons',morgan('tiny'), (request, response) => {
  response.json(persons)
})

app.get('/info',morgan('tiny'), (request, response) => {
  const now = new Date()
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
  <p>${now.toString()}</p>`)
  
})

app.get('/api/persons/:id',morgan('tiny'), (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
  
})

app.delete('/api/persons/:id',morgan('tiny'), (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})
  
app.post('/api/persons', morgan(':method :url :status :res[content-length] - :response-time ms :body'), (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
        error: 'missing name or number' 
        })
    }

    if (persons.map((person) => person.name).includes(body.name)) {
        return response.status(400).json({ 
        error: 'name must be unique' 
        })
    }

    const person = {
        id: (Math.floor(Math.random() * 10000)),  
        name: body.name,
        number: body.number,
        
    }

    persons = persons.concat(person)

    response.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})