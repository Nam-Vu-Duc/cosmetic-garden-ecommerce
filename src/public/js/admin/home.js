importLinkCss('/css/admin/home.css')

async function getFinance(fetchBody) {
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
      </tr>
      <tr>
        <td>Chi phí hàng hoá</td>
        <td>${formatNumber(cost)}</td>
      </tr>
      <tr>
        <td>Chi phí lương</td>
        <td>${formatNumber(wage)}</td>
      </tr>
      <tr>
        <td>Lợi nhuận</td>
        <td>${formatNumber(revenue-cost-wage)}</td>
      </tr>
    </tbody>
  `

  if (document.querySelector('div.finance').contains(document.querySelector("table"))) {
    document.querySelector("table").remove()
  }

  document.querySelector('div.finance').appendChild(table)
}

async function getOrders(fetchBody) {
  const response = await fetch('/admin/all/data/orders', fetchBody)
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data, status} = await response.json()

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
    </tbody>
  `

  const orderDiv = document.querySelector('div.order')
  const oldTable = orderDiv.querySelector("table")

  if (oldTable) oldTable.remove()
  orderDiv.appendChild(table)

  const orderStatusCtx = document.getElementById("order-status")
  Chart.getChart(orderStatusCtx)?.destroy()
  new Chart(orderStatusCtx, {
    type: 'doughnut',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'TRẠNG THÁI ĐƠN HÀNG'
        }
      }
    },
    data: {
      labels: Array.from(status.map((status) => status.name)),
      datasets: [{
        data: status.map((status) => {
          return data.filter((order) => order.status === status.code).length
        }),
        borderWidth: 1,
      }]
    }
  })
  
  const orderCtx = document.getElementById("order")
  Chart.getChart(orderCtx)?.destroy()
  new Chart(orderCtx, {
    type: 'bar',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'ĐƠN HÀNG THEO THỜI GIAN'
        }
      }
    },
    data: {
      labels: Array.from(new Set(data.map(order => formatDate(order.createdAt)))),
      datasets: [{
        data: data.map(order => order.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#4E79A7'
      }]
    }
  })
}

