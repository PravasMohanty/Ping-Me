# Socket.IO Real-Time Communication Module - Complete Documentation

## Overview
This module establishes real-time, bidirectional communication between clients and server using Socket.IO. It manages WebSocket connections, tracks online users, and provides utilities for real-time messaging and notifications.

---

## Table of Contents
1. [Dependencies & Setup](#dependencies--setup)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [Code Walkthrough](#code-walkthrough)
5. [Key Concepts Explained](#key-concepts-explained)
6. [Usage Examples](#usage-examples)
7. [Bug Fixes Applied](#bug-fixes-applied)
8. [Best Practices & Improvements](#best-practices--improvements)
9. [Integration Guide](#integration-guide)
10. [Troubleshooting](#troubleshooting)

---

## Dependencies & Setup

### Required Packages
```javascript
const { Server } = require('socket.io')
```

**What it does:**
- **Socket.IO**: Enables real-time, bidirectional communication
- **Server**: Socket.IO server class (imported via destructuring)

### Installation
```bash
npm install socket.io
```

**Version Compatibility:**
```json
{
  "dependencies": {
    "socket.io": "^4.6.0",
    "express": "^4.18.0"
  }
}
```

---

## Architecture Overview

```
┌──────────────┐                    ┌──────────────┐
│   Client 1   │◄──────────────────►│              │
│  (Browser)   │    WebSocket       │              │
└──────────────┘                    │              │
                                    │   Socket.IO  │
┌──────────────┐                    │    Server    │
│   Client 2   │◄──────────────────►│              │
│  (Browser)   │    WebSocket       │              │
└──────────────┘                    │              │
                                    │              │
┌──────────────┐                    │              │
│   Client 3   │◄──────────────────►│              │
│  (Mobile)    │    WebSocket       └──────────────┘
└──────────────┘
```

**Real-time Flow:**
```
User connects → Server assigns socket ID → Store in userSocketMap
                                          ↓
                                  Broadcast online users to all
                                          ↓
User sends message → Server receives → Get recipient socket ID
                                          ↓
                                  Emit to specific user
```

---

## Core Components

### 1. Socket.IO Server Instance
```javascript
const io = new Server({
    cors: {
        origin: "*"
    }
})
```

### 2. User-Socket Mapping
```javascript
const userSocketMap = {}
// Structure: { userId: socketId }
// Example: { "user123": "abc456", "user789": "def012" }
```

### 3. Connection Establishment
```javascript
const establishConnection = (httpServer) => { /* ... */ }
```

### 4. Helper Functions
```javascript
const getReceiverSocketId = (receiverId) => { /* ... */ }
```

---

## Code Walkthrough

### 1. Import Socket.IO Server
```javascript
const { Server } = require('socket.io')
```

**Destructuring Explained:**
```javascript
// Socket.IO exports multiple things:
const socketIO = require('socket.io')
// socketIO = { Server, Client, ... }

// We only need Server, so we destructure:
const { Server } = require('socket.io')

// Same as:
const socketIO = require('socket.io')
const Server = socketIO.Server
```

**Why destructuring?**
- Cleaner code
- Only imports what we need
- Explicit about dependencies

---

### 2. Initialize Socket.IO Server
```javascript
const io = new Server({
    cors: {
        origin: "*"
    }
})
```

**Breaking it down:**

#### `new Server(options)`
Creates a Socket.IO server instance with configuration options.

#### CORS Configuration
```javascript
cors: {
    origin: "*"  // Allow all origins
}
```

**What is CORS?**
- **Cross-Origin Resource Sharing**
- Security feature that restricts cross-origin HTTP requests
- Browsers block requests from different domains by default

**Visual Example:**
```
Without CORS:
Frontend (http://localhost:3000) → Backend (http://localhost:5000)
                                   ↓
                          ❌ BLOCKED (different origins)

With CORS enabled:
Frontend (http://localhost:3000) → Backend (http://localhost:5000)
                                   ↓
                          ✓ ALLOWED
```

**Security Note:**
```javascript
// Development (allows all):
cors: { origin: "*" }

// Production (specific origins):
cors: { 
    origin: ["https://myapp.com", "https://www.myapp.com"],
    credentials: true 
}
```

---

### 3. User-Socket Mapping Object
```javascript
const userSocketMap = {}
```

**Purpose:**
Maps user IDs to their socket IDs for targeted messaging.

**Structure:**
```javascript
{
    "user_12345": "socket_abc",
    "user_67890": "socket_def",
    "user_11111": "socket_ghi"
}
```

**Why this is needed:**
```javascript
// Without mapping:
io.emit("message", data)  // Sends to EVERYONE (broadcast)

// With mapping:
const socketId = userSocketMap["user_12345"]
io.to(socketId).emit("message", data)  // Sends to SPECIFIC user
```

**Real-world analogy:**
```
userSocketMap is like a phone directory:
- User ID = Person's name
- Socket ID = Phone number
- When you want to call "John", you look up his phone number
```

---

### 4. Establish Connection Function
```javascript
const establishConnection = (httpServer) => {
    io.attach(httpServer)
    // ... event handlers
}
```

#### What is `httpServer`?

**Typical Express setup:**
```javascript
// In your main server file (app.js or server.js)
const express = require('express')
const http = require('http')

const app = express()
const httpServer = http.createServer(app)  // ← This is passed to establishConnection

// Later:
establishConnection(httpServer)
httpServer.listen(5000)
```

**Why HTTP server, not Express app?**
```javascript
// ❌ WRONG - Socket.IO needs HTTP server
io.attach(app)

// ✓ CORRECT - HTTP server wraps Express
io.attach(httpServer)
```

**Visual representation:**
```
┌─────────────────────────────┐
│      HTTP Server            │
│  ┌─────────────────────┐    │
│  │   Express App       │    │
│  │  (REST API)         │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │   Socket.IO         │    │
│  │  (WebSocket)        │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

#### Attach Socket.IO to Server
```javascript
io.attach(httpServer)
```

**What this does:**
- Binds Socket.IO to the HTTP server
- Enables WebSocket protocol on the server
- Allows clients to connect via Socket.IO

**Before vs After:**
```javascript
// Before attach:
httpServer.listen(5000)  // Only handles HTTP requests

// After attach:
io.attach(httpServer)
httpServer.listen(5000)  // Handles both HTTP and WebSocket
```

---

### 5. Connection Event Handler
```javascript
io.on('connection', (socket) => {
    // Runs when a client connects
})
```

**Understanding Events:**
```javascript
io.on('eventName', (data) => { /* handler */ })
//     └─ event name   └─ callback function
```

**'connection' event:**
- Fires when a new client connects
- `socket` parameter = individual connection instance
- Each client gets unique socket object

**Real-world analogy:**
```
Server is like a receptionist:
- When someone walks in (connects), receptionist greets them
- Gives them a unique visitor badge (socket ID)
- Tracks who's in the building (userSocketMap)
```

---

### 6. Extract User ID from Handshake
```javascript
const userId = socket.handshake.query.userId
```

**What is `socket.handshake`?**

When a client connects, they send initial data in the "handshake":

```javascript
// Client-side connection:
const socket = io("http://localhost:5000", {
    query: { userId: "user_12345" }  // ← Sent in handshake
})

// Server receives:
socket.handshake.query.userId  // "user_12345"
```

**Handshake structure:**
```javascript
socket.handshake = {
    headers: { /* HTTP headers */ },
    time: "Wed Feb 04 2026 10:30:00",
    address: "192.168.1.100",
    query: { userId: "user_12345" },  // ← Custom data from client
    auth: { token: "jwt_token" }      // ← Optional authentication
}
```

**Visual flow:**
```
Client connects with userId
         ↓
io.connect("...", { query: { userId: "123" } })
         ↓
Server receives in handshake
         ↓
socket.handshake.query.userId → "123"
```

---

### 7. Log Connection
```javascript
console.log('User Connected:', userId)
```

**Console output:**
```
User Connected: user_12345
User Connected: user_67890
User Disconnected: user_12345
User Connected: user_11111
```

**Production logging:**
```javascript
// Better logging (use Winston or similar)
logger.info('User connected', { 
    userId, 
    socketId: socket.id,
    timestamp: new Date(),
    ip: socket.handshake.address 
})
```

---

### 8. Store User-Socket Mapping
```javascript
if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id
}
```

**Why the validation?**

```javascript
// Case 1: userId is null/undefined
if (!userId) { /* don't store */ }

// Case 2: userId is string "undefined" (from client-side mistake)
if (userId === 'undefined') { /* don't store */ }

// Case 3: Valid userId
if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id  // ✓ Store it
}
```

**Common client-side mistake:**
```javascript
// ❌ WRONG - sends string "undefined"
const socket = io("...", { 
    query: { userId: undefined }  // Becomes "undefined" in query string
})

// ✓ CORRECT - only send if exists
const userId = getUserId()  // Get from auth
if (userId) {
    const socket = io("...", { query: { userId } })
}
```

**What is `socket.id`?**
```javascript
socket.id  // "abc123def456"  (auto-generated unique ID)
```

- Automatically assigned by Socket.IO
- Unique for each connection
- Changes on reconnect

**Mapping example:**
```javascript
// Before:
userSocketMap = {}

// User "john" connects with socket ID "abc123":
userSocketMap["john"] = "abc123"

// After:
userSocketMap = {
    "john": "abc123"
}

// User "jane" connects with socket ID "def456":
userSocketMap["jane"] = "def456"

// After:
userSocketMap = {
    "john": "abc123",
    "jane": "def456"
}
```

---

### 9. Emit Online Users to All Clients
```javascript
io.emit("getOnlineUsers", Object.keys(userSocketMap))
```

**Breaking it down:**

#### `Object.keys(userSocketMap)`
Extracts all keys (user IDs) from the object:

```javascript
userSocketMap = {
    "user_123": "socket_abc",
    "user_456": "socket_def",
    "user_789": "socket_ghi"
}

Object.keys(userSocketMap)
// Returns: ["user_123", "user_456", "user_789"]
```

**Why keys only?**
- Clients only need to know WHO is online
- Don't need the socket IDs (internal server detail)

#### `io.emit(event, data)`
Broadcasts to **ALL connected clients**:

```javascript
io.emit("getOnlineUsers", ["user_123", "user_456", "user_789"])
```

**Visual representation:**
```
Server:
io.emit("getOnlineUsers", [...])
    ↓
    ├──► Client 1 receives: ["user_123", "user_456", "user_789"]
    ├──► Client 2 receives: ["user_123", "user_456", "user_789"]
    └──► Client 3 receives: ["user_123", "user_456", "user_789"]
```

**Different emit methods:**
```javascript
// Broadcast to ALL clients
io.emit("event", data)

// Send to SPECIFIC socket
io.to(socketId).emit("event", data)

// Send to everyone EXCEPT sender
socket.broadcast.emit("event", data)

// Send to sender only
socket.emit("event", data)
```

---

### 10. Disconnect Event Handler
```javascript
socket.on('disconnect', () => {
    console.log('User Disconnected:', userId)
    delete userSocketMap[userId]
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
})
```

**When does 'disconnect' fire?**
- User closes browser/tab
- User loses internet connection
- Client calls `socket.disconnect()`
- Server crashes/restarts

#### Delete from Mapping
```javascript
delete userSocketMap[userId]
```

**`delete` operator:**
```javascript
const obj = { a: 1, b: 2, c: 3 }

delete obj.b

// Result: { a: 1, c: 3 }
```

**Before and after:**
```javascript
// Before disconnect:
userSocketMap = {
    "user_123": "socket_abc",
    "user_456": "socket_def"
}

// User 456 disconnects:
delete userSocketMap["user_456"]

// After:
userSocketMap = {
    "user_123": "socket_abc"
}
```

#### Update Online Users
```javascript
io.emit("getOnlineUsers", Object.keys(userSocketMap))
```

Broadcasts updated list to all remaining clients:
```
User disconnects
      ↓
Remove from userSocketMap
      ↓
Broadcast new online list to everyone
      ↓
All clients update their UI
```

---

### 11. Helper Function - Get Receiver Socket ID
```javascript
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}
```

**Purpose:**
Utility function to get a user's socket ID from their user ID.

**Usage example:**
```javascript
// In your message controller:
const sendMessage = (req, res) => {
    const { receiverId, message } = req.body
    
    // Get receiver's socket ID
    const receiverSocketId = getReceiverSocketId(receiverId)
    
    if (receiverSocketId) {
        // User is online, send message in real-time
        io.to(receiverSocketId).emit("newMessage", message)
    }
    
    // Also save to database for offline users
    await Message.create({ receiverId, message })
}
```

**Why a helper function?**
```javascript
// Without helper (repetitive):
const socketId = userSocketMap[receiverId]

// With helper (cleaner):
const socketId = getReceiverSocketId(receiverId)
```

**Return values:**
```javascript
getReceiverSocketId("user_123")  // Returns: "socket_abc"
getReceiverSocketId("user_999")  // Returns: undefined (user offline)
```

---

### 12. Module Exports
```javascript
module.exports = {
    io,
    establishConnection,
    getReceiverSocketId,
    userSocketMap
}
```

**What's exported:**

1. **`io`** - Socket.IO server instance
   - Used to emit events from anywhere in your app
   
2. **`establishConnection`** - Setup function
   - Called once in main server file
   
3. **`getReceiverSocketId`** - Utility function
   - Used in controllers to send targeted messages
   
4. **`userSocketMap`** - User mapping object
   - Access current online users (read-only recommended)

**Import examples:**
```javascript
// In main server file:
const { establishConnection } = require('./socket')
establishConnection(httpServer)

// In message controller:
const { io, getReceiverSocketId } = require('./socket')

const socketId = getReceiverSocketId(receiverId)
io.to(socketId).emit("newMessage", message)
```

---

## Key Concepts Explained

### 1. WebSocket vs HTTP

**HTTP (Traditional):**
```
Client:  "GET /users" ──────────► Server
Client:  ◄──────────────────── "Here's users data"
         (Connection closes)

Client:  "POST /message" ───────► Server
Client:  ◄──────────────────── "Message saved"
         (Connection closes)
```

**Problems with HTTP:**
- Client must initiate every request
- Server can't push updates
- Need polling to get new data

**WebSocket (Real-time):**
```
Client:  Connect ───────────────► Server
         ◄═════════════════════► (Persistent connection)
Client:  ◄─ "New message arrived"
Server:  "Typing..." ───────────►
Client:  ◄─ "User came online"
```

**Benefits:**
- Bidirectional communication
- Server can push updates
- Lower latency
- Less bandwidth (no repeated headers)

---

### 2. Socket.IO Events

**Event-driven architecture:**
```javascript
// Server emits event
io.emit("eventName", data)

// Client listens for event
socket.on("eventName", (data) => {
    console.log(data)
})
```

**Built-in events:**
```javascript
// Connection lifecycle
socket.on('connect', () => {})
socket.on('disconnect', () => {})
socket.on('connect_error', (error) => {})

// Custom events (you define)
socket.on('newMessage', (data) => {})
socket.on('typing', (data) => {})
socket.on('userOnline', (data) => {})
```

**Event flow:**
```
Server: io.emit("chatMessage", { text: "Hello" })
           ↓
        Network
           ↓
Client: socket.on("chatMessage", (data) => {
           console.log(data.text)  // "Hello"
        })
```

---

### 3. Rooms and Namespaces

**Rooms (for targeted broadcasts):**
```javascript
// Join room
socket.join("room_123")

// Emit to room
io.to("room_123").emit("message", data)

// Leave room
socket.leave("room_123")
```

**Use cases:**
- Chat rooms
- Game lobbies
- Department channels

**Example:**
```javascript
// User joins chat room
socket.on('joinRoom', (roomId) => {
    socket.join(roomId)
    io.to(roomId).emit("userJoined", { userId, roomId })
})

// Send message to room only
socket.on('sendMessage', ({ roomId, message }) => {
    io.to(roomId).emit("newMessage", message)
})
```

**Namespaces (separate communication channels):**
```javascript
// Create namespaces
const chatNamespace = io.of('/chat')
const notificationNamespace = io.of('/notifications')

// Different event handlers
chatNamespace.on('connection', (socket) => {
    // Chat-specific logic
})

notificationNamespace.on('connection', (socket) => {
    // Notification-specific logic
})
```

---

### 4. Object.keys(), Object.values(), Object.entries()

```javascript
const obj = { 
    name: "John", 
    age: 30, 
    city: "NYC" 
}

// Get keys (property names)
Object.keys(obj)
// Returns: ["name", "age", "city"]

// Get values
Object.values(obj)
// Returns: ["John", 30, "NYC"]

// Get key-value pairs
Object.entries(obj)
// Returns: [["name", "John"], ["age", 30], ["city", "NYC"]]
```

**Applied to userSocketMap:**
```javascript
userSocketMap = {
    "user_1": "socket_a",
    "user_2": "socket_b",
    "user_3": "socket_c"
}

Object.keys(userSocketMap)
// ["user_1", "user_2", "user_3"]  ← Online users

Object.values(userSocketMap)
// ["socket_a", "socket_b", "socket_c"]  ← Socket IDs

Object.entries(userSocketMap)
// [["user_1", "socket_a"], ["user_2", "socket_b"], ...]
```

---

### 5. Handshake Query Parameters

**Client-side:**
```javascript
const socket = io("http://localhost:5000", {
    query: {
        userId: "user_123",
        token: "jwt_token_here"
    }
})
```

**Server-side access:**
```javascript
socket.handshake.query.userId   // "user_123"
socket.handshake.query.token    // "jwt_token_here"
```

**Common use cases:**
```javascript
// Authentication
const token = socket.handshake.query.token
const user = verifyToken(token)

// User identification
const userId = socket.handshake.query.userId

// Room assignment
const roomId = socket.handshake.query.roomId
socket.join(roomId)

// Language preference
const lang = socket.handshake.query.lang || 'en'
```

---

### 6. Delete Operator

**Syntax:**
```javascript
delete object.property
delete object['property']
```

**Examples:**
```javascript
const person = { name: "John", age: 30 }

delete person.age

console.log(person)  // { name: "John" }
```

**Return value:**
```javascript
const obj = { a: 1, b: 2 }

delete obj.a  // Returns: true (successful)
delete obj.z  // Returns: true (property didn't exist, still "successful")
```

**What can't be deleted:**
```javascript
const x = 5
delete x  // Returns: false (can't delete variables)

const arr = [1, 2, 3]
delete arr[1]  // Leaves empty slot: [1, empty, 3]
// Better: arr.splice(1, 1)  // [1, 3]
```

---

## Usage Examples

### Complete Server Setup

```javascript
// server.js
const express = require('express')
const http = require('http')
const { establishConnection } = require('./socket')

const app = express()
const httpServer = http.createServer(app)

// Middleware
app.use(express.json())

// REST API routes
app.get('/api/users', (req, res) => {
    // Handle HTTP request
})

// Establish Socket.IO connection
establishConnection(httpServer)

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
```

---

### Client-Side Connection

```javascript
// client.js (Frontend)
import { io } from 'socket.io-client'

// Get user ID from your auth system
const userId = localStorage.getItem('userId')

// Connect to server
const socket = io('http://localhost:5000', {
    query: { userId }
})

// Listen for connection
socket.on('connect', () => {
    console.log('Connected to server')
})

// Listen for online users
socket.on('getOnlineUsers', (onlineUsers) => {
    console.log('Online users:', onlineUsers)
    updateUIWithOnlineUsers(onlineUsers)
})

// Listen for new messages
socket.on('newMessage', (message) => {
    console.log('New message:', message)
    displayMessage(message)
})

// Listen for disconnect
socket.on('disconnect', () => {
    console.log('Disconnected from server')
})
```

---

### Sending Real-Time Messages

```javascript
// messageController.js
const Message = require('./models/Message')
const { io, getReceiverSocketId } = require('./socket')

const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body
        const senderId = req.userId  // From auth middleware

        // Save message to database
        const message = await Message.create({
            senderId,
            receiverId,
            text,
            timestamp: new Date()
        })

        // Send real-time notification if receiver is online
        const receiverSocketId = getReceiverSocketId(receiverId)
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', {
                id: message._id,
                senderId,
                text,
                timestamp: message.timestamp
            })
        }

        res.status(201).json({
            success: true,
            message
        })

    } catch (error) {
        console.error('Send message error:', error)
        res.status(500).json({ error: 'Failed to send message' })
    }
}

