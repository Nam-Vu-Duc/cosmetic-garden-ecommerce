importLinkCss('/css/admin/create/employee.css')

const submitButton = document.querySelector('button[type="submit"]')

async function getPositions() {
  const response = await fetch('/admin/all-employees/data/positions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)

  json.data.forEach((element) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select[name="role"]').appendChild(option) 
  })

  return
}

async function getStores() {
  const response = await fetch('/admin/all-employees/data/stores', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)

  json.data.forEach((element) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select[name="storeCode"]').appendChild(option) 
  })

  return
}

async function createEmployee() {
  try {
    const role      = document.querySelector('select[name="role"]').value
    const storeCode = document.querySelector('select[name="storeCode"]').value
    const name      = document.querySelector('input#name').value
    const email     = document.querySelector('input#email').value
    const phone     = document.querySelector('input#phone').value
    const address   = document.querySelector('input#address').value
    const password  = document.querySelector('input#password').value
  
    if (
      !name     || 
      !email    || 
      !phone    || 
      !address  || 
      !password || 
      !role     || 
      !storeCode
    ) {
      pushNotification("Hãy điền đầy đủ các thông tin!")
      return
    }
  
    const response = await fetch('/admin/all-employees/employee/created', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        role      : role,
        storeCode : storeCode,
        name      : name,
        email     : email,
        phone     : phone,
        address   : address,
        password  : password,
      })
    })
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    const {error, message} = await response.json()
    if (error) return pushNotification(error)
    pushNotification(message)
  
    setTimeout(() => window.location.reload(), 2000)
  } catch (error) {
    console.error('Error creating customer:', error)
    pushNotification("Đã có lỗi xảy ra.")
  }
}

submitButton.onclick = function() {
  createEmployee()
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  getPositions()
  getStores() 
})