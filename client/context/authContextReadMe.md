# AuthContext - The Brain of Your Frontend 🧠

## WHY You Need This Single Context File

### The Problem Without AuthContext

Imagine you have 20 different pages in your app:
- Homepage
- Login page
- Profile page
- Messages page
- Settings page
- Dashboard
- ... (15 more pages)

**WITHOUT AuthContext, EVERY PAGE needs to:**

```javascript
// ❌ REPEATED IN EVERY SINGLE PAGE (20 times!)

// Homepage.jsx
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        axios.get("/api/auth/check").then(data => setUser(data.user));
    }
}, []);

// Profile.jsx
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        axios.get("/api/auth/check").then(data => setUser(data.user));
    }
}, []);

// Messages.jsx
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        axios.get("/api/auth/check").then(data => setUser(data.user));
    }
}, []);

// ... 17 MORE TIMES!
```

**NIGHTMARE PROBLEMS:**
1. ❌ **Code duplication** - Same code written 20 times!
2. ❌ **Inconsistent state** - Homepage thinks user is logged in, Profile page thinks they're logged out
3. ❌ **Update hell** - If you change login logic, you must update 20 files!
4. ❌ **Socket connections everywhere** - Each page creates its own Socket.IO connection (massive waste!)
5. ❌ **No single source of truth** - Each page has different `user` state

---
- Auth = global state
- Global state → Context
- One AuthContext → clean, scalable, secure app
- Multiple pages → same auth logic → one place

---

### The Solution: AuthContext (Single Source of Truth)

**WITH AuthContext, you write the logic ONCE:**

```javascript
// AuthContext.jsx - Written ONCE! ✅
const [authUser, setAuthUser] = useState(null);
const [token, setToken] = useState(null);
const [socket, setSocket] = useState(null);

// All pages just USE this shared state:

// Homepage.jsx
const { authUser } = useContext(AuthContext);
console.log(authUser.name); // ✅ Works!

// Profile.jsx
const { authUser } = useContext(AuthContext);
console.log(authUser.name); // ✅ Same user!

// Messages.jsx
const { authUser, socket } = useContext(AuthContext);
socket.emit("message", "Hello"); // ✅ Same socket!
```

**BENEFITS:**
1. ✅ **Write once, use everywhere** - Logic written in ONE file
2. ✅ **Consistent state** - ALL pages see the SAME user data
3. ✅ **Single socket connection** - One Socket.IO connection shared by all pages
4. ✅ **Easy updates** - Change login logic in ONE place
5. ✅ **Single source of truth** - Only ONE `authUser` state for the entire app

---

## What This AuthContext File Does

Think of AuthContext as the **authentication manager** for your ENTIRE app.

### The 4 Core Jobs:

#### 1. **Manages User Login State**
```javascript
const [authUser, setAuthUser] = useState(null);
```
- Stores who is currently logged in
- Available to ALL pages instantly

#### 2. **Manages Authentication Token**
```javascript
const [token, setToken] = useState(localStorage.getItem("token"));
```
- Stores JWT token for API requests
- Automatically loads from localStorage on app start
- Adds token to ALL axios requests automatically

#### 3. **Manages Socket.IO Connection**
```javascript
const [socket, setSocket] = useState(null);
```
- Creates ONE websocket connection when user logs in
- Shared by all pages that need real-time updates
- Automatically disconnects on logout

#### 4. **Tracks Online Users**
```javascript
const [onlineUsers, setOnlineUsers] = useState([]);
```
- Knows who else is online right now
- Updates in real-time via Socket.IO
- Available to all pages (for showing green dots, etc.)

---

## Line-by-Line Breakdown

### Imports and Setup

```javascript
import { createContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
```

**WHY EACH IMPORT:**
- `createContext` - Creates the shared state container
- `useEffect` - Run code when component mounts (check if user is logged in)
- `useRef` - Remember values without causing re-renders (prevent double auth checks)
- `useState` - Store user, token, socket, etc.
- `axios` - Make API calls
- `toast` - Show success/error messages
- `io` - Connect to Socket.IO server for real-time features

