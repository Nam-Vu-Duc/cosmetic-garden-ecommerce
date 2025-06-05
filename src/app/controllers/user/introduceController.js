class introduceController {
  show(req, res, next) { 
    return res.render('users/introduce', { title: 'Giới thiệu về mình' })
  }
}
module.exports = new introduceController