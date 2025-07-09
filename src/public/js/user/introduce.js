importLinkCss('/css/user/introduce.css')

setTimeout(() => {
  ggetLog(
    topic = 'page-view', 
    value = {
      "user_id"   : window.uid,
      "page_type" : 'introduce',
      "timestamp" : new Date(),
    }
  )
}, 1000)