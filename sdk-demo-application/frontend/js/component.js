import { $create } from "./Utils.js"

import JSONDOMViewer from "./json-dom-viewer.js"
import createTable from "./DataTable.js"

import { createForm } from './Editor.js'

const SDK_NAME = 'TrelloSDK'

// TODO: Figure the best way to export this globally
window.createForm = createForm

window[SDK_NAME].fields = {}

// TODO: Separate editables for both create and save but usually the fields added in POST are the same for PUT for most Swaggers.
window[SDK_NAME].fields.editables = {
  'board': {
    "post": {
      "closed": { // required but NOT indicated by the SWAGGER
        "type": "string",
        "values": ["true", "false"]
      },
      "desc": {
        "type": "string",
        "length": {
          "min": 0,
          "max": 16384
        }
      },
      "idBoardSource": {
        "type": "string",
        "description": "The id of the board to copy into the new board"
      },
      "idOrganization": {
        "type": "string",
        "description": "The id or name of the organization to add the board to"
      },
      "keepFromSource": {
        "type": "string",
        "description": "Components of the source board to copy"
      },
      "labelNames": {
        "blue": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "green": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "orange": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "purple": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "red": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "yellow": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        }
      },
      "name": {
        "type": "string",
        "length": {
          "min": 1,
          "max": 16384
        }
      },
      "powerUps": {
        "type": "string",
        "values": ["all", "calendar", "cardAging", "recap", "voting"]
      },
      "prefs": {
        "background": {
          "type": "string",
          "description": "A standard background name, or the id of a custom background"
        },
        "calendarFeedEnabled": {
          "type": "string",
          "values": ["true", "false"]
        },
        "cardAging": {
          "type": "string",
          "values": ["pirate", "regular"]
        },
        "cardCovers": {
          "type": "string",
          "values": ["true", "false"]
        },
        "comments": {
          "type": "string",
          "values": ["disabled", "members", "observers", "org", "public"]
        },
        "invitations": {
          "type": "string",
          "values": ["admins", "members"]
        },
        "permissionLevel": {
          "type": "string",
          "values": ["org", "private", "public"]
        },
        "selfJoin": {
          "type": "string",
          "values": ["true", "false"]
        },
        "voting": {
          "type": "string",
          "values": ["disabled", "members", "observers", "org", "public"]
        }
      },
      "prefs_background": {
        "type": "string",
        "length": {
          "min": 0,
          "max": 16384
        }
      },
      "prefs_cardAging": {
        "type": "string",
        "values": ["pirate", "regular"]
      },
      "prefs_cardCovers": {
        "type": "string",
        "values": ["true", "false"]
      },
      "prefs_comments": {
        "type": "string",
        "values": ["disabled", "members", "observers", "org", "public"]
      },
      "prefs_invitations": {
        "type": "string",
        "values": ["admins", "members"]
      },
      "prefs_permissionLevel": {
        "type": "string",
        "values": ["org", "private", "public"]
      },
      "prefs_selfJoin": {
        "type": "string",
        "values": ["true", "false"]
      },
      "prefs_voting": {
        "type": "string",
        "values": ["disabled", "members", "observers", "org", "public"]
      },
      "subscribed": {
        "type": "string",
        "values": ["true", "false"]
      }
    },
    "put": {
      "closed": { // required but NOT indicated by the SWAGGER
        "type": "string",
        "values": ["true", "false"]
      },
      "desc": {
        "type": "string",
        "length": {
          "min": 0,
          "max": 16384
        }
      },
      "idBoardSource": {
        "type": "string",
        "description": "The id of the board to copy into the new board"
      },
      "idOrganization": {
        "type": "string",
        "description": "The id or name of the organization to add the board to"
      },
      "keepFromSource": {
        "type": "string",
        "description": "Components of the source board to copy"
      },
      "labelNames": {
        "blue": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "green": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "orange": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "purple": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "red": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        },
        "yellow": {
          "type": "string",
          "length": {
            "min": 0,
            "max": 16384
          }
        }
      },
      "name": {
        "type": "string",
        "length": {
          "min": 1,
          "max": 16384
        }
      },
      "powerUps": {
        "type": "string",
        "values": ["all", "calendar", "cardAging", "recap", "voting"]
      },
      "prefs": {
        "background": {
          "type": "string",
          "description": "A standard background name, or the id of a custom background"
        },
        "calendarFeedEnabled": {
          "type": "string",
          "values": ["true", "false"]
        },
        "cardAging": {
          "type": "string",
          "values": ["pirate", "regular"]
        },
        "cardCovers": {
          "type": "string",
          "values": ["true", "false"]
        },
        "comments": {
          "type": "string",
          "values": ["disabled", "members", "observers", "org", "public"]
        },
        "invitations": {
          "type": "string",
          "values": ["admins", "members"]
        },
        "permissionLevel": {
          "type": "string",
          "values": ["org", "private", "public"]
        },
        "selfJoin": {
          "type": "string",
          "values": ["true", "false"]
        },
        "voting": {
          "type": "string",
          "values": ["disabled", "members", "observers", "org", "public"]
        }
      },
      "prefs_background": {
        "type": "string",
        "length": {
          "min": 0,
          "max": 16384
        }
      },
      "prefs_cardAging": {
        "type": "string",
        "values": ["pirate", "regular"]
      },
      "prefs_cardCovers": {
        "type": "string",
        "values": ["true", "false"]
      },
      "prefs_comments": {
        "type": "string",
        "values": ["disabled", "members", "observers", "org", "public"]
      },
      "prefs_invitations": {
        "type": "string",
        "values": ["admins", "members"]
      },
      "prefs_permissionLevel": {
        "type": "string",
        "values": ["org", "private", "public"]
      },
      "prefs_selfJoin": {
        "type": "string",
        "values": ["true", "false"]
      },
      "prefs_voting": {
        "type": "string",
        "values": ["disabled", "members", "observers", "org", "public"]
      },
      "subscribed": {
        "type": "string",
        "values": ["true", "false"]
      }
    },
  },

  "list": {
    "post": {
      "closed": {
        "type": "string",
        "values": ["true", "false"]
      },
      "idBoard": {
        "type": "string",
        "description": "id of the board that the list should be added to"
      },
      "idListSource": {
        "type": "string",
        "description": "The id of the list to copy into a new list"
      },
      "name": {
        "type": "string",
        "length": {
          "min": 1,
          "max": 16384
        }
      },
      "pos": {
        "type": "string",
        "values": ["top", "bottom"],
        "description": "A position. 'top', 'bottom', or a positive number"
      },
      "subscribed": {
        "type": "string",
        "values": ["true", "false"]
      }
    },
    "put": {
      "closed": {
        "type": "string",
        "values": ["true", "false"]
      },
      "idBoard": {
        "type": "string",
        "description": "id of the board that the list should be added to"
      },
      "idListSource": {
        "type": "string",
        "description": "The id of the list to copy into a new list"
      },
      "name": {
        "type": "string",
        "length": {
          "min": 1,
          "max": 16384
        }
      },
      "pos": {
        "type": "string",
        "values": ["top", "bottom"],
        "description": "A position. 'top', 'bottom', or a positive number"
      },
      "subscribed": {
        "type": "string",
        "values": ["true", "false"]
      }
    }
  }

}

