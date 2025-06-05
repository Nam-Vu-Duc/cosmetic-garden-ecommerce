const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)
const Schema = mongoose.Schema
const member = new Schema({
  code : { type: String, default: 'silver', unique: true }, 
  name : { type: String, default: 'Hạng Bạc' }
}, { timestamps: true })
module.exports = mongoose.model('member', member)