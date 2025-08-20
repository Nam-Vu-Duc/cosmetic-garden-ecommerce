require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const handlebars = require('express-handlebars')
const path = require('path')
const methodOverride = require('method-override')
const app = express()
const route = require('./routes')
const db = require('./config/db')
const { createServer } = require("http")
const server = createServer(app)
const port = process.env.PORT
const cron = require('node-cron')
const { getUsersWithBirthdayThisMonth } = require('./app/controllers/cron/createBirthdayVoucher') 
const { setVoucherExpired } = require('./app/controllers/cron/setVoucherExpired') 

db.connect()
app.use(express.json({ limit: '50mb' }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(morgan('combined'))
app.use(cookieParser())
app.use(methodOverride('_method'))
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'users',
  helpers: {
    addIndex: (a, b) => a + b,
    holderData: (a) => Array(a).fill({})
  } 
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'resource', 'views'))
app.set('view options', { layout: 'other' })

// cron.schedule("0 0 * * *", async () => {
//   console.log("Running birthday voucher cron...")
//   try {
//     await getUsersWithBirthdayThisMonth()

//     console.log("Birthday vouchers created successfully.")
//   } catch (err) {
//     console.error("Error creating birthday vouchers:", err)
//   }
// })

async function main() {
  // await getUsersWithBirthdayThisMonth()
  await setVoucherExpired()
  
}

// main()

route(app)
server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
})