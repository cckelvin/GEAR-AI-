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
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
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
                className="max-w-full max-h-full object-contain filter grayscale"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <div className="w-48 h-1 bg-neutral-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="h-full bg-white"
                  />
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] animate-pulse">Initializing Gear Studio...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-screen bg-black text-white font-sans">
        {/* Navigation */}
        <nav className="border-b border-neutral-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="bg-white p-1.5 rounded-lg text-black">
                  <Box className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Gear<span className="text-neutral-400">Studio</span></span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                {session ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-neutral-300">Hi, {session.user.user_metadata?.username || session.user.email}</span>
                    <button 
                      onClick={() => setCurrentPage('dashboard')}
                      className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-neutral-200 transition-all shadow-sm cursor-pointer"
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
                    className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-neutral-200 transition-all shadow-sm cursor-pointer"
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
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                  Build faster with <span className="underline decoration-neutral-700 underline-offset-8">Precision Engineering</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-neutral-400 mb-10">
                  Turn your natural language ideas into production-ready web applications in seconds. High-performance, scalable, and beautifully engineered in monochrome.
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
                    className="bg-white text-black px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all cursor-pointer shadow-xl"
                  >
                    {session ? 'Open Workspace' : 'Start Building Now'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-24 bg-neutral-950 border-t border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="p-8 bg-neutral-900/60 border border-neutral-800 rounded-2xl group hover:border-white transition-all">
                  <div className="w-12 h-12 bg-neutral-800 text-white rounded-xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">AI Powered</h3>
                  <p className="text-neutral-400 leading-relaxed">Advanced language models drive the engineering process, ensuring code quality and architectural integrity.</p>
                </div>
                <div className="p-8 bg-neutral-900/60 border border-neutral-800 rounded-2xl group hover:border-white transition-all">
                  <div className="w-12 h-12 bg-neutral-800 text-white rounded-xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Instant Preview</h3>
                  <p className="text-neutral-400 leading-relaxed">See your changes in real-time as you type. Our environment syncs instantly with your development workflow.</p>
                </div>
                <div className="p-8 bg-neutral-900/60 border border-neutral-800 rounded-2xl group hover:border-white transition-all">
                  <div className="w-12 h-12 bg-neutral-800 text-white rounded-xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Clean Architecture</h3>
                  <p className="text-neutral-400 leading-relaxed">We don't just write code; we build structured, maintainable spaces using industry best practices.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-neutral-800 py-12 bg-black text-center text-xs text-neutral-500 font-mono">
          &copy; {new Date().getFullYear()} Gear Studio. All rights reserved.
        </footer>
      </div>
    </>
  );
}
