import React, {
    useContext,
    useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/authContext';

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [registrationStep, setRegistrationStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [registrationData, setRegistrationData] = useState({ name: '', username: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const email = e.target.email.value;
        const password = e.target.password.value;

        const result = await login('login', { email, password });
        if (result?.success) {
            navigate('/messages');
        }

        setLoading(false);
    };

    const handleRegisterStep1 = (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const username = e.target.username.value;
        setRegistrationData({ name, username });
        setRegistrationStep(2);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        const email = e.target.email.value;
        const password = e.target.passwd.value;
        const confirm = e.target.confirm.value;

        if (password !== confirm) {
            alert('Passwords dont match');
            setLoading(false);
            return;
        }

        const result = await login('register', {
            name: registrationData.name,
            username: registrationData.username,
            email,
            password
        });
        if (result?.success) {
            setRegistrationStep(1);
            setIsLogin(true);
            setRegistrationData({ name: '', username: '' });
        }

        setLoading(false);
    };

    const handleToggleToRegister = () => {
        setIsLogin(false);
        setRegistrationStep(1);
        setRegistrationData({ name: '', username: '' });
    };

    return (
        <div className="font-sans min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden p-3">

            {/* Animated Background Orbs */}
            <div className="absolute w-full h-full overflow-hidden z-0">
                <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-radial from-indigo-500/50 to-transparent top-[-10%] left-[-5%] animate-float blur-[80px]"></div>
                <div className="absolute w-[350px] h-[350px] rounded-full bg-gradient-radial from-pink-500/50 to-transparent bottom-[-10%] right-[-5%] animate-float blur-[80px]" style={{ animationDelay: '-7s' }}></div>
                <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-radial from-purple-500/50 to-transparent top-1/2 right-[10%] animate-float blur-[80px]" style={{ animationDelay: '-14s' }}></div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl flex gap-6 lg:gap-10 items-center flex-col lg:flex-row">

                {/* Welcome Section */}
                <div className="flex-1 text-white animate-slideInLeft text-center lg:text-left">
                    <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-4 bg-gradient-to-br from-white to-purple-300 bg-clip-text text-transparent leading-tight">
                        Welcome to PingMe
                    </h1>
                    <p className="text-base md:text-lg text-white/70 leading-relaxed mb-8">
                        Connect with friends, share moments, and stay in touch with the people who matter most.
                    </p>
                </div>

                {/* Auth Container */}
                <div className="flex-1 w-full max-w-md bg-white/8 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl animate-slideInRight">

                    {/* Toggle Buttons */}
                    <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${isLogin
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                                : 'text-white/50'
                                }`}>
                            Login
                        </button>
                        <button
                            onClick={handleToggleToRegister}
                            className={`flex-1 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${!isLogin
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                                : 'text-white/50'
                                }`}>
                            Register
                        </button>
                    </div>

                    {/* Forms Container */}
                    <div className="relative">

                        {/* Login Form */}
                        {isLogin ? (
                            <form onSubmit={handleLogin} className="animate-fadeIn">
                                <div className="mb-5">
                                    <label htmlFor="login-email" className="block text-white/90 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="login-email"
                                        name="email"
                                        placeholder="your@email.com"
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>

                                <div className="mb-5">
                                    <label htmlFor="login-password" className="block text-white/90 text-sm font-medium mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="login-password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold text-base md:text-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 relative overflow-hidden group disabled:opacity-50">
                                    <span className="relative z-10">{loading ? 'Logging in...' : 'Login'}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                </button>
                            </form>
                        ) : (
                            /* Register Form - Multi-step */
                            <div className="animate-fadeIn">
                                {/* Step 1: Basic Information */}
                                {registrationStep === 1 && (
                                    <form onSubmit={handleRegisterStep1}>
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-white font-semibold text-lg">Basic Information</h3>
                                                <span className="text-white/50 text-sm">Step 1 of 2</span>
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="register-name" className="block text-white/90 text-sm font-medium mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                id="register-name"
                                                name="name"
                                                placeholder="John Doe"
                                                required
                                                disabled={loading}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="register-username" className="block text-white/90 text-sm font-medium mb-2">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                id="register-username"
                                                name="username"
                                                placeholder="johndoe"
                                                required
                                                disabled={loading}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold text-base md:text-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 relative overflow-hidden group disabled:opacity-50">
                                            <span className="relative z-10">Next</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                        </button>
                                    </form>
                                )}

                                {/* Step 2: Account Credentials */}
                                {registrationStep === 2 && (
                                    <form onSubmit={handleRegister}>
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-white font-semibold text-lg">Account Details</h3>
                                                <span className="text-white/50 text-sm">Step 2 of 2</span>
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="register-email" className="block text-white/90 text-sm font-medium mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="register-email"
                                                name="email"
                                                placeholder="your@email.com"
                                                required
                                                disabled={loading}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="register-password" className="block text-white/90 text-sm font-medium mb-2">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                id="register-password"
                                                name="passwd"
                                                placeholder="••••••••"
                                                required
                                                disabled={loading}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="mb-5">
                                            <label htmlFor="register-confirm" className="block text-white/90 text-sm font-medium mb-2">
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                id="register-confirm"
                                                name="confirm"
                                                placeholder="••••••••"
                                                required
                                                disabled={loading}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 disabled:opacity-50"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setRegistrationStep(1)}
                                                disabled={loading}
                                                className="flex-1 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white font-semibold text-base hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-50">
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold text-base md:text-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 relative overflow-hidden group disabled:opacity-50">
                                                <span className="relative z-10">{loading ? 'Creating...' : 'Create Account'}</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-float {
                    animation: float 20s infinite ease-in-out;
                }
                
                .animate-slideInLeft {
                    animation: slideInLeft 0.8s ease-out;
                }
                
                .animate-slideInRight {
                    animation: slideInRight 0.8s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease;
                }
            `}</style>
        </div>
    );
}

export default LoginPage;
