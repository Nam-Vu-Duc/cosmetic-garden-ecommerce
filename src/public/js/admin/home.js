importLinkCss('/css/admin/home.css')

async function getFinance(startDate, endDate) {
  const fetchBody = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      startDate: startDate,
      endDate: endDate
    })
  }

  const response = await fetch('/admin/all/data/finance', fetchBody)
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {revenue, cost, wage} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ TÀI CHÍNH</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Doanh thu</td>
        <td>${formatNumber(revenue)}</td>
        <td><a href="/admin/all-brands">Chi tiết</a></td>
      </tr>
      <tr>
        <td>Chi phí hàng hoá</td>
        <td>${formatNumber(cost)}</td>
        <td><a href="/admin/all-brands">Chi tiết</a></td>
      </tr>
      <tr>
        <td>Chi phí lương</td>
        <td>${formatNumber(wage)}</td>
        <td><a href="/admin/all-brands">Chi tiết</a></td>
      </tr>
      <tr>
        <td>Lợi nhuận</td>
        <td>${formatNumber(revenue-cost-wage)}</td>
        <td><a href="/admin/all-brands">Chi tiết</a></td>
      </tr>
    </tbody>
  `

  if (document.querySelector('div.finance').contains(document.querySelector("table"))) {
    document.querySelector("table").remove()
  }

  document.querySelector('div.finance').appendChild(table)
}

async function getBrands() {
  const response = await fetch('/admin/all/data/brands')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ THƯƠNG HIỆU</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng thương hiệu</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-brands">Chi tiết</a></td>
      </tr>
    </tbody>
  `

  document.querySelector('div.brand').appendChild(table)
}

async function getCustomers() {
  const response = await fetch('/admin/all/data/customers')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ KHÁCH HÀNG</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng khách hàng</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-customers">Chi tiết</a></td>
      </tr>
      <tr>
        <td>Hạng bạc</td>
        <td>${data.filter(user => user.memberCode === 'silver').length}</td>
        <td></td>
      </tr>
      <tr>
        <td>Hạng vàng</td>
        <td>${data.filter(user => user.memberCode === 'gold').length}</td>
        <td></td>
      </tr>
      <tr>
        <td>Hạng kim cương</td>
        <td>${data.filter(user => user.memberCode === 'diamond').length}</td>
        <td></td>
      </tr>
    </tbody>
  `

  document.querySelector('div.customer').appendChild(table)

  new Chart(customer, {
    type: 'bar',
    data: {
      labels: Array.from(new Set(data.map(user => formatDate(user.createdAt)))),
      datasets: [{
        label: 'KHÁCH HÀNG THEO THỜI GIAN',
        data: data.map(user => user.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#FFDFDF'
      }]
    }
  })
}

async function getEmployees() {
  const response = await fetch('/admin/all/data/employees')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ NHÂN SỰ</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng nhân sự</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-employees">Chi tiết</a></td>
      </tr>
    </tbody>
  `

  document.querySelector('div.employee').appendChild(table)
}

async function getOrders() {
  const response = await fetch('/admin/all/data/orders')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ ĐƠN HÀNG</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng đơn hàng</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-orders">Chi tiết</a></td>
      </tr>
      <tr>
        <td>Đang chuẩn bị</td>
        <td>${data.filter(order => order.status === 'preparing').length}</td>
        <td></td>
      </tr>
      <tr>
        <td>Đang giao</td>
        <td>${data.filter(order => order.status === 'delivering').length}</td>
        <td></td>
      </tr>
      <tr>
        <td>Hoàn thành</td>
        <td>${data.filter(order => order.status === 'done').length}</td>
        <td></td>
      </tr>
      <tr>
        <td>Đã Huỷ</td>
        <td>${data.filter(order => order.status === 'cancel').length}</td>
        <td></td>
      </tr>
    </tbody>
  `

  document.querySelector('div.order').appendChild(table)

  new Chart(order, {
    type: 'bar',
    data: {
      labels: Array.from(new Set(data.map(order => formatDate(order.createdAt)))),
      datasets: [{
        label: 'ĐƠN HÀNG THEO THỜI GIAN',
        data: data.map(order => order.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#FFDFDF'
      }]
    }
  })
}

async function getProducts() {
  const response = await fetch('/admin/all/data/products')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ SẢN PHẨM</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng sản phẩm</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-products/?page=&type=">Chi tiết</a></td>
      </tr>
      <tr>
        <td>Skincare</td>
        <td>${data.filter(product => product.categories === 'skincare').length}</td>
        <td><a href="/admin/all-products/?page=&type=">Chi tiết</a></td>
      </tr>
      <tr>
        <td>Makeup</td>
        <td>${data.filter(product => product.categories === 'makeup').length}</td>
        <td><a href="/admin/all-products/?page=&type=">Chi tiết</a></td>
      </tr>
    </tbody>
  `

  document.querySelector('div.product').appendChild(table)
}

