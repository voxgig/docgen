
const express = require('express')

const app = express()

const port = 8000


const SDK_NAME = "phonebook_sdk"

const entities = {
  'phonebook': [
    'get',
    'list',
    'create',
    'save',
    'delete'
  ],
  'client': [
    'get',
    'list',
    'create',
    'save',
    'delete'
  ]
}

let phone_list_data = require('./phone_data.js')
const client_list_data = require('./client_data.js')

let entity = Object.keys(entities)[0]

app.get(`/api/${SDK_NAME}/${entity}/list`, async (req, res) => {
  res.status(200);
  res.send(JSON.stringify(phone_list_data))
})

entity = Object.keys(entities)[1]
app.get(`/api/${SDK_NAME}/${entity}/list`, async (req, res) => {
  res.status(200);
  res.send(JSON.stringify(client_list_data))
})


app.listen(port, () => {
  console.log(`Sample Backend App listening on port 127.0.0.1:${port}`)
})


