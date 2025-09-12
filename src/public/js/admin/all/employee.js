importLinkCss('/css/admin/all/employees.css')

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
  const response = await fetch('/admin/all-employees/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {position, error} = await response.json()
  if (error) return pushNotification(error)

  position.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select#role').appendChild(option)
  })
}

async function getEmployees(sortOptions, filterOptions, currentPage, itemsPerPage) {
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
      itemsPerPage: itemsPerPage
    })
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data, data_size, error} = await response.json()
  if (error) return pushNotification(error)

  dataSize.size = data_size

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
        <td><a target="_blank" rel="noopener noreferrer" href="/admin/all-employees/employee/${item._id}">Xem</a></td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)
  
  pagination(getEmployees, sortOptions, filterOptions, currentPage, dataSize.size)
}

paginationBtn.onchange = function () {
  const selectedValue = parseInt(paginationBtn.value)
  currentPage.page = 1
  getEmployees(sortOptions, filterOptions, currentPage.page, selectedValue)
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
    await getEmployees(sortOptions, filterOptions, currentPage.page, 10)
    await sortAndFilter(getEmployees, sortOptions, filterOptions, currentPage.page)
    await exportJs('BÁO CÁO DANH SÁCH NHÂN SỰ')
  } catch (error){
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})