const express = require('express')
const connection = require('../connection')
const router = express.Router()
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')

router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const { name, price, description, categoryId, } = req.body

    const searchQuery = 'SELECT * FROM product WHERE name=?'

    connection.query(searchQuery,[name],(err,ress)=> {
        console.log("🚀 ~ connection.query ~ res:", res)
        if(err) {
            return res.status(500).json({error: "Internal server error"})
        }
        if(ress.length >0) {
            return res.status(400).json({error: "Menu already exist of this name."})
        }
        const query = "insert into product (name,categoryId,description,price,status) values (?,?,?,?,'true')";

        connection.query(query, [name, categoryId, description, price], (err, results) => {
            if (!err) {
                return res.status(200).json({ message: "Product added successfully" })
            } else {
                return res.status(500).json(err)
            }
        })

    })

})

router.get('/get', auth.authenticateToken, (req, res, next) => {
    const { page, pageSize, sortBy } = req.query;
    let sort_by = sortBy ? sortBy : 'asc'
    let page_size = pageSize ? pageSize : "10"

    const offset = (page - 1) * page_size


    const countTotalQuery = `SELECT COUNT(*) as totalData FROM product`
    connection.query(countTotalQuery, (err, results) => {
        if (err) {
            return res.status(500).json(err)
        }
        const totalData = results[0].totalData

        var query = `select p.id, p.name,p.description,p.price,p.status,c.id as categoryId,c.name as categoryName from product as p INNER JOIN category as c ON p.categoryId = c.id ORDER BY name ${sort_by} LIMIT ${page_size} OFFSET ${offset}`;
        connection.query(query, (err, productResults) => {
            if (err) {
                res.status(500).json(err)
            } 
            
            res.json({
                totalData,
                productList: productResults
            })

        })
    })
})
router.get('/get-product/:categoryId', auth.authenticateToken, (req, res, next) => {
    const id = req.params.categoryId
    let query = "select id,name,description,price, status from product where categoryId=? and status='true'";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results)
        } else {
            return res.status(500).json(err)
        }
    })
})
router.get('/getProduct/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id
    let query = "select id,name,description,status from product where id=? and status='true'";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results[0])
        } else {
            return res.status(500).json(err)
        }
    })
})
router.put('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    let product = req.body
    var query = "update product set name=?,categoryId=?,price=?,description=? where id=?";
    connection.query(query, [product.name, product.categoryId, product.price, product.description, product.id], (err, results) => {
        if (!err) {
            res.status(200).json({ message: "Successfully updated" })
        } else {
            res.status(500).json(err)
        }
    })
})
router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const {id } = req.params
    const query = 'SELECT * FROM product WHERE id= ?'
    connection.query(query, [id],(error,results)=> {
        if(error) {
            return res.status(500).json({error: "Internal server error"})
        } else if(results.length <1) {
            return res.status(400).json({error: "Invalid product id"})
        }
        const deleteQuery = 'DELETE FROM product WHERE id=?'
        connection.query(deleteQuery,[id],(dError,dResulsts)=> {
            if(dError) {
                return res.status(500).json({error: "Internal server error"})
            }
            return res.status(200).json({message: "Product deleted successfully"})
        })
    })
})

module.exports = router