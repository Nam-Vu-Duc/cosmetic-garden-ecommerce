importLinkCss('/css/admin/all/brands.css')

const tbody         = document.querySelector('table').querySelector('tbody')
const sortOptions   = {}
const filterOptions = {}
const currentPage   = { page: 1 }
const dataSize      = { size: 0 }

async function getFilter() {
  const response = await fetch('/admin/all-customers/data/filter', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)

  const data = json.data
  
  data.forEach((element, index) => {
    const option = document.createElement('option')
    option.value = element.code
    option.textContent = element.name
    document.querySelector('select#memberCode').appendChild(option)
  })
}

async function getBrands(sortOptions, filterOptions, currentPage) {
  tbody.querySelectorAll('tr').forEach((tr, index) => {
    tr.querySelector('td:nth-child(1)').textContent = ''
    tr.querySelector('td:nth-child(1)').classList.add('loading')
  })

  const response = await fetch('/admin/all-brands/data/brands', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({sort: sortOptions, filter: filterOptions, page: currentPage})
  })
  if (!response.ok) throw new Error(`Response status: ${response.status}`)
  const json = await response.json()
  if (json.error) return pushNotification(error)

  const data = json.data
  dataSize.size = json.data_size

  document.querySelector('div.board-title').querySelector('p').textContent = 'Thương hiệu: ' + dataSize.size

  window.setTimeout(function() {
    tbody.querySelectorAll('tr').forEach((tr, index) => {
      tr.remove()
    })

    let productIndex = (currentPage - 1) * 10 + 1

    data.forEach((item, index) => {
      const newTr = document.createElement('tr')
      newTr.innerHTML = `
        <td>${productIndex}</td>
        <td style="display: flex; justify-content: start;align-items: center;gap: 5px">
          <img src="${item.img.path}" alt="${item.name}" loading="lazy" loading="lazy"> 
          <p>${item.name}</p>
        </td> 
        <td>${item.totalProduct}</td>
        <td>${item.totalProduct}</td>
        <td>${formatNumber(item.totalRevenue)}</td>
        <td><a href="/admin/all-brands/brand/${item._id}">Xem</a></td>
      `
      tbody.appendChild(newTr)
      productIndex++
    })
  }, 1000)
  
  pagination(getBrands, sortOptions, filterOptions, currentPage, dataSize.size)
}

window.addEventListener('DOMContentLoaded', async function loadData() {
  try {
    await getBrands(sortOptions, filterOptions, currentPage.page)
    await new Promise(r => setTimeout(r, 500))

    await sortAndFilter(getBrands, sortOptions, filterOptions, currentPage.page)
    await new Promise(r => setTimeout(r, 500))

    await exportJs()
  } catch (error) {
    console.error('Error loading data:', error)
    pushNotification(error)
  }
})