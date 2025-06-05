const employee = require('../../models/employeeModel')
const store = require('../../models/storeModel')
const position = require('../../models/positionModel')
const bcrypt = require('bcryptjs')
const checkForHexRegExp = require('../../middleware/checkForHexRegExp')

class allEmployeesController {
  // all
  async getEmployees(req, res, next) {
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
        employee
          .find(filter)
          .sort(sort)
          .skip(skip)
          .limit(itemsPerPage)
          .lean(),
        employee.find(filter).countDocuments(),
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
      const [positions, stores] = await Promise.all([
        position.find().lean(),
        store.find().lean()
      ])
  
      return res.json({position: positions, store: stores})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async allEmployees(req, res, next) {
    try {
      const userInfo = await employee.findOne({ _id: req.cookies.uid }).lean()
      if (!userInfo) throw new Error()
      if (!['admin', 'manager'].includes(userInfo.role)) throw new Error()
      return res.render('admin/all/employee', { title: 'Danh sách nhân sự', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    }
  }

  // update
  async getEmployee(req, res, next) {
    try {
      const [employeeInfo, storesInfo, positionsInfo] = await Promise.all([
        employee.findOne({ _id: req.body.id }).lean(),
        store.find().lean(),
        position.find().lean()
      ])
      if (!employeeInfo) throw new Error('error')
  
      return res.json({employeeInfo: employeeInfo, storesInfo: storesInfo, positionsInfo: positionsInfo})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  async employeeInfo(req, res, next) {
   try {
      if (!checkForHexRegExp(req.params.id)) throw new Error('error')
      if (!(await employee.findOne({ _id: req.params.id }).lean())) throw new Error('error')

      return res.render('admin/detail/employee', { layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' }) 
    }
  }

  async employeeUpdate(req, res, next) {
    try {
      await employee.updateOne({ _id: req.body.id }, {
        name     : req.body.name    ,
        role     : req.body.role    ,
        phone    : req.body.phone   ,
        address  : req.body.address ,
        gender   : req.body.gender  ,
        storeCode: req.body.store   ,
      })
  
      return res.json({message: 'Cập nhật thông tin thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }

  // create
  async getPositions(req, res, next) {
    try {
      const positions = await position.find().lean()
      return res.json({data: positions})
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

  async employeeCreate(req, res, next) {
    try {
      return res.render('admin/create/employee', { title: 'Thêm nhân viên mới', layout: 'admin' })
    } catch (error) {
      return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    }
  }

  async employeeCreated(req, res, next) {
    try {
      const empExist = await employee.findOne({ email: req.body.email })
      if (empExist) throw new Error('Tài khoản đã tồn tại')
  
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)
  
      const newEmp = new employee({
        email     : req.body.email,
        password  : hashedPassword,
        role      : req.body.role,
        name      : req.body.name,
        phone     : req.body.phone,
        address   : req.body.address,
        storeCode : req.body.storeCode
      })
      await newEmp.save()
      
      return res.json({message: 'Tạo tài khoản thành công'})
    } catch (error) {
      return res.json({error: error.message})
    }
  }
}
module.exports = new allEmployeesController