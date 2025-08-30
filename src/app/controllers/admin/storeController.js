const store = require('../../models/storeModel')
const employee = require('../../models/employeeModel')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')
const { ObjectId } = require('mongodb')

class allStoresController {
  // all
  async getStores(req, res, next) {
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
      if (userInfo.role !== 'admin') filter.code = userInfo.storeCode
  
      const [data, dataSize] = await Promise.all([
        store
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(itemsPerPage)
          .lean(),
        store.find(filter).countDocuments(),
      ]) 
      if (!data) throw new Error('Data not found')
      
      return res.json({data: data, data_size: dataSize})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async getFilter(req, res, next) {
  
  }

  async allStores(req, res, next) {
    try {
      return res.render('admin/all/store', { title: 'Danh sách đại lý', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    }
  }

  // update
  async getStore(req, res, next) {
    try {
      const storeInfo = await store.findOne({ _id: req.body.id }).lean()
      if (!storeInfo) throw new Error('Store not found')
      
      return res.json({storeInfo: storeInfo})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async storeInfo(req, res, next) {
    try {
      if (!checkForHexRegExp(req.params.id)) throw new Error('error')
      if (!(await store.findOne({ _id: req.params.id }).lean())) throw new Error('error')
      return res.render('admin/detail/store', { layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async storeUpdate(req, res, next) {
    try {
      await store.updateOne({ _id: req.body.id }, {
        name   : req.body.name,
        address: req.body.address,
        details: req.body.details
      })
  
      return res.json({message: 'Cập nhật thông tin thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  // create
  async storeCreate(req, res, next) {
    try {
      return res.render('admin/create/store', { title: 'Thêm đại lý mới', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async storeCreated(req, res, next) {
    try {
      const newStore = new store(req.body)
      await newStore.save()

      return res.json({message: 'Tạo đại lý thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }
}
module.exports = new allStoresController