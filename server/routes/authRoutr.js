const express = require('express')
const { Login, Register, CheckAuth } = require('../controllers/authController')
const verifyToken = require('../middleware/authMiddleware')

const authRouter = express.Router()

authRouter.post('/login', Login)
authRouter.post('/register', Register)
authRouter.get('/check', verifyToken, CheckAuth)

module.exports = authRouter;