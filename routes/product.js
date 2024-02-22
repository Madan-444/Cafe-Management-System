const express = require('express')
const connection = require('../connection')
const router = express.Router()
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')

router.post('/add',auth.authenticateToken,checkRole.checkRole,(req,res)=> {
    const {name,price,description,categoryId,} = req.body
    const query = "insert into product (name,categoryId,description,price,status) values (?,?,?,?,'true')";

    connection.query(query,[name,categoryId,description,price],(err,results)=> {
        if(!err) {
            return res.status(200).json({message: "Product added successfully"})
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/get',auth.authenticateToken,(req,res,next)=> {
    var query = "select p.id, p.name,p.description,p.price,p.status,c.id as categoryId,c.name as categoryName from product as p INNER JOIN category as c where p.categoryId = c.id";
    connection.query(query,(err,results)=> {
        console.log("The restt",results)
        if(!err) {
            res.status(200).json(results)
        } else {
            res.status(500).json(err)
        }
    })
})
router.get('/getByCategory/:id',auth.authenticateToken,(req,res,next)=> {
    const id = req.params.id
    let query = "select id,name,description, status from product where categoryId=? and status='true'";
    connection.query(query,[id],(err,results)=> {
        if(!err) {
            return res.status(200).json(results)
        } else {
            return res.status(500).json(err)
        }
    })
})
router.get('/getProduct/:id',auth.authenticateToken,(req,res,next)=> {
    const id = req.params.id
    let query = "select id,name,description,status from product where id=? and status='true'";
    connection.query(query,[id],(err,results)=> {
        if(!err) {
            return res.status(200).json(results[0])
        } else {
            return res.status(500).json(err)
        }
    })
})
router.patch('/update',auth.authenticateToken,checkRole.checkRole,(req,res,next)=> {
    let product = req.body
    var query = "update product set name=?,categoryId=?,price=?,description=? where id=?";
    connection.query(query,[product.name,product.categoryId,product.price,product.description,product.id],(err,results)=> {
        if(!err) {
            res.status(200).json({message: "Successfully updated"})
        } else {
            res.status(500).json(err)
        }
    })
})

module.exports = router