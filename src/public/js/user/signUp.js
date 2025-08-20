importLinkCss('/css/layouts/signIn.css')

const client = new Appwrite.Client()
  .setEndpoint("https://syd.cloud.appwrite.io/v1")
  .setProject("68a4957600115808485e")

const account = new Appwrite.Account(client)
const databases = new Appwrite.Databases(client)

async function googleRedirect() {
  try {
    document.querySelector('button.google-sign-in').classList.add('loading')
    
    try {
      await account.get() 
      await account.deleteSession("current")
      console.log("Existing session cleared")
    } catch (err) {
      console.log("No existing session, skipping delete")
    }
    
    account.createOAuth2Session(
      'google', 
      'http://localhost:3000/authentication/sign-up?signup=google',
      'http://localhost:3000/failed'
    )
  } catch (error) {
    console.error('Google sign-in error:', error)
  }
}

async function signUp(email, password, name) {
  try {
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    )
    console.log("User created:", user)
  } catch (err) {
    console.error(err)
  }
}

const submitButton = document.querySelector('button')

async function verifyingEmail(email) {
  try {
    const response = await fetch("/authentication/sign-up/verifying-email", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: email,
      })
    })
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    const json = await response.json()
    return { isValid: json.isValid, message: json.message }
  } catch (error) {
    pushNotification(`Error verifying email: ${error}`)
  }
}

async function verifyingCode(email, code) {
  try {
    const response = await fetch('/authentication/sign-up/verifying-code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: email,
        code : code
      })
    })
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    const json = await response.json()
    return json.message
  } catch (error) {
    pushNotification(`Error verifying code: ${error}`) 
  }
}

async function creatingAccount(email, name, password) {
  try {
    const response = await fetch('/authentication/creating-account', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email    : email,
        name     : name,
        password : password
      })
    })
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    const {isSuccessful, message} = await response.json()
    return { isSuccessful: isSuccessful, message: message }
  } catch (error) {
    pushNotification(`Error creating account: ${error}`)
  }
}

submitButton.onclick = async function() {
  submitButton.classList.add('loading')
  if (submitButton.className.includes('email')) {
    const email = document.querySelector('input#email').value
    if (email.trim() === '') {
      document.querySelector('p.wrong-info').textContent = 'Email không được để trống'
      document.querySelector('p.wrong-info').style.color = 'red'
      submitButton.classList.remove('loading')
      return
    }
    const {isValid, message} = await verifyingEmail(email) 
    if (!isValid) {
      document.querySelector('p.wrong-info').textContent = message
      document.querySelector('p.wrong-info').style.color = 'red'

      submitButton.classList.remove('loading')
      return
    }
    
    document.querySelector('input#email').setAttribute('disabled', true)
    document.querySelector('p.wrong-info').textContent = message
    document.querySelector('p.wrong-info').style.color = 'green'

    const inputCode = document.createElement('input')
    inputCode.type  = 'text'
    inputCode.placeholder = 'Nhập mã xác nhận'
    inputCode.name  = 'code'

    document.querySelector('div[class="form-group code"]').style.display = ''
    document.querySelector('div[class="form-group code"]').appendChild(inputCode)

    submitButton.innerText = 'Gửi mã xác nhận'
    submitButton.className = 'submit-code'
    submitButton.classList.remove('loading')
    return
  }
  if (submitButton.className.includes('code')) {
    const email = document.querySelector('input#email').value
    const code = document.querySelector('input[name="code"]').value
    const isVerify = await verifyingCode(email, code)
    if (!isVerify) {
      document.querySelector('p.wrong-info').textContent = 'Mã không chính xác'
      document.querySelector('p.wrong-info').style.color = 'red'
      submitButton.classList.remove('loading')
      return
    }

    document.querySelector('input[name="code"]').remove()

    const name = document.createElement('input')
    name.type  = 'text'
    name.placeholder = 'Nhập tên của bạn'
    name.name  = 'name'

    const password = document.createElement('input')
    password.type  = 'password'
    password.placeholder = 'Nhập mật khẩu mới'
    password.name  = 'password'

    const confirmPassword = document.createElement('input')
    confirmPassword.type  = 'password'
    confirmPassword.placeholder = 'Xác nhận mật khẩu'
    confirmPassword.name  = 'confirm-password'

    document.querySelector('div[class="form-group name"]').style.display = ''
    document.querySelector('div[class="form-group name"]').appendChild(name)

    document.querySelector('div[class="form-group password"]').style.display = ''
    document.querySelector('div[class="form-group password"]').appendChild(password)
    
    document.querySelector('div[class="form-group confirm-password"]').style.display = ''
    document.querySelector('div[class="form-group confirm-password"]').appendChild(confirmPassword)

    submitButton.innerText = 'Xác nhận'
    submitButton.className = 'submit-password'
    submitButton.classList.remove('loading')

    document.querySelector('p.wrong-info').textContent = ''
    return
  }
  if (submitButton.className.includes('password')) {
    const email    = document.querySelector('input[name="email"]').value
    const name     = document.querySelector('input[name="name"]').value
    const password = document.querySelector('input[name="password"]').value
    const confirmPassword = document.querySelector('input[name="confirm-password"]').value

    if (password.trim() === '') return pushNotification('Mật khẩu đang trống')
    if (password !== confirmPassword) return pushNotification('Mật khẩu không khớp')

    const {isSuccessful, message} = await creatingAccount(email, name, password)
    if (isSuccessful) {
      document.querySelector('p.wrong-info').textContent = ''
      pushNotification(message)

      setTimeout(() => {
        window.location.replace(window.location.origin + '/authentication/sign-in')
      }, 1000)
    } 

    submitButton.classList.remove('loading')
    return
  }
}

window.onload = async () => {
  const params = new URLSearchParams(window.location.search)
  const signup = params.get("signup")

  if (signup === "google") {
    try {
      const user = await account.get()
      pushNotification("Đang kiểm tra tài khoản")

      const response = await fetch("/authentication/creating-google-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name
        }),
      })
      if (!response.ok) throw new Error(`Response status: ${response.status}`)
      const {isValid, message} = await response.json()

      if (!isValid) {
        document.querySelector('p.wrong-info').textContent = message
        document.querySelector('p.wrong-info').style.color = 'red'
        return 
      } 
      document.querySelector('p.wrong-info').textContent = ''
      pushNotification(message) 

      window.isLoggedIn = true

      setTimeout(() => {
        const path = window.location.origin
        window.location.replace(path + '/home')
      }, 1000)

    } catch (err) {
      console.error("Failed to get user:", err)
    }
  }
}

document.querySelector("button.google-sign-up").addEventListener("click", googleRedirect)