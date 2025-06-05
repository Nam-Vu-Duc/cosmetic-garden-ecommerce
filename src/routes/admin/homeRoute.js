const express = require('express')
const router = express.Router()
const homeController = require('../../app/controllers/admin/homeController')

router.get('/', homeController.show)

router.post('/data/finance'  , homeController.getFinance)
router.get('/data/brands'    , homeController.getBrands)
router.get('/data/customers' , homeController.getCustomers)
router.get('/data/employees' , homeController.getEmployees)
router.get('/data/orders'    , homeController.getOrders)
router.get('/data/products'  , homeController.getProducts)
router.get('/data/purchases' , homeController.getPurchases)
router.get('/data/stores'    , homeController.getStores)
router.get('/data/suppliers' , homeController.getSuppliers)
router.get('/data/user'      , homeController.getUser)

module.exports = router