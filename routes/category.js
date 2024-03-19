const express = require('express')
const connection = require('../connection')

const router = express.Router()
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')

require('dotenv').config();

router.post('/addCategory', auth.authenticateToken, (req, res) => {
    let category = req.body
    let query = "insert into category (name,description) values(?,?)";
    connection.query(query, [category.name, category.description], (err, results) => {
        if (!err) {
            return res.status(200).json({ message: "Category added successfully !!!" })
        } else {
            return res.status(500).json(err)
        }
    })
})

router.get('/get-category', auth.authenticateToken, (req, res) => {
    const { page, pageSize,sortBy } = req.query;
    let sort_by = sortBy ? sortBy : 'asc'
    let page_size = pageSize ? pageSize: "10"

    const offset = (page - 1) * page_size

    const countTotalQuery = `SELECT COUNT(*) as totalData FROM category`

    connection.query(countTotalQuery, (err, results) => {
        if (err) {
            return res.status(500).json(err)
        }
        const totalData = results[0].totalData
        let query = `SELECT * from category ORDER BY name ${sort_by?.toUpperCase()} LIMIT ${page_size} OFFSET ${offset}`
        connection.query(query, (err, categoryResulsts) => {
            if (err)  {
                return res.status(500).json(err)
            }
            res.json({
                totalData,
                categoryList: categoryResulsts
            })
        })
    })

})
router.put('/update', auth.authenticateToken, (req, res) => {
    const { name, description, id } = req.body
    let query = "update category set name=? ,description=? where id=?";
    connection.query(query, [name, description, id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(400).json({
                    message: "Category id doesnot matched"
                })
            }
            else {
                return res.status(200).json("Category updated successfully !!!")
            }

        } else {
            return res.status(500).json(err)
        }
    })
})
router.delete('/delete/:id', auth.authenticateToken, (req, res) => {
    const {id } = req.params
    const query = 'SELECT * FROM category WHERE id= ?'
    connection.query(query, [id],(error,results)=> {
        if(error) {
            return res.status(500).json({error: "Internal server error"})
        } else if(results.length <1) {
            return res.status(400).json({error: "Invalid category id"})
        }
        const deleteQuery = 'DELETE FROM category WHERE id=?'
        connection.query(deleteQuery,[id],(dError,dResulsts)=> {
            if(dError) {
                return res.status(500).json({error: "Internal server error"})
            }
            return res.status(200).json({message: "Category deleted successfully"})
        })
    })
})

module.exports = router