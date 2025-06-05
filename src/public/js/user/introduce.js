importLinkCss('/css/user/introduce.css')

function createOdometer(el, value) {
  const odometer = new Odometer({
    el: el,
    value: 0
  })

  odometer.update(value)
}

const experience  = document.querySelector('div#experience')
const product     = document.querySelector('div#product')
const store       = document.querySelector('div#store')

createOdometer(experience, 2)
createOdometer(product, 50)
createOdometer(store, 3)