const Message = require("../models/Message");
const User = require("../models/User");
const Redis = require("redis");

const redisClient = Redis.createClient();

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

const DEFAULT_EXPIRATION = 3600;

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

const getUsersForSideBar = async (req, res) => {
    try {
        const currentUserId = req.user._id.toString();
        const cacheKey = `users:${currentUserId}`;

        const cachedUsers = await redisClient.get(cacheKey);
        let filteredUsers;

        if (cachedUsers) {
            filteredUsers = JSON.parse(cachedUsers);
        } else {
            filteredUsers = await User.find({
                _id: { $ne: currentUserId },
            }).select("-password");

            await redisClient.setEx(
                cacheKey,
                DEFAULT_EXPIRATION,
                JSON.stringify(filteredUsers)
            );
        }

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

        return res.status(200).json({
            success: true,
            users: filteredUsers,
            unseenMessages,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const getMessages = async (req, res) => {
    try {
        const myId = req.user._id.toString();
        const { selectedId } = req.body;

        const ids = [myId, selectedId].sort();
        const cacheKey = `messages:${ids[0]}:${ids[1]}`;

        const cachedMessages = await redisClient.get(cacheKey);
        let chats;

        if (cachedMessages) {
            chats = JSON.parse(cachedMessages);

            await Message.updateMany(
                {
                    senderId: selectedId,
                    receiverId: myId,
                    seen: false,
                },
                { $set: { seen: true } }
            );

            await redisClient.del(cacheKey);
        } else {
            await Message.updateMany(
                {
                    senderId: selectedId,
                    receiverId: myId,
                    seen: false,
                },
                { $set: { seen: true } }
            );

            chats = await Message.find({
                $or: [
                    { senderId: myId, receiverId: selectedId },
                    { senderId: selectedId, receiverId: myId },
                ],
            }).sort({ createdAt: 1 });

            await redisClient.setEx(
                cacheKey,
                DEFAULT_EXPIRATION,
                JSON.stringify(chats)
            );
        }

        return res.status(200).json(chats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findByIdAndUpdate(
            id,
            { seen: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        await invalidateMessageCache(
            message.senderId.toString(),
            message.receiverId.toString()
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const sendMessage = async (req, res) => {
    try {
        const myId = req.user._id.toString();
        const { otherId, messageSent } = req.body; // Fixed: removed () from req.body

        // Fixed: Correct MongoDB query syntax
        const validReceiver = await User.findById(otherId);

        // Fixed: Logic - should check if receiver does NOT exist
        if (!otherId || !messageSent || !validReceiver) {
            console.log('Error cant send message: No user or No Message'); // Fixed: parentheses
            return res.status(400).json({
                message: 'Cant Send Message: Receiver / Message Missing'
            });
        }

        // Create and save new message
        const newMessage = new Message({
            senderId: myId,
            receiverId: otherId,
            message: messageSent
        });

        await newMessage.save();

        // Invalidate cache after sending message
        await invalidateMessageCache(myId, otherId);

        console.log('Message Sent');
        return res.status(200).json({
            success: true,
            message: 'Message Sent Successfully', // Fixed: colon instead of backtick
            data: newMessage
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

const sendAttachment = async (req, res) => {
    try {
        const myId = req.user._id.toString();
        const { otherId, AttachmentSent } = req.body; // Fixed: removed () from req.body

        // Fixed: Correct MongoDB query syntax
        const validReceiver = await User.findById(otherId);

        // Fixed: Logic - should check if receiver does NOT exist
        if (!otherId || !AttachmentSent || !validReceiver) {
            console.log('Error cant send message: No user or No Message'); // Fixed: parentheses
            return res.status(400).json({
                message: 'Cant Send Message: Receiver / Message Missing'
            });
        }

        // Create and save new message
        const newMessage = new Message({
            senderId: myId,
            receiverId: otherId,
            attachment: AttachmentSent
        });

        await newMessage.save();

        // Invalidate cache after sending message
        await invalidateMessageCache(myId, otherId);

        console.log('Message Sent');
        return res.status(200).json({
            success: true,
            message: 'Message Sent Successfully', // Fixed: colon instead of backtick
            data: newMessage
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};



module.exports = { getUsersForSideBar, getMessages, markMessageAsSeen, sendAttachment, sendMessage };