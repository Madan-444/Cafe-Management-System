
const express = require('express');
const connection = require('../connection')
const router = express.Router()
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')
const auth = require('../middlewares/authentication')
const checkRole = require('../middlewares/checkRole')
require('dotenv').config()

router.post('/signup',(req,res)=> {
    let user = req.body;
    // console.log("user",user)
    query = "select email, password, role, status from user where email=?"
    connection.query(query,[user.email],(err,results)=> {

        if(!err) {
            
            if(results.length <=0) {
                query= "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?, 'false','user')"
                connection.query(query,[user.name,user.contactNumber,user.email,user.password],(err,results)=> {
    
                    if(!err) {
                        return res.status(200).json({message: "Successfully Registered"})
                    } else {
                        return res.status(500).json(err)
                    }
                })
            } else {
                return res.status(500).json({message: "Email Already Exist."})
            }
        } else {
            res.status(500).json({message: "Database error. Try again later."})
        }
    })

})
router.post('/login',(req,res)=> {
    const user = req.body

    query = "select email,password,role,status from user where email=?"
    connection.query(query,[user.email],(err,results)=> {
        if(!err) {
            if(results.length <=0 || results[0].password !=user.password) {
                return res.status(401).json({message: "Incorrect email or password. Plz try valid email and password"})
            } else if(results[0].status === 'false') {
                return res.status(401).json({message: "Wait for Admin Approval"})
            } else if(results[0].password === user.password) {
                const response = {email: results[0].email,role: results[0]}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn: '8h'})
                res.status(200).json({token: accessToken})
            } else {
                return res.status(400).json({message: "Internal server error. Try again later."})
            }
        } else {
            return res.status(500).json(err);
        }
    })

    
})

router.post('/forgot-password',(req,res)=> {
    const user = req.body
    query = "select email,password from user where email=?"
    connection.query(query,[user.email],(err,results)=> {
        console.log("my resutls",results)
        if(!err) {
            if(results.length<=0) {
                return res.status(200).json({message: "Password sent successfully to your email"})
            }
            else {
                const message = `
                <h2>Hello Stranger !!!</h2>
                <p>Your login credential is:</p>
                <p>email: ${results[0].email}</p>
                <p>password: ${results[0].password}</p>
            
                <p>Regards...</p>
                <p>Cafe management Team</p>
              `
              const subject = "Forgot password recovery"
              const send_to = results[0].email
              const sent_from = process.env.EMAIL
              try{
                sendEmail(subject,message,send_to,sent_from)
                res.status(200).json({success: true, message: "Email Sent successfully!!!"})
              } catch {
                res.status(500).json(err)
                
              }
            
            }
        } else {
            return res.status(500).json(err)
        }
    })
})
router.get('/get-users',auth.authenticateToken,checkRole.checkRole,(req,res)=> {
    var query = "select id,name,email,contactNumber,status from user where role='user'"
    connection.query(query,(err,results)=> {
        if(!err) {
            res.status(200).json(results)
            
        } else {
            res.status(500).json(err)
        }
    })
})
router.patch('/update',auth.authenticateToken,(req,res)=> {

    const {name, contactNumber,role,status,id} = req.body
    var query = `UPDATE user SET name= '${name}', contactNumber='${contactNumber}', role='${role}' where id=${id}`
    connection.query(query,(err,results)=> {
        if(!err) {
            if(results.affectedRows ==0) {
                return res.status(404).json({message: "User id doesnot exist"})
            }
            return res.status(200).json({message: "User Updated Successfully !!!"})
        } else {
            return res.status(500).json(err)
        }
    })
})
router.get('/checkToken',(req,res)=> {
    return res.status(200).json({
        message: true
    })
})

router.put('/changePassword',auth.authenticateToken,(req,res)=> {
    const email = res.locals.email
    const {oldPassword,password} = req.body

    var query = `select * from user where email='${email}' and password='${oldPassword}'`;
    connection.query(query,[email,oldPassword],(err,results)=> {
        console.log("the result i got",results)
        if(!err) {
            if(results.length <=0) {
                return res.status(400).json({message: "Email or old password doesn't matched. Try again."})

            } else {
                // let newQuery = `UPDATE user set password= '${password}' where email='${email}'`
                let newQuery = "update user set password=? where email=?"
                connection.query(newQuery,[password,email],(err,results)=> {
                    if(!err) {
                        return res.status(200).json({message: "password changed successfully !!"})
                    } else {
                        return res.status(500).json(err)
                    }
                })
            }

        } else {
            return res.status(400).json(err)
        }
    })

})

module.exports = router