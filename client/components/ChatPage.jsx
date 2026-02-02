import React, {
  useEffect,
  useState,
} from 'react';

function ChatPage() {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [contactsError, setContactsError] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Fetch current user data
    useEffect(() => {
        fetchCurrentUser();
    }, []);

    // Fetch contacts
    useEffect(() => {
        fetchContacts();
    }, []);

    // Fetch messages when contact is selected
    useEffect(() => {
        if (selectedContact) {
            fetchMessages(selectedContact.id);
        }
    }, [selectedContact]);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/user/me');
            const data = await response.json();
            setCurrentUser(data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            setLoadingContacts(true);
            const response = await fetch('/api/contacts');
            if (!response.ok) throw new Error('Failed to fetch contacts');
            const data = await response.json();
            setContacts(data);
            setContactsError(false);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContactsError(true);
        } finally {
            setLoadingContacts(false);
        }
    };

    const fetchMessages = async (contactId) => {
        try {
            setLoadingMessages(true);
            const response = await fetch(`/api/messages/${contactId}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedContact) return;

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: selectedContact.id,
                    content: messageInput
                })
            });

            if (response.ok) {
                const newMessage = await response.json();
                setMessages([...messages, newMessage]);
                setMessageInput('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleEditUser = () => {
        window.location.href = '/user';
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">

            {/* Sidebar - 30% */}
            <div className="w-full md:w-[30%] bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">

                {/* Current User Header */}
                <div className="p-6 border-b border-white/10 relative">
                    <div className="flex items-center gap-4">
                        {currentUser?.avatar ? (
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/50"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-indigo-500/50">
                                {currentUser ? getInitials(currentUser.name) : '...'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white font-semibold text-lg truncate">
                                {currentUser?.name || 'Loading...'}
                            </h2>
                            <p className="text-white/50 text-sm truncate">
                                @{currentUser?.username || 'username'}
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
                                className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
                            >
                                <img src="menu.svg" alt="" />
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto">
                    {loadingContacts ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : contactsError ? (
                        <div className="flex flex-col items-center justify-center h-32 px-6 text-center">
                            <p className="text-white/50 text-sm">Can't load contacts</p>
                            <button
                                onClick={fetchContacts}
                                className="mt-3 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="flex items-center justify-center h-32 px-6 text-center">
                            <p className="text-white/50 text-sm">No contacts yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {contacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-all ${selectedContact?.id === contact.id ? 'bg-white/10' : ''
                                        }`}
                                >
                                    {contact.avatar ? (
                                        <img
                                            src={contact.avatar}
                                            alt={contact.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                                            {getInitials(contact.name)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 text-left">
                                        <h3 className="text-white font-medium truncate">{contact.name}</h3>
                                        <p className="text-white/50 text-sm truncate">@{contact.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area - 70% */}
            <div className="flex-1 flex flex-col">

                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
                            <div className="flex items-center gap-4">
                                {selectedContact.avatar ? (
                                    <img
                                        src={selectedContact.avatar}
                                        alt={selectedContact.name}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/50"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ring-2 ring-indigo-500/50">
                                        {getInitials(selectedContact.name)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-white font-semibold text-lg">{selectedContact.name}</h2>
                                    <p className="text-white/50 text-sm">@{selectedContact.username}</p>
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
                                    <p className="text-white/50 text-center">Waiting for messages...</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.senderId === currentUser?.id
                                                ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white'
                                                : 'bg-white/10 text-white backdrop-blur-sm'
                                                }`}
                                        >
                                            <p>{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.senderId === currentUser?.id ? 'text-white/70' : 'text-white/50'
                                                }`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                                />
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-white/70 text-xl font-semibold mb-2">Select a chat to start messaging</h3>
                            <p className="text-white/40 text-sm">Choose from your contacts on the left</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;