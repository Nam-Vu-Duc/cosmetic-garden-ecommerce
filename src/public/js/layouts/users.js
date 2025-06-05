checkUser()
// window.recommend_url = 'http://localhost:8000'
// const socket = io("http://localhost:3100/", {path: "/socket.io"})

window.recommend_url = 'https://bunny-recommendation.onrender.com'
const socket = io("https://bunny-chat.onrender.com/", {path: "/socket.io"})

async function checkUser() {
  const response = await fetch('/data/user')
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const {message, uid} = await response.json()

  window.isLoggedIn = message
  window.uid = uid
}

setInterval(async function () {
  socket.emit('heartbeat', { message: 'user ping' })
  await fetch(window.recommend_url, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  })
}, 30000) // Send a ping every 30 seconds

window.addEventListener('DOMContentLoaded', async function() {
  const preloader = document.querySelector('div.preloader')
  preloader.classList.add('inactive')
})