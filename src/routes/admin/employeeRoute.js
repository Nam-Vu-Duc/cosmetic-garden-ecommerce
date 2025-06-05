const express = require('express')
const router = express.Router()
const employeeController = require('../../app/controllers/admin/employeeController')

router.get('/'                  , employeeController.allEmployees)

router.get('/employee/create'   , employeeController.employeeCreate)
router.post('/employee/created' , employeeController.employeeCreated)

router.get('/employee/:id'      , employeeController.employeeInfo)
router.put('/employee/updated'  , employeeController.employeeUpdate)

router.post('/data/filter'      , employeeController.getFilter)
router.post('/data/positions'   , employeeController.getPositions) 
router.post('/data/stores'      , employeeController.getStores)
router.post('/data/employees'   , employeeController.getEmployees)
router.post('/data/employee'    , employeeController.getEmployee)

module.exports = router