module.exports = { sendMessage }
```

---

### Typing Indicator

```javascript
// Server-side
socket.on('typing', ({ receiverId, isTyping }) => {
    const receiverSocketId = getReceiverSocketId(receiverId)
    
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
            userId: socket.handshake.query.userId,
            isTyping
        })
    }
})

// Client-side
const inputField = document.getElementById('message-input')
let typingTimeout

inputField.addEventListener('input', () => {
    // Emit typing event
    socket.emit('typing', { 
        receiverId: currentChatUser.id, 
        isTyping: true 
    })

    // Stop typing after 2 seconds of no input
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
        socket.emit('typing', { 
            receiverId: currentChatUser.id, 
            isTyping: false 
        })
    }, 2000)
})

// Listen for other user typing
socket.on('userTyping', ({ userId, isTyping }) => {
    if (isTyping) {
        showTypingIndicator(userId)
    } else {
        hideTypingIndicator(userId)
    }
})
```

---

### Group Chat Rooms

```javascript
// Server-side
socket.on('joinRoom', (roomId) => {
    socket.join(roomId)
    console.log(`User ${userId} joined room ${roomId}`)
    
    // Notify room members
    socket.to(roomId).emit('userJoinedRoom', {
        userId,
        roomId,
        timestamp: new Date()
    })
})

