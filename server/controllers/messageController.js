const Message = require("../models/Message");
const User = require("../models/User");

const getUsersForSideBar = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Get all users except the current user
        const filteredUsers = await User.find({ _id: { $ne: currentUserId } }).select("-password");

        const unseenMessages = {};

        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: currentUserId,
                seen: false
            });
            if (messages.length > 0) {
                unseenMessages[user._id.toString()] = messages.length;
            }
        });

        await Promise.all(promises);

        return res.status(200).json({ success: true, users: filteredUsers, unseenMessages });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getUsersForSideBar };
