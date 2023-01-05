const User = require('../model/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const jwt = require("jsonwebtoken");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_SECRET_EXPIRES_IN,
    });
  };
  
  
  const sendToken = (user, statusCode, res) => {
      const token = signToken(user._id)
  
      user.password = undefined
  
      res.status(statusCode).json({
          status: "success",
          token,
          data: {
              user
          }
      })
  }
  

exports.signup = catchAsync(async (req,res,next) => {
    const rb = req.body
    const newUser = await User.create({
        username: rb.username,
        email: rb.email,
        password: rb.password,
        passwordConfirm: rb.passwordConfirm
    })
    res.status(201).json({
        status:"success",
        data: {
            newUser
        }
    })
})

exports.login = catchAsync(async (req,res,next) => {
    const {email, password} = req.body

    if(!email || !password){
        return next(new AppError('Please provide an email and password', 401))
    }

    const check = await User.findOne({email}).select("+password")

    const correct = await check.correctPassword(password, check.password)
    
    if(!check || !correct){
        return next(new AppError('Incorrect email or password',401))
    }
   const tokenObj = {id: check.id}
   const token = await signToken(tokenObj)
   const user = {
    token,
    id: check.id,
    email: check.email,
    username: check.username
   }
   req.session.info = user
   return res.status(200).json(user)

})


exports.logout = catchAsync(async (req,res,next) => {
    req.session.destroy((err) => {
        if(err){
            console.log(err);
            return res.send(false)
        }

        res.clearCookie(process.env.SESSION_NAME)
        return res.send(true)
    })
})