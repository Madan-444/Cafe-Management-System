require("dotenv").config();

function checkRole(req, res, next) {
  if (res.locals.role.role == 'user'){
    return res.status(401).json({message: "You are not permited todo that"})
  } else {

   next();
  }
  
}

module.exports = {checkRole:checkRole}