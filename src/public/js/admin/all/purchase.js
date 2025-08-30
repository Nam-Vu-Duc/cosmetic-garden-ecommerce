importLinkCss('/css/admin/all/purchases.css')

const tbody         = document.querySelector('table').querySelector('tbody')
const paginationBtn = document.querySelector('select[name="pagination"]')
const sortOptions   = {}
const filterOptions = {}
const currentPage   = { page: 1 }
const dataSize      = { size: 0 }

async function getPurchases(sortOptions, filterOptions, currentPage, itemsPerPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-purchases/data/purchases', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      sort  : sortOptions, 
      filter: filterOptions, 
      page  : currentPage,
      itemsPerPage: itemsPerPage
    })
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)
    
  const data = json.data
  dataSize.size = json.data_size

  document.querySelector('div.board-title').querySelector('p').textContent = 'Đơn nhập: ' + dataSize.size

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
        <td>${formatDate(item.purchaseDate)}</td>
        <td>${item.totalProducts}</td>
        <td>${formatNumber(item.totalPurchasePrice)}</td>
        <td><a target="_blank" rel="noopener noreferrer" href="/admin/all-purchases/purchase/${item._id}">Xem</a></td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)
  
  pagination(getPurchases, sortOptions, filterOptions, currentPage, dataSize.size)
}

paginationBtn.onchange = function () {
  const selectedValue = parseInt(paginationBtn.value)
  currentPage.page = 1
  getPurchases(sortOptions, filterOptions, currentPage.page, selectedValue)
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  try {
    await getPurchases(sortOptions, filterOptions, currentPage.page, 10)
    await sortAndFilter(getPurchases, sortOptions, filterOptions, currentPage.page)
    await exportJs()
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})