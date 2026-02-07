# API Interceptor Configuration - EXPLAINED

## What This File Does

This creates a **custom axios instance** with automatic token management and error handling.

Think of it as a **smart wrapper** around axios that:
1. Automatically adds authentication tokens to EVERY request
2. Automatically handles "unauthorized" errors
3. Redirects to login if token expires

---

## Line-by-Line Breakdown

### Import and Base URL Setup

```javascript
import axios from 'axios';
const backEndUrl = import.meta.env.VITE_BACKEND_PORT || 'http://localhost:1965';
```

**WHAT:**
- Import axios library
- Get backend URL from environment variable
- If not set, use `http://localhost:1965` as fallback

**WHY ENVIRONMENT VARIABLE:**
```javascript
// Development:
VITE_BACKEND_PORT=http://localhost:1965

// Production:
VITE_BACKEND_PORT=https://api.yourapp.com
```

Switch between environments without changing code!

---

```javascript
const API = axios.create({
    baseURL: backEndUrl
});
```

**WHAT:** Creates a NEW axios instance with custom configuration

**WHY NOT USE REGULAR axios:**

```javascript
// ❌ Without custom instance
axios.get('http://localhost:1965/api/users');
axios.post('http://localhost:1965/api/login');
axios.get('http://localhost:1965/api/profile');
// Repeating URL every time!

// ✅ With custom instance
API.get('/api/users');
API.post('/api/login');
API.get('/api/profile');
// URL automatically prefixed!
```

---

### Request Interceptor (Automatic Token Injection)

```javascript
API.interceptors.request.use((config) => {
```

**WHAT IS AN INTERCEPTOR:**
A function that runs BEFORE every request is sent.

**ANALOGY:**
Think of it as a security checkpoint at an airport. Every passenger (request) must pass through and get their boarding pass (token) stamped before boarding.

---

```javascript
const token = localStorage.getItem('token');
if (token) {
    config.headers.authorization = `Bearer ${token}`;
}
return config;
```

**WHAT THIS DOES:**

**Step 1:** Get token from localStorage
**Step 2:** If token exists, add it to request headers
**Step 3:** Send the modified request

**EXAMPLE FLOW:**

```javascript
// You write:
API.get('/api/profile');

// Interceptor automatically transforms it to:
API.get('/api/profile', {
    headers: {
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
});

// You don't have to manually add token every time!
```

**WITHOUT INTERCEPTOR (Manual Token Addition):**
```javascript
// ❌ You'd have to write this EVERY TIME:
const token = localStorage.getItem('token');
API.get('/api/profile', {
    headers: { authorization: `Bearer ${token}` }
});

API.post('/api/update', data, {
    headers: { authorization: `Bearer ${token}` }
});

API.delete('/api/delete/123', {
    headers: { authorization: `Bearer ${token}` }
});
// Extremely tedious!
```

**WITH INTERCEPTOR:**
```javascript
// ✅ Token automatically added!
API.get('/api/profile');
API.post('/api/update', data);
API.delete('/api/delete/123');
// Clean and simple!
```

---

### Response Interceptor (Automatic Error Handling)

```javascript
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);
```

**WHAT IS A RESPONSE INTERCEPTOR:**
A function that runs AFTER receiving a response from the server.

**TWO CALLBACK FUNCTIONS:**

#### 1. Success Handler
```javascript
(response) => response,
```
**WHAT:** If request succeeds (status 200, 201, etc.), just return the response unchanged.

#### 2. Error Handler
```javascript
(error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/auth';
    }
    return Promise.reject(error);
}
```

**WHAT THIS DOES:**

**Step 1:** Check if error status is 401 (Unauthorized)
**Step 2:** If yes, remove token from localStorage
**Step 3:** Redirect to login page (`/auth`)
**Step 4:** Reject the promise so calling code knows error occurred

---

### Why 401 Auto-Redirect Is Powerful

**THE SCENARIO:**

```
Day 1: User logs in
  → Token saved to localStorage
  → Token valid for 7 days

Day 8: User returns
  → Token loaded from localStorage
  → User makes a request
  → Token expired!
  → Backend returns 401
```

**WITHOUT INTERCEPTOR:**
```javascript
// ❌ Every API call needs manual error handling
try {
    const response = await API.get('/api/profile');
} catch (error) {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
    }
}

// You'd write this 100+ times across your app!
```

