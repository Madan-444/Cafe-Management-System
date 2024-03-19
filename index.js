const express = require("express")
const cors = require('cors')
const connection = require('./connection')
const dashboardRoutes = require('./routes/dashboard')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/order')
const orderReportRoutes = require('./routes/orderReport')

const app = express()



app.use(cors())
app.use(express.urlencoded({extended: true}))

app.use(express.json());
// creating user routes
app.use('/dashboard',dashboardRoutes)
app.use('/user',userRoutes)
app.use('/category',categoryRoutes)
app.use('/product',productRoutes)
app.use('/order',orderRoutes)
app.use('/reports',orderReportRoutes)

module.exports = app