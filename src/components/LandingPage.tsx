import React from 'react';
import { Box, ChevronRight, Cpu, Zap, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  session: any;
  showSplash: boolean;
  setCurrentPage: (page: 'landing' | 'chat' | 'dashboard' | 'editor' | 'integrations' | 'auth' | 'domains' | 'view') => void;
  setAuthStep: (step: 'signup' | 'otp' | 'login') => void;
}

export default function LandingPage({
  session,
  showSplash,
  setCurrentPage,
  setAuthStep,
}: LandingPageProps) {
  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center p-8"
            >
              <img
                src="https://www.dropbox.com/scl/fi/u97h69xds0zmerbe69pmw/1774586031153-2.png?rlkey=tg24ppj129i9xv5286n8owh5m&st=dp6m0lrf&dl=1"
                alt="Gear Studio Splash"
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <div className="w-48 h-1 bg-[#262626] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="h-full bg-blue-600"
                  />
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Initializing Gear Studio...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Navigation */}
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">Gear<span className="text-indigo-600">Studio</span></span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                {session ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600">Hi, {session.user.user_metadata?.username || session.user.email}</span>
                    <button 
                      onClick={() => setCurrentPage('dashboard')}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      Go to App
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setCurrentPage('auth');
                      setAuthStep('signup');
                    }}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main>
          <div className="relative overflow-hidden pt-16 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
                  Build faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Precision Engineering</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10">
                  Turn your natural language ideas into production-ready web applications in seconds. High-performance, scalable, and beautifully designed by default.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => {
                      if (session) {
                        setCurrentPage('dashboard');
                      } else {
                        setCurrentPage('auth');
                        setAuthStep('signup');
                      }
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    {session ? 'Open Workspace' : 'Start Building Now'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                    View Documentation
                  </button>
                </div>
              </div>
            </div>
            
            {/* Abstract background shape */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
              <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 blur-[120px] rounded-full"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200 blur-[120px] rounded-full"></div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI Powered</h3>
                  <p className="text-slate-600 leading-relaxed">Advanced language models drive the engineering process, ensuring code quality and architectural integrity.</p>
                </div>
                <div className="group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Instant Preview</h3>
                  <p className="text-slate-600 leading-relaxed">See your changes in real-time as you type. Our environment syncs instantly with your development workflow.</p>
                </div>
                <div className="group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Clean Architecture</h3>
                  <p className="text-slate-600 leading-relaxed">We don't just write code; we build structured, maintainable spaces using industry best practices.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200 py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
            <p>© 2024 Gear Studio. Built with Gear AI.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
