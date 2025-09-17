importLinkCss('/css/admin/all/stores.css')

const tbody         = document.querySelector('table').querySelector('tbody')
const thead         = document.querySelector('table').querySelector('thead')
const paginationBtn = document.querySelector('select[name="pagination"]')
const changeColumns = document.querySelector('i.fi.fi-rr-objects-column')
const submitChange  = document.querySelector('button.generate-columns')
const sortOptions   = {}
const filterOptions = {}
const currentPage   = { page: 1 }
const dataSize      = { size: 0 }

function generateColumns() {
  const columnsGroup = document.querySelector('div.checkbox-group')
  const inputList = `
    <label><input type="checkbox" value="_id" checked> Mã đại lý</label>
    <label><input type="checkbox" value="name" checked> Tên đại lý</label>
    <label><input type="checkbox" value="address" checked> Địa chỉ</label>
    <label><input type="checkbox" value="details" > Chi tiết</label>
    <label><input type="checkbox" value="revenue" checked> Tổng doanh thu</label>
  `
  columnsGroup.insertAdjacentHTML('beforeend', inputList)
} 

async function getFilter() {
  const response = await fetch('/admin/all-customers/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {error} = await response.json()
  if (error) return pushNotification(error)
}

async function getStores(sortOptions, filterOptions, currentPage, itemsPerPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-stores/data/stores', {
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
  const {data, data_size, error} = await response.json()
  if (error) return pushNotification(error)

  dataSize.size = data_size

  document.querySelector('div.board-title').querySelector('p').textContent = 'đại lý: ' + dataSize.size

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
        <td>${item.address}</td>
        <td style="text-align: right;">${formatNumber(item.revenue)}</td>
        <td><a target="_blank" rel="noopener noreferrer" href="/admin/all-stores/store/${item._id}">Xem</a></td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)
  
  pagination(getStores, sortOptions, filterOptions, currentPage, dataSize.size)
}

paginationBtn.onchange = function () {
  const selectedValue = parseInt(paginationBtn.value)
  currentPage.page = 1
  getStores(sortOptions, filterOptions, currentPage.page, selectedValue)
}

changeColumns.onclick = function() {
  const columnLists = document.querySelector('div.checkbox-group')
  columnLists.style.display === 'none' ? columnLists.style.display = 'block' : columnLists.style.display = 'none'
}

submitChange.onclick = async function() {
  await getCustomers(sortOptions, filterOptions, currentPage.page, 10)
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  try {
    generateColumns()
    await getFilter()
    await getStores(sortOptions, filterOptions, currentPage.page, 10)
    await sortAndFilter(getStores, sortOptions, filterOptions, currentPage.page)
    await exportJs('BÁO CÁO DANH SÁCH ĐẠI LÝ')
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})