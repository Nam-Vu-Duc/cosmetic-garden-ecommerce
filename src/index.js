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
const Handlebars = require('handlebars')
const { format } = require('date-fns')
const { createServer } = require("http")
const { Server } = require('socket.io')
const server = createServer(app)
const port = process.env.PORT

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

//route 
route(app)
server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
})