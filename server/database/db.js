const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const DBConnect = async (req, res) => {
    try {
        const MONGO_URI = process.env.MONGODB_URI
        await mongoose.connect(MONGO_URI)

        console.log(`Database Connected`)
        console.log(`===============================================\n`)

    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

module.exports = DBConnect
