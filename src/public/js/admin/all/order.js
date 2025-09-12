importLinkCss('/css/admin/all/orders.css')

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
  const response = await fetch('/admin/all-orders/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {orderStatus, paymentMethod, error} = await response.json()
  if (error) return pushNotification(error)

  orderStatus.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select#status').appendChild(option)
  })

  paymentMethod.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select#paymentMethod').appendChild(option)
  })
}

async function getOrders(sortOptions, filterOptions, currentPage, itemsPerPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-orders/data/orders', {
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

  document.querySelector('div.board-title').querySelector('p').textContent = 'Đơn hàng: ' + dataSize.size

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
        <td>${item.customerInfo.name}</td>
        <td style="text-align: right;">${formatNumber(item.totalNewOrderPrice)}</td>
        <td style="text-align: right;">${formatDate(item.createdAt)}</td>
        <td><a target="_blank" rel="noopener noreferrer" href="/admin/all-orders/order/${item._id}">Xem</a></td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)
  
  pagination(getOrders, sortOptions, filterOptions, currentPage, dataSize.size)
}

paginationBtn.onchange = function () {
  const selectedValue = parseInt(paginationBtn.value)
  currentPage.page = 1
  getOrders(sortOptions, filterOptions, currentPage.page, selectedValue)
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
    await getOrders(sortOptions, filterOptions, currentPage.page, 10)
    await sortAndFilter(getOrders, sortOptions, filterOptions, currentPage.page)
    await exportJs('BÁO CÁO DANH SÁCH ĐƠN HÀNG')
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})