socket.on('sendMessageToRoom', ({ roomId, message }) => {
    // Broadcast to everyone in room EXCEPT sender
    socket.to(roomId).emit('newRoomMessage', {
        userId,
        message,
        timestamp: new Date()
    })
})

socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId)
    socket.to(roomId).emit('userLeftRoom', { userId, roomId })
})

// Client-side
// Join room
socket.emit('joinRoom', 'room_123')

// Send message to room
socket.emit('sendMessageToRoom', {
    roomId: 'room_123',
    message: 'Hello everyone!'
})

// Listen for room messages
socket.on('newRoomMessage', ({ userId, message, timestamp }) => {
    displayRoomMessage(userId, message, timestamp)
})
```

---

### Notifications

```javascript
// Server-side notification utility
const sendNotification = (userId, notification) => {
    const socketId = getReceiverSocketId(userId)
    
    if (socketId) {
        io.to(socketId).emit('notification', notification)
    }
}

// Usage in controllers
const likePost = async (req, res) => {
    const { postId } = req.body
    const userId = req.userId
    
    const post = await Post.findById(postId)
    await Like.create({ postId, userId })
    
    // Send notification to post owner
    sendNotification(post.ownerId, {
        type: 'like',
        message: `${userId} liked your post`,
        postId,
        timestamp: new Date()
    })
    
    res.json({ success: true })
}