**WITH INTERCEPTOR:**
```javascript
// ✅ Automatic redirect on 401!
try {
    const response = await API.get('/api/profile');
} catch (error) {
    // User already redirected to login!
    // You can just handle other errors
    console.error("Some other error:", error);
}

// No need to check for 401 manually!
```

---

### Understanding Promise.reject

```javascript
return Promise.reject(error);
```

**WHY REJECT:**
Even though we handle 401, we still need to reject the promise so the calling code knows the request failed.

**EXAMPLE:**

```javascript
// Component code
try {
    const response = await API.get('/api/profile');
    console.log("Success:", response.data);
} catch (error) {
    // Without Promise.reject, this catch block wouldn't run
    console.log("Error occurred:", error.message);
}
```

If we didn't reject, the `catch` block would never execute, and the calling code would think the request succeeded!

---

## Complete Flow Example

### Successful Request Flow

```
1. Component: API.get('/api/users')
      ↓
2. Request Interceptor: Add token to headers
      ↓
3. Request sent: GET /api/users
   Headers: { authorization: "Bearer token123" }
      ↓
4. Backend: Verify token ✓
      ↓
5. Backend: Return users data
      ↓
6. Response Interceptor: Status 200, pass through
      ↓
7. Component: Receives data
```

---

### Failed Request Flow (Expired Token)

```
1. Component: API.get('/api/users')
      ↓
2. Request Interceptor: Add token to headers
      ↓
3. Request sent: GET /api/users
   Headers: { authorization: "Bearer expired_token" }
      ↓
4. Backend: Verify token ✗ (expired!)
      ↓
5. Backend: Return 401 Unauthorized
      ↓
6. Response Interceptor:
   - Detects status 401
   - Removes token from localStorage
   - Redirects to /auth
      ↓
7. User sees login page
```

---

## How to Use This API Instance

### Exporting

```javascript
export default API;
```

Makes this custom axios instance available to other files.

---

### Importing and Using

```javascript
// In any component or service file
import API from './api'; // or './utils/api'

// GET request
const fetchUsers = async () => {
    try {
        const response = await API.get('/api/users');
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
};

// POST request
const createUser = async (userData) => {
    try {
        const response = await API.post('/api/users', userData);
        console.log('User created:', response.data);
    } catch (error) {
        console.error('Failed to create user:', error);
    }
};

// PUT request
const updateUser = async (userId, updates) => {
    try {
        const response = await API.put(`/api/users/${userId}`, updates);
        console.log('User updated:', response.data);
    } catch (error) {
        console.error('Failed to update user:', error);
    }
};

// DELETE request
const deleteUser = async (userId) => {
    try {
        const response = await API.delete(`/api/users/${userId}`);
        console.log('User deleted');
    } catch (error) {
        console.error('Failed to delete user:', error);
    }
};
```

---

## 🆚 COMPARISON: This API File vs AuthContext Approach

You now have TWO different approaches to handle tokens. Let's compare:

### Your AuthContext Approach

```javascript
// In AuthContext.jsx
axios.defaults.headers.common["authorization"] = `Bearer ${token}`;

// Usage in components
import axios from 'axios';
const response = await axios.get('/api/users');
```

**PROS:**
- ✅ Uses the default axios instance
- ✅ Token set once globally
- ✅ Simple to understand

**CONS:**
- ❌ No automatic 401 redirect
- ❌ Token only added when AuthContext sets it
- ❌ If you import axios directly elsewhere, token might not be there
- ❌ Manual error handling needed everywhere

---

### This API Interceptor Approach

```javascript
// In api.js
const API = axios.create({ baseURL: backEndUrl });
API.interceptors.request.use(/* add token */);
API.interceptors.response.use(/* handle 401 */);

// Usage in components
import API from './api';
const response = await API.get('/api/users');
```

**PROS:**
- ✅ Automatic token injection from localStorage
- ✅ Automatic 401 redirect
- ✅ Centralized error handling
- ✅ Always works, even if AuthContext isn't loaded yet
- ✅ More reliable token management

**CONS:**
- ❌ Must import custom `API` instead of regular `axios`
- ❌ Slightly more complex setup

---

## 🎯 RECOMMENDED: Combine Both Approaches!

**BEST PRACTICE:** Use BOTH files together!

### How to Integrate

#### 1. Keep Your API Interceptor (This File)

