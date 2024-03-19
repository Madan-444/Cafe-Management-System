const express = require('express')
const connection = require('../connection')

const router = express.Router()
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')

require('dotenv').config();

router.get('/order-reports/:status', auth.authenticateToken, (req, res) => {
    const { page, pageSize,sortBy } = req.query;

    const status = req.params.status
    console.log("🚀 ~ router.get ~ status:", status,page,pageSize,sortBy)
    let sort_by = sortBy ? sortBy : 'asc'
    let page_size = pageSize ? pageSize: "10"

    const offset = (page - 1) * page_size


    const countTotalQuery = `SELECT COUNT(*) as totalData FROM orders WHERE status='${status}'`

    connection.query(countTotalQuery, (err, results) => {
        if (err) {
            return res.status(500).json(err)
        }
        const totalData = results[0].totalData
        let queryTotalAmount = `SELECT (SELECT SUM(total_amount) FROM orders WHERE status = '${status}') AS totalAmount`
        connection.query(queryTotalAmount, (err, queryTotalAmountResult) => {
            if (err)  {
                return res.status(500).json(err)
            }
            const total_amount = queryTotalAmountResult[0].totalAmount
            let query = `SELECT * from orders WHERE status='${status}' ORDER BY order_name ${sort_by.toUpperCase()} LIMIT ${page_size} OFFSET ${offset}`
            connection.query(query, (err, orderResulsts) => {
                if (err)  {
                    return res.status(500).json(err)
                }
                res.json({
                    totalData:totalData,
                    totalAmount: total_amount ?? 0,
                    orderList: orderResulsts
                })
            })
        })
    })

})

module.exports = router