---

```javascript
const backEndUrl = import.meta.env.VITE_BACKEND_PORT || 'http://localhost:1965';
axios.defaults.baseURL = backEndUrl;
```

**WHAT THIS DOES:**
- Get backend URL from environment variables
- If not set, use `http://localhost:1965` as default
- Set axios to automatically prefix all requests with this URL

**EXAMPLE:**
```javascript
// Instead of writing:
axios.get('http://localhost:1965/api/users');

// You can just write:
axios.get('/api/users');
// Axios automatically adds 'http://localhost:1965' in front!
```

---

```javascript
export const AuthContext = createContext();
```

**WHAT THIS DOES:**
Creates the "container" that will hold all the shared authentication state.

**ANALOGY:**
Think of it as creating a **shared notebook** that all pages can read from and write to.

---

### The Main Component

```javascript
export const AuthProvider = ({ children }) => {
```

**WHAT `children` MEANS:**
This component will wrap your ENTIRE app.

**HOW IT'S USED:**
```javascript
// main.jsx or App.jsx
<AuthProvider>
    <App />  {/* ← This is 'children' */}
</AuthProvider>

// Everything inside <AuthProvider> can access the auth state!
```

---

### State Variables

```javascript
const [token, setToken] = useState(localStorage.getItem("token"));
```

**WHY START WITH LOCALSTORAGE:**
When user refreshes the page, React state resets to default (null). But the token is still in localStorage! So we grab it on startup.

**FLOW:**
```
1. User logs in → Token saved to localStorage
2. User refreshes page → All React state is lost
3. AuthContext loads → Reads token from localStorage
4. Token restored! → User stays logged in
```

---

```javascript
const [authUser, setAuthUser] = useState(null);
```

**STORES:** Current logged-in user's data
```javascript
{
    _id: "123",
    name: "John Doe",
    email: "john@example.com",
    role: "admin"
}
```

---

```javascript
const [onlineUsers, setOnlineUsers] = useState([]);
```

**STORES:** Array of user IDs who are currently online
```javascript
["user123", "user456", "user789"]
```

**USED FOR:** Showing green "online" dots next to user names in chat apps

---

```javascript
const [socket, setSocket] = useState(null);
```

**STORES:** The Socket.IO connection object

**WHY IN STATE:** So all pages can access the SAME socket connection

---

```javascript
const authChecked = useRef(false);
const socketRef = useRef(null);
```

**WHY useRef NOT useState:**

`useRef` stores a value that:
1. Persists across re-renders (like useState)
2. Does NOT cause re-render when changed (unlike useState)

**PURPOSE:**
- `authChecked` - Prevent checking authentication twice on startup (React 18 strict mode runs effects twice in dev)
- `socketRef` - Keep reference to socket to check if already connected

---

### The connectSocket Function

```javascript
const connectSocket = (userData) => {
    if (!userData || socketRef.current?.connected) return;
```

**WHY THIS CHECK:**
- `!userData` - Don't connect if no user is logged in
- `socketRef.current?.connected` - Don't connect if already connected

**PREVENTS:** Creating multiple socket connections (waste of resources!)

---

```javascript
const newSocket = io(backEndUrl, {
    query: {
        userId: userData._id,
    }
});
```

**WHAT THIS DOES:**
Connects to Socket.IO server and sends the user's ID.

**WHY SEND userId:**
Backend needs to know WHO is connecting so it can:
1. Map this socket connection to this user
2. Send messages to the right person

**BACKEND RECEIVES:**
```javascript
// On backend
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    // Now backend knows: "Socket ABC123 belongs to User 789"
});
```

---

```javascript
newSocket.connect();
socketRef.current = newSocket;
setSocket(newSocket);
```

**STEP BY STEP:**
1. `.connect()` - Actually establish the websocket connection
2. `socketRef.current = newSocket` - Store in ref (for checking if connected)
3. `setSocket(newSocket)` - Store in state (so all pages can access it)

---

```javascript
newSocket.on("getOnlineUsers", (userIds) => {
    setOnlineUsers(userIds);
});
```