let entities = [
  {
    name: 'board',
    title: 'Board', // just capitalized

    // TODO: Transform from model
    op: {
      save: {},
      create: {},
      list: {
        query: {
          idMember: { 
            type: String,
            // HARDCODED - make a query button/form
            default: 'me'
          }
        }
      },
      remove: {}
    },

    // TODO: Transform from model
    formFields: Object.keys(window[SDK_NAME].fields.editables['board'].post)
  },
  {
    name: 'list',
    title: 'List',

    // TODO: Transform from model
    op: {
      save: {},
      create: {},
      list: {
        query: {
          idBoard: { 
            type: String,
            // HARDCODED - make a query button/form
            default: '6735f4225f8fbbd10bba2da0'
          }
        }
      },
      // If not found here, it is considered "UNSUPPORTED"
      // remove: {}
    },

    formFields: Object.keys(window[SDK_NAME].fields.editables['list'].post)
  }
]

console.log(SDK_NAME, window[SDK_NAME])
window[SDK_NAME].ui.current_entity = entities[0] // DEFAULT



function injectDataEditor(data, op, handler) {
  let dataEditorDivContainer = document.querySelector('#dataEditor')
  let formContainer;

  op = op[0].toUpperCase() + op.slice(1)

  // console.log('data: ', data)

  dataEditorDivContainer.innerHTML = ''

  let form = createForm({
    fields: {
      'id': { disabled: true },
      'lastModified': { disabled: true },
      editables: window[SDK_NAME].fields.editables[
        window[SDK_NAME].ui.current_entity.name].put
    },
    op, // TODO: ops: ['Save', 'Delete']
    handler: handler || ((op, json_data) => console.log('result: ', op, json_data)),
    del_enabled: !!window[SDK_NAME].ui.current_entity.op.remove,
    save_enabled: !!window[SDK_NAME].ui.current_entity.op.save
  }, data)


  let div = $create({
    elem: 'div',
    children: [
      $create({
        elem: 'h1',
        textContent: 'Editor'
      }),
      $create({
        elem: 'div',
        id: 'formEditor',
        children: () => form
      }),
      $create({
        elem: 'h3',
        textContent: 'Json Viewer'
      }),
      $create({
        elem: 'div',
        classes: ['terminal'],
        children: () => JSONDOMViewer(data)
      })
    ]
  })
  dataEditorDivContainer.appendChild(div)

}

