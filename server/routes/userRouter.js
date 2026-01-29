const express = require('express')
const { UpDateUser } = require('../controllers/userController')
const verifyToken = require('../middleware/authMiddleware')

const userRouter = express.Router()
userRouter.put('/', verifyToken, UpDateUser)

module.exports = userRouter