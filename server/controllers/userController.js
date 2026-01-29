const User = require('../models/User')
const cloudinary = require('../database/cloudinary')

const UpDateUser = async (req, res) => {
    try {
        const { username, avatar } = req.body
        const existingUser = req.user

        if (!existingUser) {
            return res.status(404).json({
                error: 'User not found'
            })
        }

        if (username) {
            existingUser.username = username
        }

        if (avatar) {
            // DELETE OLD AVATAR 
            if (
                existingUser.avatar &&
                existingUser.avatar.includes('cloudinary')
            ) {
                const publicId = existingUser.avatar
                    .split('/')
                    .pop()
                    .split('.')[0]

                await cloudinary.uploader.destroy(`avatars/${publicId}`)
            }

            // UPLOAD NEW AVATAR
            const uploadResult = await cloudinary.uploader.upload(avatar, {
                folder: 'avatars'
            })

            existingUser.avatar = uploadResult.secure_url
        }

        await existingUser.save()

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
