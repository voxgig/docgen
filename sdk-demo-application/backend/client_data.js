const { v4: uuidv4 } = require('uuid')

const lastModified = Date.now()

module.exports = [
  {
    id: uuidv4(),
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": 1234567890,
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Alice",
    "lastName": "Smith",
    "phoneNumber": 9876543210,
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Robert",
    "lastName": "Brown",
    "phoneNumber": 5551234567,
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Emily",
    "lastName": "Johnson",
    "phoneNumber": 4449876543,
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Michael",
    "lastName": "Williams",
    "phoneNumber": 3332221111,
    lastModified
  }
]
