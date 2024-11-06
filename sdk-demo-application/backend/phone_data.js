const { v4: uuidv4 } = require('uuid')

const lastModified = Date.now()

module.exports = [
  {
    id: uuidv4(),
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": 1234567890,
    "address": "123 Elm Street",
    "city": "Springfield",
    "country": "USA",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Alice",
    "lastName": "Smith",
    "phoneNumber": 9876543210,
    "address": "456 Oak Avenue",
    "city": "Metropolis",
    "country": "Canada",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Robert",
    "lastName": "Brown",
    "phoneNumber": 5551234567,
    "address": "789 Pine Road",
    "city": "Gotham",
    "country": "USA",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Emily",
    "lastName": "Johnson",
    "phoneNumber": 4449876543,
    "address": "101 Maple Lane",
    "city": "Star City",
    "country": "Canada",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Michael",
    "lastName": "Williams",
    "phoneNumber": 3332221111,
    "address": "202 Birch Blvd",
    "city": "Central City",
    "country": "USA",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Sophia",
    "lastName": "Taylor",
    "phoneNumber": 8887776666,
    "address": "303 Cedar Drive",
    "city": "Smallville",
    "country": "UK",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "David",
    "lastName": "Anderson",
    "phoneNumber": 2223334444,
    "address": "404 Redwood Court",
    "city": "Hill Valley",
    "country": "Australia",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Linda",
    "lastName": "Martinez",
    "phoneNumber": 7778889999,
    "address": "505 Spruce Street",
    "city": "Metropolis",
    "country": "Brazil",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "James",
    "lastName": "Wilson",
    "phoneNumber": 6665554444,
    "address": "606 Willow Avenue",
    "city": "Rivertown",
    "country": "USA",
    lastModified
  },
  {
    id: uuidv4(),
    "firstName": "Olivia",
    "lastName": "Moore",
    "phoneNumber": 1112223333,
    "address": "707 Aspen Trail",
    "city": "Hawkins",
    "country": "Ireland",
    lastModified
  }
]