// Client-side
socket.on('notification', (notification) => {
    showNotificationToast(notification.message)
    playNotificationSound()
    updateNotificationBadge()
})
```

---

## Bug Fixes Applied

### Bug 1: Incorrect Import Syntax ✅ FIXED

**Original (Wrong):**
```javascript
const { Server } = require('socket.io')  // Attempting to destructure
const io = Server()  // Server is not a function in this context
```

**Fixed:**
```javascript
const { Server } = require('socket.io')  // Correct destructuring
const io = new Server({ /* options */ })  // Proper instantiation
```

**Why it was wrong:**
- Socket.IO's `Server` is a class, must use `new` keyword
- Can't call it as a function directly

---

### Bug 2: Improper Server Initialization ✅ FIXED

**Original (Wrong):**
```javascript
const io = new Server()  // Created without HTTP server
// Later...
io.on('connection', ...)  // Would fail - no server attached
```

**Fixed:**
```javascript
const io = new Server({ cors: { origin: "*" } })
// Then attach to HTTP server:
io.attach(httpServer)
```

**Why it matters:**
- Socket.IO needs an HTTP server to handle upgrade requests
- Without it, WebSocket connections fail

---

### Bug 3: Incorrect Socket ID Assignment ✅ FIXED

**Original (Wrong):**
```javascript
userSocketMap[userId] = socket.userId  // socket.userId doesn't exist!
```

**Fixed:**
```javascript
userSocketMap[userId] = socket.id  // Correct property
```

**Why it was wrong:**
- `socket.userId` is undefined (not a Socket.IO property)
- Correct property is `socket.id` (auto-generated unique ID)

---

### Bug 4: userSocketMap Attached to Wrong Module ✅ FIXED

**Original (Wrong):**
```javascript
socket.userSocketMap = {}  // Attached to socket module
```

**Problems:**
- `socket` is the Socket.IO module, not instance
- Would reset on every require
- Not accessible globally

**Fixed:**
```javascript
const userSocketMap = {}  // Standalone module-level variable
```

**Why it's better:**
- Persists across connections
- Accessible from module exports
- Clear separation of concerns

---

## Best Practices & Improvements

### ✅ Good Practices Already Implemented

1. **CORS Configuration**
   ```javascript
   cors: { origin: "*" }  // Allows cross-origin connections
   ```

2. **User Validation**
   ```javascript
   if (userId && userId !== 'undefined')  // Prevents invalid entries
   ```

3. **Broadcast Online Users**
   ```javascript
   io.emit("getOnlineUsers", Object.keys(userSocketMap))
   ```

4. **Cleanup on Disconnect**
   ```javascript
   delete userSocketMap[userId]
   ```

---

### ⚠️ Production Improvements

#### 1. Restrict CORS Origins

```javascript
// Development
const io = new Server({
    cors: { origin: "*" }
})