```javascript
// api.js
const API = axios.create({ baseURL: backEndUrl });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);

export default API;
```

---

#### 2. Update AuthContext to Use This API Instance

```javascript
// AuthContext.jsx
import API from './api'; // ← Import custom API instead of axios

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    // ... rest of state

    const checkAuth = async () => {
        try {
            const { data } = await API.get("/api/auth/check"); // ← Use API
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            if (error.response?.status !== 401) {
                console.error("Auth check failed:", error);
            }
        }
    };

    const login = async (state, creds) => {
        try {
            const { data } = await API.post(`/api/auth/${state}`, creds); // ← Use API
            if (data.success) {
                const userData = data.user;
                userData._id = userData._id || userData.id;
                setAuthUser(userData);
                connectSocket(userData);
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message || "Login successful");
                return data;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return null;
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem("token");
            setToken(null);
            setAuthUser(null);
            setOnlineUsers([]);
            toast.success("Logged out successfully");
            if (socket) {
                socket.disconnect();
            }
        } catch (error) {
            toast.error("Error logging out");
        }
    };

    const updateProfile = async (body) => {
        try {
            const { data } = await API.put("/api/user/update-profile", body); // ← Use API
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
                return data;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return null;
        }
    };

    // ... rest of the code

    const value = {
        API, // ← Export API so components can use it
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        token,
        setAuthUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
```

---

#### 3. Use in Components

```javascript
// ProfilePage.jsx
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function ProfilePage() {
    const { authUser, API } = useContext(AuthContext); // ← Get API from context
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Token automatically added!
                // 401 automatically handled!
                const { data } = await API.get('/api/users');
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
                // User already redirected to login if 401
            }
        };
        fetchUsers();
    }, [API]);

    return (
        <div>
            <h1>Welcome {authUser?.name}</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

---

## ⚠️ IMPORTANT: Redirect Conflict to Fix

Your current response interceptor has a potential issue:

```javascript
if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/auth'; // ❌ Hard redirect
}
```

**THE PROBLEM:**
`window.location.href` does a FULL page reload, which:
- Loses all React state
- Breaks SPA experience
- Can cause infinite redirects if `/auth` is also a protected route

---

### BETTER APPROACH: Use React Router

```javascript
// api.js
import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

const API = axios.create({ baseURL: backEndUrl });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // ✅ Use history for SPA navigation
            history.push('/auth');
        }
        return Promise.reject(error);
    }
);

export default API;
```

**OR EVEN BETTER: Handle in AuthContext**

```javascript
// api.js
const API = axios.create({ baseURL: backEndUrl });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});

// Don't redirect here - just reject
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Just clear token, let AuthContext handle redirect
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default API;
```

```javascript
// AuthContext.jsx
useEffect(() => {
    const handleUnauthorized = () => {
        setAuthUser(null);
        setToken(null);
        toast.error("Session expired. Please login again.");
        // Use React Router navigate here
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
}, []);
```

---

## 🎯 Final Recommendations

### 1. ✅ Use This API Interceptor File
**WHY:**
- Automatic token management
- Centralized error handling
- Cleaner code

---

### 2. ✅ Update AuthContext to Use This API
**WHY:**
- Best of both worlds
- AuthContext manages state
- API interceptor manages requests

---

### 3. ✅ Fix the 401 Redirect
**WHY:**
- Avoid hard page reloads
- Better user experience
- Prevent infinite redirects

---

### 4. ✅ Remove Token Setting from AuthContext
**REMOVE THIS LINE:**
```javascript
// AuthContext.jsx - DELETE THIS:
axios.defaults.headers.common["authorization"] = `Bearer ${data.token}`;
```

**WHY:**
The API interceptor already handles this! No need to set it twice.

---

## Summary

### What This File Does:
1. **Creates custom axios instance** with base URL
2. **Automatically adds token** to every request
3. **Automatically handles 401** errors and redirects
4. **Simplifies API calls** throughout your app

### Benefits:
- ✅ Write token logic ONCE
- ✅ Automatic 401 handling
- ✅ Cleaner component code
- ✅ More maintainable

### How to Use:
```javascript
import API from './api';

// All requests automatically have token!
await API.get('/api/users');
await API.post('/api/update', data);
await API.delete('/api/delete/123');
```

This is a **professional-grade** API setup that top companies use! 🚀
