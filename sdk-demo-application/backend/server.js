
const express = require('express')

const app = express()

const port = 8000

app.use(express.json())

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

// "/api/${SDK_NAME}/${entity}/${op_name}"

app.get(`/api/${SDK_NAME}/${entity}/list`, async (req, res) => {
  res.status(200)
  res.send(JSON.stringify(phone_list_data))
})

app.get(`/api/${SDK_NAME}/${entity}/load/:uid`, async (req, res) => {
  const id = req.params.uid
  const res_body = phone_list_data.find(phone_item => phone_item.id == id)

  res.status(200)
  res.send(JSON.stringify(res_body))
})

app.put(`/api/${SDK_NAME}/${entity}/save/:uid`, async (req, res) => {
  const id = req.params.uid

  const res_body = phone_list_data.find(phone_item => phone_item.id == id)


  console.log('PUT: req.body: ', req.body)

  // DO modify/save

  res.status(200);
  res.send(JSON.stringify(res_body))
})

app.post(`/api/${SDK_NAME}/${entity}/create`, async (req, res) => {
  // DO create
  res.status(200);
  res.send(JSON.stringify(req.body))
})

app.delete(`/api/${SDK_NAME}/${entity}/remove/:uid`, async (req, res) => {
  const id = req.params.uid
  phone_list_data = phone_list_data.filter(phone_item => phone_item.id != id)

  res.status(200)
  res.send(JSON.stringify('null'))
})

entity = Object.keys(entities)[1]
app.get(`/api/${SDK_NAME}/${entity}/list`, async (req, res) => {
  res.status(200);
  res.send(JSON.stringify(client_list_data))
})
app.get(`/api/${SDK_NAME}/${entity}/load/:uid`, async (req, res) => {
  const id = req.params.uid
  const res_body = client_list_data.find(client_item => client_item.id == id)

  res.status(200);
  res.send(JSON.stringify(res_body))
})



app.listen(port, () => {
  console.log(`Sample Backend App listening on port 127.0.0.1:${port}`)
})


