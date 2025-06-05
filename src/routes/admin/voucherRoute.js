const express = require('express')
const router = express.Router()
const voucherController = require('../../app/controllers/admin/voucherController')

router.get('/'                 , voucherController.allVouchers)

router.get('/voucher/create'   , voucherController.voucherCreate)
router.post('/voucher/created' , voucherController.voucherCreated)

router.get('/voucher/:id'      , voucherController.voucherInfo)
router.put('/voucher/updated'  , voucherController.voucherUpdate)

router.post('/data/filter'     , voucherController.getFilter)
router.post('/data/vouchers'   , voucherController.getVouchers)
router.post('/data/members'    , voucherController.getMembers)
router.post('/data/voucher'    , voucherController.getVoucher)

module.exports = router