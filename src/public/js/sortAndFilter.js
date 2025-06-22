async function sortAndFilter(getDataFunction, sortOptions, filterOptions, currentPage) {
  const sortButton    = document.querySelector('div.sort').querySelectorAll('select')
  const filterButton  = document.querySelector('div.filter').querySelectorAll('select')
  const clearButton   = document.querySelector('button#clear-sort-filter')
  const searchInput   = document.querySelector('input#search-input')
  
  sortButton.forEach((button) => {
    button.onchange = function () {
      button.selectedIndex === 0 ? clearButton.style.display = 'none' : clearButton.style.display = ''
      const sortType = button.id
      const sortValue = parseInt(button.value)
      sortOptions[sortType] = sortValue
      if (!sortValue) delete sortOptions[sortType]
      getDataFunction(sortOptions, filterOptions, currentPage)
    }
  }) 
  
  filterButton.forEach((button) => {
    button.onchange = function () {
      button.selectedIndex === 0 ? clearButton.style.display = 'none' : clearButton.style.display = ''
      const filterType = button.id
      const filterValue = button.value
      filterOptions[filterType] = filterValue
      console.log(filterOptions)
      if (!filterValue) delete filterOptions[filterType]
      getDataFunction(sortOptions, filterOptions, currentPage)
    }
  }) 

  searchInput.addEventListener('keypress', function(e) {
    if (searchInput.value.trim() === '') return
    if (e.key === "Enter") {
      filterOptions['name'] = { $regex: searchInput.value.trim(), $options: 'i'}
      clearButton.style.display = ''
      // if (!filterValue) delete filterOptions[filterType]
      getDataFunction(sortOptions, filterOptions, currentPage)
    }
  })

  clearButton.addEventListener('click', function() {
    sortButton.forEach((button) => button.selectedIndex = 0) 
    filterButton.forEach((button) => button.selectedIndex = 0) 
    searchInput.value = ''
    clearButton.style.display = 'none'
    sortOptions = {}
    filterOptions = {}
    currentPage = 1
    getDataFunction(sortOptions, filterOptions, currentPage)
  })
}