**WHAT THIS DOES:**
Listens for "getOnlineUsers" event from backend.

**BACKEND SENDS:**
```javascript
// Backend sends this whenever someone logs in/out
io.emit("getOnlineUsers", ["user1", "user2", "user3"]);
```

**FRONTEND RECEIVES:**
```javascript
// Frontend automatically updates onlineUsers state
setOnlineUsers(["user1", "user2", "user3"]);

// Now all pages can show who's online!
```

---

### The checkAuth Function

```javascript
const checkAuth = async () => {
    try {
        const { data } = await axios.get("/api/auth/check");
```

**PURPOSE:** Check if user is still logged in when app loads

**WHY NEEDED:**
```
User logs in → Token saved to localStorage
User closes browser
User opens browser next day → Token still in localStorage
Is token still valid? → checkAuth() asks backend to verify!
```

---

```javascript
if (data.success) {
    setAuthUser(data.user);
    connectSocket(data.user);
}
```

**IF TOKEN IS VALID:**
1. Set the user data
2. Connect to Socket.IO (for real-time features)

---

```javascript
} catch (error) {
    if (error.response?.status !== 401) {
        console.error("Auth check failed:", error);
    }
}
```

**WHY IGNORE 401:**
- 401 = "Unauthorized" = User not logged in
- This is EXPECTED when user hasn't logged in yet
- Only log OTHER errors (500, network errors, etc.)

**WITHOUT THIS CHECK:**
```javascript
// Page loads
// Not logged in yet (normal!)
// Error logged: "401 Unauthorized" ← Scary but harmless
// Users panic thinking something broke
```

**WITH THIS CHECK:**
```javascript
// Page loads
// Not logged in yet (normal!)
// 401 silently ignored ← No scary errors
// Users not worried
```

---

### The login Function

```javascript
const login = async (state, creds) => {
```

**PARAMETERS:**
- `state` - Login type: "login" or "register" or "admin-login"
- `creds` - Credentials object: `{ email, password }` or `{ username, password }`

**WHY FLEXIBLE:**
Can handle multiple login types:
```javascript
login("login", { email: "john@email.com", password: "pass123" });
login("admin-login", { admin_id: "ADM001", password: "admin123" });
login("register", { username: "john", email: "...", password: "..." });
```

---

```javascript
const { data } = await axios.post(`/api/auth/${state}`, creds);
```

**DYNAMIC URL:**
```javascript
state = "login" → POST /api/auth/login
state = "admin-login" → POST /api/auth/admin-login
state = "register" → POST /api/auth/register
```

---

```javascript
if (data.success) {
    const userData = data.user;
    userData._id = userData._id || userData.id;
```

**WHY THIS LINE:**
Some backends return `id`, some return `_id`. This ensures we always have `_id`.

**EXAMPLE:**
```javascript
// Backend returns: { id: "123", name: "John" }
userData._id = userData._id || userData.id;
// Now: { id: "123", _id: "123", name: "John" }
```

---

```javascript
setAuthUser(userData);
connectSocket(userData);
axios.defaults.headers.common["authorization"] = `Bearer ${data.token}`;
setToken(data.token);
localStorage.setItem("token", data.token);
```

**STEP BY STEP:**
1. **Store user data** - So all pages know who's logged in
2. **Connect socket** - Enable real-time features
3. **Add token to axios** - All future requests automatically include token
4. **Store token in state** - For access across components
5. **Save token to localStorage** - So user stays logged in after refresh

**THE AXIOS MAGIC:**
```javascript
axios.defaults.headers.common["authorization"] = `Bearer ${token}`;

// Now ALL axios requests automatically include:
// Headers: { authorization: "Bearer xyz123..." }

// So you can just write:
axios.get("/api/profile"); // Token automatically included!

// Instead of:
axios.get("/api/profile", {
    headers: { authorization: `Bearer ${token}` }
}); // Tedious to write every time!
```

---

```javascript
toast.success(data.message || "Login successful");
return data;
```

**WHY RETURN DATA:**
So the login page can do something after successful login:

