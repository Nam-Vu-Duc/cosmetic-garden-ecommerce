const emp = require('../models/employeeModel')
const jwt = require('jsonwebtoken')
const dbConnect = require('../middleware/mongoose')

module.exports = async function checkAdmin(req, res, next) {
  try {
    await dbConnect()
    const rt = req.cookies.rt
    const uid = req.cookies.uid

    if (rt && uid) {
      const decodedRefreshToken = jwt.verify(rt, 'SECRET_KEY')
      if (!decodedRefreshToken) throw new Error('error decoded refresh token')
      
      const empInfo = await emp.findOne({ _id: uid })
      if (!empInfo) throw new Error('error')
      if (!['admin', 'manager', 'employee'].includes(empInfo.role)) throw new Error('error')
      next()
    } else {
      throw new Error('error')
    }
  } catch (error) {
    return res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
  }
}