const scrollTop   = document.querySelector('div.scroll-to-top-icon')
const dropup      = document.querySelector('div.dropup')
const chat        = document.querySelector('div.chat-icon')

const chatBox     = document.querySelector('div.chat-box')
const minimize    = chatBox.querySelector('div.minimize')
const chatHeader  = chatBox.querySelector('div.chat-header')
const chatBody    = chatBox.querySelector('div.chat-body')
const chatContent = chatBox.querySelector('ul.chat-content')
const input       = chatBox.querySelector('textarea.input')
const sendBtn     = chatBox.querySelector('div.send-btn')
const notLoggedIn = chatBox.querySelector('div.not-logged-in')
const form        = chatBox.querySelector('form.input-form')

checkUser()

async function checkUser() {
  // Wait until window.isLoggedIn is assigned
  while (typeof window?.isLoggedIn === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  if (window.isLoggedIn) {
    chatBody.style.display     = ''
    chatHeader.style.opacity   = '1'
    socket.emit('joinRoom', {id: window.uid, room: window.uid})
  }
}

window.addEventListener('scroll', function() {
  document.documentElement.scrollTop >= 1000 ? scrollTop.style.display = "" : scrollTop.style.display = "none"
})
scrollTop.onclick = function() {
  window.scrollTo({top: 0, behavior: "smooth"})
}

async function getChatData() {
  try {
    const response = await fetch(`/api/chat/${window.uid}`)
    if (!response.ok) throw new Error(`Response status: ${response.status}`)

    const json = await response.json();
    const messages = json.data
    if (messages.length === 0) return
    chatContent.replaceChildren()
    messages.forEach((message) => {
      const chat = document.createElement('li')
      const date = document.createElement('li')

      chat.textContent = message.content 
      date.textContent = formatDateTime(message.createdAt)
      date.style.display = 'none'

      chat.onclick = function() {
        date.style.display === 'none' ? date.style.display = 'block' : date.style.display = 'none'
      }

      if (message.senderId === window.uid) {
        chat.setAttribute('class', 'right-content')
        date.setAttribute('class', 'right-date')
      } else {
        chat.setAttribute('class', 'left-content')
        date.setAttribute('class', 'left-date')
      }
 
      chatContent.appendChild(chat)
      chatContent.appendChild(date)
    })
    chatContent.scrollTo(0, chatContent.scrollHeight)
  } catch (error) {
    console.error("Error fetching chat data:", error)
  }
}

// icon 
var isUsed = false
chat.onclick = function() {
  if (chatBox.style.display === 'none') {
    chatBox.style.display = 'block'
    if (isUsed) {
      chatBox.style.right = '370px'
    } else {
      chatBox.style.right = '60px'
      isUsed = true
    }
    if (window.isLoggedIn) getChatData()
  } else {
    chatBox.style.display = 'none'
    chatBox.style.right === '60px' ? isUsed = false : ''
  } 
}

// minimize button
minimize.onclick = function () {
  chatBox.style.display = 'none'
  chatBox.style.right === '60px' ? isUsed = false : isUsed = true
} 
  
// send message
sendBtn.onclick = async function() {
  try {
    if (input.value.trim() !== '') {
      socket.emit('privateMessage', { room: window.uid, message: `${window.uid}:${input.value}` })
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({value: input.value})
      })
      if (!response.ok) throw new Error(`Response status: ${response.status}`)
      input.value = ''
      sendBtn.classList.add('not-allowed')
      chatContent.scrollTo(0, chatContent.scrollHeight)
    }
  } catch (error) {
    console.log(error)
  }
}

// input event
input.addEventListener('input', function() {
  if (input.value.trim() !== '') sendBtn.classList.remove('not-allowed') 
  else sendBtn.classList.add('not-allowed')
})

// submit event
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter" && input.value.trim() !== '') {
    sendBtn.click()
  }
})


socket.on('chat-message', async function(id, msg, room) {
  const chat = document.createElement('li')
  const date = document.createElement('li')
  
  chat.textContent = msg
  date.textContent = formatDateTime(new Date())
  date.style.display = 'none'

  chat.onclick = function() {
    date.style.display === 'none' ? date.style.display = 'block' : date.style.display = 'none'
  }

  if (id.trim() === window.uid) {
    chat.setAttribute('class', 'right-content')
    date.setAttribute('class', 'right-date')
  } else {
    chat.setAttribute('class', 'left-content')
    date.setAttribute('class', 'left-date')
  }

  chatContent.appendChild(chat)
  chatContent.appendChild(date)
  chatContent.scrollTo(0, chatContent.scrollHeight)

  const response = await fetch('/data/notification', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      message: msg,
      type: 'message',
      userId: id
    })
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
})