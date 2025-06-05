const checkDay = {message: ''}
const index    = new URL(window.location).pathname.split('/').find(el => el.includes('all')) || []

async function getProfile() {
  const response = await fetch('/admin/all/data/user')
  const json = await response.json()
  if (json.error) return pushNotification(error)
  
  const data =json.data

  if (data.role === 'manager') {
    document.querySelector('a#all-chats').remove()
  }

  if (data.role === 'employee') {
    document.querySelector('a#all-chats').remove()
    document.querySelector('a#all-stores').remove()
    document.querySelector('a#all-employees').remove()
    document.querySelector('a#all-attributes').remove()
  }

  const currentTime = new Date().getHours()
  if      (currentTime <= 9) checkDay.message  = 'buổi sáng'
  else if (currentTime <= 14) checkDay.message = 'buổi trưa'
  else if (currentTime <= 18) checkDay.message = 'buổi chiều'
  else    checkDay.message = 'buổi tối'
  document.getElementById('welcome-text').innerHTML = `Xin chào ${data.name}, Chúc bạn một ${checkDay.message} vui vẻ !!!`
}

document.querySelector('div.admin-button').querySelectorAll('a').forEach((a) => {
  if (index === a.id) return a.style.backgroundColor = '#FFDFDF'
})

document.querySelector('button.resize-button').onclick = function() {
  const adminSidebar = document.querySelector('div.admin-sidebar-container')
  const main = document.querySelector('main')
  const minimize = document.querySelector('i.fi-rr-cross')
  const maximize = document.querySelector('i.fi-rr-menu-burger')

  if (adminSidebar.className.includes('small')) {
    adminSidebar.classList.remove('small')
    main.style.marginLeft = '200px'
    minimize.style.display = 'block'
    maximize.style.display = 'none'
  } else {
    adminSidebar.classList.add('small')
    main.style.marginLeft = '70px'
    minimize.style.display = 'none'
    maximize.style.display = 'block'
  }
}

window.addEventListener('DOMContentLoaded', getProfile)