importLinkCss('/css/admin/detail/order.css')

const urlSlug = location.href.match(/([^\/]*)\/*$/)[1]

async function getOrder() {
  const response = await fetch('/admin/all-orders/data/order', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id: urlSlug})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {error, orderInfo, orderStatuses, paymentMethods, userRole} = await response.json()
  if (error) return pushNotification('Có lỗi xảy ra')

  document.title = 'Đơn hàng ' + orderInfo.customerInfo.name

  document.querySelector('input#id').value      = orderInfo._id
  document.querySelector('input#date').value    = formatDate(orderInfo.createdAt) 
  document.querySelector('input#name').value    = orderInfo.customerInfo.name
  document.querySelector('input#phone').value   = orderInfo.customerInfo.phone
  document.querySelector('input#address').value = orderInfo.customerInfo.address
  document.querySelector('input#note').value    = orderInfo.customerInfo.note

  orderStatuses.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    option.disabled = true
    if (element.code === orderInfo.status) option.selected = true
    if (userRole === 'employee' && element.code === 'preparing') option.disabled = false
    if (userRole === 'merchandise' && element.code === 'out_for_delivery') option.disabled = false
    if (userRole === 'shipper' && element.code === 'delivering') option.disabled = false
    if (userRole === 'shipper' && element.code === 'delivered') option.disabled = false
    if (userRole === 'manager' && element.code === 'cancel') option.disabled = false
    if (userRole === 'admin') option.disabled = false

    document.querySelector('select#status').appendChild(option)
  })
  
  paymentMethods.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    option.disabled = true
    if (element.code === orderInfo.paymentMethod) option.selected = true
    
    document.querySelector('select#paymentMethod').appendChild(option)
  })

  document.querySelector('input#total').value = formatNumber(orderInfo.totalOrderPrice)
  document.querySelector('input#new-total').value = formatNumber(orderInfo.totalNewOrderPrice)
  document.querySelector('input#isRated').value = orderInfo.isRated ? 'Đã đánh giá' : 'Chưa đánh giá'

  document.querySelector('select#isPaid').value = orderInfo.isPaid
  if (userRole === 'admin' || userRole === 'accountant') {
    document.querySelector('select#isPaid').querySelectorAll('option').forEach((option) => option.disabled = false)
  }

  const submitButton = document.querySelector('button[type="submit"]')
  if (orderInfo.status === 'done' || orderInfo.status === 'cancel') {
    document.querySelector('select#paymentMethod').disabled = true
    document.querySelector('select#paymentMethod').style.cursor = 'not-allowed'
    
    document.querySelector('select#status').disabled = true
    document.querySelector('select#status').style.cursor = 'not-allowed'
    submitButton.style.display = 'none'
  }

  orderInfo.products.forEach((product) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td></td>
      <td style="
        display: flex; 
        justify-content: start;
        align-items: center;
        gap: 5px"
      >
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.name}
      </td>
      <td>${product.quantity}</td>
      <td>${formatNumber(product.price)}</td>
      <td><a href="/admin/all-products/product/${product.id}">Xem</a></td>
    `
    document.querySelector('table#table-2').querySelector('tbody').appendChild(tr)
  })

  return orderInfo
}

async function updateOrder(orderInfo) {
  const paymentMethod  = document.querySelector('select#paymentMethod').value
  const status         = document.querySelector('select#status').value
  const isPaid         = document.querySelector('select#isPaid').value

  if (
    paymentMethod === orderInfo.paymentMethod    &&
    status        === orderInfo.status           &&
    isPaid        === orderInfo.isPaid
  ) return pushNotification('Hãy cập nhật thông tin')

  const response = await fetch('/admin/all-orders/order/updated', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id            : urlSlug,
      paymentMethod : paymentMethod,
      status        : status,
      isPaid        : isPaid
    })
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {error, message} = await response.json()
  if (error) return pushNotification(error)
  pushNotification(message)

  setTimeout(() => window.location.reload(), 3000)
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  try {
    const orderInfo = await getOrder()

    document.querySelector('button[type="submit"]').onclick = function() {
      updateOrder(orderInfo)
    }
  } catch (error) {
    console.error('Có lỗi xảy ra:', error)
    pushNotification('Có lỗi xảy ra')
  }
})