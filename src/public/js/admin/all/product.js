importLinkCss('/css/admin/all/products.css')

const thead         = document.querySelector('table').querySelector('thead')
const tbody         = document.querySelector('table').querySelector('tbody')
const paginationBtn = document.querySelector('select[name="pagination"]')
const changeColumns = document.querySelector('i.fi.fi-rr-objects-column')
const submitChange  = document.querySelector('button.generate-columns')
const sortOptions   = {}
const filterOptions = { deletedAt: null }
const currentPage   = { page: 1 }
const dataSize      = { size: 0 }
const deleteForm    = document.forms['delete-form']
const deleteButton  = document.getElementById('delete-button')
const formButton    = document.getElementsByClassName('form-button')
var courseId

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
  const response = await fetch('/admin/all-products/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {brand, error} = await response.json()
  if (error) return pushNotification(error)


  brand.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.name
    option.textContent = element.name
    document.querySelector('select#brand').appendChild(option)
  })
}

async function getProducts(sortOptions, filterOptions, currentPage, itemsPerPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-products/data/products', {
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
  const {data, data_size, error} = await response.json()
  if (error) return pushNotification(error)

  dataSize.size = data_size

  document.querySelector('div.board-title').querySelector('p').textContent = 'Sản phẩm: ' + dataSize.size

  window.setTimeout(function() {
    tbody.querySelectorAll('tr').forEach((tr, index) => {
      tr.remove()
    })

    let productIndex = (currentPage - 1) * itemsPerPage + 1

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
        <td style="text-align: right;">${formatNumber(item.purchasePrice)}</td>
        <td style="text-align: right;">${formatNumber(item.price)}</td>
        <td style="text-align: right;">${item.quantity}</td>
        <td style="display: flex; align-items: center; justify-content:center; gap: 5px;">
          <a target="_blank" rel="noopener noreferrer" href="/admin/all-products/product/${item._id}" class="update-button">Xem</a>
          <button class="delete-btn" data-id="${item._id}" data-name="${item.name}">Xoá</button>
        </td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })

    tbody.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id
        const name = e.target.dataset.name
        reply_click(id, name)
      })
    })
  }, 1000)

  pagination(getProducts, sortOptions, filterOptions, currentPage, dataSize.size)
}

function reply_click(clicked_id, clicked_name) {
  console.log('123')
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
  setTimeout(() => window.location.reload(), 2000)
}

paginationBtn.onchange = function () {
  const selectedValue = parseInt(paginationBtn.value)
  currentPage.page = 1
  getProducts(sortOptions, filterOptions, currentPage.page, selectedValue)
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
    await getProducts(sortOptions, filterOptions, currentPage.page, 10)
    await sortAndFilter(getProducts, sortOptions, filterOptions, currentPage.page)
    await exportJs('BÁO CÁO DANH SÁCH SẢN PHẨM')
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})