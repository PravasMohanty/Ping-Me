import {
    createContext,
    useEffect,
    useState,
} from 'react';

import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const backEndUrl = import.meta.env.VITE_BACKEND_PORT || 'http://localhost:1965';
axios.defaults.baseURL = backEndUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
        }
    };

    const login = async (state, creds) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, creds);
            if (data.success) {
                const userData = data.user;
                // Ensure _id is set (backend returns both id and _id)
                userData._id = userData._id || userData.id;
                setAuthUser(userData);
                connectSocket(userData);
                axios.defaults.headers.common["authorization"] = `Bearer ${data.token}`;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message || "Login successful");
                return data;
            } else {
                toast.error(data.message || "Login failed");
                return null;
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
            axios.defaults.headers.common["authorization"] = null;
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
            const { data } = await axios.put("/api/user/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
                return data;
            } else {
                toast.error(data.message || "Update failed");
                return null;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return null;
        }
    };

    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backEndUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["authorization"] = `Bearer ${token}`;
        }
        checkAuth();
    }, []);

    const value = {
        axios,
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
