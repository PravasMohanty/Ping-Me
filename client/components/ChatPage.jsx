import React, {
    useContext,
    useEffect,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/authContext';

function ChatPage() {
    const navigate = useNavigate();
    const { authUser, socket, logout, axios } = useContext(AuthContext);

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [usersError, setUsersError] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sending, setSending] = useState(false);

    // Fetch users for sidebar
    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch messages when user is selected
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser]);

    // Listen for new messages via socket
    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (message) => {
            if (selectedUser && message.senderId === selectedUser._id) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => socket.off("newMessage");
    }, [socket, selectedUser]);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const { data } = await axios.get('/api/message/users');
            if (data.success) {
                setUsers(data.users || []);
                setUsersError(false);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsersError(true);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            setLoadingMessages(true);
            const { data } = await axios.get(`/api/message/${userId}`);
            // Backend returns array directly or wrapped in success object
            const messagesArray = Array.isArray(data) ? data : (data.messages || data.data || []);
            setMessages(messagesArray);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;

        setSending(true);
        try {
            const { data } = await axios.post(`/api/message/send/text-message/${selectedUser._id}`, {
                message: messageInput
            });

            if (data.success) {
                const messageToAdd = {
                    ...data.data,
                    senderId: authUser._id
                };
                setMessages([...messages, messageToAdd]);
                setMessageInput('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleEditUser = () => {
        navigate('/profile');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (userId) => {
        const colors = [
            'from-indigo-500 to-pink-500',
            'from-purple-500 to-pink-500',
            'from-blue-500 to-purple-500',
            'from-cyan-500 to-blue-500',
            'from-teal-500 to-cyan-500',
        ];
        return colors[userId.charCodeAt(0) % colors.length];
    };

    if (!authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">

            {/* Sidebar - 30% */}
            <div className="w-full md:w-[30%] bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">

                {/* Current User Header */}
                <div className="p-6 border-b border-white/10 relative">
                    <div className="flex items-center gap-4">
                        {authUser?.avatar ? (
                            <img
                                src={authUser.avatar}
                                alt={authUser.name}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/50"
                            />
                        ) : (
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(authUser._id)} flex items-center justify-center text-white font-bold text-lg ring-2 ring-indigo-500/50`}>
                                {getInitials(authUser.name)}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white font-semibold text-lg truncate">
                                {authUser?.name || 'Loading...'}
                            </h2>
                            <p className="text-white/50 text-sm truncate">
                                @{authUser?.username || 'username'}
                            </p>
                        </div>

                        {/* Menu Button */}
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 relative"
                        >
                            <svg
                                className="w-6 h-6 text-white/70 hover:text-white transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute right-6 top-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[180px]">
                            <button
                                onClick={handleEditUser}
                                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-3 border-b border-white/10"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left text-red-400 hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {loadingUsers ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : usersError ? (
                        <div className="flex flex-col items-center justify-center h-32 px-6 text-center">
                            <p className="text-white/50 text-sm">Can't load users</p>
                            <button
                                onClick={fetchUsers}
                                className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex items-center justify-center h-32 px-6 text-center">
                            <p className="text-white/50 text-sm">No users available</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {users.map((user) => (
                                <button
                                    key={user._id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-all ${selectedUser?._id === user._id ? 'bg-white/10' : ''
                                        }`}
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(user._id)} flex items-center justify-center text-white font-semibold`}>
                                            {getInitials(user.name)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 text-left">
                                        <h3 className="text-white font-medium truncate">{user.name}</h3>
                                        <p className="text-white/50 text-sm truncate">@{user.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area - 70% */}
            <div className="flex-1 flex flex-col">

                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
                            <div className="flex items-center gap-4">
                                {selectedUser.avatar ? (
                                    <img
                                        src={selectedUser.avatar}
                                        alt={selectedUser.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/50"
                                    />
                                ) : (
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(selectedUser._id)} flex items-center justify-center text-white font-semibold ring-2 ring-indigo-500/50`}>
                                        {getInitials(selectedUser.name)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-white font-semibold text-lg">{selectedUser.name}</h2>
                                    <p className="text-white/50 text-sm">@{selectedUser.username}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-white/50 text-center">Start a conversation</p>
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.senderId === authUser._id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.senderId === authUser._id
                                                ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white'
                                                : 'bg-white/10 text-white backdrop-blur-sm'
                                                }`}
                                        >
                                            <p>{message.message || message.content}</p>
                                            <p className={`text-xs mt-1 ${message.senderId === authUser._id ? 'text-white/70' : 'text-white/50'
                                                }`}>
                                                {new Date(message.createdAt || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/10">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    disabled={sending}
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim() || sending}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {sending ? 'Sending...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-white/70 text-xl font-semibold mb-2">Select a user to start messaging</h3>
                            <p className="text-white/40 text-sm">Choose from the list on the left</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;
