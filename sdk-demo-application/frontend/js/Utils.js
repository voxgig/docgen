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



  if(typeof children == 'function') {
    elem.appendChild(children())
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
    } else if(child == null) {
      continue
    } else {
      elem.appendChild(child)
    }
  }

  return elem

}


export {
  $create
}
