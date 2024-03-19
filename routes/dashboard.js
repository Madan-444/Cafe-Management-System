const express = require('express')
const connection = require('../connection')

const router = express.Router()
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')

require('dotenv').config();

router.get('/get-statics', auth.authenticateToken, (req, res) => {

    const query = `
    SELECT
        COUNT(*) AS totalOrders,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS totalPendingOrders,
        SUM(CASE WHEN status = 'CANCEL' THEN 1 ELSE 0 END) AS totalCanceledOrders,
        SUM(CASE WHEN status = 'COMPLETE' THEN 1 ELSE 0 END) AS totalCompleteOrders,
        (SELECT COUNT(*) FROM product) AS totalMenu
    FROM
        orders;`;

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json(err)
        }

        console.log("the result ", results[0])
        const { totalOrders, totalPendingOrders, totalCanceledOrders, totalCompleteOrders, totalMenu } = results[0];

        const queryChart = `
        SELECT
            product_name AS name,
            SUM(quantity) AS totalOrder
        FROM
            order_items
        GROUP BY
            product_name
        ORDER BY
            totalOrder DESC
        LIMIT 6;`;

        connection.query(queryChart, (err, results) => {
            if (err) {
                return res.status(500).json(err)
            }

            res.json({
                totalOrders, 
                totalPendingOrders, 
                totalCanceledOrders, 
                totalCompleteOrders, 
                totalMenu,
                orderVsMenuList: results
            })
        })

    })

})

module.exports = router