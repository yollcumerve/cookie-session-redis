const Router = require('express').Router()
const userService = require('../service/userService')

Router.post('/signup', userService.signup)

Router.post('/login', userService.login)

Router.get('/logout', userService.logout)


module.exports = Router