importLinkCss('/css/admin/detail/order.css')

const urlSlug = location.href.match(/([^\/]*)\/*$/)[1]

async function getOrder() {
  const response = await fetch('/admin/all-orders/data/order', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id: urlSlug})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {error, orderInfo, orderStatuses, paymentMethods} = await response.json()
  if (error) return pushNotification('Có lỗi xảy ra')

  document.title = 'Đơn hàng ' + orderInfo.customerInfo.name

  document.querySelector('input#id').value      = orderInfo._id
  document.querySelector('input#date').value    = formatDate(orderInfo.createdAt) 
  document.querySelector('input#name').value    = orderInfo.customerInfo.name
  document.querySelector('input#phone').value   = orderInfo.customerInfo.phone
  document.querySelector('input#address').value = orderInfo.customerInfo.address
  document.querySelector('input#note').value    = orderInfo.customerInfo.note
  document.querySelector('input#store').value   = orderInfo.store.name

  orderStatuses.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    if (element.code === orderInfo.status) option.selected = true
    
    document.querySelector('select#status').appendChild(option)
  })
  
  paymentMethods.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    if (element.code === orderInfo.paymentMethod) option.selected = true
    
    document.querySelector('select#paymentMethod').appendChild(option)
  })

  document.querySelector('input#total').value = formatNumber(orderInfo.totalOrderPrice)
  document.querySelector('input#new-total').value = formatNumber(orderInfo.totalNewOrderPrice)
  
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

  if (
    paymentMethod === orderInfo.paymentMethod    &&
    status        === orderInfo.status 
  ) return pushNotification('Hãy cập nhật thông tin')

  const response = await fetch('/admin/all-orders/order/updated', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      id            : urlSlug,
      paymentMethod : paymentMethod,
      status        : status
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