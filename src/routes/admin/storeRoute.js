const express = require('express')
const router = express.Router()
const storeController = require('../../app/controllers/admin/storeController')

router.get('/'               , storeController.allStores)

router.get('/store/create'   , storeController.storeCreate)
router.post('/store/created' , storeController.storeCreated)

router.get('/store/:id'      , storeController.storeInfo)
router.put('/store/updated'  , storeController.storeUpdate)

router.post('/data/stores'   , storeController.getStores)
router.post('/data/store'    , storeController.getStore)
router.post('/data/filter'   , storeController.getFilter)

module.exports = router