const notificationIcon = document.querySelector('div.admin-notification')
const notificationBody = document.querySelector('div.notification-box')

notificationIcon.onclick = function() {
  notificationBody.style.display = notificationBody.style.display === 'none' ? 'block' : 'none'
}

async function getNotification() {
  const response = await fetch('/admin/all/data/notification', {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {data, error} = await response.json()
  if (error) return pushNotification(error)

  data.forEach((item, index) => {
    const newTr = document.createElement('tr')
    newTr.innerHTML = `
      <td>${productIndex}</td>
      <td>${item._id}</td>
      <td>${item.name}</td>
      <td>${item.address}</td>
      <td>${item.quantity}</td>
      <td>${formatNumber(item.revenue)}</td>
      <td><a href="/admin/all-customers/customer/${item._id}">Xem</a></td>
    `
    tbody.appendChild(newTr)
    productIndex++
  })
}