function injectForm(form) {
  let formContainer = document.querySelector('#formEditor')

  // See https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
  formContainer.innerHTML = ''

  formContainer.appendChild(form)
}


async function loadComponents(current_entity) {

  let entityTableContainer = document.querySelector('#entityTable')
  let dataEditor = document.querySelector('#dataEditor')

  entityTableContainer.innerHTML = ''
  dataEditor.innerHTML = ''

  // Default DataEditor Container for now
  dataEditor.appendChild($create({
    elem: 'div',
    children: [
      $create({
        elem: 'h1',
        textContent: 'Editor'
      })
    ]
  }))


  /*
  <!-- For example, this is the static HTML presentation of $create for the following element: -->
  <div>
    <h1>Entity Table</h1>
    <button id="openSidebarEntities" class="openbtn" onclick="openNav()">&#187; Show Entities</button>
  </div>
   */
  let entityTable = $create({
    elem: 'div',
    children: [
      $create({
        elem: 'h1',
        textContent: 'Entity Table'
      }),
      $create({
        elem: 'div',
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40em'
        },
        children: [
          $create({
            elem: 'button',
            id: 'openSidebarEntities',
            classes: ['openbtn'],
            innerHTML: window[SDK_NAME].ui.navtab.opened 
            ? "&#171; Hide Entities" : "&#187; Show Entities",
            onclick: function() {
              let navopened = window[SDK_NAME].ui.navtab.opened
              if(!navopened) {
                SideNav.style.width = "25vh"
                this.innerHTML = "&#171; Hide Entities"
                window[SDK_NAME].ui.navtab.opened = true
              } else {
                SideNav.style.width = '0'
                this.innerHTML = "&#187; Show Entities"
                window[SDK_NAME].ui.navtab.opened = false
              }
            }
          }),
          $create({
            elem: 'button',
            classes: ['openbtn'],
            textContent: 'Add Entity',
            onclick: function() {
              let new_entity = window[SDK_NAME].ui.current_entity.formFields.reduce((acc, item) => {
                acc[item] = ''
                return acc
              }, {})

              console.log('new entity: ', new_entity)

              // TODO: Exclude delete button/op, Only create button
              injectDataEditor(new_entity, 'create', async (op, item) => {

                if(op == 'create') {
                  let post_item = await fetch(`/api/${SDK_NAME}/${window[SDK_NAME].ui.current_entity.name}/create`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      ...item
                    })
                  })
                  let json_out = await post_item.json()
                  console.log('post: ', json_out)

                  // TODO: more efficient solution // add to a table
                  await loadComponents(window[SDK_NAME].ui.current_entity)

                }

              })

            }
          })
        ]
      })
    ]

  })

  entityTableContainer.appendChild(entityTable)

  const query_entries = Object.entries(current_entity.op.list.query || {})
  let query = query_entries.reduce((acc, entry, i) => {
    acc += entry[0] + '=' + entry[1].default
    if(i < query_entries.length-1) acc += '&'

    return acc
  }, '')

  query = query == '' ? '' : '?' + query

  let out = await fetch(`/api/${SDK_NAME}/${current_entity.name}/list${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  let json_out = await out.json()

  // TODO: Explicit transformed header from the model
  let header = json_out[0] != null && Object.keys(json_out[0]).map(key=>({title: key, key}))

  // [ { title: ..., key: ..., }, ... ]

  console.log(header)

  // See if we need to do this
  // loadForm(json_out[0] || {})

  let table = createTable(header,
    json_out, // .map(item => item.data), // backend or frontend processing?
    async function (event, item) {
      

      // console.log('selected row: ', this)


      console.log('item.id: ', item.id)
      
      let load_entity
      
      if(window[SDK_NAME].ui.datatable.load == 'data') {
         // TODO: Fix Object Object bug as now the item nested objects are strings from the data-set so the content aren't lost. Should we JSON.stringify in both cases: stringify everything and pass it around, in other words?
        let entity = { ...item }
        
        // For now, using this UGLY work-around
        for(let key in entity) {
          if(entity[key][0] == '{' || entity[key][0] == '[') {
            try {
              entity[key] = JSON.parse(entity[key])
            } catch(err) {
              // ignore
            }
          }
        }
        
        load_entity = entity
      } else if(window[SDK_NAME].ui.datatable.load == 'network') {
        let out = await fetch(`/api/${SDK_NAME}/${window[SDK_NAME].ui.current_entity.name}/load/${item.id}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'GET',
        })
        load_entity = await out.json()
      
      }



      console.log('load_entity: ', load_entity)

      injectDataEditor(load_entity, 'save', async (op, item) => { 
        console.log('ddd: ', op, item) // { ...item }

        if(op == 'save') {
          let put_item = await fetch(`/api/${SDK_NAME}/${window[SDK_NAME].ui.current_entity.name}/save/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...item
            })
          })
          let json_out = await put_item.json()
          console.log('put: ', json_out)


        } else if(op == 'delete') {
          let remove_item = await fetch(`/api/${SDK_NAME}/${window[SDK_NAME].ui.current_entity.name}/remove/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...item
            })
          })
          let json_out = await remove_item.json()
          console.log('remove: ', json_out)
        }

        // TODO: more efficient solution // add to a table
        await loadComponents(window[SDK_NAME].ui.current_entity)

      })


      // console.log('item::::', item)

    }
  )

  entityTable.appendChild(table)

  let terminal = $create({
    elem: 'div',
    classes: ['terminal'],
    children: [
      JSONDOMViewer(json_out)
    ]
  })

  entityTable.appendChild(
    $create({
      elem: 'h3',
      textContent: 'Json Viewer'
    })
  )
  entityTable.appendChild(terminal)

}

