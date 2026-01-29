const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const http = require('http')
const aliveRouter = require('../routes/aliveRouter')
const DBConnect = require('../database/db')

const app = express()
const server = http.createServer(app)
dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

DBConnect();

app.use('/api/status', aliveRouter)
const PORT = process.env.PORT || 1965

server.listen(PORT, () => {
  console.log(`\n===============================================`)
  console.log(` Server running at http://localhost:${PORT}`)
  console.log(` Health Check: http://localhost:${PORT}/api/status `)
  console.log(`===============================================`)
})
