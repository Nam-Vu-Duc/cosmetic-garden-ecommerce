importLinkCss('/css/admin/all/products.css')

const tbody         = document.querySelector('table').querySelector('tbody')
const paginationBtn = document.querySelector('select[name="pagination"]')
const sortOptions   = {}
const filterOptions = { deletedAt: null }
const currentPage   = { page: 1 }
const dataSize      = { size: 0 }

async function getMaterials(sortOptions, filterOptions, currentPage, itemsPerPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-materials/data/materials', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      sort: sortOptions, 
      filter: filterOptions, 
      page: currentPage,
      itemsPerPage: itemsPerPage
    })
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)
    
  const data = json.data
  dataSize.size = json.data_size

  document.querySelector('div.board-title').querySelector('p').textContent = 'Nguyên liệu: ' + dataSize.size

  window.setTimeout(function() {
    tbody.querySelectorAll('tr').forEach((tr, index) => {
      tr.remove()
    })

    let productIndex = (currentPage - 1) * itemsPerPage + 1

    data.forEach((item, index) => {
      const newTr = document.createElement('tr')
      newTr.innerHTML = `
        <td>${productIndex}</td>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td style="text-align: right;">${formatNumber(item.price)}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="text-align: right;">${formatDate(item.expiry_date)}</td>
        <td><a target="_blank" rel="noopener noreferrer" href="/admin/all-materials/material/${item._id}" class="update-button">Xem</a></td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)

  pagination(getMaterials, sortOptions, filterOptions, currentPage, dataSize.size)
}

paginationBtn.onchange = function () {
  const selectedValue = parseInt(paginationBtn.value)
  currentPage.page = 1
  getMaterials(sortOptions, filterOptions, currentPage.page, selectedValue)
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  try {
    await getMaterials(sortOptions, filterOptions, currentPage.page, 10)
    await sortAndFilter(getMaterials, sortOptions, filterOptions, currentPage.page)
    await exportJs()
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})