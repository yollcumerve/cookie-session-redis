const AppError = require("../utils/appError");


const sendErrorDev = (err,res) => {
    res.status(statuscode).json({
        status: err.status,
        message: err.message
    })
}

module.exports = (err,req,res,next) => {
    if(process.env.NODE_ENV === "development"){
        sendErrorDev(err,res)
    }
}