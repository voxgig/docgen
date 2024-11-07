import JSONDOMViewer from "./json-dom-viewer.js"
import createTable from "./DataTable.js"

const SDK_NAME = 'phonebook_sdk'

// TODO: Figure the best way to export this globally
window.createForm = createForm

function createForm(config, data_item) {
  let form = document.createElement('form')

  const { fields = {}, op = 'Create' } = config
  const handler = config.handler || (() => {})


  if(data_item.id != null) {
    form.dataset.id = data_item.id
  }
  // form.classList.add('ford-grid')

  form.style.display = 'grid'
  // TODO: Should come from config
  form.style.gridTemplateColumns = '1fr '.repeat(2).trim()
  form.style.gap = '1em'

  for(let key in data_item) {
    /*
    if(key == 'id') {
      continue
    }
    */

    let div = document.createElement('div')
    let value = data_item[key]

    // TODO: Dynamically build the style
    div.classList.add('form-group')

    let label = document.createElement('label')
    let input = document.createElement('input')

    // TODO: password, email, tel, etc.
    input.type = 'text'

    // NOTE: NEEDED for FormData
    input.name = key
    input.id = key

    let field_options = fields[key]
    if(field_options) {
      if(field_options.disabled) {
        input.disabled = true
        input.style.backgroundColor = '#ccc'
      }
    }

    label.textContent = key
    input.defaultValue = value != null && value || ''

    div.appendChild(label)
    div.appendChild(input)

    form.appendChild(div)

  }

  let div_button = $create({
    elem: 'div',
    classes: [ 'form-group' ],
    style: {
      display: 'grid',
      gridColumn: '1 / -1',
      gap: '1em',
      // TODO: Depending on the number of operations - usually save and delete
      gridTemplateColumns: '1fr 1fr'
    },
    children: [
      $create({
        elem: 'button',
        textContent: op,
        // onclick: () => console.log('op: ', op),
        props: {
          type: 'submit',
          dataset: {
            'op': op.toLowerCase()
          }
        }
      }),
      $create({
        elem: 'button',
        textContent: 'Delete',
        // NOTE: ONLY For DELETE
        style: {
          backgroundColor: '#dd1010'
        },
        props: {
          type: 'submit',
          dataset: {
            'op': 'Delete'.toLowerCase()
          }
        }
      })
    ]
  })

  form.appendChild(div_button)

  attachSubmitHandler(form, handler)

  return form
}

function attachSubmitHandler(form, userHandler) {

  const formToJSON = (form) => {
    const data = new FormData(form)
    // console.log(form, data)
    let result = {}
    let data_keys = data.keys()
    for(let key of data_keys) {
      result[key] = data.get(key)
    }
    return result
  }

  const handler = async (event) => {
    event.preventDefault()
    const result = formToJSON(event.target)

    result.id = form.dataset.id != null ? form.dataset.id : ''

    await userHandler(event.submitter.dataset.op || '', result)
  }

  form.addEventListener('submit', handler)
}

function injectForm(form) {
  let formContainer = document.querySelector('#formEditor')

  // TODO: Find a better way to remove children dynamically
  formContainer.innerHTML = ''

  formContainer.appendChild(form)
}


async function loadComponents(entity_name) {

  let entityTableContainer = document.querySelector('#entityTable')
  let formEditor = document.querySelector('#formEditor')

  // TODO: Figure the better way to erase the children
  entityTableContainer.innerHTML = ''
  formEditor.innerHTML = ''

  /*
  <!-- The static HTML presentation of $create: -->
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
            innerHTML: window.SDK_NAME.ui.navtab.opened 
              ? "&#171; Hide Entities" : "&#187; Show Entities",
            onclick: function() {
              let navopened = window.SDK_NAME.ui.navtab.opened
              if(!navopened) {
                SideNav.style.width = "25vh"
                this.innerHTML = "&#171; Hide Entities"
                window.SDK_NAME.ui.navtab.opened = true
              } else {
                SideNav.style.width = '0'
                this.innerHTML = "&#187; Show Entities"
                window.SDK_NAME.ui.navtab.opened = false
              }
            }
          }),
          $create({
            elem: 'button',
            classes: ['openbtn'],
            textContent: 'Add Entity',
          })
        ]
      })
    ]

  })

  entityTableContainer.appendChild(entityTable)

  let out = await fetch(`/api/${SDK_NAME}/${entity_name}/list`, {
    method: 'GET',
  })

  let json_out = await out.json()

  let header = json_out[0] != null && Object.keys(json_out[0]).map(key=>({title: key, key}))

  // [ { title: ..., key: ..., }, ... ]

  console.log(header)

  // See if we need to do this
  // loadForm(json_out[0] || {})

  let table = createTable(header,
    json_out.map(item => ({...item})),
    function (event, item) {
      console.log('selected row: ', this)

      // console.log('item::::', item)
      let form = createForm({
        fields: {
          'id': { disabled: true },
          'lastModified': { disabled: true }
        },
        op: 'Save', // TODO: ops: ['Save', 'Delete']
        handler (op, data) {
          console.log('result: ', op, data)
        }
      }, item)

      injectForm(form)

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

  /*
  let div = document.createElement('div')
  div.classList.add('terminal')

  let terminal_header = document.createElement('h3')
  terminal_header.textContent = 'Json Viewer'

  div.appendChild(JSONDOMViewer(json_out))
  entityTable.appendChild(terminal_header)


  entityTable.appendChild(div)
  */

}

function loadForm(data_item) {

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

;(async function load_root() {

  let entities = [
    { name: 'phonebook', title: 'Phonebook' }, // just capitalized
    { name: 'client', title: 'Client' }
  ]

  console.log(window.SDK_NAME)
  window.SDK_NAME.ui.current_entity = entities[0].name // DEFAULT

  await loadComponents(window.SDK_NAME.ui.current_entity)

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
          /*
          // TODO: access parent by "this.prior" feature
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
            console.log(entity.name)
            window.SDK_NAME.ui.current_entity = entity.name
            await loadComponents(window.SDK_NAME.ui.current_entity)
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

function $create(config) {
  const {
    classes = [], 
    style = {},
    children = [],
    props = {}
  } = config

  let elem = document.createElement(config.elem || 'div')

  config.id != null && (elem.id = config.id)
  config.textContent != null
    && (elem.textContent = config.textContent)

  Object.assign(elem.style, style)

  for(let prop in props) {
    if(prop == 'dataset') {
      let dataset = props[prop]
      for(let set_key in dataset) {
        elem.dataset[set_key] = dataset[set_key]
      }
    } else {
      elem[prop] = props[prop]
    }
  }

  for(let i = 0; i < classes.length; i++) {
    let cssClass = config.classes[i]
    elem.classList.add(cssClass)
  }

  if(typeof config.onclick == 'function') {
    elem.addEventListener('click', config.onclick)
  }

  // NOTE: innerHTML take priority over children
  // TODO: Unless it is actually a String ( &233; )
  if(config.innerHTML != null) {
    elem.innerHTML = config.innerHTML
    return elem
  }



  for(let i = 0; i < children.length; i++) {
    let child = children[i]
    if(typeof child == 'function') {
      let node = child()
      // if node is "iterateable"
      if(node[Symbol.iterator] != null) {
        for(let item of node) {
          elem.appendChild(item)
        }
      } else {
        elem.appendChild(node)
      }
    } else {
      elem.appendChild(child)
    }
  }

  return elem

}
