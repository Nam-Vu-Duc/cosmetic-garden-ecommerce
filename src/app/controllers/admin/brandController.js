const brand = require('../../models/brandModel')
const product = require('../../models/productModel')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')
const kafka = require("kafkajs").Kafka
const kafkaClient = new kafka({ brokers: ["localhost:9092"] })
const producer = kafkaClient.producer()

class allBrandsController {
  // all
  async getBrands(req, res, next) {
    try {
      const currentPage  = req.body.page
      const sort         = req.body.sort
      const filter       = req.body.filter
      const itemsPerPage = req.body.itemsPerPage
      const skip         = (currentPage - 1) * itemsPerPage

      if (filter['_id']) {
        filter['_id'] = ObjectId.createFromHexString(filter['_id'])
      }

      const [data, dataSize] = await Promise.all([
        brand
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(itemsPerPage)
          .lean(),
        brand.find(filter).countDocuments(),
      ]) 
      if (!data) throw new Error('Data not found')
      return res.json({data: data, data_size: dataSize})
    } catch (error) {
      console.log(error)
      return res.json({error: error})
    }
  }

  async getFilter(req, res, next) {
  
  }
  
  async allBrands(req, res, next) {
    try {
      return res.render('admin/all/brand', { title: 'Danh sách đại lý', layout: 'admin' })
    } catch (error) {
      console.log(error)
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  // update
  async getBrand(req, res, next) {
    try {
      const brandInfo = await brand.findOne({ _id: req.body.id }).lean()
      if (!brandInfo) throw new Error('error')
  
      const productsInfo = await product.find({ brand: brandInfo.name }).lean()
  
      res.json({brandInfo: brandInfo, productsInfo: productsInfo})
    } catch (error) {
      return res.json({error: error})
    }
  }

  async brandInfo(req, res, next) {
    try {
      if (!checkForHexRegExp(req.params.id)) throw new Error('error')
      if (!(await brand.findOne({ _id: req.params.id }).lean())) throw new Error('error')

      return res.render('admin/detail/brand', { layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async brandUpdate(req, res, next) {

  }

  // create
  async brandCreate(req, res, next) {   
    try {
      return res.render('admin/create/brand', { title: 'Thêm thương hiệu mới', layout: 'admin' })
    } catch (error) {
      console.log(error)
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    } 
  }

  async brandCreated(req, res, next) {

  }
}
module.exports = new allBrandsController