# Messaging Controller Documentation

## Overview

This is a Node.js Express controller that handles messaging functionality with Redis caching. It manages user retrieval, message fetching, and message status updates with performance optimization through caching.

---

## Dependencies

```javascript
const Message = require("../models/Message");
const User = require("../models/User");
const Redis = require("redis");
```

- **Message Model**: MongoDB schema for storing chat messages
- **User Model**: MongoDB schema for user data
- **Redis**: In-memory data store used for caching to improve performance

---

## Redis Configuration

```javascript
const redisClient = Redis.createClient();
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();
```

**What this does:**
- Creates a Redis client connection
- Sets up error handling for Redis connection issues
- Establishes connection to Redis server

**Cache Expiration:**
```javascript
const DEFAULT_EXPIRATION = 3600;
```
- Cached data expires after 3600 seconds (1 hour)
- After expiration, data is fetched fresh from MongoDB

---

## Core Functions

### 1. `invalidateMessageCache(userId1, userId2)`

**Purpose:** Clears cached data when messages are updated

```javascript
const invalidateMessageCache = async (userId1, userId2) => {
  try {
    const ids = [userId1, userId2].sort();
    const cacheKey = `messages:${ids[0]}:${ids[1]}`;
    await redisClient.del(cacheKey);
    await redisClient.del(`users:${userId1}`);
    await redisClient.del(`users:${userId2}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
```

**How it works:**
1. **Sorts user IDs** to ensure consistent cache key format (prevents duplicate keys like `user1:user2` and `user2:user1`)
2. **Deletes three cache entries:**
   - Message cache between the two users
   - User sidebar cache for both users
3. **Error handling** to prevent cache errors from breaking the application

**When it's called:**
- After marking a message as seen
- When message data changes and cache needs to be refreshed

---

### 2. `getUsersForSideBar(req, res)`

**Purpose:** Retrieves all users (except current user) for the chat sidebar with unseen message counts

```javascript
const getUsersForSideBar = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const cacheKey = `users:${currentUserId}`;
```

**Step-by-step breakdown:**

#### Step 1: Get Current User ID
```javascript
const currentUserId = req.user._id.toString();
```
- Extracts authenticated user's ID from request object (set by authentication middleware)
- Converts MongoDB ObjectId to string for consistent comparison

#### Step 2: Check Cache
```javascript
const cachedUsers = await redisClient.get(cacheKey);
let filteredUsers;

if (cachedUsers) {
  filteredUsers = JSON.parse(cachedUsers);
} else {
  // Fetch from database...
}
```
- Looks for cached user list in Redis
- If found: parses JSON string back to JavaScript array
- If not found: queries MongoDB database

#### Step 3: Database Query (if cache miss)
```javascript
filteredUsers = await User.find({ 
  _id: { $ne: currentUserId } 
}).select("-password");
```
- **`find({ _id: { $ne: currentUserId } })`**: Finds all users where ID is NOT EQUAL to current user
- **`.select("-password")`**: Excludes password field from results for security
- Stores result in Redis cache for future requests

#### Step 4: Count Unseen Messages
```javascript
const unseenMessages = {};
await Promise.all(
  filteredUsers.map(async (user) => {
    const count = await Message.countDocuments({
      senderId: user._id,
      receiverId: currentUserId,
      seen: false,
    });
    if (count > 0) {
      unseenMessages[user._id.toString()] = count;
    }
  })
);
```
- **Creates object** to store unseen message counts per user
- **`Promise.all()`**: Runs all database queries in parallel for better performance
- **`.map()`**: Iterates through each user
- **Counts documents** where:
  - Message was sent BY that user
  - Message was sent TO current user
  - Message hasn't been seen yet
- **Only adds to object** if count is greater than 0

#### Step 5: Return Response
```javascript
return res.status(200).json({
  success: true,
  users: filteredUsers,
  unseenMessages,
});
```

**Response format:**
```json
{
  "success": true,
  "users": [
    { "_id": "123", "name": "John", "email": "john@example.com" },
    { "_id": "456", "name": "Jane", "email": "jane@example.com" }
  ],
  "unseenMessages": {
    "123": 5,
    "456": 2
  }
}
```

---

### 3. `getMessages(req, res)`

**Purpose:** Retrieves all messages between two users and marks unread messages as seen

```javascript
const getMessages = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const { selectedId } = req.body;
```

**Step-by-step breakdown:**

#### Step 1: Extract User IDs
```javascript
const myId = req.user._id.toString();
const { selectedId } = req.body;
const ids = [myId, selectedId].sort();
const cacheKey = `messages:${ids[0]}:${ids[1]}`;
```
- Gets current user ID from authenticated request
- Gets selected chat partner ID from request body
- **Sorts IDs** to create consistent cache key (important!)

#### Step 2: Check Cache
```javascript
const cachedMessages = await redisClient.get(cacheKey);
let chats;