// Production
const io = new Server({
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ["https://myapp.com", "https://www.myapp.com"]
            : "*",
        credentials: true
    }
})
```

---

#### 2. Authentication Middleware

```javascript
const jwt = require('jsonwebtoken')

io.use((socket, next) => {
    const token = socket.handshake.auth.token
    
    if (!token) {
        return next(new Error('Authentication required'))
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.userId = decoded.id
        next()
    } catch (error) {
        next(new Error('Invalid token'))
    }
})

io.on('connection', (socket) => {
    // socket.userId is now verified and trusted
    const userId = socket.userId
    userSocketMap[userId] = socket.id
})
```

**Client-side:**
```javascript
const socket = io('http://localhost:5000', {
    auth: {
        token: localStorage.getItem('token')
    }
})
```

---

#### 3. Handle Reconnection

```javascript
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    
    // Handle reconnection (user might have multiple tabs)
    if (userSocketMap[userId]) {
        console.log(`User ${userId} reconnected (replacing old connection)`)
    }
    
    userSocketMap[userId] = socket.id
    
    // Send missed messages on reconnect
    socket.on('requestMissedMessages', async () => {
        const messages = await Message.find({ 
            receiverId: userId, 
            delivered: false 
        })
        socket.emit('missedMessages', messages)
    })
})
```

---

#### 4. Rate Limiting

```javascript
const rateLimit = require('socket.io-rate-limiter')

