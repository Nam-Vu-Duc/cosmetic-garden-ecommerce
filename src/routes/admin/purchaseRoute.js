const express = require('express')
const router = express.Router()
const purchaseController = require('../../app/controllers/admin/purchaseController')

router.get('/'                  , purchaseController.allPurchases)

router.get('/purchase/create'   , purchaseController.purchaseCreate)
router.post('/purchase/created' , purchaseController.purchaseCreated)

router.get('/purchase/:id'      , purchaseController.purchaseInfo)
router.put('/purchase/updated'  , purchaseController.purchaseUpdate)

router.post('/data/purchases'   , purchaseController.getPurchases)
router.post('/data/purchase'    , purchaseController.getPurchase)
router.post('/data/filter'      , purchaseController.getFilter)
router.post('/data/suppliers'   , purchaseController.getSuppliers)
router.post('/data/stores'      , purchaseController.getStores)
router.post('/data/products'    , purchaseController.getProducts)

module.exports = router