async function getCustomers(fetchBody) {
  const response = await fetch('/admin/all/data/customers', fetchBody)
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data, members} = await response.json()

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
    </tbody>
  `

  const customerDiv = document.querySelector('div.customer')
  const oldTable = customerDiv.querySelector("table")

  if (oldTable) oldTable.remove()
  customerDiv.appendChild(table)

  const customerMembershipCtx = document.getElementById("customer-membership")
  Chart.getChart(customerMembershipCtx)?.destroy()
  new Chart(customerMembershipCtx, {
    type: 'pie',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'HẠNG THÀNH VIÊN'
        }
      }
    },
    data: {
      labels: Array.from(members.map((member) => member.name)),
      datasets: [{
        data: members.map((member) => {
          return data.filter((user) => user.memberCode === member.code).length
        }),
        borderWidth: 1,
      }]
    }
  })

  const customerCtx = document.getElementById("customer")
  Chart.getChart(customerCtx)?.destroy()
  new Chart(customerCtx, {
    type: 'bar',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'KHÁCH HÀNG THEO THỜI GIAN'
        }
      }
    },
    data: {
      labels: Array.from(new Set(data.map(user => formatDate(user.createdAt)))),
      datasets: [{
        data: data.map(user => user.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#F28E2B'
      }]
    }
  })
}

async function getEmployees(fetchBody) {
  const response = await fetch('/admin/all/data/employees', fetchBody)
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data, positions} = await response.json()

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

  const employeeDiv = document.querySelector('div.employee')
  const oldTable = employeeDiv.querySelector("table")

  if (oldTable) oldTable.remove()
  employeeDiv.appendChild(table)

  const employeeRoleCtx = document.getElementById("employee-role")
  Chart.getChart(employeeRoleCtx)?.destroy()
  new Chart(employeeRoleCtx, {
    type: 'doughnut',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'VỊ TRÍ NHÂN SỰ'
        }
      }
    },
    data: {
      labels: Array.from(positions.map((position) => position.name)),
      datasets: [{
        data: positions.map((position) => {
          return data.filter((user) => user.role === position.code).length
        }),
        borderWidth: 1,
      }]
    }
  })

  const employeeCtx = document.getElementById("employee")
  Chart.getChart(employeeCtx)?.destroy()
  new Chart(employeeCtx, {
    type: 'bar',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'NHÂN SỰ THEO THỜI GIAN'
        }
      }
    },
    data: {
      labels: Array.from(new Set(data.map(user => formatDate(user.createdAt)))),
      datasets: [{
        data: data.map(user => user.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#E15759'
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
    </tbody>
  `

  const productDiv = document.querySelector('div.product')
  const oldTable = productDiv.querySelector("table")

  if (oldTable) oldTable.remove()
  productDiv.appendChild(table)

  const productCtx = document.getElementById("product")
  Chart.getChart(productCtx)?.destroy()
  new Chart(productCtx, {
    type: 'bar',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'SẢN PHẨM THEO DANH MỤC'
        }
      }
    },
    data: {
      labels: ['Skincare', 'Makeup'],
      datasets: [{
        data: [
          data.filter(product => product.categories === 'skincare').length, 
          data.filter(product => product.categories === 'makeup').length
        ],
        borderWidth: 1,
        backgroundColor: '#76B7B2'
      }]
    }
  })

  const productCategoryCtx = document.getElementById("product-category")
  Chart.getChart(productCategoryCtx)?.destroy()
  new Chart(productCategoryCtx, {
    type: 'pie',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'TỈ LỆ DOANH THU'
        }
      }
    },
    data: {
      labels: ['Skincare', 'Makeup'],
      datasets: [{
        data: [
          data.filter(product => product.categories === 'skincare').reduce((acc, product) => acc + product.price * product.saleNumber, 0), 
          data.filter(product => product.categories === 'makeup').reduce((acc, product) => acc + product.price * product.saleNumber, 0)
        ],
        borderWidth: 1,
      }]
    }
  })
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
    </tbody>
  `

  document.querySelector('div.supplier').appendChild(table)

  new Chart(supplier, {
    type: 'bar',
    options: {
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'NHÀ CUNG CẤP THEO THỜI GIAN'
        }
      }
    },
    data: {
      labels: Array.from(new Set(data.map(supplier => formatDate(supplier.createdAt)))),
      datasets: [{
        data: data.map(supplier => supplier.createdAt).reduce((acc, date) => {
          const formattedDate = formatDate(date)
          acc[formattedDate] = (acc[formattedDate] || 0) + 1
          return acc
        }, {}),
        borderWidth: 1,
        backgroundColor: '#59A14F'
      }]
    }
  })
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

async function getPurchases(fetchBody) {
  const response = await fetch('/admin/all/data/purchases', fetchBody)
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
    </tbody>
  `

  const purchaseDiv = document.querySelector('div.purchase')
  const oldTable = purchaseDiv.querySelector("table")

  if (oldTable) oldTable.remove()
  purchaseDiv.appendChild(table)

  const purchaseCtx = document.getElementById("purchase")
  Chart.getChart(purchaseCtx)?.destroy()
  new Chart(purchaseCtx, {
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
        backgroundColor: '#5ab868'
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
      <tr><td colspan="3">QUẢN LÝ ĐẠI LÝ</td></tr>
    </thead>
    <tbody>
      <tr>
        <td>Số lượng đại lý</td>
        <td>${data.length}</td>
        <td><a href="/admin/all-stores">Chi tiết</a></td>
      </tr>
    </tbody>
  `

  document.querySelector('div.store').appendChild(table)
}

async function getAll() {
  try {
    const date = new Date();
    const y = date.getFullYear()
    const m = date.getMonth()

    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)

    const formatDate = (d) => {
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${month}-${day}`
    };

    const startDate = document.querySelector('input#start-date')
    const endDate   = document.querySelector('input#end-date')

    startDate.value =  formatDate(firstDay)
    endDate.value   =  formatDate(lastDay)

    const fetchBody = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        startDate: firstDay,
        endDate: lastDay
      })
    }

    await getFinance(fetchBody)
    await getOrders(fetchBody)
    await getCustomers(fetchBody)
    await getEmployees(fetchBody)
    await getSuppliers()
    await getProducts()
    await getStores()
    // await getPurchases(fetchBody)
    // await getBrands()
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

  const fetchBody = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      startDate: startDate,
      endDate: endDate
    })
  }
  await getFinance(fetchBody)
  await getOrders(fetchBody)
  await getCustomers(fetchBody)
  await getEmployees(fetchBody)
  // await getPurchases(fetchBody)
})

window.addEventListener('DOMContentLoaded', async function loadData() {
  await getAll()
})