function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VND'
}

function formatQuantity(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function formatRate(number) {
  return number.toFixed(1).toString()
}

function formatDate(date) {
  const newDate = new Date(date);
  const day = newDate.getUTCDate();
  const month = newDate.getUTCMonth() + 1; // Months are zero-based
  const year = newDate.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

function formatInputNumber(input) {
  input.addEventListener('input', function (e) {
    // Lấy giá trị số, loại bỏ dấu chấm cũ
    let value = e.target.value.replace(/\./g, '')
    
    // Kiểm tra nếu không phải số thì return
    if (!/^\d*$/.test(value)) return
    
    // Định dạng số với dấu chấm (.) phân tách hàng nghìn
    e.target.value = Number(value).toLocaleString('de-DE') // 'de-DE' dùng dấu chấm
  })
}

function deFormatNumber(number) {
  return parseInt(number.replace(/\./g, '').replace(/\s?VND$/, ''))
}