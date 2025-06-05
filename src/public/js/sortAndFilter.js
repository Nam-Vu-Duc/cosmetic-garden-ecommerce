async function sortAndFilter(getDataFunction, sortOptions, filterOptions, currentPage) {
  const sortButton = document.querySelector('div.sort').querySelectorAll('select')
  sortButton.forEach((button) => {
    button.onchange = function () {
      const sortType = button.id
      const sortValue = parseInt(button.value)
      sortOptions[sortType] = sortValue
      if (!sortValue) delete sortOptions[sortType]
      getDataFunction(sortOptions, filterOptions, currentPage)
    }
  }) 
  
  const filterButton = document.querySelector('div.filter').querySelectorAll('select')
  filterButton.forEach((button) => {
    button.onchange = function () {
      const filterType = button.id
      const filterValue = button.value
      filterOptions[filterType] = filterValue
      if (!filterValue) delete filterOptions[filterType]
      getDataFunction(sortOptions, filterOptions, currentPage)
    }
  }) 

  const searchInput = document.querySelector('input#search-input')
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === "Enter") {
      filterOptions['name'] = { $regex: searchInput.value.trim(), $options: 'i'}
      // if (!filterValue) delete filterOptions[filterType]
      getDataFunction(sortOptions, filterOptions, currentPage)
    }
  })
}