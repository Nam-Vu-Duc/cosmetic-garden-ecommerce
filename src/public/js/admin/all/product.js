importLinkCss('/css/admin/all/products.css')

const tbody         = document.querySelector('table').querySelector('tbody')
const sortOptions   = {}
const filterOptions = { deletedAt: null }
const currentPage   = { page: 1 }
const dataSize      = { size: 0 }
const deleteForm    = document.forms['delete-form']
const deleteButton  = document.getElementById('delete-button')
const formButton    = document.getElementsByClassName('form-button')
var courseId

async function getFilter() {
  const response = await fetch('/admin/all-products/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)


  json.brand.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.name
    option.textContent = element.name
    document.querySelector('select#brand').appendChild(option)
  })
}

async function getProducts(sortOptions, filterOptions, currentPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-products/data/products', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({sort: sortOptions, filter: filterOptions, page: currentPage})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)
    
  const data = json.data
  dataSize.size = json.data_size

  document.querySelector('div.board-title').querySelector('p').textContent = 'Sản phẩm: ' + dataSize.size

  window.setTimeout(function() {
    tbody.querySelectorAll('tr').forEach((tr, index) => {
      tr.remove()
    })

    let productIndex = (currentPage - 1) * 10 + 1

    data.forEach((item, index) => {
      const newTr = document.createElement('tr')
      newTr.innerHTML = `
        <td>${productIndex}</td>
        <td>${item.brand}</td>
        <td style="
          display: flex; 
          justify-content: start;
          align-items: center;
          "
        >
          <img src="${item.img.path}" alt="${item.name}" loading="lazy"> 
          <p>${item.name}</p>
        </td>  
        <td>${formatNumber(item.purchasePrice)}</td>
        <td>${formatNumber(item.price)}</td>
        <td>${item.quantity}</td>
        <td>
          <button><a href="/admin/all-products/product/${item._id}" class="update-button">Xem</a></button>
          <button id="${item._id}" name="${item.name}" onclick="reply_click(this.id, this.name)">Xoá</button> 
        </td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)

  pagination(getProducts, sortOptions, filterOptions, currentPage, dataSize.size)
}

function reply_click(clicked_id, clicked_name) {
  const name = clicked_name
  const message = document.querySelector('p#confirm-message')
  message.innerText = `Bạn có muốn xoá sản phẩm ${name} không ?`
  document.getElementById('id01').style.display='block'
  courseId = clicked_id
}

// delete action
deleteButton.onclick = async function () {
  const response = await fetch('/admin/all-products/product/soft-delete', {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id: courseId})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {isValid, message} = await response.json()

  pushNotification(message)
  
  if (!isValid) return
  setTimeout(() => window.location.reload(), 3000)
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  try {
    await getFilter()
    await new Promise(r => setTimeout(r, 500))

    await sortAndFilter(getProducts, sortOptions, filterOptions, currentPage.page)
    await new Promise(r => setTimeout(r, 500))
    
    await getProducts(sortOptions, filterOptions, currentPage.page)
    await new Promise(r => setTimeout(r, 500))
    
    await exportJs()
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})