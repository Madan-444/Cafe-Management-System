const express = require('express')
const connection = require('../connection')

const router = express.Router()
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')

require('dotenv').config();

router.post('/addCategory',auth.authenticateToken,(req,res)=> {
    let category = req.body
    let query = "insert into category (name,description) values(?,?)";
    connection.query(query,[category.name,category.description],(err,results)=> {
        if(!err) {
            return res.status(200).json({message: "Category added successfully !!!"})
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/get-category',auth.authenticateToken,(req,res)=> {
    let query = "select * from category order by name"
    connection.query(query,(err,results)=> {
        if(!err) {
            return res.status(200).json(results)
        } else {
            return res.status(500).json(err)
        }
    })
})
router.patch('/update',auth.authenticateToken,(req,res)=> {
    const {name,description,id} = req.body
    let query = "update category set name=? ,description=? where id=?";
    connection.query(query,[name,description,id],(err,results)=> {
        if(!err) {
            if(results.affectedRows ==0) {
                return res.status(400).json({
                    message: "Category id doesnot matched"
                })
            }
             else{
                return res.status(200).json("Category updated successfully !!!")
             }
            
        } else {
            return res.status(500).json(err)
        }
    })
})

module.exports = router