const express = require('express')
const router = express.Router()
const allOrderController = require('../../app/controllers/user/allOrderController')

router.get('/'                    , allOrderController.show)

router.get('/order/:id'           , allOrderController.orderInfo)
router.get('/order/rate/:id'      , allOrderController.rateOrder)
router.post('/order/rate/updated' , allOrderController.orderRated)

router.get('/checking'            , allOrderController.ordersChecking)

router.post('/create-orders'      , allOrderController.createOrders)
router.post('/payment'            , allOrderController.createPayment)

// For user redirect (GET request with query params)
router.get('/callback', allOrderController.paymentResult)
// For server-to-server notification (IPN, POST request with JSON body)
router.post('/callback', allOrderController.paymentResult)

router.post('/data/order'         , allOrderController.getOrder)
router.post('/data/order-rated'   , allOrderController.getRatedOrder)
router.post('/data/voucher'       , allOrderController.getVoucher)

module.exports = router