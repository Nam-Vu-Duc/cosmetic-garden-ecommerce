const express = require('express')
const router = express.Router()
const allOrderController = require('../../app/controllers/user/allOrderController')

router.get('/'                    , allOrderController.show)

router.get('/order/:id'           , allOrderController.orderInfo)
router.get('/order/rate/:id'      , allOrderController.rateOrder)
router.post('/order/rate/updated' , allOrderController.orderRated)

router.get('/checking'            , allOrderController.ordersChecking)

router.post('/create-orders'      , allOrderController.createOrders)

router.post('/data/order'         , allOrderController.getOrder)
router.post('/data/voucher'       , allOrderController.getVoucher)

module.exports = router