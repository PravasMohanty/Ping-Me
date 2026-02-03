import React, {
    useContext,
    useEffect,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/authContext';

function UserProfilePage() {
    const navigate = useNavigate();
    const { authUser, setAuthUser, updateProfile, axios } = useContext(AuthContext);

    const [name, setName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [userAvatar, setUserAvatar] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (authUser) {
            setName(authUser.name || "");
            setUserName(authUser.username || "");
            setEmail(authUser.email || "");
            setUserAvatar(authUser.avatar || null);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [authUser]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewAvatar(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("username", userName);
            formData.append("email", email);

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const result = await updateProfile(formData);
            if (result?.success) {
                setPreviewAvatar(null);
                setAvatarFile(null);
                navigate("/messages");
            }
        } catch (error) {
            console.error("Profile update error:", error);
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(w => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const getAvatarColor = () => {
        const colors = [
            'from-indigo-500 to-pink-500',
            'from-purple-500 to-pink-500',
            'from-blue-500 to-purple-500',
            'from-cyan-500 to-blue-500',
            'from-teal-500 to-cyan-500',
        ];
        return colors[authUser?._id?.charCodeAt(0) % colors.length] || 'from-indigo-500 to-pink-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
                <div className="animate-spin h-12 w-12 border-b-2 border-indigo-500 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">

            <div className="max-w-2xl mx-auto">

                <button
                    onClick={() => navigate("/messages")}
                    className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Chat
                </button>

                <div className="bg-white/8 backdrop-blur-xl border border-white/20 rounded-2xl p-8">

                    <h1 className="text-3xl font-bold text-white mb-8">
                        Edit Profile
                    </h1>

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        {previewAvatar || userAvatar ? (
                            <img
                                src={previewAvatar || userAvatar}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover ring-4 ring-indigo-500/50 mb-4"
                            />
                        ) : (
                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center text-5xl font-bold text-white ring-4 ring-indigo-500/50 mb-4`}>
                                {getInitials(name)}
                            </div>
                        )}

                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleAvatarChange}
                        />

                        <label
                            htmlFor="avatar-upload"
                            className="px-4 py-2 bg-indigo-500/50 hover:bg-indigo-500 text-white rounded-lg cursor-pointer transition-all duration-300"
                        >
                            Change Photo
                        </label>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSaveProfile} className="space-y-5">

                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                disabled={saving}
                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Your username"
                                disabled={saving}
                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-white/90 text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                disabled={saving}
                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;
