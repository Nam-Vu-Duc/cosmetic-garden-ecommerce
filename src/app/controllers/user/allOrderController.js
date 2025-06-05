require('dotenv').config()
const order = require('../../models/orderModel')
const user = require('../../models/userModel')
const store = require('../../models/storeModel')
const product = require('../../models/productModel')
const comment = require('../../models/commentModel')
const orderStatus = require('../../models/orderStatusModel')
const voucher = require('../../models/voucherModel')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key   : process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

class allOrderController {
  async getOrder(req, res, next) {
    try {
      const orderInfo = await order.findOne({ _id: req.body.id }).lean()
      if (!orderInfo) return res.json({message: 'order not found'})
      
      const status = await orderStatus.findOne({ code: orderInfo.status })
      return res.json({data: orderInfo, status: status})

    } catch (error) {
      return res.json({error: error})
    }
  }
  
  async getVoucher(req, res, next) {
    try {
      const voucherInfo = await voucher.findOne({ code: req.body.voucherCode }).lean()
      if (!voucherInfo) throw new Error('Voucher not found')
      if (voucherInfo.status === 'end') throw new Error('Voucher expired')
      
      const userInfo = await user.findOne({ _id: req.cookies.uid }).lean()
      if (!userInfo) throw new Error('User not found') 
      if (userInfo.memberCode !== voucherInfo.memberCode) throw new Error('User not eligible for this voucher')
      
      return res.json({voucherInfo: voucherInfo})
    } catch (error) {
      return res.json({error: error.message})
    }
  }
  
  async show(req, res, next) {
    return res.render('users/allOrders', { title: 'Đơn hàng' })
  }

  async orderInfo(req, res, next) {
    try {
      const id = req.cookies.uid || null
      // if (!id) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
      
      const orderInfo = await order.findOne({ _id: req.params.id }).lean()
      if (!orderInfo) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
      if (orderInfo.customerInfo.userId === 'guest') return res.render('users/detailOrder', { title: `Đơn của khách` })

      const userInfo = await user.findOne({ _id: orderInfo.customerInfo.userId }).lean()
      if (!userInfo) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })

      if (userInfo._id.toString() !== id ) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })

      return res.render('users/detailOrder', { title: `Đơn của ${orderInfo.customerInfo.name}` })

    } catch (error) {
      return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    }
  }

  async ordersChecking(req, res, next) {
    return res.render('users/ordersChecking', { title: 'Kiểm Tra Đơn Hàng' })
  }

  async createOrders(req, res, next) {
    try {
      const result = req.body.img === '' ? '' : await cloudinary.uploader.upload(req.body.img, {
        folder: 'bills',
        use_filename: true
      })

      const { 
        productInfo,
        paymentMethod,
        code,
        ...customerInfo 
      } = req.body
  
      let totalOrderPrice = 0
  
      const productIds = productInfo.map(item => item.id)
      const products = await product.find({ _id: { $in: productIds }, status: { $ne: 'out-of-order' } }).lean()
      const finalProductInfo = productInfo.map(cartItem => {
        const product = products.find(p => p._id.toString() === cartItem.id)
        if (!product) return null
  
        totalOrderPrice += product.price * cartItem.quantity
    
        return {
          id        : cartItem.id,
          image     : product.img.path,
          name      : product.name,
          price     : product.price,
          quantity  : cartItem.quantity,
          totalPrice: product.price * cartItem.quantity
        }
      }).filter(Boolean)

      let totalNewOrderPrice = totalOrderPrice

      const voucherInfo = await voucher.findOne({ code: code }).lean()
      if (voucherInfo && voucherInfo.status === 'end') throw new Error('Voucher expired')
      
      const userInfo = await user.findOne({ _id: req.cookies.uid }).lean()

      if (voucherInfo) {
        if (!userInfo) throw new Error('User not found') 
        if (userInfo.memberCode !== voucherInfo.memberCode) throw new Error('User not eligible for this voucher')

        var discountValue = (totalOrderPrice * voucherInfo.discount) / 100
        if (discountValue > voucherInfo.maxDiscount) discountValue = voucherInfo.maxDiscount
        
        totalNewOrderPrice = totalOrderPrice - discountValue
      }
      
      const newOrder = new order({
        products: finalProductInfo.map((product, index) => ({
          id        : product.id,   
          image     : product.image,
          name      : product.name,
          price     : product.price,
          quantity  : product.quantity,
          totalPrice: product.totalPrice
        })),
        customerInfo: {
          userId  : customerInfo.userId,
          name    : customerInfo.name,
          phone   : customerInfo.phone,
          address : customerInfo.address,
          note    : `note: ${customerInfo.note}, link bill: ${result.secure_url}`
        },
        voucherCode: code,
        totalOrderPrice: totalOrderPrice,
        totalNewOrderPrice: totalNewOrderPrice,
        paymentMethod: paymentMethod
      })
      await newOrder.save()
  
      const bulkOps = finalProductInfo.map(({ id, quantity }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $inc: { quantity: -quantity, saleNumber: quantity }}, 
          upsert: true,
        },
      }))
      await product.bulkWrite(bulkOps)
  
      await store.updateOne({ _id: '671600cc147dd8bae142bbb5' }, {
        $inc: { revenue: totalOrderPrice }
      })
  
      if(customerInfo.userId !== 'guest') {
        await user.updateOne({ _id: customerInfo.userId }, {
          $inc: { 
            revenue: totalOrderPrice,
            quantity: 1
          }
        })
      }
  
      return res.json({id: newOrder._id})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async rateOrder(req, res, next) {
    try {
      const id = req.cookies.uid || null
      if (!id) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
      
      const orderInfo = await order.findOne({ _id: req.params.id }).lean()
      if (!orderInfo) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })

      const userInfo = await user.findOne({ _id: orderInfo.customerInfo.userId }).lean()
      if (!userInfo) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })

      if (userInfo._id.toString() !== id ) return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })

      res.render('users/detailRateOrder', { title: 'Đánh giá đơn hàng' })

    } catch (error) {
      return res.render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    }
    
  }
  
  async orderRated(req, res, next) {
    try {
      const {
        orderId,
        senderId,
        productId,
        productComment,
        productRate
      } = req.body
  
      if(!Array.isArray(productId)) {
        productId      = [productId]
        productComment = [productComment]
        productRate    = [productRate]
      }
  
      await comment.insertMany(productId.map((id, index) => (
        {
          orderId: orderId,
          productId: id,
          senderId: senderId,
          comment: productComment[index],
          rate: productRate[index]
        }
      )))
  
      await order.updateOne({ _id: orderId }, {
        isRated: true
      })
  
      const bulkOps = productId.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: [{
            $set: {
              rate: { 
                $divide: [
                  { $add: [{ $multiply: ["$rate", "$rateNumber"] }, parseInt(productRate[index])] },
                  { $add: ["$rateNumber", 1] }
                ]
              },
              rateNumber: { $add: ["$rateNumber", 1] }
            }
          }]
        }
      }));
      await product.bulkWrite(bulkOps)
  
      return res.json({message: true})
      
    } catch (error) {
      return res.json({error: error})
    }
  }
}
module.exports = new allOrderController