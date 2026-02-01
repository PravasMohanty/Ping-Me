const express = require('express')
const verifyToken = require('../middleware/authMiddleware')
const { getMessages, getUsersForSideBar, markMessageAsSeen, sendMessage, sendAttachment } = require('../controllers/messageController')

const messageRouter = express.Router();

messageRouter.get('/users', verifyToken, getUsersForSideBar)
messageRouter.get('/:id', verifyToken, getMessages)
messageRouter.put("/markSeen/:id", verifyToken, markMessageAsSeen)
messageRouter.post('/send/text-message/:id', verifyToken, sendMessage)
messageRouter.post("/send/attachment/:id", verifyToken, sendAttachment)

module.exports = messageRouter;