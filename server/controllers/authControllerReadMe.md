# Authentication Controller - Complete Documentation

## Overview
This module handles user authentication in a Node.js/Express application, providing three core functionalities: **Login**, **Register**, and **CheckAuth**. It uses bcrypt for password hashing and JWT tokens for session management.

---

## Table of Contents
1. [Dependencies & Setup](#dependencies--setup)
2. [Architecture Overview](#architecture-overview)
3. [Function 1: Login](#function-1-login)
4. [Function 2: Register](#function-2-register)
5. [Function 3: CheckAuth](#function-3-checkauth)
6. [Key Concepts Explained](#key-concepts-explained)
7. [Security Best Practices](#security-best-practices)
8. [Error Handling](#error-handling)
9. [API Endpoints](#api-endpoints)
10. [Issues & Improvements](#issues--improvements)

---

## Dependencies & Setup

### Required Packages
```javascript
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')
```

**What each does:**
- **bcrypt**: Library for hashing passwords securely
- **User**: Mongoose model for user database operations
- **generateToken**: Utility function that creates JWT tokens

### Installation
```bash
npm install bcryptjs jsonwebtoken mongoose express
```

---

## Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ├──── POST /auth/register ────► Register()
       │
       ├──── POST /auth/login ───────► Login()
       │
       └──── GET  /auth/check ───────► CheckAuth()
                                        (requires token)
```

**Flow:**
1. **Register**: Create new user → Hash password → Save to DB → Return token
2. **Login**: Find user → Verify password → Return token
3. **CheckAuth**: Verify token → Return user data

---

## Function 1: Login

### Purpose
Authenticates existing users by verifying email and password, then returns a JWT token for subsequent requests.

### Code Breakdown

#### Step 1: Extract Credentials
```javascript
const { email, password } = req.body
```

**Destructuring** - Extracts values from request body:
```javascript
// Same as:
const email = req.body.email
const password = req.body.password
```

---

#### Step 2: Input Validation
```javascript
if (!email || !password) {
    return res.status(400).json({
        error: 'Email and password are required'
    })
}
```

**Why this check?**
- Prevents unnecessary database queries
- Returns early with clear error message
- **400 Bad Request**: Client sent incomplete data

**Logical OR (`||`) operator:**
```javascript
// Returns true if EITHER is missing
!email || !password

// Examples:
!undefined || !undefined  → true  (both missing)
!undefined || !"pass123"  → true  (email missing)
!"user@x.com" || !undefined → true  (password missing)
!"user@x.com" || !"pass123" → false (both present)
```

---

#### Step 3: Find User by Email
```javascript
const existingUser = await User.findOne({ email })
```

**Mongoose `.findOne()` method:**
- Searches for **first matching document**
- Returns: User object if found, `null` if not found
- Query: `{ email: "user@example.com" }`

**Why `await`?**
```javascript
// Database operations are asynchronous
const user = await User.findOne({ email }) // Waits for result
// vs
User.findOne({ email }).then(user => { /* use user */ }) // Promise syntax
```

---

#### Step 4: Check if User Exists
```javascript
if (!existingUser) {
    return res.status(404).json({
        error: 'User not found'
    })
}
```

**HTTP Status Codes:**
- **404 Not Found**: Resource doesn't exist
- Better UX: Tells user the email isn't registered

**Security Note:**
⚠️ This reveals whether an email is registered. For higher security:
```javascript
// Generic message (doesn't reveal if email exists)
if (!existingUser) {
    return res.status(401).json({
        error: 'Invalid email or password'
    })
}
```

---

#### Step 5: Verify Password
```javascript
const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.password
)
```

**How `bcrypt.compare()` works:**
```javascript
// Plain text password from request
password = "myPassword123"

// Hashed password from database
existingUser.password = "$2a$12$KIXxGVzQ7Xj9k..."

// bcrypt.compare() internally:
// 1. Extracts salt from stored hash
// 2. Hashes input password with same salt
// 3. Compares hashes
// Returns: true or false
```

**Why NOT do this:**
```javascript
// ❌ WRONG - Never compare plain text
if (password === existingUser.password) { ... }
```

**Visual Example:**
```
Input: "hello123"
         ↓ (bcrypt hashes with stored salt)
"$2a$12$abc...xyz"
         ↓ (compare with stored hash)
"$2a$12$abc...xyz" === "$2a$12$abc...xyz" ✓
         ↓
Return: true
```

---

#### Step 6: Password Validation Check
```javascript
if (!isPasswordValid) {
    return res.status(401).json({
        error: 'Incorrect password'
    })
}
```

**HTTP 401 Unauthorized:**
- Credentials are invalid
- User is not authenticated

---

#### Step 7: Generate JWT Token
```javascript
const token = generateToken(existingUser);
```

**What `generateToken()` typically does:**
```javascript
// In utils/generateToken.js
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}
```

**JWT Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M...
│                                         │
├─ Header (algorithm)                     ├─ Payload (user data)
                                          │
                                          └─ Signature (verification)
```

---

#### Step 8: Hide Password from Response
```javascript
existingUser.password = undefined
```

**Important Notes:**
- This only removes password from the **response object**
- Does NOT delete from database
- Prevents accidental password leaks in API responses

**How it works:**
```javascript
// Before:
existingUser = {
    _id: "123",
    email: "user@example.com",
    password: "$2a$12$hashed..." // ⚠️ Sensitive!
}

// After:
existingUser.password = undefined

// Result:
existingUser = {
    _id: "123",
    email: "user@example.com",
    password: undefined // Won't be sent in JSON
}
```

---

#### Step 9: Send Success Response
```javascript
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
```

**HTTP 200 OK**: Request succeeded

**Response Structure:**
```json
{
    "success": true,
    "message": "Login Successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe",
        "groupsPresent": [],
        "groupCount": 0,
        "avatar": "https://cloudinary.com/..."
    }
}
```

---

### Complete Login Flow Diagram
```
User submits credentials
         ↓
Extract email & password
         ↓
Validate inputs ──────────────► 400 (missing fields)
         ↓
Find user by email
         ↓
User exists? ─────────────────► 404 (user not found)
         ↓
Compare password with hash
         ↓
Password valid? ──────────────► 401 (incorrect password)
         ↓
Generate JWT token
         ↓
Hide password from object
         ↓
Return 200 with token & user data
```

---

## Function 2: Register

### Purpose
Creates a new user account with hashed password and returns a JWT token for immediate authentication.

### Code Breakdown

#### Step 1: Extract User Data
```javascript
const { name, email, username, password } = req.body
```

**Destructuring multiple fields:**
```javascript
// Equivalent to:
const name = req.body.name
const email = req.body.email
const username = req.body.username
const password = req.body.password
```

---

#### Step 2: Validate All Required Fields
```javascript
if (!name || !email || !username || !password) {
    return res.status(400).json({
        error: 'All fields are required'
    })
}
```

**Multiple OR conditions:**
```javascript
// Returns true if ANY field is missing
!name || !email || !username || !password
```

**Truth table:**
```
name     email    username password  →  Result
❌       ✓        ✓        ✓        →  true (error)
✓        ❌       ✓        ✓        →  true (error)
✓        ✓        ✓        ✓        →  false (all present)
```

---

#### Step 3: Check for Existing Users
```javascript
const existingUserByEmail = await User.findOne({ email })
const existingUserByUsername = await User.findOne({ username })
```

**Why two separate queries?**
- Email must be unique
- Username must be unique
- Need to check both independently

**Parallel vs Sequential:**
```javascript
// Current (Sequential - slower):
const user1 = await User.findOne({ email })      // Wait
const user2 = await User.findOne({ username })   // Then wait again

// Better (Parallel - faster):
const [user1, user2] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username })
])
```

---

#### Step 4: Validate Uniqueness
```javascript
if (existingUserByEmail || existingUserByUsername) {
    return res.status(400).json({
        error: 'User already exists'
    })
}
```

**Logical OR check:**
- Returns error if **either** email or username exists
- Could be improved to specify which field conflicts:

```javascript
// Better error messages:
if (existingUserByEmail) {
    return res.status(400).json({ error: 'Email already registered' })
}
if (existingUserByUsername) {
    return res.status(400).json({ error: 'Username already taken' })
}
```

---

#### Step 5: Hash Password
```javascript
const hashedPass = await bcrypt.hash(password, 12)
```

**Understanding `bcrypt.hash()`:**
```javascript
bcrypt.hash(password, saltRounds)
```

**Parameters:**
- `password`: Plain text password
- `12`: Salt rounds (cost factor)

**What happens internally:**
```
Input: "myPassword123"
         ↓
Generate random salt
         ↓
Hash password with salt (12 rounds)
         ↓
Output: "$2a$12$KIXxGVzQ7Xj9kL..." (60 chars)
```

**Salt Rounds Explained:**
```javascript
Rounds | Time     | Security
-------|----------|----------
10     | ~65ms    | Minimum recommended
12     | ~250ms   | Good balance (used here)
14     | ~1000ms  | High security
16     | ~4000ms  | Very high (might be slow)
```

**Why salting?**
```
Without salt:
"password123" → "482c811da5d5b4bc6d497ffa98491e38" (always same)
"password123" → "482c811da5d5b4bc6d497ffa98491e38" (predictable)

With salt:
"password123" + "salt1" → "$2a$12$abc...xyz"
"password123" + "salt2" → "$2a$12$def...uvw" (different!)
```

---

#### Step 6: Create New User Object
```javascript
const newUser = new User({
    name,
    email,
    username,
    password: hashedPass,
    groupsPresent: [],
    groupCount: 0,
    firstLogin: true
})
```

**Mongoose Model Constructor:**
- `new User()` creates a document instance
- Does NOT save to database yet

**ES6 Property Shorthand:**
```javascript
const newUser = new User({
    name: name,        // Old way
    email: email,      // Old way
    username,          // ES6 shorthand (same as username: username)
    password: hashedPass
})
```

**Default Values:**
```javascript
groupsPresent: []    // Empty array
groupCount: 0        // Zero
firstLogin: true     // Boolean flag
```

---

#### Step 7: Save to Database
```javascript
await newUser.save()
```

**What `.save()` does:**
1. Validates data against schema
2. Runs pre-save hooks (if defined)
3. Inserts document into MongoDB
4. Returns the saved document with `_id`

**Pre-save hook example (in User model):**
```javascript
// In models/User.js
userSchema.pre('save', function(next) {
    // Runs before saving
    this.createdAt = Date.now()
    next()
})
```

---

#### Step 8: Generate Token & Response
```javascript
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
```

**HTTP 201 Created**: Resource successfully created

**Why return token immediately?**
- Auto-login after registration
- Better UX (no need to login again)

---

### Complete Registration Flow Diagram
```
User submits registration data
         ↓
Extract all fields
         ↓
Validate all fields ──────────► 400 (missing fields)
         ↓
Check if email exists
         ↓
Check if username exists
         ↓
User exists? ─────────────────► 400 (already exists)
         ↓
Hash password (12 rounds)
         ↓
Create new User instance
         ↓
Save to database
         ↓
Generate JWT token
         ↓
Return 201 with token & user
```

---

## Function 3: CheckAuth

### Purpose
Verifies the validity of a JWT token and returns the authenticated user's data. Used to maintain sessions and protect routes.

### Code Breakdown

#### Step 1: Extract User ID from Token
```javascript
const userId = req.userId;
```

**Where does `req.userId` come from?**

This is set by **authentication middleware** that runs before this controller:

```javascript
// middleware/auth.js (typical implementation)
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKEN"
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.id  // ← Sets this
        next()
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}
```

**Route setup:**
```javascript
// In routes/auth.js
router.get('/check', authMiddleware, CheckAuth)
//                    ↑ Runs first    ↑ Then this
```

---

#### Step 2: Query User Without Password
```javascript
const user = await User.findById(userId).select('-password');
```

**`.select('-password')` explained:**

```javascript
// WITHOUT select (returns all fields):
const user = await User.findById(userId)
// Result: { _id, name, email, password: "$2a$12..." } ⚠️

// WITH select('-password') (excludes password):
const user = await User.findById(userId).select('-password')
// Result: { _id, name, email, username, avatar } ✓
```

**Mongoose `.select()` syntax:**
```javascript
.select('-password')        // Exclude password
.select('name email')       // Include only name and email
.select('-password -email') // Exclude multiple fields
.select('+sensitiveField')  // Include field marked as select: false
```

**Why exclude password?**
- Even hashed passwords shouldn't be sent unnecessarily
- Reduces response size
- Security best practice

---

#### Step 3: Validate User Exists
```javascript
if (!user) {
    return res.status(401).json({
        success: false,
        error: 'User not found'
    })
}
```

**When would this happen?**
- User was deleted after token was issued
- Token contains invalid user ID
- Database inconsistency

**HTTP 401 Unauthorized:**
- Token is valid but user no longer exists
- Session is invalid

---

#### Step 4: Return User Data
```javascript
return res.status(200).json({
    success: true,
    user: {
        _id: user._id,
        id: user._id,      // Redundant (for backwards compatibility?)
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar
    }
});
```

**Response structure:**
```json
{
    "success": true,
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe",
        "avatar": "https://cloudinary.com/avatar.jpg"
    }
}
```

**Note:** Both `_id` and `id` are included (likely for frontend compatibility)

---

### Complete CheckAuth Flow Diagram
```
Client sends request with JWT
         ↓
Middleware extracts & verifies token ──► 401 (invalid/missing token)
         ↓
Sets req.userId from token payload
         ↓
CheckAuth() executes
         ↓
Query user by ID (exclude password)
         ↓
User exists? ─────────────────────────► 401 (user not found)
         ↓
Return 200 with user data
```

---

## Key Concepts Explained

### 1. Async/Await
```javascript
// Promise-based (older way)
User.findOne({ email })
    .then(user => {
        return bcrypt.compare(password, user.password)
    })
    .then(isValid => {
        // Handle result
    })
    .catch(err => {
        // Handle error
    })

// Async/await (modern way)
try {
    const user = await User.findOne({ email })
    const isValid = await bcrypt.compare(password, user.password)
    // Handle result
} catch (err) {
    // Handle error
}
```

---

### 2. Bcrypt Password Hashing

**One-way Hashing:**
```javascript
// Can go this way:
"password123" → bcrypt.hash() → "$2a$12$KIXx..."

// CANNOT reverse:
"$2a$12$KIXx..." → ??? → "password123" ❌
```

**Salt Rounds Impact:**
```javascript
bcrypt.hash("password", 12)
// Performs 2^12 = 4,096 iterations
// Takes ~250ms
// Security vs Performance trade-off
```

**Full Example:**
```javascript
// Registration
const hash = await bcrypt.hash("myPassword123", 12)
// Store: "$2a$12$Ro5nFZ..."

// Login
const isValid = await bcrypt.compare("myPassword123", "$2a$12$Ro5nFZ...")
// Returns: true
```

---

### 3. JWT (JSON Web Tokens)

**Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MyJ9.SflKxwRJSMeKKF2QT
│─────────── HEADER ───────────│─── PAYLOAD ──│──── SIGNATURE ────│
```

**Creating a token:**
```javascript
const jwt = require('jsonwebtoken')

const token = jwt.sign(
    { id: user._id, email: user.email },  // Payload
    'SECRET_KEY',                          // Secret
    { expiresIn: '7d' }                   // Options
)
```

**Verifying a token:**
```javascript
try {
    const decoded = jwt.verify(token, 'SECRET_KEY')
    // decoded = { id: "673...", email: "...", iat: 1234, exp: 5678 }
} catch (error) {
    // Token invalid or expired
}
```

**How it works:**
```
Client Login
     ↓
Server creates token with payload + secret
     ↓
Server sends token to client
     ↓
Client stores token (localStorage/cookies)
     ↓
Client sends token with each request
     ↓
Server verifies token signature
     ↓
Server extracts user data from payload
```

---

### 4. Mongoose Queries

**findOne() - Returns single document:**
```javascript
const user = await User.findOne({ email: 'john@example.com' })
// Returns: { _id: "123", name: "John", ... } or null
```

**findById() - Query by MongoDB _id:**
```javascript
const user = await User.findById('507f1f77bcf86cd799439011')
// Returns: User document or null
```

**select() - Field projection:**
```javascript
const user = await User.findById(id).select('name email')
// Returns: { _id: "123", name: "John", email: "john@..." }

const user = await User.findById(id).select('-password')
// Returns: All fields EXCEPT password
```

---

### 5. HTTP Status Codes

```javascript
200 OK              // Request succeeded
201 Created         // Resource created successfully
400 Bad Request     // Invalid input from client
401 Unauthorized    // Authentication failed
404 Not Found       // Resource doesn't exist
500 Internal Error  // Server error
```

**When to use each:**
```javascript
// 200 - Successful operation
res.status(200).json({ success: true, data: user })

// 201 - Created new resource
res.status(201).json({ success: true, user: newUser })

// 400 - Client input error
res.status(400).json({ error: 'Email is required' })

// 401 - Auth failure
res.status(401).json({ error: 'Invalid credentials' })

// 404 - Resource not found
res.status(404).json({ error: 'User not found' })

// 500 - Server error
res.status(500).json({ error: 'Database connection failed' })
```

---

### 6. Try-Catch Error Handling

```javascript
try {
    // Code that might throw errors
    const user = await User.findOne({ email })
    const isValid = await bcrypt.compare(password, user.password)
} catch (error) {
    // Handles ANY error from try block
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' })
}
```

**What gets caught:**
- Database errors
- Bcrypt errors
- Mongoose validation errors
- JavaScript runtime errors

---

## Security Best Practices

### ✅ What This Code Does Right

1. **Password Hashing**
```javascript
const hashedPass = await bcrypt.hash(password, 12)
// Never stores plain text passwords
```

2. **Hiding Passwords in Responses**
```javascript
existingUser.password = undefined
// or
.select('-password')
```

3. **JWT Token Authentication**
```javascript
const token = generateToken(user)
// Stateless authentication
```

4. **Input Validation**
```javascript
if (!email || !password) {
    return res.status(400).json({ error: '...' })
}
```

---

### ⚠️ Security Improvements Needed

#### 1. Generic Error Messages
```javascript
// CURRENT (reveals if email exists):
if (!existingUser) {
    return res.status(404).json({ error: 'User not found' })
}
if (!isPasswordValid) {
    return res.status(401).json({ error: 'Incorrect password' })
}

// BETTER (doesn't reveal which failed):
if (!existingUser || !isPasswordValid) {
    return res.status(401).json({ 
        error: 'Invalid email or password' 
    })
}
```

---

#### 2. Rate Limiting
```javascript
// Add middleware to prevent brute force
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, try again later'
})

router.post('/login', loginLimiter, Login)
```

---

#### 3. Password Strength Validation
```javascript
// In Register function
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

if (!passwordRegex.test(password)) {
    return res.status(400).json({
        error: 'Password must be 8+ chars with uppercase, lowercase, number, and special char'
    })
}
```

---

#### 4. Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
}
```

---

#### 5. SQL Injection Prevention
✅ **Already protected** by Mongoose (ORM handles sanitization)

But for extra safety:
```javascript
const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize()) // Removes $ and . from user input
```

---

#### 6. Account Lockout
```javascript
// In User model
const userSchema = new Schema({
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
})

// In Login function
if (user.loginAttempts >= 5 && user.lockUntil > Date.now()) {
    return res.status(423).json({ 
        error: 'Account locked. Try again later.' 
    })
}

// Reset on successful login
user.loginAttempts = 0
user.lockUntil = undefined

// Increment on failed login
user.loginAttempts += 1
user.lockUntil = Date.now() + 15 * 60 * 1000 // 15 min
```

---

## Error Handling

### Current Error Handling
```javascript
try {
    // Main logic
} catch (error) {
    console.log(error)
    return res.status(500).json({
        error: 'Internal Server Error'
    })
}
```

**Problems:**
- Generic error message (not helpful for debugging)
- Doesn't distinguish error types
- Security risk if detailed errors leak in production

---

### Improved Error Handling

```javascript
try {
    // Main logic
} catch (error) {
    console.error('Login error:', error)

    // MongoDB duplicate key error
    if (error.code === 11000) {
        return res.status(400).json({
            error: 'Email or username already exists'
        })
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: Object.values(error.errors).map(e => e.message).join(', ')
        })
    }

    // Bcrypt error
    if (error.name === 'BCryptError') {
        return res.status(500).json({
            error: 'Password processing failed'
        })
    }

    // Generic fallback
    return res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : error.message
    })
}
```

---

## API Endpoints

### 1. Register Endpoint

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
    "success": true,
    "message": "User Created",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe",
        "avatar": null
    }
}
```

**Error Responses:**
```json
// 400 - Missing fields
{ "error": "All fields are required" }

// 400 - User exists
{ "error": "User already exists" }

// 500 - Server error
{ "error": "Internal Server Error" }
```

---

### 2. Login Endpoint

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Login Successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe",
        "groupsPresent": [],
        "groupCount": 0,
        "avatar": "https://cloudinary.com/..."
    }
}
```

**Error Responses:**
```json
// 400 - Missing fields
{ "error": "Email and password are required" }

// 404 - User not found
{ "error": "User not found" }

// 401 - Wrong password
{ "error": "Incorrect password" }

// 500 - Server error
{ "error": "Internal Server Error" }
```

---

### 3. CheckAuth Endpoint

**Request:**
```http
GET /api/auth/check
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
    "success": true,
    "user": {
        "_id": "507f1f77bcf86cd799439011",
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe",
        "avatar": "https://cloudinary.com/..."
    }
}
```

**Error Responses:**
```json
// 401 - No token / Invalid token (from middleware)
{ "error": "Authentication required" }

// 401 - User not found
{ "success": false, "error": "User not found" }

// 500 - Server error
{ "success": false, "error": "Internal Server Error" }
```

---

## Issues & Improvements

### ❌ Current Issues

#### 1. Duplicate `id` Field in Response
```javascript
user: {
    _id: user._id,
    id: user._id,  // ← Redundant
    // ...
}
```

**Fix:**
```javascript
user: {
    id: user._id.toString(),
    // Remove _id or keep only one
}
```

---

#### 2. No Email Verification
```javascript
// Users can register with any email
const newUser = new User({ email, ... })
```

**Improvement:**
```javascript
// Add email verification token
const verificationToken = crypto.randomBytes(32).toString('hex')
const newUser = new User({ 
    email,
    emailVerified: false,
    verificationToken 
})

// Send verification email
await sendVerificationEmail(email, verificationToken)
```

---

#### 3. Inconsistent Error Response Format
```javascript
// Login uses 'error':
{ error: 'User not found' }

// CheckAuth uses 'success' + 'error':
{ success: false, error: 'User not found' }
```

**Standardize:**
```javascript
// All responses should use same format
{
    success: true/false,
    message: "...",
    data: { ... },
    error: "..." // only when success: false
}
```

---

#### 4. Password Not Excluded in Register
```javascript
// Register returns newUser directly
// If password wasn't removed in model, it could leak
return res.status(201).json({
    user: {
        id: newUser._id,
        // Should explicitly exclude or set to undefined
    }
})
```

**Fix:**
```javascript
newUser.password = undefined
// or
const userResponse = newUser.toObject()
delete userResponse.password
```

---

#### 5. No Logging
```javascript
catch (error) {
    console.log(error) // Only logs to console
}
```

**Better logging:**
```javascript
const winston = require('winston')
const logger = winston.createLogger({ /* config */ })

catch (error) {
    logger.error('Login failed', {
        error: error.message,
        stack: error.stack,
        userId: existingUser?._id
    })
}
```

---

#### 6. Sequential Database Queries
```javascript
// In Register
const existingUserByEmail = await User.findOne({ email })
const existingUserByUsername = await User.findOne({ username })
```

**Optimization:**
```javascript
// Run in parallel
const [existingUserByEmail, existingUserByUsername] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username })
])
```

---

### ✅ Improvements Summary

```javascript
// IMPROVED VERSION

const Register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body

        // 1. Enhanced validation
        if (!name || !email || !username || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            })
        }

        // 2. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            })
        }

        // 3. Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters'
            })
        }

        // 4. Parallel existence checks
        const [existingUserByEmail, existingUserByUsername] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ username })
        ])

        // 5. Specific error messages
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            })
        }
        if (existingUserByUsername) {
            return res.status(400).json({
                success: false,
                error: 'Username already taken'
            })
        }

        // 6. Hash password
        const hashedPass = await bcrypt.hash(password, 12)

        // 7. Create user
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

        // 8. Generate token
        const token = generateToken(newUser)

        // 9. Standardized response
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    avatar: newUser.avatar
                }
            }
        })

    } catch (error) {
        // 10. Enhanced error logging
        console.error('Registration error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        })

        // 11. Specific error handling
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'User already exists'
            })
        }

        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        })
    }
}
```

---

## Complete Usage Example

### Frontend Integration

```javascript
// Registration
const register = async (userData) => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        
        const data = await response.json()
        
        if (data.success) {
            // Store token
            localStorage.setItem('token', data.token)
            // Redirect to dashboard
            window.location.href = '/dashboard'
        } else {
            alert(data.error)
        }
    } catch (error) {
        console.error('Registration failed:', error)
    }
}

// Login
const login = async (email, password) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        
        const data = await response.json()
        
        if (data.success) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            window.location.href = '/dashboard'
        } else {
            alert(data.error)
        }
    } catch (error) {
        console.error('Login failed:', error)
    }
}

// Check Auth
const checkAuth = async () => {
    try {
        const token = localStorage.getItem('token')
        
        const response = await fetch('/api/auth/check', {
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        })
        
        const data = await response.json()
        
        if (!data.success) {
            // Redirect to login
            window.location.href = '/login'
        }
        
        return data.user
    } catch (error) {
        console.error('Auth check failed:', error)
        window.location.href = '/login'
    }
}
```

---

## Environment Variables

```env
# .env file
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
MONGODB_URI=mongodb://localhost:27017/your_database
PORT=5000
NODE_ENV=development
```

---

## Complete Router Setup

```javascript
// routes/auth.js
const express = require('express')
const router = express.Router()
const { Login, Register, CheckAuth } = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')

// Public routes
router.post('/register', Register)
router.post('/login', Login)

// Protected route
router.get('/check', authMiddleware, CheckAuth)

module.exports = router
```

---

## Middleware Example

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try {
        // Extract token from header
        const authHeader = req.headers.authorization
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'No token provided' 
            })
        }

        const token = authHeader.split(' ')[1]

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Attach user ID to request
        req.userId = decoded.id

        next()
    } catch (error) {
        return res.status(401).json({ 
            error: 'Invalid or expired token' 
        })
    }
}