/*
function loadForm(data_item) {

 */

/*
  let data_item = {
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": 1234567890,
    "address": "123 Elm Street",
    "city": "Springfield",
    "country": "USA",
    lastModified: Date.now()
  }
 */

/*
  let config = {
    fields: {
      'lastModified': { disabled: true }
    },
    op: 'Save', // TODO: ops: ['Save', 'Delete']
    handler: (op, data) => console.log('data: ', op, data),
  }

  let form = createForm(config, data_item)

  injectForm(form)
}
 */

;(async function load_root() {

  await loadComponents(window[SDK_NAME].ui.current_entity)

  let sideNav = $create({
    elem: 'div',
    id: 'SideNav',
    classes: ['sidenav'],
    children: [
      $create({
        elem: 'div',
        classes: ['sidenav-header'],
        children: [
          $create({
            elem: 'h2',
            textContent: 'Entities'
          }),
          // TODO: access parent by "this.prior" feature
          /*
          $create({
            elem: 'span',
            innerHTML: '&#171;',
            classes: ['closebtn'],
            onclick: function(event) {
              let SideNav = event.target.parentNode.parentNode
              SideNav.style.width = '0'
              document.querySelector('#openSidebarEntities').style.display = "block"
            }

          })
           */
        ]

      }),
      function* () {
        for(let entity of entities) {
          let switch_entity = $create({
            elem: 'a',
            textContent: entity.title
          })

          switch_entity.addEventListener('click', async function () {
            console.log('entity: ', entity)

            window[SDK_NAME].ui.current_entity = entity

            console.log(window[SDK_NAME])

            await loadComponents(window[SDK_NAME].ui.current_entity)
          })

          yield switch_entity
        }
      }

    ]

  })

  let split_side_bar = document.querySelector('#sidebar.split')

  console.log(sideNav, split_side_bar)

  split_side_bar.appendChild(sideNav)

})();