if (cachedMessages) {
  chats = JSON.parse(cachedMessages);
  // Mark messages as seen...
  await redisClient.del(cacheKey);
}
```
- Checks if conversation is cached
- If cached: parses messages and immediately deletes cache (because we're about to mark messages as seen, changing the data)

#### Step 3: Mark Messages as Seen
```javascript
await Message.updateMany(
  {
    senderId: selectedId,
    receiverId: myId,
    seen: false,
  },
  { $set: { seen: true } }
);
```
- **Updates multiple documents** in MongoDB
- **Filter criteria:**
  - Messages sent BY the other user
  - Messages sent TO current user
  - Messages that haven't been seen
- **Update:** Sets `seen` field to `true`

#### Step 4: Fetch Messages (if cache miss)
```javascript
chats = await Message.find({
  $or: [
    { senderId: myId, receiverId: selectedId },
    { senderId: selectedId, receiverId: myId },
  ],
}).sort({ createdAt: 1 });
```
- **`$or` operator**: Finds messages where EITHER condition is true
  - Messages sent BY me TO them
  - Messages sent BY them TO me
- **`.sort({ createdAt: 1 })`**: Sorts by creation date ascending (oldest first)

#### Step 5: Cache and Return
```javascript
await redisClient.setEx(
  cacheKey,
  DEFAULT_EXPIRATION,
  JSON.stringify(chats)
);

return res.status(200).json(chats);
```
- Stores messages in Redis with 1-hour expiration
- Returns message array directly (not wrapped in object)

---

### 4. `markMessageAsSeen(req, res)`

**Purpose:** Marks a single message as read and invalidates related caches

```javascript
const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
```

**Step-by-step breakdown:**

#### Step 1: Extract Message ID
```javascript
const { id } = req.params;
```
- Gets message ID from URL parameters (e.g., `/api/messages/mark-seen/12345`)

#### Step 2: Update Message
```javascript
const message = await Message.findByIdAndUpdate(
  id,
  { seen: true },
  { new: true }
);
```
- **`findByIdAndUpdate()`**: Finds document by ID and updates it
- **First argument**: Message ID to find
- **Second argument**: Update operation (set `seen` to `true`)
- **Third argument `{ new: true }`**: Returns updated document (not original)

#### Step 3: Handle Not Found
```javascript
if (!message) {
  return res.status(404).json({
    success: false,
    message: "Message not found"
  });
}
```
- Checks if message exists
- Returns 404 error if not found

#### Step 4: Invalidate Cache
```javascript
await invalidateMessageCache(
  message.senderId.toString(),
  message.receiverId.toString()
);
```
- Clears cached messages between sender and receiver
- Ensures next fetch gets updated data from database

#### Step 5: Success Response
```javascript
res.status(200).json({ success: true });
```

---

## Cache Key Patterns

### User List Cache
```
users:{userId}
```
**Example:** `users:507f1f77bcf86cd799439011`

Stores the list of all users for a specific user's sidebar.

### Message Cache
```
messages:{userId1}:{userId2}
```
**Example:** `messages:507f1f77bcf86cd799439011:507f191e810c19729de860ea`

Stores conversation between two users (IDs always sorted alphabetically).

---

## Error Handling

All functions use try-catch blocks:

```javascript
try {
  // Main logic
} catch (error) {
  console.error(error);
  return res.status(500).json({ 
    message: "Internal Server Error" 
  });
}
```

**Error handling strategy:**
- Logs errors to console for debugging
- Returns generic 500 error to client (doesn't expose internal details)
- Prevents application crashes

---

## Performance Optimization

### Caching Strategy

1. **First Request:** Data fetched from MongoDB, stored in Redis
2. **Subsequent Requests:** Data retrieved from Redis (much faster)
3. **After 1 Hour:** Cache expires, next request fetches fresh data
4. **On Updates:** Cache invalidated immediately to prevent stale data

### Parallel Processing

```javascript
await Promise.all(
  filteredUsers.map(async (user) => {
    // Count unseen messages
  })
);
```
- Runs multiple database queries simultaneously
- Much faster than sequential processing

---

## Data Flow Diagrams

### Get Messages Flow

```
User requests messages
         ↓