async function getPurchases() {
  const response = await fetch('/admin/all/data/purchases')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ NHẬP HÀNG</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng đơn nhập</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-purchases">Chi tiết</a></td>
      </tr>
      <tr></tr>
      <tr></tr>
      <tr></tr>
      <tr></tr>
    </tbody>
  `

  document.querySelector('div.purchase').appendChild(table)

  new Chart(purchase, {
    type: 'bar',
    data: {
      labels: Array.from(new Set(data.map(purchase => formatDate(purchase.createdAt)))),
      datasets: [{
        label: 'ĐƠN NHẬP THEO THỜI GIAN',
        data: data.map(purchase => purchase.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#FFDFDF'
      }]
    }
  })
}

async function getStores() {
  const response = await fetch('/admin/all/data/stores')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ CỬA HÀNG</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng cửa hàng</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-stores">Chi tiết</a></td>
      </tr>
    </tbody>
  `

  document.querySelector('div.store').appendChild(table)
}

async function getSuppliers() {
  const response = await fetch('/admin/all/data/suppliers')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data} = await response.json()

  const table = document.createElement('table')
  table.innerHTML = `
    <thead>
      <tr><td colspan="3">QUẢN LÝ NHÀ CUNG CẤP</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng nhà cung cấp</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-suppliers">Chi tiết</a></td>
      </tr>
      <tr></tr>
      <tr></tr>
      <tr></tr>
    </tbody>
  `

  document.querySelector('div.supplier').appendChild(table)

  new Chart(supplier, {
    type: 'bar',
    data: {
      labels: Array.from(new Set(data.map(supplier => formatDate(supplier.createdAt)))),
      datasets: [{
        label: 'NHÀ CUNG CẤP THEO THỜI GIAN',
        data: data.map(supplier => supplier.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#FFDFDF'
      }]
    }
  })
}

async function getAll() {
  try {
    await getFinance()
    await new Promise(r => setTimeout(r, 200))

    await getOrders()
    await new Promise(r => setTimeout(r, 200))

    await getPurchases() 
    await new Promise(r => setTimeout(r, 200))

    await getCustomers()
    await new Promise(r => setTimeout(r, 200))

    await getSuppliers()
    await new Promise(r => setTimeout(r, 200))
    
    await getProducts()
    await new Promise(r => setTimeout(r, 200))

    await getBrands()
    await new Promise(r => setTimeout(r, 200))

    await getStores()
    await new Promise(r => setTimeout(r, 200))

    await getEmployees()    
  } catch (error) {
    console.error('Có lỗi xảy ra:', error)
    pushNotification('Có lỗi xảy ra')
  }
}

document.querySelector('button[type="submit"]').addEventListener('click', async function() {
  const startDate = document.querySelector('input#start-date').value
  const endDate = document.querySelector('input#end-date').value

  if (startDate === '' || endDate === '') return pushNotification('Vui lòng chọn ngày bắt đầu và kết thúc')

  if (new Date(startDate) > new Date(endDate)) return pushNotification('Ngày bắt đầu đang lớn hơn ngày kết thúc')

  await getFinance(startDate, endDate)
})

window.addEventListener('DOMContentLoaded', async function loadData() {
  await getAll()
})