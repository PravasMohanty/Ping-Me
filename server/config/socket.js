// CORRECTED VERSION - All bugs fixed

const { Server } = require('socket.io'); // Fixed: Proper destructuring

// Fixed: Correct initialization - Server needs http server instance
const io = new Server({
    cors: {
        origin: "*" // Allow all origins (configure appropriately for production)
    }
});

// Fixed: userSocketMap should be a simple object, not attached to socket module
const userSocketMap = {};

const establishConnection = (httpServer) => {
    // Attach Socket.IO to HTTP server
    io.attach(httpServer);

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        console.log('User Connected:', userId);

        if (userId && userId !== 'undefined') {
            userSocketMap[userId] = socket.id; // Fixed: Use socket.id, not socket.userId
        }

        // Emit online users to all clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on('disconnect', () => {
            console.log('User Disconnected:', userId);
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
};

// Helper function to get socket ID for a user
const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

module.exports = {
    io,
    establishConnection,
    getReceiverSocketId,
    userSocketMap
};