const express = require('express')
const router = express.Router()
const orderController = require('../../app/controllers/admin/orderController')

router.get('/'                    , orderController.allOrders)

router.get('/order/create'        , orderController.orderCreate)
router.post('/order/created'      , orderController.orderCreated)

router.get('/order/:id'           , orderController.orderInfo)
router.put('/order/updated'       , orderController.orderUpdate)

router.post('/data/orders'        , orderController.getOrders)
router.post('/data/order'         , orderController.getOrder)
router.post('/data/filter'        , orderController.getFilter)
router.post('/data/customers'     , orderController.getCustomers)
router.post('/data/stores'        , orderController.getStores)
router.post('/data/paymentMethod' , orderController.getPaymentMethod)
router.post('/data/products'      , orderController.getProducts)

module.exports = router