const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')


/* =========================
   LOGIN 
========================= */
const Login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      })
    }

    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Incorrect password'
      })
    }

    const token = generateToken(existingUser);

    existingUser.password = undefined

    return res.status(200).json({
      success: true,
      message: 'Login Successful',
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        username: existingUser.username,
        groupsPresent: existingUser.groupsPresent,
        groupCount: existingUser.groupCount,
        avatar: existingUser.avatar
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: 'Internal Server Error'
    })
  }
}

/* =========================
   REGISTER
========================= */
const Register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        error: 'All fields are required'
      })
    }

    const existingUserByEmail = await User.findOne({ email })
    const existingUserByUsername = await User.findOne({ username })

    if (existingUserByEmail || existingUserByUsername) {
      return res.status(400).json({
        error: 'User already exists'
      })
    }

    const hashedPass = await bcrypt.hash(password, 12)

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPass,
      groupsPresent: [],
      groupCount: 0,
      firstLogin: true
    })

    await newUser.save()

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'User Created',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: 'Internal Server Error'
    })
  }
}


/* =========================
   CHECK AUTH
========================= */
const CheckAuth = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

module.exports = { Login, Register, CheckAuth }