```javascript
// LoginPage.jsx
const handleLogin = async () => {
    const result = await login("login", { email, password });
    if (result) {
        navigate("/dashboard"); // Redirect to dashboard
    }
};
```

---

### The logout Function

```javascript
const logout = async () => {
    try {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["authorization"] = null;
        toast.success("Logged out successfully");
        if (socket) {
            socket.disconnect();
        }
```

**COMPLETE CLEANUP:**
1. Delete token from localStorage
2. Clear token from state
3. Clear user from state
4. Clear online users list
5. Remove token from axios headers
6. Show success message
7. Disconnect websocket

**WHY SO THOROUGH:**
Leaving any authentication data around is a security risk!

---

### The updateProfile Function

```javascript
const updateProfile = async (body) => {
```

**PURPOSE:** Update user's profile (name, email, avatar, etc.)

```javascript
if (data.success) {
    setAuthUser(data.user);
```

**WHY UPDATE authUser:**
After profile update, the user data changed! Update it everywhere.

**EXAMPLE:**
```javascript
// Before update
authUser = { name: "John Doe", avatar: "old.jpg" }

// User updates profile
updateProfile({ name: "Johnny", avatar: "new.jpg" })

// After update
authUser = { name: "Johnny", avatar: "new.jpg" }

// ALL pages automatically see the new name/avatar!
```

---

### The useEffect Hook

```javascript
useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;
```

**WHY authChecked:**
In React 18 strict mode (development), useEffect runs TWICE to help find bugs.

**WITHOUT authChecked:**
```javascript
// Effect runs
checkAuth(); // Makes API call #1

// Effect runs AGAIN (React 18 strict mode)
checkAuth(); // Makes API call #2

// Two identical API calls! Wasteful!
```

**WITH authChecked:**
```javascript
// Effect runs
if (authChecked.current) return; // False, continue
authChecked.current = true;
checkAuth(); // Makes API call #1

// Effect runs AGAIN
if (authChecked.current) return; // True, STOP HERE!
// No second API call!
```

---

```javascript
if (token) {
    axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
}
checkAuth();
```

**STARTUP FLOW:**
1. Load token from localStorage
2. If token exists, add it to axios headers
3. Call checkAuth to verify token is still valid

**WHY CHECK IF VALID:**
```
User logged in yesterday → Token saved
User comes back today → Token loaded from localStorage
But maybe token expired! → checkAuth() verifies with backend
If expired → Backend returns 401 → User prompted to login again
```

---

### The Value Object

```javascript
const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    token,
    setAuthUser
};
```

**WHAT THIS IS:**
Everything you're making available to all pages.

**HOW PAGES USE IT:**
```javascript
// Any page in your app
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

function ProfilePage() {
    const { authUser, logout, updateProfile } = useContext(AuthContext);
    
    return (
        <div>
            <h1>Welcome {authUser.name}</h1>
            <button onClick={logout}>Logout</button>
            <button onClick={() => updateProfile({ name: "New Name" })}>
                Update Name
            </button>
        </div>
    );
}
```

---

### The Provider

```javascript
return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
);
```

**WHAT THIS DOES:**
Wraps your entire app and makes `value` available to all child components.

**IN YOUR MAIN FILE:**
```javascript
// main.jsx
import { AuthProvider } from './AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <App />
    </AuthProvider>
);

// Now EVERY component in <App /> can access auth state!
```

---

## How Pages Use This Context

### Example 1: Profile Page

```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ProfilePage() {
    const { authUser, updateProfile, logout } = useContext(AuthContext);
    
    if (!authUser) {
        return <div>Please login first</div>;
    }
    
    return (
        <div>
            <h1>{authUser.name}</h1>
            <p>{authUser.email}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
}
```

---

### Example 2: Chat Page

```javascript
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

function ChatPage() {
    const { authUser, socket, onlineUsers } = useContext(AuthContext);
    
    useEffect(() => {
        if (!socket) return;
        
        socket.on("newMessage", (message) => {
            console.log("New message:", message);
        });
    }, [socket]);
    
    return (
        <div>
            <h2>Online Users: {onlineUsers.length}</h2>
            {/* Chat UI here */}
        </div>
    );
}
```