io.use(rateLimit({
    tokensPerInterval: 10,  // 10 requests
    interval: 'second'      // per second
}))
```

---

#### 5. Error Handling

```javascript
io.on('connection', (socket) => {
    try {
        const userId = socket.handshake.query.userId
        
        if (!userId || userId === 'undefined') {
            socket.disconnect(true)
            return
        }
        
        userSocketMap[userId] = socket.id
        
    } catch (error) {
        console.error('Connection error:', error)
        socket.disconnect(true)
    }
    
    // Handle custom event errors
    socket.on('sendMessage', async (data) => {
        try {
            // Process message
        } catch (error) {
            socket.emit('error', { message: 'Failed to send message' })
        }
    })
})
```

---

#### 6. Logging

```javascript
const winston = require('winston')
const logger = winston.createLogger({ /* config */ })

io.on('connection', (socket) => {
    logger.info('User connected', {
        userId: socket.handshake.query.userId,
        socketId: socket.id,
        ip: socket.handshake.address,
        timestamp: new Date()
    })
    
    socket.on('disconnect', (reason) => {
        logger.info('User disconnected', {
            userId: socket.handshake.query.userId,
            reason,
            timestamp: new Date()
        })
    })
})
```

---

#### 7. Redis Adapter (for scaling)

```javascript
const { createAdapter } = require('@socket.io/redis-adapter')
const { createClient } = require('redis')

