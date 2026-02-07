# 💬 PingMe - Real-Time Chat Application

A full-stack real-time messaging application built with modern web technologies. PingMe enables instant communication with features like online status tracking, media sharing, and message caching for optimal performance.

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red)
![React](https://img.shields.io/badge/React-18+-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black)

---

## ✨ Features

- **💬 Real-Time Messaging** - Instant message delivery using WebSockets
- **⚡ Message Caching** - Lightning-fast message loading with Redis
- **🔐 Secure Authentication** - JWT-based user authentication
- **📱 Responsive Design** - Works seamlessly across all devices

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI library for building interactive interfaces
- **Socket.IO Client** - Real-time bidirectional communication
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Beautiful notifications
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Node.js & Express** - Server runtime and web framework
- **Socket.IO** - WebSocket server for real-time features
- **MongoDB** - NoSQL database for data persistence
- **Redis** - In-memory cache for performance optimization
- **Cloudinary** - Cloud-based media storage
- **Multer** - File upload middleware
- **JWT** - Secure token-based authentication
- **bcrypt** - Password hashing

---

## 🚀 Quick Start

### Prerequisites

- **Linux Environment** (WSL, Virtual Machine, or native Linux)
- **Node.js** (v18 or higher)
- **MongoDB** (running instance)
- **Redis** (running instance)
- **Git**

---

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/PravasMohanty/Ping-Me.git
cd pingme
```

#### 2. Install Redis (if not already installed)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server

# Start Redis server
redis-server
```

Keep this terminal running or run Redis in the background.

#### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

#### 4. Environment Configuration

**Backend (.env file in `/server`):**
```env
PORT=1965
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Frontend (.env file in `/client`):**
```env
VITE_BACKEND_PORT=http://localhost:1965
```

#### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

**Terminal 3 - Redis (if not already running):**
```bash
redis-server
```

#### 6. Access the App
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔌 How Socket.IO Powers Real-Time Features

Socket.IO enables bidirectional, event-based communication between the client and server. Here's how PingMe uses it:

### Connection Flow
```
User Logs In
    ↓
Client connects to Socket.IO server with userId
    ↓
Server maps userId → socketId
    ↓
User sends message
    ↓
Server emits "newMessage" event to receiver's socket
    ↓
Receiver sees message instantly (no page refresh!)
```

### Key Socket Events

**Client → Server:**
- `connection` - User connects
- `sendMessage` - Send message to another user
- `disconnect` - User goes offline

**Server → Client:**
- `getOnlineUsers` - List of currently online users
- `newMessage` - Incoming message notification
- `messageRead` - Message seen status update

### Why Socket.IO?
- **Real-Time** - Messages delivered instantly
- **Bidirectional** - Both client and server can initiate communication
- **Automatic Reconnection** - Handles disconnects gracefully
- **Cross-Browser Compatible** - Works everywhere

---

## 🗄️ Why Redis?

PingMe uses Redis as a caching layer for:

- **Message Caching** - Store recent conversations in memory
- **User List Caching** - Fast retrieval of user data
- **Performance** - 100x faster than database queries

### Caching Strategy
```
User opens chat
    ↓
Check Redis cache
    ↓
Cache Hit? → Return instantly ⚡
    ↓
Cache Miss? → Fetch from MongoDB → Store in Redis → Return
```

---

## 📁 Project Structure

```
pingme/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context (Auth, Socket)
│   │   ├── pages/         # Route pages
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   │   ├── db.js         # MongoDB connection
│   │   ├── redis.js      # Redis client
│   │   └── socket.js     # Socket.IO setup
│   ├── controllers/      # Route controllers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js         # Entry point
│
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Cliche`

Ofcourse cant forget the cliche` developers' line ... 

---



<div align="center">

**Built with ❤️ by Pravas Mohanty**

⭐ Star this repo if you find it helpful!

</div>
