importLinkCss('/css/user/introduce.css')

window.addEventListener('DOMContentLoaded', function () {
  getLog(
    topic = 'page-view', 
    value = {
      "user_id": window.uid,
      "timestamp": new Date(),
      "category": 'introduce',
    }
  )
})