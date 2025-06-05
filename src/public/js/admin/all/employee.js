importLinkCss('/css/admin/all/employees.css')

const tbody         = document.querySelector('table').querySelector('tbody')
const sortOptions   = {}
const filterOptions = {}
const currentPage   = { page: 1 }
const dataSize      = { size: 0 }

async function getFilter() {
  const response = await fetch('/admin/all-employees/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)
  
  json.position.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select#role').appendChild(option)
  })
  
  json.store.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select#storeCode').appendChild(option)
  })
}

async function getEmployees(sortOptions, filterOptions, currentPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-employees/data/employees', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      sort  : sortOptions, 
      filter: filterOptions, 
      page  : currentPage,
    })
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)
    
  const data = json.data
  dataSize.size = json.data_size

  document.querySelector('div.board-title').querySelector('p').textContent = 'Nhân sự: ' + dataSize.size

  window.setTimeout(function() {
    tbody.querySelectorAll('tr').forEach((tr, index) => {
      tr.remove()
    })

    let productIndex = (currentPage - 1) * 10 + 1

    data.forEach((item, index) => {
      const newTr = document.createElement('tr')
      newTr.innerHTML = `
        <td>${productIndex}</td>
        <td>${item._id}</td>
        <td>${item.name}</td>
        <td>${item.email}</td>
        <td>${item.address}</td>
        <td><a href="/admin/all-employees/employee/${item._id}">Xem</a></td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)
  
  pagination(getEmployees, sortOptions, filterOptions, currentPage, dataSize.size)
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  try {
    await getFilter()
    await new Promise(r => setTimeout(r, 500))

    await getEmployees(sortOptions, filterOptions, currentPage.page)
    await new Promise(r => setTimeout(r, 500))

    await sortAndFilter(getEmployees, sortOptions, filterOptions, currentPage.page)
    await new Promise(r => setTimeout(r, 500))

    await exportJs()
  } catch (error){
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})