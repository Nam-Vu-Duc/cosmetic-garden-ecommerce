const express = require('express')
const router = express.Router()
const supplierController = require('../../app/controllers/admin/supplierController')

router.get('/'                  , supplierController.allSuppliers)

router.get('/supplier/create'   , supplierController.supplierCreate)
router.post('/supplier/created' , supplierController.supplierCreated)

router.get('/supplier/:id'      , supplierController.supplierInfo)
router.put('/supplier/updated'  , supplierController.supplierUpdate)

router.post('/data/suppliers'   , supplierController.getSuppliers)
router.post('/data/supplier'    , supplierController.getSupplier)
router.post('/data/filter'      , supplierController.getFilter)

module.exports = router