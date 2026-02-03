const User = require('../models/User')
const cloudinary = require('../config/cloudnary')
const { Readable } = require('stream')
const Redis = require('redis')

const redisClient = Redis.createClient()
redisClient.on('error', (err) => console.error('Redis Client Error', err))
redisClient.connect()

const UpDateUser = async (req, res) => {
    try {
        const { username } = req.body
        const existingUser = req.user

        if (!existingUser) {
            return res.status(404).json({
                error: 'User not found'
            })
        }

        if (username) {
            existingUser.username = username
        }

        if (req.file) {
            // Upload avatar to Cloudinary
            try {
                const stream = Readable.from(req.file.buffer)
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'ping-me/avatars',
                            resource_type: 'auto',
                            public_id: `avatar_${existingUser._id}`
                        },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    stream.pipe(uploadStream)
                })
                existingUser.avatar = result.secure_url
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError)
                return res.status(400).json({
                    error: 'Failed to upload avatar'
                })
            }
        }

        await existingUser.save()

        // Invalidate Redis cache for all users' user lists
        // This ensures the updated avatar is fetched fresh
        try {
            const allUsers = await User.find()
            await Promise.all(
                allUsers.map(user => redisClient.del(`users:${user._id.toString()}`))
            )
        } catch (cacheError) {
            console.warn('Warning: Could not invalidate Redis cache:', cacheError)
        }

        // hide password
        existingUser.password = undefined

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: existingUser
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                error: 'Username already taken'
            })
        }

        console.error(error)
        return res.status(500).json({
            error: 'Internal Server Error'
        })
    }
}

module.exports = { UpDateUser }
