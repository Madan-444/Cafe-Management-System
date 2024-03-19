const express = require('express')
const connection = require('../connection')

const router = express.Router()
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')

require('dotenv').config();

router.post('/place-order',auth.authenticateToken,(req,res)=> {
    let {orderName,data,paymentMethod} = req.body
    let tempPaymentMethod = ''

    if(!orderName) {
        return res.status(400).json({error: "orderName is missing"})
    }
    if(data.length <1) {
        return res.status(400).json({error: "Order is empty"})
    }
    if(paymentMethod) {
        tempPaymentMethod = paymentMethod
    }

    let totalAmount = data.reduce((acc,item)=> {
        return acc + Number(item.price) * item.quantity
    },0)

        const query = `insert into orders (order_name,payment_method,total_amount,status) values (?,?,?,?)`;

        connection.query(query,[orderName,tempPaymentMethod,totalAmount, 'PENDING'],(err,results)=> {
            if (err) {
                return res.status(500).json(err)
            } 
            let completedItems = 0; 
            const orderId = results.insertId;

            data.forEach((orderItem)=> {
                const {productId,quantity} = orderItem
        
        
                const productQuery = `SELECT name, categoryId,price FROM product WHERE id=${productId}`
        
                connection.query(productQuery,(err,productResults)=> {
                    if(err) {
                        res.status(500).json(err)
                    }
                    const {name,price} = productResults[0]
        
                const itemsQuery = `insert into order_items (order_id,product_name,product_id,quantity,price) values (?,?,?,?,?)`;
                connection.query(itemsQuery,[orderId,name,productId,quantity,price],(err,results)=> {
                    if(err) {
                        return res.status(500).json(err)
                    } 
                    completedItems++
                     if (completedItems === data.length) {
                        res.status(200).json({ message: "Order placed successfully" });
                    }
                })
                })
            })
        })
})

router.get('/get-order', auth.authenticateToken, (req, res) => {
    const { page, pageSize,sortBy } = req.query;
    let sort_by = sortBy ? sortBy : 'asc'
    let page_size = pageSize ? pageSize: "10"

    const offset = (page - 1) * page_size


    const countTotalQuery = `SELECT COUNT(*) as totalData FROM orders`

    connection.query(countTotalQuery, (err, results) => {
        if (err) {
            return res.status(500).json(err)
        }
        const totalData = results[0].totalData
        let query = `SELECT * from orders ORDER BY order_name ${sort_by.toUpperCase()} LIMIT ${page_size} OFFSET ${offset}`
        connection.query(query, (err, orderResulsts) => {
            if (err)  {
                return res.status(500).json(err)
            }
            res.json({
                totalData:totalData,
                orderList: orderResulsts
            })
        })
    })

})
router.get('/get-order-details/:orderId?', auth.authenticateToken, (req, res) => {
    const orderId = req.params.orderId

    if(!orderId) {
        return res.status(400).json({error: "orderId is missing"})
    }

    let query = `select order_id,order_name,total_amount,payment_method,status from orders where order_id=${orderId}`;

    connection.query(query, (err, detailResults) => {
        if (err)  {
            return res.status(500).json(err)
        }
        if(detailResults.length ==0) {
            return res.status(404).json({ error: "Order not found" });
        }
        let queryDetails = `select id,product_name,quantity,price from order_items where order_id=${orderId}`;

        connection.query(queryDetails, (err, orderResults) => {
            if (err)  {
                return res.status(500).json(err)
            }
            const discount = detailResults[0].total_amount * 0.1
            const vat = detailResults[0].total_amount * 0.13
            res.json({
                order_id:detailResults[0].order_id,    
                order_name:detailResults[0].order_name,
                sub_total:detailResults[0].total_amount,
                payment_method:detailResults[0].payment_method,
                status:detailResults[0].status,
                invoice_number: Math.floor(1000 + Math.random() * 9000),
                service_charge: 50,
                discount,
                vat_amount: vat, 
                itemsList: orderResults,
                
            })
        })
    })

})
router.put('/change-status/:orderId?', auth.authenticateToken, (req, res) => {
    const orderId = req.params.orderId
    const {status} = req.query

    if(!orderId) {
        return res.status(400).json({error: "orderId is missing"})
    }

    let query = `select order_id,status from orders where order_id=${orderId}`;

    connection.query(query, (err, detailResults) => {
        if (err)  {
            return res.status(500).json(err)
        }
        if(detailResults.length ==0) {
            return res.status(404).json({ error: "Order not found" });
        }
        const currentStatus = detailResults[0].status;

        if (status !== currentStatus) {
            let updateQuery = `UPDATE orders SET status='${status}' WHERE order_id=${orderId}`;

            connection.query(updateQuery, (err, updateResult) => {
                if (err) {
                    return res.status(500).json(err);
                }

                // Return success response
                return res.status(200).json({ message: `Order status updated successfully from ${currentStatus} to ${status}` });
            });
        } else {
            // Return message indicating status is already the same
            return res.status(400).json({ message: `Order status is already ${status}` });
        }
        
    })

})

module.exports = router