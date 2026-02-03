import React from 'react';

import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate('/auth');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">

            {/* Animated Background Orbs - matching login page */}
            <div className="absolute w-full h-full overflow-hidden z-0">
                <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-radial from-indigo-500/40 to-transparent top-[-15%] left-[-10%] animate-float blur-[100px]"></div>
                <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-radial from-pink-500/40 to-transparent bottom-[-15%] right-[-10%] animate-float blur-[100px]" style={{ animationDelay: '-7s' }}></div>
                <div className="absolute w-[350px] h-[350px] rounded-full bg-gradient-radial from-purple-500/40 to-transparent top-1/2 right-[15%] animate-float blur-[100px]" style={{ animationDelay: '-14s' }}></div>
            </div>

            <div className="relative z-10 max-w-4xl w-full text-center space-y-10 animate-fadeIn">
                {/* Logo/Brand */}
                <div className="mb-8">
                    <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-br from-white via-indigo-200 to-pink-200 bg-clip-text text-transparent leading-tight mb-4">
                        PingMe
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto rounded-full"></div>
                </div>

                {/* Tagline */}
                <h2 className="text-3xl md:text-4xl font-semibold text-white/90 leading-relaxed">
                    Stay Connected, Anytime, Anywhere
                </h2>

                <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                    Join millions of users who trust PingMe for instant messaging, voice calls, and seamless collaboration with friends and colleagues.
                </p>

                {/* CTA Button */}
                <div className="pt-6">
                    <button
                        onClick={handleLoginRedirect}
                        className="group relative px-16 py-5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl text-white font-bold text-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/50 active:translate-y-0 transition-all duration-300 overflow-hidden"
                    >
                        <span className="relative z-10">Get Started</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                </div>

                {/* Features Quick Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="text-4xl mb-3">💬</div>
                        <h3 className="text-white font-semibold mb-2">Instant Messaging</h3>
                        <p className="text-white/50 text-sm">Chat in real-time with friends and groups</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="text-4xl mb-3">🎥</div>
                        <h3 className="text-white font-semibold mb-2">Video Calls</h3>
                        <p className="text-white/50 text-sm">Crystal clear video and voice quality</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="text-white font-semibold mb-2">Secure & Private</h3>
                        <p className="text-white/50 text-sm">End-to-end encrypted conversations</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
        </div>
    )
}

export default HomePage