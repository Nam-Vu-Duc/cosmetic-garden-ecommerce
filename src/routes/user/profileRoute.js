const express = require('express')
const router = express.Router()
const profileController= require('../../app/controllers/user/profileController')

router.get('/info/:id'          , profileController.profileInfo)

router.post('/updated'          , profileController.profileUpdate)

router.post('/data/user'        , profileController.getUser)
router.post('/data/orders'      , profileController.getOrders)
router.post('/data/done-orders' , profileController.getDoneOrders)

module.exports = router