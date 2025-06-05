async function exportJs() {
  document.getElementById("export-js").addEventListener('click', function() {
    /* Create worksheet from HTML DOM TABLE */
    var wb = XLSX.utils.table_to_book(document.querySelector("table.all-items"));
    /* Export to file (start a download) */
    XLSX.writeFile(wb, "SheetJSTable.xlsx");
  })
}