---

### Example 3: Login Page

```javascript
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login("login", { email, password });
        if (result) {
            navigate("/dashboard");
        }
    };
    
    return (
        <form onSubmit={handleLogin}>
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
        </form>
    );
}
```

---

## The Big Picture: How It All Works Together

```
┌─────────────────────────────────────────────────────────┐
│                    AuthProvider                          │
│  (Wraps entire app)                                      │
│                                                           │
│  State:                                                   │
│  • authUser: { id, name, email }                         │
│  • token: "jwt_token_here"                               │
│  • socket: Socket.IO connection                          │
│  • onlineUsers: ["user1", "user2"]                       │
│                                                           │
│  Functions:                                               │
│  • login(type, creds)                                    │
│  • logout()                                               │
│  • updateProfile(data)                                    │
│  • checkAuth()                                            │
│  • connectSocket(user)                                    │
│                                                           │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Provides to all children:
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
    │ Home  │   │Profile│   │ Chat  │
    │ Page  │   │ Page  │   │ Page  │
    └───────┘   └───────┘   └───────┘
        │           │           │
        │           │           │
    All pages see the SAME state!
    All pages use the SAME functions!
    All pages share the SAME socket!
```

---

## Why This Architecture Is Powerful

### 1. Single Source of Truth
```javascript
// ✅ ONE place stores user
// ✅ ALL pages see the same user
// ✅ Update once, reflects everywhere
```

### 2. Automatic Token Management
```javascript
// ✅ Token automatically added to ALL axios requests
// ✅ No need to manually add headers everywhere
```

### 3. Shared Socket Connection
```javascript
// ✅ ONE socket connection for entire app
// ✅ All pages can send/receive real-time events
// ✅ No resource waste
```

### 4. Persistent Authentication
```javascript
// ✅ User stays logged in after refresh
// ✅ Token verified on startup
// ✅ Automatic logout if token expired
```

### 5. Centralized Logic
```javascript
// ✅ Login logic in ONE place
// ✅ Logout logic in ONE place
// ✅ Easy to update and maintain
```

---

## Common Patterns

### Protected Routes

```javascript
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    const { authUser } = useContext(AuthContext);
    
    if (!authUser) {
        return <Navigate to="/login" />;
    }
    
    return children;
}

// Usage:
<Route path="/dashboard" element={
    <ProtectedRoute>
        <Dashboard />
    </ProtectedRoute>
} />
```

---

### Conditional Rendering

```javascript
function Navbar() {
    const { authUser, logout } = useContext(AuthContext);
    
    return (
        <nav>
            {authUser ? (
                <>
                    <span>Welcome {authUser.name}</span>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </nav>
    );
}
```

---

### Real-time Features

```javascript
function MessagesPage() {
    const { socket } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        if (!socket) return;
        
        socket.on("newMessage", (msg) => {
            setMessages(prev => [...prev, msg]);
        });
        
        return () => socket.off("newMessage");
    }, [socket]);
    
    const sendMessage = (text) => {
        socket.emit("sendMessage", { text });
    };
    
    return (
        <div>
            {messages.map(msg => (
                <div key={msg.id}>{msg.text}</div>
            ))}
            <button onClick={() => sendMessage("Hello")}>
                Send
            </button>
        </div>
    );
}
```

---

## Summary: Why You Need This File

**WITHOUT AuthContext:**
- ❌ Every page manages its own auth state
- ❌ 20+ files with duplicate login logic
- ❌ Inconsistent user data across pages
- ❌ Multiple socket connections (waste!)
- ❌ Maintenance nightmare

**WITH AuthContext:**
- ✅ ONE file manages ALL authentication
- ✅ Write once, use everywhere
- ✅ Consistent state across entire app
- ✅ Single shared socket connection
- ✅ Easy to maintain and update

**BOTTOM LINE:**
AuthContext is the **central nervous system** of your app's authentication. Every page connects to it to know who's logged in, make authenticated requests, and receive real-time updates. Without it, your app would be a chaotic mess of duplicate code and inconsistent state!
