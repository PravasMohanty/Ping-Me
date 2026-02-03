const express = require('express')
const { UpDateUser } = require('../controllers/userController')
const verifyToken = require('../middleware/authMiddleware')
const upload = require('../middleware/multerMiddleware')

const userRouter = express.Router()
userRouter.put('/update-profile', verifyToken, upload.single('avatar'), UpDateUser)

module.exports = userRouter