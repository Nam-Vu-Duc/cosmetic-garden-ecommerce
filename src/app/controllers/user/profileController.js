const user = require('../../models/userModel')
const order = require('../../models/orderModel')
const memberShip = require('../../models/memberModel')
const voucher = require('../../models/voucherModel')
const userVoucher = require('../../models/userVoucherModel')
const orderStatus = require('../../models/orderStatusModel')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')
const bcrypt = require('bcryptjs')

class profileController {
  async getUser(req, res, next) {
    try {
      const userId = req.cookies.uid 
      const userInfo = await user.findOne({ _id: userId }).lean()
      if (!userId) throw Error()
  
      const userMemberShip = await memberShip.findOne({ code: userInfo.memberCode })
  
      return res.json({data: userInfo, member: userMemberShip})
      
    } catch (error) {
      return res.json({error: error})
    }
  }

  async getOrders(req, res, next) {
    try {
      const userId = req.cookies.uid 
      const userInfo = await user.findOne({ _id: userId }).lean()
      if (!userInfo) throw Error()
  
      const orderInfo = await order.aggregate([
        {
          $match: { 'customerInfo.userId': userId } // Filter by userId first
        },
        {
          $lookup: {
            from: 'orderStatuses',    // Join with orderStatuses collection
            localField: 'status',     // Match 'status' field in orders
            foreignField: 'code',     // Match 'code' field in orderStatuses
            as: 'orderStatus'         // Output field
          }
        },
        {
          $unwind: { 
            path: "$orderStatus", 
            preserveNullAndEmptyArrays: true  // Keep orders even if status not found
          }
        },
        {
          $sort: {createdAt: -1}
        }
      ])
      if (!orderInfo) return res.json({data: []})
  
      return res.json({data: orderInfo})
      
    } catch (error) {
      return res.json({error: error})
    }
  }

  async getDoneOrders(req, res, next) {
    try {
      const userId = req.cookies.uid 
      const userInfo = await user.findOne({ _id: userId }).lean()
      if (!userInfo) throw Error()
  
      // const orderInfo = await order.find({ 'customerInfo.userId': userId, status: 'done' }).lean()
      const orderInfo = await order.aggregate([
        {
          $match: {$and: [{ 'customerInfo.userId': userId }, { status: 'done' }]}
        },
        {
          $lookup: {
            from: 'orderStatuses',    // Join with orderStatuses collection
            localField: 'status',     // Match 'status' field in orders
            foreignField: 'code',     // Match 'code' field in orderStatuses
            as: 'orderStatus'         // Output field
          }
        },
        {
          $unwind: { 
            path: "$orderStatus", 
            preserveNullAndEmptyArrays: true  // Keep orders even if status not found
          }
        },
        {
          $sort: {createdAt: -1}
        }
      ])
      if (!orderInfo) return res.json({data: []})
  
      return res.json({data: orderInfo})
      
    } catch (error) {
      return res.json({error: error})
    }
  }

  async getVouchers(req, res, next) {
    try {
      const userId = req.cookies.uid 
      const userInfo = await user.findOne({ _id: userId }).lean()
      if (!userInfo) throw Error()
  
      const vouchers = await voucher.find({ memberCode: userInfo.memberCode }).sort({ endDate: -1 }).lean()
      if (!vouchers) return res.json({data: []})
  
      return res.json({data: vouchers})
      
    } catch (error) {
      return res.json({error: error})
    }
  }

  async getUserVouchers(req, res, next) {
    try {
      const userId = req.cookies.uid 
      const userInfo = await user.findOne({ _id: userId }).lean()
      if (!userInfo) throw Error()
  
      const userVouchers = await userVoucher.find({ userId: userId }).sort({ endDate: -1 }).lean()
      if (!userVouchers) return res.json({data: []})
  
      return res.json({data: userVouchers})
      
    } catch (error) {
      return res.json({error: error})
    }
  }

  async profileInfo(req, res, next) {
    try {
      const userId = req.cookies.uid || null
      if (!userId) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
  
      const userInfo = await user.findOne({ _id: userId }).lean()
      if (!userInfo) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
      
      return res.render('users/profileInfo', { title: 'Thông tin cá nhân' })
      
    } catch (error) {
      return res.json({error: error})
    }
  }

  async profileUpdate(req, res, next) {
    try {
      await user.updateOne({ _id: req.body.id}, {
        name    : req.body.name,
        phone   : req.body.phone,
        gender  : req.body.gender,
        address : req.body.address,
        dob     : req.body.dob
      })
  
      return res.json({isValid: true, message: 'Cập nhật thông tin thành công'})

    } catch (error) {
      return res.json({error: error})
    }
  }
  
  async passwordUpdate(req, res, next) {
    try {
      const oldPassword = req.body.oldPassword
      const newPassword = req.body.newPassword
      const userInfo = await user.findOne({ _id: req.cookies.uid }).lean()
      bcrypt.compare(oldPassword, userInfo.password, async function(err, result) {
        if (result) {
          const salt = await bcrypt.genSalt(10)
          const hashedPassword = await bcrypt.hash(newPassword, salt)

          await user.updateOne({ _id: userInfo._id}, {
            password: hashedPassword
          })

          return res.json({isValid: true, message: 'Cập nhật mật khẩu thành công'})

        } else {
          return res.json({isValid: false, message: 'Mật khẩu không đúng'})
        }
      })

    } catch (error) {
      return res.json({error: error})
    }
  }
}
module.exports = new profileController