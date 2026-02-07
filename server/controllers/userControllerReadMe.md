# User Profile Update Controller - Complete Documentation

## Overview
This module handles user profile updates in a Node.js application, specifically managing username changes and avatar uploads with Cloudinary integration and Redis caching.

---

## Table of Contents
1. [Dependencies & Setup](#dependencies--setup)
2. [Core Functionality](#core-functionality)
3. [Code Walkthrough](#code-walkthrough)
4. [Key Concepts Explained](#key-concepts-explained)
5. [Error Handling](#error-handling)
6. [Redis Cache Invalidation Strategy](#redis-cache-invalidation-strategy)
7. [Important Notes & Issues](#important-notes--issues)
8. [Usage Example](#usage-example)
9. [Environment Variables](#environment-variables-needed)

---

## Dependencies & Setup

### Required Packages
```javascript
const User = require('../models/User')
const cloudinary = require('../config/cloudnary')
const { Readable } = require('stream')
const Redis = require('redis')
```

**What each does:**
- **User**: Mongoose model for database operations
- **cloudinary**: Cloud storage service for images
- **Readable**: Node.js stream utility for handling file buffers
- **Redis**: In-memory cache for performance optimization

### Redis Client Initialization
```javascript
const redisClient = Redis.createClient()
redisClient.on('error', (err) => console.error('Redis Client Error', err))
redisClient.connect()
```

**Understanding this:**
- `createClient()`: Creates a Redis connection instance
- `.on('error', callback)`: Event listener for connection errors
- `.connect()`: Establishes the connection to Redis server

---

## Core Functionality

The `UpDateUser` function performs three main operations:

1. **Username Update**: Changes user's username if provided
2. **Avatar Upload**: Uploads image to Cloudinary and updates user profile
3. **Cache Invalidation**: Clears Redis cache for all users

---

## Code Walkthrough

### 1. Function Signature
```javascript
const UpDateUser = async (req, res) => {
```
- **async**: Function returns a Promise, allows `await` usage
- **req**: Express request object (contains body, file, user data)
- **res**: Express response object (for sending responses)

---

### 2. Extract Data & Validate User
```javascript
const { username } = req.body
const existingUser = req.user
```

**Destructuring Assignment:**
```javascript
const { username } = req.body
// Same as: const username = req.body.username
```

**Middleware Assumption:**
- `req.user` is populated by authentication middleware
- Contains the logged-in user's database record

**User Validation:**
```javascript
if (!existingUser) {
    return res.status(404).json({
        error: 'User not found'
    })
}
```

---

### 3. Username Update Logic
```javascript
if (username) {
    existingUser.username = username
}
```

**Why this works:**
- `existingUser` is a Mongoose document (reference type)
- Direct assignment modifies the object
- Changes saved later with `.save()`

---

### 4. Avatar Upload to Cloudinary

#### Understanding `req.file`
Comes from middleware like **Multer**:
```javascript
// Typical multer setup (not shown in code)
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
// Route: app.put('/user', upload.single('avatar'), UpDateUser)
```

#### The Upload Process
```javascript
if (req.file) {
    const stream = Readable.from(req.file.buffer)
```

**Stream Creation:**
- `req.file.buffer`: Binary data of uploaded file (Buffer object)
- `Readable.from()`: Converts buffer to readable stream
- **Why streams?** Efficient for large files, prevents memory overflow

---

#### Promise-Based Upload
```javascript
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
```

**Breaking it down:**

**Cloudinary Options:**
- `folder`: Organizes uploads in Cloudinary dashboard
- `resource_type: 'auto'`: Auto-detects file type (image/video/raw)
- `public_id`: Unique identifier (overwrites old avatar)

**Callback to Promise Pattern:**
```javascript
// Cloudinary uses callbacks, we convert to Promise
new Promise((resolve, reject) => {
    // Callback function becomes Promise resolver
    cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) reject(error)    // Promise fails
        else resolve(result)         // Promise succeeds
    })
})
```

**Stream Piping:**
```javascript
stream.pipe(uploadStream)
```
- `.pipe()`: Connects readable stream to writable stream
- Data flows: `req.file.buffer` → `stream` → `uploadStream` → Cloudinary

**Storing the URL:**
```javascript
existingUser.avatar = result.secure_url
```
- `result.secure_url`: HTTPS URL of uploaded image
- Saved to user's document

---

### 5. Save Changes to Database
```javascript
await existingUser.save()
```
- Mongoose `.save()`: Commits all changes to MongoDB
- Validates data, runs hooks, updates document

---

### 6. Redis Cache Invalidation
```javascript
try {
    const allUsers = await User.find()
    await Promise.all(
        allUsers.map(user => redisClient.del`users:${user._id.toString()}`)
    )
} catch (cacheError) {
    console.warn('Warning: Could not invalidate Redis cache:', cacheError)
}
```

**Why invalidate cache?**
When User A updates their avatar, User B's cached user list shows the old avatar. Invalidating ensures fresh data on next fetch.

**The Logic:**
1. `User.find()`: Gets all users from database
2. `.map()`: Transforms each user into a delete operation
3. `Promise.all()`: Executes all deletes concurrently

**⚠️ CRITICAL BUG:**
```javascript
redisClient.del`users:${user._id.toString()}`
```
**This is wrong!** Should be:
```javascript
redisClient.del(`users:${user._id.toString()}`)
```

**Template Literals vs Function Calls:**
```javascript
// WRONG - Tagged template literal (special syntax)
redisClient.del`users:${id}`

// CORRECT - Function call with string argument
redisClient.del(`users:${id}`)
```

---

### 7. Hide Sensitive Data
```javascript
existingUser.password = undefined
```
- Removes password from response object
- **Does NOT delete from database** (not saved again)
- Security best practice

---

### 8. Success Response
```javascript
return res.status(200).json({
    message: 'Profile updated successfully',
    user: existingUser
})
```

---

## Key Concepts Explained

### 1. Async/Await
```javascript
// Without async/await
User.save()
    .then(user => res.json(user))
    .catch(err => res.status(500).json(err))

// With async/await (cleaner)
try {
    const user = await User.save()
    res.json(user)
} catch (err) {
    res.status(500).json(err)
}
```

---

### 2. Destructuring
```javascript
// Object destructuring
const { username, email } = req.body
// Same as:
const username = req.body.username
const email = req.body.email

// Array destructuring
const [first, second] = [1, 2, 3]
// first = 1, second = 2
```

---

### 3. Promises
```javascript
new Promise((resolve, reject) => {
    // resolve(value) - Success
    // reject(error)  - Failure
})
```

---

### 4. Stream Operations
```javascript
const stream = Readable.from(buffer)  // Create readable
stream.pipe(destination)              // Connect to writable
```

**Benefits:**
- Memory efficient (processes chunks)
- Faster for large files
- Non-blocking I/O

---

### 5. MongoDB/Mongoose
```javascript
const existingUser = await User.findById(id)  // Query
existingUser.username = 'new'                  // Modify
await existingUser.save()                      // Persist
```

---

### 6. Express Response Methods
```javascript
res.status(200)           // Set HTTP status code
res.json({ data })        // Send JSON response
res.status(404).json({})  // Chain methods
```

---

## Error Handling

### 1. User Not Found (404)
```javascript
if (!existingUser) {
    return res.status(404).json({ error: 'User not found' })
}
```

### 2. Upload Failure (400)
```javascript
catch (uploadError) {
    return res.status(400).json({ error: 'Failed to upload avatar' })
}
```

### 3. Duplicate Username (400)
```javascript
if (error.code === 11000) {  // MongoDB duplicate key error
    return res.status(400).json({ error: 'Username already taken' })
}
```

### 4. Server Error (500)
```javascript
return res.status(500).json({ error: 'Internal Server Error' })
```

### 5. Non-Blocking Cache Errors
```javascript
catch (cacheError) {
    console.warn('Warning: Could not invalidate Redis cache:', cacheError)
    // Continues execution - doesn't fail the request
}
```

---

## Redis Cache Invalidation Strategy

### Current Implementation
```javascript
// Delete cache for ALL users when ONE user updates profile
const allUsers = await User.find()
allUsers.map(user => redisClient.del(`users:${user._id}`))
```

**Problems:**
- ❌ Inefficient: Deletes thousands of keys for one update
- ❌ Database load: Fetches all users unnecessarily
- ❌ Slow: Sequential deletes

### Better Approach
```javascript
// Only delete relevant caches
await redisClient.del(`user:${existingUser._id}`)
await redisClient.del('users:list')  // If you cache a user list
```

---

## Important Notes & Issues

### ✅ Good Practices
1. Non-blocking cache errors (using `console.warn`)
2. Hiding passwords in responses
3. Specific error codes (11000 for duplicates)
4. Using streams for file uploads

---

### ❌ Issues to Fix

#### 1. Template Literal Bug
```javascript
// Current (WRONG)
redisClient.del`users:${user._id.toString()}`

// Fixed (CORRECT)
redisClient.del(`users:${user._id.toString()}`)
```

---

#### 2. Inefficient Cache Invalidation
```javascript
// Current: Deletes ALL user caches
const allUsers = await User.find()

// Better: Delete only what's needed
await redisClient.del(`user:${existingUser._id}`)
```

---

#### 3. No Transaction Safety
If `.save()` fails after Cloudinary upload, you have orphaned images:
```javascript
// Solution: Use try-catch around both operations
let uploadedUrl
try {
    // Upload
    uploadedUrl = result.secure_url
    existingUser.avatar = uploadedUrl
    await existingUser.save()
} catch (saveError) {
    // Rollback: delete uploaded image
    if (uploadedUrl) {
        await cloudinary.uploader.destroy(public_id)
    }
    throw saveError
}
```

---

#### 4. Missing Input Validation
```javascript
// Add before processing
if (username && username.length < 3) {
    return res.status(400).json({ error: 'Username too short' })
}
```

---

## Usage Example

```javascript
// Frontend code
const formData = new FormData()
formData.append('username', 'newUsername')
formData.append('avatar', fileInput.files[0])

await fetch('/api/user/update', {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer token' },
    body: formData
})
```

---

## Environment Variables Needed

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_URL=redis://localhost:6379
```

---

## Installation

```bash
npm install express mongoose redis cloudinary multer
```

---

## Complete Code with Fixes

```javascript
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

        // Validate username if provided
        if (username) {
            if (username.length < 3) {
                return res.status(400).json({
                    error: 'Username must be at least 3 characters'
                })
            }
            existingUser.username = username
        }

        let uploadedPublicId
        if (req.file) {
            try {
                const stream = Readable.from(req.file.buffer)
                const publicId = `avatar_${existingUser._id}`
                
                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'ping-me/avatars',
                            resource_type: 'auto',
                            public_id: publicId
                        },
                        (error, result) => {
                            if (error) reject(error)
                            else resolve(result)
                        }
                    )
                    stream.pipe(uploadStream)
                })
                
                uploadedPublicId = publicId
                existingUser.avatar = result.secure_url
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError)
                return res.status(400).json({
                    error: 'Failed to upload avatar'
                })
            }
        }

        // Save changes
        try {
            await existingUser.save()
        } catch (saveError) {
            // Rollback: delete uploaded image if save fails
            if (uploadedPublicId) {
                await cloudinary.uploader.destroy(uploadedPublicId).catch(err => 
                    console.error('Failed to cleanup uploaded image:', err)
                )
            }
            throw saveError
        }

        // Invalidate only relevant Redis cache
        try {
            await redisClient.del(`user:${existingUser._id.toString()}`)
            await redisClient.del('users:list') // If you cache a full user list
        } catch (cacheError) {
            console.warn('Warning: Could not invalidate Redis cache:', cacheError)
        }

        // Hide password
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
```

---

## Summary
This controller efficiently handles profile updates with cloud storage and caching. The fixed version includes proper Redis syntax, optimized cache invalidation, transaction safety, and input validation for production use.

---

## License
MIT

---

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