const pubClient = createClient({ url: 'redis://localhost:6379' })
const subClient = pubClient.duplicate()

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient))
})
```

**Why Redis adapter?**
- Enables horizontal scaling (multiple server instances)
- Shares events across servers
- Load balancing support

**Without Redis:**
```
User A (Server 1) → Can't receive messages from → User B (Server 2)
```

**With Redis:**
```
User A (Server 1) ←─── Redis ───→ User B (Server 2)
                        ↕
                  Shared event bus
```

---

#### 8. Namespace for Different Features

```javascript
// socket.js
const chatIO = io.of('/chat')
const notificationIO = io.of('/notifications')

chatIO.on('connection', (socket) => {
    // Chat-specific logic
})

notificationIO.on('connection', (socket) => {
    // Notification-specific logic
})

module.exports = {
    io,
    chatIO,
    notificationIO,
    establishConnection
}
```

**Benefits:**
- Separation of concerns
- Different middleware per namespace
- Cleaner event handling

---

#### 9. Heartbeat for Connection Health

```javascript
const HEARTBEAT_INTERVAL = 30000  // 30 seconds

io.on('connection', (socket) => {
    const interval = setInterval(() => {
        socket.emit('ping')
    }, HEARTBEAT_INTERVAL)
    
    socket.on('pong', () => {
        // Client is alive
    })
    
    socket.on('disconnect', () => {
        clearInterval(interval)
    })
})

// Client-side
socket.on('ping', () => {
    socket.emit('pong')
})
```

---

#### 10. Graceful Shutdown

```javascript
// server.js
const gracefulShutdown = () => {
    console.log('Shutting down gracefully...')
    
    // Close Socket.IO
    io.close(() => {
        console.log('Socket.IO closed')
    })
    
    // Close HTTP server
    httpServer.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
    })
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown')
        process.exit(1)
    }, 10000)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
```

---

## Integration Guide

### Step 1: Install Dependencies
```bash
npm install socket.io express
```

### Step 2: Create Socket Module
```javascript
// socket/index.js
const { Server } = require('socket.io')

const io = new Server({
    cors: { origin: "*" }
})

const userSocketMap = {}

const establishConnection = (httpServer) => {
    io.attach(httpServer)
    
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId
        
        if (userId && userId !== 'undefined') {
            userSocketMap[userId] = socket.id
        }
        
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
        
        socket.on('disconnect', () => {
            delete userSocketMap[userId]
            io.emit("getOnlineUsers", Object.keys(userSocketMap))
        })
    })
}

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}

module.exports = {
    io,
    establishConnection,
    getReceiverSocketId,
    userSocketMap
}
```

### Step 3: Setup Server
```javascript
// server.js
const express = require('express')
const http = require('http')
const { establishConnection } = require('./socket')

const app = express()
const httpServer = http.createServer(app)

app.use(express.json())

// Your routes here
app.use('/api/auth', require('./routes/auth'))
app.use('/api/messages', require('./routes/messages'))

establishConnection(httpServer)

httpServer.listen(5000, () => {
    console.log('Server running on port 5000')
})
```

### Step 4: Use in Controllers
```javascript
// controllers/messageController.js
const { io, getReceiverSocketId } = require('../socket')

const sendMessage = async (req, res) => {
    const { receiverId, text } = req.body
    const senderId = req.userId
    
    // Save to database
    const message = await Message.create({ senderId, receiverId, text })
    
    // Send real-time if online
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', message)
    }
    
    res.json({ success: true, message })
}

module.exports = { sendMessage }
```

### Step 5: Client Setup
```javascript
// client/src/socket.js
import { io } from 'socket.io-client'

