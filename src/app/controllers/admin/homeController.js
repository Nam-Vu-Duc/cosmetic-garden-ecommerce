const product = require('../../models/productModel')
const user = require('../../models/userModel')
const order = require('../../models/orderModel')
const store = require('../../models/storeModel')
const brand = require('../../models/brandModel')
const employee = require('../../models/employeeModel')
const purchase = require('../../models/purchaseModel')
const supplier = require('../../models/supplierModel')

class homeController {
  async show(req, res, next) {
    try {
      return res.render('admin/home', { title: 'Trang chủ', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    }
  }

  async getFinance(req, res, next) {
    try {
      const matchStage = {}
      const userInfo = await employee.findOne({ _id: req.cookies.uid }).lean()
      if (!userInfo) throw new Error('User not found')
      if (userInfo.role !== 'admin') matchStage.storeCode = userInfo.storeCode

      if (req.body.startDate && req.body.endDate) {
        matchStage.createdAt = {
          $gte: new Date(req.body.startDate),
          $lte: new Date(req.body.endDate),
        }
      }

      const revenue = await order.aggregate([
        {
          $match: matchStage
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalOrderPrice' },
          },
        },
      ])

      const cost = await purchase.aggregate([
        {
          $match: matchStage
        },
        {
          $group: {
            _id: null,
            cost: { $sum: '$totalPurchasePrice' },
          },
        },
      ])

      const wage = await employee.aggregate([
        {
          $match: matchStage
        },
        {
          $lookup: {
            from: 'positions',
            localField: 'role',
            foreignField: 'code',
            as: 'position',
          },
        },
        {
          $unwind: '$position'
        },
        {
          $group: {
            _id: null,
            wage: { $sum: '$position.wage' },
          },
        },
      ])

      return res.json({ 
        revenue: revenue.length > 0 ? revenue[0].revenue : 0,
        cost   : cost.length    > 0 ? cost[0].cost       : 0,
        wage   : wage.length    > 0 ? wage[0].wage       : 0,
      })
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getBrands(req, res, next) {
    try {
      const brands = await brand.find().lean()
      return res.json({data: brands})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getCustomers(req, res, next) {
    try {
      const customers = await user.find().lean()
      return res.json({data: customers})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getEmployees(req, res, next) {
    try {
      const employees = await employee.find().lean()
      return res.json({data: employees})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = await order.find().lean()
      return res.json({data: orders})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getProducts(req, res, next) {
    try {
      const products = await product.find({ deletedAt: null }).lean()
      return res.json({data: products})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getPurchases(req, res, next) {
    try {
      const purchases = await purchase.find().lean()
      return res.json({data: purchases})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getStores(req, res, next) {
    try {
      const stores = await store.find().lean()
      return res.json({data: stores})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async getSuppliers(req, res, next) {
    try {
      const suppliers = await supplier.find().lean()
      return res.json({data: suppliers})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }
  
  async getUser(req, res, next) {
    try {
      const userId = req.cookies.uid || ''
      if (!userId) throw new Error('User not found')
      
      const userInfo = await employee.findOne({ _id: userId }).lean()
      if (!userInfo) throw new Error('User not found')
      
      return res.json({data: userInfo})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }
}
module.exports = new homeController