
function createTable(header, data, rowClick = function() {}) {
  let div = document.createElement('div')
  let table = document.createElement('table')

  table.id = "basicLedTable"


  let thead = document.createElement('thead')
  let tbody = document.createElement('tbody')

  let thr = document.createElement('tr')


  for(const column of header) {
    /*
    if(column.title == 'id') {
      continue
    }
    */

    const th = document.createElement('th')
    th.classList.add('tableheader')
    th.textContent = column.title || 'Blank'

    thr.appendChild(th)

  }
  thead.appendChild(thr)

  let selected_rows = {
    prev: null
  }

  data.forEach(entry => {
    let tbr = document.createElement('tr')
    let i = 0 // TODO: Refactor once we define the interface for header

    if(entry.id != null) {
      tbr.dataset.id = entry.id
    }

    for(let column of header) {
      /*
      if(column.key == 'id') {
        continue
      }
      */
      let key = column.key
      const td = document.createElement('td')
      td.classList.add('tablecolumn')

      // tbr.id = entry.id || i++;

      // TODO: Try to come up with a more efficient way since entry[key] is basically stored in the td.textContent
      // See: https://developer.mozilla.org/en-US/docs/Web/API/DOMStringMap
      tbr.dataset[key] = entry[key]

      td.textContent = entry[key]

      tbr.appendChild(td)
    }

    tbr.addEventListener('click', async function (event) {
      // Even use the Lexical Environment(tbr) or event.target.parentNode
      // console.log(this.dataset)
      if(selected_rows.prev) {
        selected_rows.prev.style.border = '0'
        selected_rows.prev.style.backgroundColor = ''
      }

      selected_rows.prev = this // HTMLElement

      this.style.border = '3px solid #9abde1'
      this.style.backgroundColor = '#9abde1'

      await rowClick.bind(this)(event, this.dataset)
    })
    tbody.appendChild(tbr)
  })

  table.appendChild(thead)
  table.appendChild(tbody)

  // Removed when div: style: { display: 'grid' }
  div.style.maxHeight = '60%'
  div.style.maxWidth = '100%'
  div.style.overflow = 'auto'

  /*
      background: #fff;
    border-radius: 5px;
  */

  // See: https://medium.com/evodeck/responsive-data-tables-with-css-grid-3c58ecf04723
  div.style.display = 'grid';
  div.style.gridTemplateColumns = 'repeat(auto-fit, 20em)'
  div.style.overflowX = 'scroll'

  div.appendChild(table)

  return div

}

export default createTable;
