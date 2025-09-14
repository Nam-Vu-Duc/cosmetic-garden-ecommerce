importLinkCss('/css/admin/all/customers.css')

const thead         = document.querySelector('table').querySelector('thead')
const tbody         = document.querySelector('table').querySelector('tbody')
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
    <label><input type="checkbox" value="_id" checked> Mã Khách hàng</label>
    <label><input type="checkbox" value="name" checked> Tên Khách hàng</label>
    <label><input type="checkbox" value="address" checked> Địa chỉ</label>
    <label><input type="checkbox" value="quantity" checked> S/L Đơn</label>
    <label><input type="checkbox" value="revenue" checked> Tổng doanh thu</label>
    <label><input type="checkbox" value="email"> Email</label>
    <label><input type="checkbox" value="phone"> SDT</label>
    <label><input type="checkbox" value="gender"> Giới tính</label>
    <label><input type="checkbox" value="memberCode"> Hạng thành viên</label>
    <label><input type="checkbox" value="isActive"> Trạng thái</label>
    <label><input type="checkbox" value="dob"> Ngày sinh</label>
    <label><input type="checkbox" value="lastLogin"> Lần đăng nhập cuối</label>
  `
  columnsGroup.insertAdjacentHTML('beforeend', inputList)
} 

async function getFilter() {
  const response = await fetch('/admin/all-customers/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {memberShip, error} = await response.json()
  if (error) return pushNotification(error)

  memberShip.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select#memberCode').appendChild(option)
  })
}

async function getCustomers(sortOptions, filterOptions, currentPage, itemsPerPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-customers/data/customers', {
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

  document.querySelector('div.board-title').querySelector('p').textContent = 'Khách Hàng: ' + dataSize.size

  const selected = Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => ({
    value: cb.value,
    name: cb.closest("label").innerText.trim()
  }))

  window.setTimeout(function() {
    thead.querySelectorAll('tr').forEach((tr, index) => {
      tr.remove()
    })

    // header
    const trHead = document.createElement("tr")

    const headOrder = document.createElement('td')
    headOrder.textContent = 'STT'
    trHead.appendChild(headOrder)

    selected.forEach(col => {
      const td = document.createElement("td")
      td.textContent = col.name
      trHead.appendChild(td)
    })

    const headLink = document.createElement('td')
    headLink.textContent = 'Chi tiết'
    trHead.appendChild(headLink)

    thead.appendChild(trHead)

    // body
    tbody.querySelectorAll('tr').forEach((tr, index) => {
      tr.remove()
    })

    let productIndex = (currentPage - 1) * itemsPerPage + 1

    data.forEach((item, index) => {
      const newTr = document.createElement('tr')

      const order = document.createElement('td')
      order.textContent = productIndex
      newTr.appendChild(order)

      selected.forEach(col => {
        const td = document.createElement("td")
        td.textContent = item[col.value]

        if (['quantity', 'revenue', 'dob', 'lastLogin'].includes(col.value) ) td.style.textAlign = 'right'
        if (['revenue'].includes(col.value)) td.textContent = formatNumber(item[col.value])
        if (['dob', 'lastLogin'].includes(col.value)) td.textContent = formatDate(item[col.value])
        if (['gender'].includes(col.value)) td.textContent = item[col.value] === 'male' ? 'Nam' : 'Nữ'
        if (['isActive'].includes(col.value)) td.textContent = item[col.value] === 'true' ? 'Online' : 'Offline'

        newTr.appendChild(td)
      })

      const link = document.createElement('td')
      link.innerHTML = `<a target="_blank" rel="noopener noreferrer" href="/admin/all-customers/customer/${item._id}">Xem</a>`
      newTr.appendChild(link)
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)
  
  pagination(getCustomers, sortOptions, filterOptions, currentPage, dataSize.size)
}

paginationBtn.onchange = function () {
  const selectedValue = parseInt(paginationBtn.value)
  currentPage.page = 1
  getCustomers(sortOptions, filterOptions, currentPage.page, selectedValue)
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
    await getCustomers(sortOptions, filterOptions, currentPage.page, 10)
    await sortAndFilter(getCustomers, sortOptions, filterOptions, currentPage.page)
    await exportJs('BÁO CÁO DANH SÁCH KHÁCH HÀNG')
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})