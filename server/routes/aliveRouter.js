const express = require('express')
const aliveRouter = express.Router()
const aLive = require('../controllers/aliveController')

aliveRouter.get('/', aLive)

module.exports = aliveRouter
