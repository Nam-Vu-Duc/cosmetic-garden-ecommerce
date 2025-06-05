// ok
importLinkCss('/css/user/profile.css')

const content       = document.querySelector('div.profile-container').querySelector('div.content')
const infoBtn       = document.querySelector('span.profile')
const orderBtn      = document.querySelector('span.order')
const rateOrderBtn  = document.querySelector('span.rate-order')
const feedbackBtn   = document.querySelector('span.feedBack')
const urlSlug       = location.href.match(/([^\/]*)\/*$/)[1]

function resetFormat(button) {
  document.querySelector('div.tag').querySelectorAll('span').forEach((span) => {
    span.classList.remove('current')
  })
  button.classList.add('current')
}

function resetContent() {
  document.querySelector('div.content').querySelector('div').remove()
}

async function getUser() {
  const response = await fetch('/profile/data/user', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ id: urlSlug})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data, member} = await response.json()

  const p = document.createElement('p')
  p.textContent = 'Thông Tin Cá Nhân'

  const form = document.createElement('form')
  form.innerHTML = `
    <div class="form-group">
      <label for="name">Tên Khách Hàng</label>
      <input type="text" name="name" value="${data.name}">
    </div>

    <div class="form-group">
      <label for="gender">Giới tính</label>
      <div>
        <input type="radio" name="gender" value="male">
        <label for="gender">Nam</label>
        
        <input type="radio" name="gender" value="female">
        <label for="gender">Nữ</label>
      </div>
    </div>

    <div class="form-group">
      <label for="name">Email khách hàng</label>
      <input type="text" name="email" value="${data.email}" disabled>
    </div>

    <div class="form-group">
      <label for="phone">Số điện thoại</label>
      <input type="text" name="phone" value="${data.phone}">
    </div>

    <div class="form-group">
      <label for="address">Địa chỉ nhận hàng</label>
      <input type="text" name="address" value="${data.address}">
    </div>
    
    <div class="form-group">
      <label for="address">Số lượng đơn hàng hoàn thành</label>
      <input type="text" name="quantity" value="${data.quantity}" disabled>
    </div>
    
    <div class="form-group">
      <label for="address">Tổng chi tiêu</label>
      <input type="text" name="revenue" value="${formatNumber(data.revenue) }" disabled>
    </div>

    <div class="form-group">
      <label for="member">Hạng thành viên</label>
      <input type="text" name="member" value="${member.name}" disabled>
    </div>
    
    <div class="form-group">
      <label for="address">Ngày tạo tài khoản</label>
      <input type="text" name="createdAt" value="${formatDate(data.createdAt)}" disabled>
    </div>
  `
  form.querySelectorAll('input[name="gender"]').forEach((input) => {
    if (input.value === data.gender) input.checked = true
  })

  const submitButton = document.createElement('div')
  submitButton.classList.add('submit-button')

  const button = document.createElement('button')
  button.type = 'submit'
  button.textContent = 'Cập Nhật'
  button.onclick = async function updateUser() {
    const name    = document.querySelector('input[name="name"]').value
    const gender  = document.querySelector('input[name="gender"]:checked').value
    const phone   = document.querySelector('input[name="phone"]').value
    const address = document.querySelector('input[name="address"]').value

    if (
      name    === data.name    &&
      phone   === data.phone   &&
      address === data.address &&
      gender  === data.gender
    ) return pushNotification('Hãy cập nhật thông tin')

    const response = await fetch('/profile/updated', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id      : data._id,
        name    : name,
        gender  : gender,
        phone   : phone,
        address : address
      })
    })

    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    const {isValid, message} = await response.json()
    pushNotification(message)

    if (!isValid) return
    setTimeout(() => window.location.reload(), 3000)
  }
  submitButton.appendChild(button)

  const div = document.createElement('div')
  div.appendChild(p)
  div.appendChild(form)
  div.appendChild(submitButton)

  content.appendChild(div)

  document.querySelector('span.user-name').textContent = data.name
}

async function getOrders() {
  const response = await fetch('/profile/data/orders', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ id: urlSlug})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  const data = json.data

  const thead = document.createElement('thead')
  thead.innerHTML = `
    <tr>
      <td style="width: 25%">Người Nhận</td>
      <td style="width: 25%">Tổng Tiền</td>
      <td style="width: 20%">Ngày</td>
      <td style="width: 15%">Tình Trạng</td>
      <td style="width: 15%"></td>
    </tr>
  `

  const tbody = document.createElement('tbody')
  data.forEach((order) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${order.customerInfo.name}</td>
      <td>${formatNumber(order.totalNewOrderPrice)}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${order.orderStatus.name}</td>
      <td><a href="/all-orders/order/${order._id}">Chi Tiết</a></td>
    `
    tbody.appendChild(tr)
  })

  const table = document.createElement('table')
  table.appendChild(thead)
  table.appendChild(tbody)

  const p = document.createElement('p')
  p.textContent = 'Thông Tin Đơn Hàng'

  const div = document.createElement('div')
  div.appendChild(p)
  div.appendChild(table)

  content.appendChild(div)
}

async function getDoneOrders() {
  const response = await fetch('/profile/data/done-orders', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ id: urlSlug})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  const data = json.data

  const thead = document.createElement('thead')
  thead.innerHTML = `
    <tr>
      <td style="width: 25%">Người Nhận</td>
      <td style="width: 25%">Tổng Tiền</td>
      <td style="width: 20%">Ngày</td>
      <td style="width: 15%">Tình Trạng</td>
      <td style="width: 15%"></td>
    </tr>
  `

  const tbody = document.createElement('tbody')
  data.forEach((order) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${order.customerInfo.name}</td>
      <td>${formatNumber(order.totalOrderPrice)}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>${order.orderStatus.name}</td>
      <td><a href="/all-orders/order/rate/${order._id}">Chi Tiết</a></td>
    `
    tbody.appendChild(tr)
  })

  const table = document.createElement('table')
  table.appendChild(thead)
  table.appendChild(tbody)

  const p = document.createElement('p')
  p.textContent = 'Đánh giá Đơn Hàng'

  const div = document.createElement('div')
  div.appendChild(p)
  div.appendChild(table)

  content.appendChild(div)
}

async function getFeedback() {
  const p = document.createElement('p')
  p.textContent = 'Góp ý'

  const form = document.createElement('form')
  form.innerHTML = `
    <div class="form-group">
      <label for="phone">Bạn có góp ý gì cho mình thì điền vô đây nha</label>
      <input 
        type="text" 
        class="form-control" 
        id="phone" 
        name="phone" 
      >
    </div>
  `

  const submitButton = document.createElement('div')
  submitButton.classList.add('submit-button')
  submitButton.innerHTML = `
    <button type="submit">Cập Nhật</button>
  `

  const div = document.createElement('div')
  div.appendChild(p)
  div.appendChild(form)
  div.appendChild(submitButton)

  content.appendChild(div)

}

infoBtn.onclick = function() {
  if (infoBtn.classList.contains('current')) return
  resetFormat(infoBtn)
  resetContent()
  getUser()
}

orderBtn.onclick = function() {
  if (orderBtn.classList.contains('current')) return
  resetContent()
  resetFormat(orderBtn)
  getOrders()
}

rateOrderBtn.onclick = function() {
  if (rateOrderBtn.classList.contains('current')) return
  getDoneOrders()
  resetFormat(rateOrderBtn)
  resetContent()
}

feedbackBtn.onclick = function() {
  resetFormat(feedbackBtn)
  resetContent()
  getFeedback()
}

async function loadData(retriesLeft) {
  try {
    getUser()
    resetFormat(infoBtn)
  } catch (err) {
    if (retriesLeft > 1) {
      console.error(`Retrying... Attempts left: ${retriesLeft - 1}`)
      pushNotification('Error loading data. Retrying...')
      window.setTimeout(async function() {
        loadData(retriesLeft - 1)
      }, 2000)
    } else {
      console.error("Failed to fetch products after multiple attempts:", err)
      pushNotification(`Error loading data: ${err}. Please try again later`)
    }
  }
}

window.addEventListener('DOMContentLoaded', function () {
  loadData(5)
})