Check Redis cache
         ↓
    ┌────┴────┐
    ↓         ↓
  Cache     Cache
  Hit       Miss
    ↓         ↓
  Parse   Query DB
  JSON      ↓
    └────┬──┘
         ↓
   Mark as seen
         ↓
   Update cache
         ↓
  Return messages
```

### Cache Invalidation Flow

```
Message marked as seen
         ↓
   Update database
         ↓
Delete message cache
         ↓
Delete user caches
         ↓
  Success response
```

---

## API Endpoints Expected

Based on the controller functions, these routes would be defined elsewhere:

```javascript
// Likely in routes file:
router.get('/users', getUsersForSideBar);
router.post('/messages', getMessages);
router.patch('/messages/mark-seen/:id', markMessageAsSeen);
```

---

## MongoDB Schema Assumptions

### Message Model
```javascript
{
  senderId: ObjectId,      // Who sent the message
  receiverId: ObjectId,    // Who receives the message
  seen: Boolean,           // Whether message has been read
  createdAt: Date,         // When message was created
  // ... other fields
}
```

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,  // Excluded in queries
  // ... other fields
}
```

---

## Important Notes

### Authentication Required
All functions expect `req.user` to exist, meaning authentication middleware must run before these controllers.

### ID Sorting
User IDs are always sorted when creating cache keys to ensure consistency:
```javascript
const ids = [userId1, userId2].sort();
```
This prevents having two different cache entries for the same conversation.

### Cache Invalidation Timing
- Messages are marked as seen immediately when fetched
- Cache is deleted after marking to ensure fresh data
- User sidebar cache is also cleared to update unseen counts

---

---

## Module Exports

```javascript
module.exports = {
  getUsersForSideBar,
  getMessages,
  markMessageAsSeen
};
```

These functions are exported to be used in route definitions.

---

## Testing Considerations

When testing this code:
- Mock Redis client to avoid requiring actual Redis server
- Mock MongoDB models for unit testing
- Test cache hit and miss scenarios separately
- Test error handling paths
- Verify cache invalidation occurs at correct times
- Test with different user combinations to ensure ID sorting works

---

## Common Issues & Solutions

### Issue: Stale unseen message counts
**Solution:** `invalidateMessageCache()` clears user caches when messages are marked as seen

### Issue: Different cache keys for same conversation
**Solution:** IDs are sorted before creating cache key

### Issue: Cache never updates
**Solution:** TTL of 1 hour ensures periodic refresh; manual invalidation on updates

### Issue: Race conditions on concurrent updates
**Solution:** Consider using Redis transactions or locks for critical operations

---

*This documentation covers the complete messaging controller implementation with Redis caching for a real-time chat application.*
