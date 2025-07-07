importLinkCss('/css/user/introduce.css')

window.addEventListener('DOMContentLoaded', async function() {
  // Wait until window.isLoggedIn is assigned
  while (typeof window?.isLoggedIn === 'undefined') {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log(window.uid)

  getLog(
    topic = 'page-view', 
    value = {
      "user_id"   : window.uid,
      "page_type" : 'introduce',
      "timestamp" : new Date(),
    }
  )
})