// window.recommend_url = 'http://localhost:8000'
// const socket = io("http://localhost:3100/", {path: "/socket.io"})

window.recommend_url = 'https://bunny-recommendation.onrender.com'
const socket = io("https://bunny-chat.onrender.com/", {path: "/socket.io"})

setInterval(async function () {
  socket.emit('heartbeat', { message: 'admin ping' })
  await fetch(window.recommend_url, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })
}, 30000) // Send a ping every 30 seconds


async function checkRole() {
  try {
    const response = await fetch('/admin/all/data/notification', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        message: `Bạn có đơn hàng mới: ${id}`,
        type: 'order'
      })
    })
    const {data, error} = await response.json()
    if (error) throw new Error('error')
    return data.role
  } catch (error) {

  }
}

socket.on('order', async function() {
  const role = await checkRole()
  if (role === 'employee') pushNotification('Bạn có tin nhắn mới')
})

socket.on('account', () => {
  pushNotification('Bạn có khách hàng mới')
})

socket.on('chat-message', async function() {
  const role = await checkRole()
  if (role === 'chat') pushNotification('Bạn có tin nhắn mới')
})

socket.on('privateMessageEmp', () => {
  pushNotification('Bạn có tin nhắn mới')
})

window.addEventListener('load', () => {
  const preloader = document.querySelector('div.preloader')
  preloader.classList.add('inactive')
})