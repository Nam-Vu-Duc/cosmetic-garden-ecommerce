async function exportJs() {
  document.getElementById("export-js").addEventListener('click', function () {
    const table = document.querySelector("table.all-items").cloneNode(true)

    // Remove the last column from header
    const headerRow = table.querySelector('thead tr')
    if (headerRow) headerRow.removeChild(headerRow.lastElementChild)

    // Remove the last column from each body row
    const bodyRows = table.querySelectorAll('tbody tr')
    bodyRows.forEach(row => {
      row.removeChild(row.lastElementChild)
    })

    // Insert custom rows into the existing thead
    const thead = table.querySelector("thead")

    const row1 = document.createElement("tr")
    row1.innerHTML = `
      <td colspan="3" style="font-weight: bold; text-align: center;">
        Công ty TNHH Cosmetic Garden
      </td>
      <td></td>
      <td colspan="2" style="font-weight: bold; text-align: center;">
        Cộng hoà xã hội chủ nghĩa Việt Nam
      </td>`

    const row2 = document.createElement("tr")
    row2.innerHTML = `
      <td></td><td></td><td></td><td></td>
      <td colspan="2" style="text-align: center;">
        Độc lập - Tự do - Hạnh phúc
      </td>
    `

    // Optionally: add empty spacing rows
    for (let i = 0; i < 2; i++) {
      const emptyRow = document.createElement("tr")
      emptyRow.innerHTML = `<td></td><td></td><td></td><td></td><td></td><td></td>`
      thead.insertBefore(emptyRow, thead.firstChild.nextSibling)
    }

    // Insert custom rows at the top of thead
    thead.insertBefore(row2, thead.firstChild)
    thead.insertBefore(row1, thead.firstChild)

    // Export to Excel
    const wb = XLSX.utils.table_to_book(table)
    XLSX.writeFile(wb, "SheetJSTable.xlsx")
  })
}