module.exports = authMiddleware
```

---

## Testing

```javascript
// Using Jest and Supertest
const request = require('supertest')
const app = require('../app')

describe('Auth Controller', () => {
    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    username: 'testuser',
                    password: 'password123'
                })

            expect(res.status).toBe(201)
            expect(res.body.success).toBe(true)
            expect(res.body.token).toBeDefined()
        })

        it('should fail with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com'
                })

            expect(res.status).toBe(400)
            expect(res.body.error).toBe('All fields are required')
        })
    })

    describe('POST /auth/login', () => {
        it('should login existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })

            expect(res.status).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.token).toBeDefined()
        })

        it('should fail with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })

            expect(res.status).toBe(401)
            expect(res.body.error).toBe('Incorrect password')
        })
    })
})
```

---

## Summary

This authentication system provides:

✅ **User Registration** with password hashing
✅ **User Login** with credential verification  
✅ **Session Management** via JWT tokens
✅ **Protected Routes** with auth middleware

**Key Technologies:**
- bcryptjs for password security
- JWT for stateless authentication
- Mongoose for database operations
- Express for routing

**Security Features:**
- Password hashing (12 rounds)
- Token-based authentication
- Password exclusion from responses
- Input validation

**Areas for Improvement:**
- Rate limiting
- Email verification
- Password strength requirements
- Better error handling
- Account lockout mechanism

---

## License
MIT

## Contributing
Pull requests are welcome. For major changes, please open an issue first.