import { $create } from './Utils.js'

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}

function createForm(config, data_item) {
  let form = document.createElement('form')

  let {
    fields = {},
    op = 'create',
    del_enabled,
    save_enabled,
  } = config

  const handler = config.handler || (() => {})

  const { editables = {} } = fields


  op = op.toLowerCase()


  if(data_item.id != null) {
    form.dataset.id = data_item.id
  }
  // form.classList.add('ford-grid')

  form.style.display = 'grid'
  // TODO: Should come from config
  form.style.gridTemplateColumns = '1fr '.repeat(2).trim()
  form.style.gap = '1em'

  // visiable fields are a combination of data_item and editables in order to determine what field is viewable(disabled) and what editable - all in line with the swagger.
  // See: `if((key in data_item) && !(key in editables)) {` below
  let visible_fields = new Set([
    ...Object.keys(data_item),
    ...Object.keys(editables)])

  for(let key of visible_fields) {
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

    if(!(key in editables)) {
      input.disabled = true
      input.style.backgroundColor = '#ccc'
    }

    label.textContent = key
    input.defaultValue = value != null && value || ''

    // TODO: refine to be editable but this is disabled for now
    if(typeof value == 'object' && value != null) {
      input.disabled = true
      input.defaultValue = JSON.stringify(value)
      input.style.backgroundColor = '#ccc'
    } else if(value == null) {
      input.disabled = true
      input.defaultValue = 'null'
      input.style.backgroundColor = '#ccc'
    }

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
      gridTemplateColumns: op == 'create' ? '1fr' : '1fr 1fr'
    },
    children: [
      $create({
        elem: 'button',
        textContent: capitalize(op),
        style: op != 'create' ? {
          filter: save_enabled ? 'none': 'brightness(1.5)',
          pointerEvents: save_enabled ? 'all' : 'none'
        } : {},
        props: {
          type: 'submit',
          dataset: {
            'op': op
          }
        }
      }),
      (op != 'create' ? $create({
        elem: 'button',
        textContent: 'Delete',
        // NOTE: ONLY For DELETE
        style: {
          backgroundColor: '#dd1010',
          filter: del_enabled ? 'none': 'brightness(1.5)',
          pointerEvents: del_enabled ? 'all' : 'none'
        },
        props: {
          type: 'submit',
          dataset: {
            'op': 'delete'
          }
        }
      }) : null )
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

    // TODO: NOTE THIS MAY BE SWAGGER/CASE SPECIFIC
    for(let key in result) {
      if(result[key] == '' || result[key] == null) {
        delete result[key]
      }
    }

    await userHandler(event.submitter.dataset.op || '', result)
  }

  form.addEventListener('submit', handler)
}



export {
  createForm
}
