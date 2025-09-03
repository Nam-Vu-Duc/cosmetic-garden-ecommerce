const emp = require('../models/employeeModel')
const permission = require('../controllers/admin/permissionController')
const attributePermission = permission.attributePermission
const brandPermission     = permission.brandPermission
const chatPermission      = permission.chatPermission
const chatEmpPermission   = permission.chatEmpPermission
const customerPermission  = permission.customerPermission
const employeePermission  = permission.employeePermission
const homePermission      = permission.homePermission
const orderPermission     = permission.orderPermission
const productPermission   = permission.productPermission
const materialPermission  = permission.materialPermission
const purchasePermission  = permission.purchasePermission
const storePermission     = permission.storePermission
const supplierPermission  = permission.supplierPermission
const voucherPermission   = permission.voucherPermission

async function checkPermission(req, res, permissionMap, action) {
  try {
    const empInfo = await emp.findOne({ _id: req.cookies.uid }).lean()
    const empRole = empInfo?.role

    if (!permissionMap[action]?.includes(empRole)) throw new Error('error')
    return true;
  } catch (err) {
    res.status(403).render('partials/denyUserAccess', { title: 'Not found', layout: 'empty' })
    return false
  }
}

class attributeClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, attributePermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, attributePermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, attributePermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, attributePermission, 'DELETE')) next();
  }
}
class brandClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, brandPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, brandPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, brandPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, brandPermission, 'DELETE')) next();
  }
}
class chatClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, chatPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, chatPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, chatPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, chatPermission, 'DELETE')) next();
  }
}
class chatEmpClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, chatEmpPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, chatEmpPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, chatEmpPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, chatEmpPermission, 'DELETE')) next();
  }
}
class customerClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, customerPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, customerPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, customerPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, customerPermission, 'DELETE')) next();
  }
}
class employeeClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, employeePermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, employeePermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, employeePermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, employeePermission, 'DELETE')) next();
  }
}
class homeClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, homePermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, homePermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, homePermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, homePermission, 'DELETE')) next();
  }
}
class orderClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, orderPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, orderPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, orderPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, orderPermission, 'DELETE')) next();
  }
}
class productClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, productPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, productPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, productPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, productPermission, 'DELETE')) next();
  }
}
class materialClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, materialPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, materialPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, materialPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, materialPermission, 'DELETE')) next();
  }
}
class purchaseClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, purchasePermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, purchasePermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, purchasePermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, purchasePermission, 'DELETE')) next();
  }
}
class storeClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, storePermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, storePermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, storePermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, storePermission, 'DELETE')) next();
  }
}
class supplierClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, supplierPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, supplierPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, supplierPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, supplierPermission, 'DELETE')) next();
  }
}
class voucherClass {
  async create(req, res, next) {
    if (await checkPermission(req, res, voucherPermission, 'CREATE')) next();
  }
  async read(req, res, next) {
    if (await checkPermission(req, res, voucherPermission, 'READ')) next();
  }
  async update(req, res, next) {
    if (await checkPermission(req, res, voucherPermission, 'UPDATE')) next();
  }
  async delete(req, res, next) {
    if (await checkPermission(req, res, voucherPermission, 'DELETE')) next();
  }
}

module.exports = {
  attributeClass: new attributeClass,
  brandClass    : new brandClass,
  chatClass     : new chatClass,
  chatEmpClass  : new chatEmpClass,
  customerClass : new customerClass,
  employeeClass : new employeeClass,
  homeClass     : new homeClass,
  orderClass    : new orderClass,
  productClass  : new productClass,
  materialClass : new materialClass,
  purchaseClass : new purchaseClass,
  storeClass    : new storeClass,
  supplierClass : new supplierClass,
  voucherClass  : new voucherClass,
};