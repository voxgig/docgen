
const express = require('express')

const sdk_model = require('./sdk.json')

const { TrelloSDK } = require('trello-sdk')

console.log(TrelloSDK)


const app = express()

const port = 8000

app.use(express.json())

const SDK_NAME = "TrelloSDK"

// TODO: transform from the model
const entities = {
  'board': {
    'load': {},
    'list': {
      query: { 
        idMember: String
      }
    },
    'create': {},
    'save': {},
    'remove': {}
  },
  'list': {
    'load': {},
    'list': {
      query: {
        idBoard: String
      }
    },
    'create': {},
    'save': {},
    // 'remove': {}
  }
}

function cap(s) {
  return s[0].toUpperCase() + s.slice(1)
}

const client = TrelloSDK.make({
  endpoint: process.env.TRELLO_ENDPOINT,
  apikey: process.env.TRELLO_APIKEY,
  token: process.env.TRELLO_TOKEN,
})

for(const entity_name in entities) {
  const entity = entities[entity_name]
  for(const op in entity) {
    const settings = entity[op]

    if(op == 'list') {
      app.get(`/api/${SDK_NAME}/${entity_name}/${op}`, async (req, res) => {
        // console.log('cap: ', client[cap(entity_name)]()[op] )
        for(let q in settings.query) {
          if(!req.query[q]) {
            res.status(400)
            return res.send(JSON.stringify(q + ': REQUIRED'))
          }
        }
        try {
          let list = await client[cap(entity_name)]().list(req.query)
          res.status(200)
          return res.send(JSON.stringify(list))
        } catch(err) {
          res.status(400)
          res.send(JSON.stringify("error occured"))
        }

      })
    }

    if(op == 'load') {
      app.get(`/api/${SDK_NAME}/${entity_name}/${op}/:uid`, async (req, res) => {
        const id = req.params.uid
        console.log('cap: ', client[cap(entity_name)]()[op] )
        for(let q in settings.query) {
          if(!req.query[q]) {
            res.status(400)
            return res.send(JSON.stringify(q + ': REQUIRED'))
          }
        }

        try {
          let item = await client[cap(entity_name)]().load({ id, }) 
          console.log('load item: ', item)
          res.status(200)
          return res.send(JSON.stringify(item))
        } catch(err) {
          res.status(400)
          res.send(JSON.stringify("error occured"))
        }
      })

    }

  }
}



/*

// "/api/${SDK_NAME}/${entity}/${op_name}"

let phone_list_data = require('./phone_data.js')
const client_list_data = require('./client_data.js')
let entity = Object.keys(entities)[0]

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

*/


app.listen(port, () => {
  console.log(`Sample Backend App listening on port 127.0.0.1:${port}`)
})


