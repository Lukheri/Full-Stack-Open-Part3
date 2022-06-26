const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

function validator (number) {
  return /^(\d{8,11}|\d{2}-\d{6,9}|\d{3}-\d{5,8})$/.test(number)
}

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'Please input name']
  },
  number: {
    type: String,
    minLength: 8,
    required: [true, 'Phone number is required'],
    validate: [validator, 'Invalid number']
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)