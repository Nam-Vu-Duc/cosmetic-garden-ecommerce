const product = require('../../models/productModel')
const purchase = require('../../models/purchaseModel')
const supplier = require('../../models/supplierModel')
const store = require('../../models/storeModel')
const employee = require('../../models/employeeModel')
const material = require('../../models/materialModel')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')
const { ObjectId } = require('mongodb')

class adminController {
  // all
  async getPurchases(req, res, next) {
    try {
      const currentPage  = req.body.page
      const sort         = req.body.sort
      const filter       = req.body.filter
      const itemsPerPage = req.body.itemsPerPage
      const skip         = (currentPage - 1) * itemsPerPage

      if (filter['_id']) {
        filter['_id'] = ObjectId.createFromHexString(filter['_id'])
      }

      const userInfo = await employee.findOne({ _id: req.cookies.uid }).lean()
      if (!userInfo) throw new Error('User not found')
  
      const [data, dataSize] = await Promise.all([
        purchase
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(itemsPerPage)
          .sort({ createdAt: -1 })
          .lean(),
        purchase.find(filter).countDocuments(),
      ]) 
      if (!data) throw new Error('Data not found')
      
      return res.json({data: data, data_size: dataSize})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async getFilter(req, res, next) {
    try {
      const stores = await store.find().lean()
      return res.json({ store: stores })
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async allPurchases(req, res, next) {
    try {
      return res.render('admin/all/purchase', { title: 'Danh sách phiếu nhập', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  // update
  async getPurchase(req, res, next) {
    try {
      const purchaseInfo = await purchase.findOne({ _id: req.body.id }).lean()
      if (!purchaseInfo) throw new Error('error')
  
      const supplierInfo = await supplier.findOne({ _id: purchaseInfo.supplierId}).lean()
      if (!supplierInfo) throw new Error('error')
      
      return res.json({purchaseInfo: purchaseInfo, supplierInfo: supplierInfo})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }

  async purchaseInfo(req, res, next) {
    try {
      if (!checkForHexRegExp(req.params.id)) throw new Error('error')
      if (!(await purchase.findOne({ _id: req.params.id }).lean())) throw new Error('error')

      return res.render('admin/detail/purchase', { layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async purchaseUpdate(req, res, next) {

  }

  // create
  async getSuppliers(req, res, next) {
    try {
      const suppliers = await supplier.find().lean()
      return res.json({data: suppliers})
    } catch (error) {
      return res.json({error: error.message})
    }
  }
  
  async getMaterials(req, res, next) {
    try {
      const query = req.body.query
      const materials = await material.find({
        name: { $regex: query, $options: 'i'}
      }).lean()
      return res.json({data: materials})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }
  
  async purchaseCreate(req, res, next) {
    try {
      return res.render('admin/create/purchase', { title: 'Thêm đơn nhập mới', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async purchaseCreated(req, res, next) {
    try {
      let { 
        purchaseDate, 
        supplierId,
        note,
        productId, 
        productName,
        productPrice,
        productQuantity,
        totalPurchasePrice
      } = req.body
  
      // if the req.body has only 1 record, convert 1 record to array
      if(!Array.isArray(productId)) {
        productId       = [productId]
        productName     = [productName]
        productPrice    = [productPrice]
        productQuantity = [productQuantity]
      }
  
      const newPurchase = new purchase({
        materials: productId.map((product, index) => ({
          id        : productId[index],
          name      : productName[index],
          price     : productPrice[index],
          quantity  : productQuantity[index], 
          totalPrice: productPrice[index] * productQuantity[index]
        })),
        supplierId: supplierId,
        note: note,
        purchaseDate: purchaseDate,
        totalProducts: productQuantity.reduce((acc, curr) => acc + parseInt(curr), 0),
        totalPurchasePrice: totalPurchasePrice
      });
      await newPurchase.save()

      const materialUpdates = []
      productId.forEach((id, index) => {
        materialUpdates.push({ materialId: id, quantity: productQuantity[index] })
      })
      
      await supplier.updateOne({ _id: supplierId }, {
        $inc: { 
          totalCost: totalPurchasePrice,
          quantity: 1
         }
      })

      const bulkOps = materialUpdates.map(({ materialId, quantity }) => ({
        updateOne: {
          filter: { _id: materialId },
          update: { $inc: { quantity: quantity } }, 
          upsert: true,
        },
      }))
      await material.bulkWrite(bulkOps)

      return res.json({message: 'Tạo đơn nhập mới thành công'})
    } catch (error) {
      console.log(error)
      return res.json({error: error.message})
    }
  }
}
module.exports = new adminController