const userId = localStorage.getItem('userId')

export const socket = io('http://localhost:5000', {
    query: { userId }
})

socket.on('connect', () => {
    console.log('Connected')
})

socket.on('getOnlineUsers', (users) => {
    console.log('Online:', users)
})

socket.on('newMessage', (message) => {
    console.log('New message:', message)
})
```

---

## Troubleshooting

### Issue 1: "io.attach is not a function"

**Cause:**
```javascript
const io = require('socket.io')
io.attach(httpServer)  // ❌ Wrong
```

**Solution:**
```javascript
const { Server } = require('socket.io')
const io = new Server()
io.attach(httpServer)  // ✓ Correct
```

---

### Issue 2: CORS Error

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
```javascript
const io = new Server({
    cors: {
        origin: "http://localhost:3000",  // Your frontend URL
        credentials: true
    }
})
```

---

### Issue 3: Users Not Showing Online

**Check:**
1. Is `userId` being sent in handshake?
2. Is it a string or undefined?
3. Is validation passing?

**Debug:**
```javascript
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    console.log('userId:', userId, 'type:', typeof userId)
    
    if (userId && userId !== 'undefined') {
        console.log('Storing user:', userId)
        userSocketMap[userId] = socket.id
        console.log('Map:', userSocketMap)
    } else {
        console.log('Invalid userId, not storing')
    }
})
```

---

### Issue 4: Messages Not Sending

**Check:**
1. Is receiver online? (check `getReceiverSocketId()`)
2. Is socket ID correct?
3. Are you emitting to correct event name?

**Debug:**
```javascript
const receiverSocketId = getReceiverSocketId(receiverId)
console.log('Receiver ID:', receiverId)
console.log('Socket ID:', receiverSocketId)
console.log('Is online?', receiverSocketId ? 'Yes' : 'No')

if (receiverSocketId) {
    io.to(receiverSocketId).emit('newMessage', message)
    console.log('Message sent to socket:', receiverSocketId)
}
```

---

### Issue 5: Connection Keeps Dropping

**Causes:**
- Network issues
- Server timeouts
- Client-side errors

**Solution - Auto Reconnect:**
```javascript
// Client-side
const socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
})

socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts')
})
```

---

## Environment Variables

```env
# .env
PORT=5000
SOCKET_CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Usage:**
```javascript
const io = new Server({
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || "*"
    }
})
```

---

## Testing

```javascript
// test/socket.test.js
const { createServer } = require('http')
const { Server } = require('socket.io')
const Client = require('socket.io-client')

describe('Socket.IO', () => {
    let io, serverSocket, clientSocket

    beforeAll((done) => {
        const httpServer = createServer()
        io = new Server(httpServer)
        httpServer.listen(() => {
            const port = httpServer.address().port
            clientSocket = new Client(`http://localhost:${port}`, {
                query: { userId: 'test_user_123' }
            })
            io.on('connection', (socket) => {
                serverSocket = socket
            })
            clientSocket.on('connect', done)
        })
    })

    afterAll(() => {
        io.close()
        clientSocket.close()
    })

    test('should emit getOnlineUsers on connection', (done) => {
        clientSocket.on('getOnlineUsers', (users) => {
            expect(users).toContain('test_user_123')
            done()
        })
    })
})
```

---

## Performance Monitoring

```javascript
// Track active connections
io.on('connection', (socket) => {
    console.log('Active connections:', io.sockets.sockets.size)
    
    socket.on('disconnect', () => {
        console.log('Active connections:', io.sockets.sockets.size)
    })
})

// Monitor events per second
let eventCount = 0
setInterval(() => {
    console.log('Events/second:', eventCount)
    eventCount = 0
}, 1000)

io.on('connection', (socket) => {
    socket.onAny(() => {
        eventCount++
    })
})
```

---

## Summary

This Socket.IO module provides:

✅ **Real-time bidirectional communication**
✅ **Online user tracking**
✅ **Targeted message delivery**
✅ **Connection lifecycle management**
✅ **Scalable architecture**

**Key Features:**
- WebSocket connections
- User-socket mapping
- Online status broadcasts
- Helper utilities
- Event-driven communication

**Use Cases:**
- Real-time chat
- Live notifications
- Online presence
- Collaborative editing
- Live dashboards

**Security Considerations:**
- CORS configuration
- Authentication middleware
- Input validation
- Rate limiting
- Error handling

---

## License
MIT

## Contributing
Pull requests welcome. For major changes, open an issue first.

---

## Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [Redis Adapter](https://socket.io/docs/v4/redis-adapter/)
- [Testing Socket.IO](https://socket.io/docs/v4/testing/)
