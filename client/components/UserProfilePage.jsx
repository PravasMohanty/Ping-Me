import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  getUserProfile,
  updateUserProfile,
} from '../api/api';

function UserProfilePage() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [contacts, setContacts] = useState(0);
    const [userAvatar, setUserAvatar] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);

            const data = await getUserProfile();

            setName(data.name || "");
            setUserName(data.username || "");
            setEmail(data.email || "");
            setContacts(data.contactsCount || 0);
            setUserAvatar(data.avatar || null);

        } catch (err) {
            alert("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setPreviewAvatar(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("name", name);
            formData.append("username", userName);
            formData.append("email", email);

            const fileInput = document.querySelector("#avatar-upload");
            if (fileInput.files[0]) {
                formData.append("avatar", fileInput.files[0]);
            }

            const data = await updateUserProfile(formData);

            setUserAvatar(data.avatar || userAvatar);
            setPreviewAvatar(null);

            alert("Profile updated successfully!");

        } catch (err) {
            alert("Profile update failed");
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map(w => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex justify-center items-center p-4">

            <div className="bg-white/10 p-8 rounded-xl w-full max-w-xl">

                <button
                    onClick={() => navigate("/chat")}
                    className="text-white mb-4"
                >
                    ← Back
                </button>

                <h1 className="text-2xl text-white font-bold mb-6">
                    Edit Profile
                </h1>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">

                    {previewAvatar || userAvatar ? (
                        <img
                            src={previewAvatar || userAvatar}
                            className="w-28 h-28 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-indigo-500 flex items-center justify-center text-3xl text-white">
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
                        className="mt-2 text-indigo-400 cursor-pointer"
                    >
                        Change Photo
                    </label>

                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">

                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full p-3 rounded bg-white/10 text-white"
                    />

                    <input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Username"
                        className="w-full p-3 rounded bg-white/10 text-white"
                    />

                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full p-3 rounded bg-white/10 text-white"
                    />

                    <p className="text-gray-400">
                        Contacts: {contacts}
                    </p>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-500 py-3 rounded text-white font-semibold"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default UserProfilePage;
