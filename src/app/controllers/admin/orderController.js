const order = require('../../models/orderModel')
const user = require('../../models/userModel')
const product = require('../../models/productModel')
const store = require('../../models/storeModel')
const orderStatus = require('../../models/orderStatusModel')
const paymentMethod = require('../../models/paymentMethodModel')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')
const employee = require('../../models/employeeModel')
const objectId = require('mongoose').Types.ObjectId

class allOrdersController {
  // all
  async getOrders(req, res, next) {
    try {
      const currentPage  = req.body.page
      const sort         = req.body.sort
      const filter       = req.body.filter
      const itemsPerPage = 10
      const skip         = (currentPage - 1) * itemsPerPage
      const userInfo     = await employee.findOne({ _id: req.cookies.uid }).lean()
      if (!userInfo) throw new Error('User not found')
      if (userInfo.role !== 'admin') filter.storeCode = userInfo.storeCode
  
      const [data, dataSize] = await Promise.all([
        order
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(itemsPerPage)
          .lean(),
        order.find(filter).countDocuments(),
      ]) 
      if (!data) throw new Error('Data not found')
      
      return res.json({data: data, data_size: dataSize})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getFilter(req, res, next) {
    try {
      const [orderStatuses, paymentMethods, stores] = await Promise.all([
        orderStatus.find().lean(),
        paymentMethod.find().lean(),
        store.find().lean()
      ]) 
  
      return res.json({ orderStatus: orderStatuses, paymentMethod: paymentMethods, store: stores })
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async allOrders(req, res, next) {
    try {
      return res.render('admin/all/order', { title: 'Danh sách đơn hàng', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  // update
  async getOrder(req, res, next) {
    try {
      const [orderInfo, orderStatuses, paymentMethods] = await Promise.all([
        order.aggregate([
          {
            $match: { _id: new objectId(req.body.id) }
          },
          {
            $lookup: {
              from: 'stores',
              localField: 'storeCode',
              foreignField: 'code',
              as: 'store'
            }
          },
          {
            $unwind: '$store'
          },
        ]),
        orderStatus.find({}).lean(),
        paymentMethod.find({}).lean()
      ])
      if (!orderInfo) throw new Error('Order not found')
  
      return res.json({orderInfo: orderInfo[0], orderStatuses: orderStatuses, paymentMethods: paymentMethods})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async orderInfo(req, res, next) {
    try {
      if (!checkForHexRegExp(req.params.id)) throw new Error('error')
      if (!(await order.findOne({ _id: req.params.id }).lean())) throw new Error('error')

      return res.render('admin/detail/order', { layout: 'admin' })

    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async orderUpdate(req, res, next) {
    try {
      await order.updateOne({ _id: req.body.id }, { 
        status        : req.body.status,
        paymentMethod : req.body.paymentMethod
      })

      if (req.body.status === 'cancel') {
        const orderInfo = await order.findOne({ _id: req.body.id }).lean()
        const userId = orderInfo.customerInfo.userId
        const storeCode = orderInfo.storeCode
  
        // update product quantity
        const productInfo = orderInfo.products.map(product => ({id: product.id, quantity: product.quantity}))
        const bulkOps = productInfo.map(({ id, quantity }) => ({
          updateOne: {
            filter: { _id: id },
            update: { $inc: { quantity: +quantity, saleNumber: -quantity }}, 
            upsert: true,
          },
        }))
        await product.bulkWrite(bulkOps)
  
        await store.updateOne({ code: storeCode }, {
          $inc: { revenue: -orderInfo.totalOrderPrice }
        })
  
        if(userId !== 'guest') {
          await user.updateOne({ _id: userId }, {
            $inc: { 
              revenue: -orderInfo.totalOrderPrice,
              quantity: -1
            }
          })
        }
      }

      if (req.body.status === 'done') {
        const silver  = 1000000
        const gold    = 2000000
        const diamond = 4000000
        const userId = orderInfo.customerInfo.userId

        if(userId !== 'guest') {
          const userInfo = await user.findOne({ _id: userId }).lean()
          if (userInfo.revenue >= diamond) {
            await user.updateOne({ _id: userId }, {
              $set: { memberCode: 'diamond' }
            })
          }
          else if (userInfo.revenue >= gold) {
            await user.updateOne({ _id: userId }, {
              $set: { memberCode: 'gold' }
            })
          }
          else if (userInfo.revenue >= silver) {
            await user.updateOne({ _id: userId }, {
              $set: { memberCode: 'silver' }
            })
          }
        }
      }
  
      return res.json({message: 'Cập nhật thông tin thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  // create
  async getCustomers(req, res, next) {
    try {
      const customers = await user.find().lean()
      return res.json({data: customers})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async getStores(req, res, next) {
    try {
      const stores = await store.find().lean()
      return res.json({data: stores})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async getPaymentMethod(req, res, next) {
    try {
      const paymentMethods = await paymentMethod.find().lean()
      return res.json({data: paymentMethods})
    } catch (error) {
      return res.json({error: error.message})
    }
  }
  
  async getProducts(req, res, next) {
    try {
      const query = req.body.query
      const products = await product.find({
        deletedAt: null,
        status: { $ne: 'out-of-order' },
        name: { $regex: query, $options: 'i'}
      }).lean()
      return res.json({data: products})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async orderCreate(req, res, next) {  
    try {
      return res.render('admin/create/order', { title: 'Thêm đơn hàng mới', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async orderCreated(req, res, next) {
    try {
      const { 
        orderDate, 
        userId,
        paymentMethod,
        note,
        storeId,
        productId, 
        productName,
        productImg,
        productPrice,
        productQuantity,
        totalOrderPrice
      } = req.body
  
      // if the req.body has only 1 record, convert 1 record to array
      if(!Array.isArray(productId)) {
        productId       = [productId]
        productName     = [productName]
        productImg      = [productImg]
        productPrice    = [productPrice]
        productQuantity = [productQuantity]
      }
  
      const userInfo = await user.findOne({ _id: userId }).lean()
  
      const newOrder = new order({
        products: productId.map((product, index) => ({
          id        : productId[index],
          name      : productName[index],
          image     : productImg[index],
          price     : productPrice[index],
          quantity  : productQuantity[index], 
          totalPrice: productPrice[index] * productQuantity[index]
        })),
        customerInfo: {
          userId  : userId,
          name    : userInfo.name,
          phone   : userInfo.phone,
          address : userInfo.address,
          note    : note
        },
        paymentMethod     : paymentMethod,
        storeId           : storeId,
        createdAt         : orderDate,
        totalOrderPrice   : totalOrderPrice,
        totalNewOrderPrice: totalOrderPrice
      });
      await newOrder.save()

      const productInfo = productId.map((id, index) => ({id: id, quantity: productQuantity[index]}))
      const bulkOps = productInfo.map(({ id, quantity }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $inc: { quantity: -quantity, saleNumber: quantity }}, 
          upsert: true,
        },
      }))
      await product.bulkWrite(bulkOps)
  
      await store.updateOne({ _id: storeId }, {
        $inc: { revenue: totalOrderPrice }
      })
  
      if(userId !== 'guest') {
        await user.updateOne({ _id: userId }, {
          $inc: { 
            revenue: totalOrderPrice,
            quantity: 1
          }
        })
      }
  
      return res.json({message: 'Tạo đơn hàng mới thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }
}
module.exports = new allOrdersController