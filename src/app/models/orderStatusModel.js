const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)
const Schema = mongoose.Schema
const orderStatus = new Schema({
  code : { type: String, default: 'preparing', unique: true }, 
  name : { type: String, default: 'Đang chuẩn bị đơn hàng' }, 
}, { timestamps: true })
module.exports = mongoose.model('orderStatus', orderStatus, 'orderStatuses')