import React, { useState } from 'react';

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [registrationStep, setRegistrationStep] = useState(1); // Step 1: Basic info, Step 2: Credentials

    const handleLogin = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const passwd = e.target.password.value;
        // Add your login logic here
    }

    const handleRegisterStep1 = (e) => {
        e.preventDefault();
        // Move to step 2
        setRegistrationStep(2);
    }

    const handleRegister = (e) => {
        e.preventDefault();
        const name = e.target.name.value;
        const username = e.target.username.value;
        const email = e.target.email.value;
        const passwd = e.target.passwd.value;
        const confirm = e.target.confirm.value;

        if (passwd != confirm) {
            alert('Passwords Dont Match');
            return;
        }

        // Add your registration logic here
        alert('Registration successful!');

        // Reset to step 1 after registration
        setRegistrationStep(1);
        setIsLogin(true);
    }

    const handleToggleToRegister = () => {
        setIsLogin(false);
        setRegistrationStep(1); // Reset to step 1 when switching to register
    }

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
                                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
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
                                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                                    />
                                </div>

                                <div className="text-right mb-4">
                                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Password recovery feature coming soon!'); }} className="text-indigo-400 text-sm hover:text-pink-400 transition-colors duration-300">
                                        Forgot password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold text-base md:text-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 relative overflow-hidden group">
                                    <span className="relative z-10">Login</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                </button>

                                <div className="flex items-center my-5 text-white/40 text-sm">
                                    <div className="flex-1 h-px bg-white/10"></div>
                                    <span className="px-4">or continue with</span>
                                    <div className="flex-1 h-px bg-white/10"></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => alert('Google login coming soon!')}
                                        className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5 transition-all duration-300">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                                            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                                        </svg>
                                        Google
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => alert('GitHub login coming soon!')}
                                        className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5 transition-all duration-300">
                                        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                                        </svg>
                                        GitHub
                                    </button>
                                </div>
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
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
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
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold text-base md:text-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 relative overflow-hidden group">
                                            <span className="relative z-10">Next</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                        </button>

                                        <div className="flex items-center my-5 text-white/40 text-sm">
                                            <div className="flex-1 h-px bg-white/10"></div>
                                            <span className="px-4">or sign up with</span>
                                            <div className="flex-1 h-px bg-white/10"></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => alert('Google signup coming soon!')}
                                                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5 transition-all duration-300">
                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                                                    <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                                                </svg>
                                                Google
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => alert('GitHub signup coming soon!')}
                                                className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/15 rounded-xl text-white text-sm hover:bg-white/10 hover:border-white/30 hover:-translate-y-0.5 transition-all duration-300">
                                                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                                                </svg>
                                                GitHub
                                            </button>
                                        </div>
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
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
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
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
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
                                                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:bg-white/8 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setRegistrationStep(1)}
                                                className="flex-1 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white font-semibold text-base hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl text-white font-semibold text-base md:text-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 transition-all duration-300 relative overflow-hidden group">
                                                <span className="relative z-10">Create Account</span>
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

            <style jsx>{`
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