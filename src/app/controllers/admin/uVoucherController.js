const userVoucher = require('../../models/userVoucherModel')
const employee = require('../../models/employeeModel')
const order = require('../../models/orderModel')
const member = require('../../models/memberModel')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')
const { ObjectId } = require('mongodb')

class allUVouchersController {
  // all
  async getVouchers(req, res, next) {
    try {
      const currentPage  = req.body.page
      const sort         = req.body.sort
      const filter       = req.body.filter
      const itemsPerPage = 10
      const skip         = (currentPage - 1) * itemsPerPage

      if (filter['_id']) {
        filter['_id'] = ObjectId.createFromHexString(filter['_id'])
      }
  
      const [data, dataSize] = await Promise.all([
        userVoucher
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(itemsPerPage)
          .lean(),
        userVoucher.find(filter).countDocuments(),
      ]) 
      if (!data) throw new Error('Data not found')
      
      return res.json({data: data, data_size: dataSize})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async getFilter(req, res, next) {

  }

  async allVouchers(req, res, next) {
    try {
      return res.render('admin/all/userVoucher', { title: 'Danh sách voucher', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    }
  }

  // update
  async getVoucher(req, res, next) {
    try {
      const voucherInfo = await userVoucher.findOne({ _id: req.body.id }).lean()
      if (!voucherInfo) throw new Error('Store not found')

      const memberInfo = await member.findOne({ code: voucherInfo.memberCode }).lean()
      if (!voucherInfo) throw new Error('Member not found')
  
      const orderInfo = await order.aggregate([
        {
          $match: { 'voucherCode': voucherInfo.code }
        },
        {
          $lookup: {
            from: 'orderStatuses',
            localField: 'status',
            foreignField: 'code',
            as: 'orderStatus'
          }
        },
        {
          $lookup: {
            from: 'paymentMethods',
            localField: 'paymentMethod',
            foreignField: 'code',
            as: 'paymentMethod'
          }
        },
        {
          $unwind: '$orderStatus'
        },
        {
          $unwind: '$paymentMethod'
        }
      ])
      
      return res.json({voucherInfo: voucherInfo, memberInfo: memberInfo, orderInfo: orderInfo})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async voucherInfo(req, res, next) {
    try {
      if (!checkForHexRegExp(req.params.id)) throw new Error('error')
      if (!(await userVoucher.findOne({ _id: req.params.id }).lean())) throw new Error('error')
      return res.render('admin/detail/userVoucher', { layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async voucherUpdate(req, res, next) {
    try {
      await userVoucher.updateOne({ _id: req.body.id }, {
        name        : req.body.name,
        description : req.body.description,
        status      : req.body.status,
        startDate   : new Date(req.body.startDate),
        endDate     : new Date(req.body.endDate)
      })
  
      return res.json({message: 'Cập nhật thông tin thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  // create
  async getMembers(req, res, next) {
    try {
      const memberShip = await member.find().lean()
      if (!memberShip) throw new Error('error')
      return res.json({data: memberShip})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async voucherCreate(req, res, next) {
    try {
      return res.render('admin/create/userVoucher', { title: 'Thêm voucher mới', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async voucherCreated(req, res, next) {
    try {
      const newVoucher = new userVoucher({
        name        : req.body.name,
        description : req.body.description,
        memberCode  : req.body.memberCode,
        discount    : req.body.discount,
        maxDiscount : req.body.maxDiscount,
        minOrder    : req.body.minOrder,
        startDate   : new Date(req.body.startDate),
        endDate     : new Date(req.body.endDate),
      })
      await newVoucher.save()

      return res.json({message: 'Tạo voucher thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }
}
module.exports = new allUVouchersController