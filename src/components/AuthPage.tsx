import React from 'react';
import { Box, Mail, Lock, Loader2, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthPageProps {
  authStep: 'signup' | 'otp' | 'login';
  setAuthStep: (step: 'signup' | 'otp' | 'login') => void;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (pwd: string) => void;
  authOtp: string;
  setAuthOtp: (otp: string) => void;
  authError: string | null;
  isAuthLoading: boolean;
  isSupabaseConfigured: boolean;
  handleSignUp: (e: React.FormEvent) => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  handleLogin: (e: React.FormEvent) => void;
  setCurrentPage: (page: any) => void;
}

export default function AuthPage({
  authStep,
  setAuthStep,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authOtp,
  setAuthOtp,
  authError,
  isAuthLoading,
  isSupabaseConfigured,
  handleSignUp,
  handleVerifyOtp,
  handleLogin,
  setCurrentPage,
}: AuthPageProps) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg text-black">
            <Box className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {authStep === 'signup' && 'Create Account'}
            {authStep === 'otp' && 'Verify Email'}
            {authStep === 'login' && 'Welcome Back'}
          </h2>
          <p className="text-neutral-400 text-sm mt-2 text-center">
            {authStep === 'signup' && 'Join Gear Studio to start building.'}
            {authStep === 'otp' && `We've sent a 6-digit code to ${authEmail}`}
            {authStep === 'login' && 'Sign in to your account.'}
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center gap-3 text-white text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            {authError}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-neutral-900 border border-neutral-700 rounded-xl flex flex-col gap-2 text-neutral-300 text-xs">
            <div className="flex items-center gap-3 text-white">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-bold uppercase tracking-wider">Configuration Notice</span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              Supabase environment variables are optional. You can continue directly or set <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>.
            </p>
          </div>
        )}

        {authStep === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading || !isSupabaseConfigured}
              className="w-full bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Create Account'}
            </button>
            <p className="text-center text-xs text-neutral-400 mt-4">
              Already have an account? <button type="button" onClick={() => setAuthStep('login')} className="text-white hover:underline cursor-pointer">Sign In</button>
            </p>
          </form>
        )}

        {authStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1 text-center block">Verification Code</label>
              <input 
                type="text" 
                required
                value={authOtp}
                onChange={(e) => setAuthOtp(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-4 text-2xl text-center font-mono focus:outline-none focus:border-white transition-colors text-white"
                placeholder="Enter Code"
              />
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading || !isSupabaseConfigured}
              className="w-full bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Verify Code'}
            </button>
            <button 
              type="button"
              onClick={() => setAuthStep('signup')}
              className="w-full text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Sign Up
            </button>
          </form>
        )}

        {authStep === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading || !isSupabaseConfigured}
              className="w-full bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Sign In'}
            </button>
            <p className="text-center text-xs text-neutral-400 mt-4">
              Don't have an account? <button type="button" onClick={() => setAuthStep('signup')} className="text-white hover:underline cursor-pointer">Sign Up</button>
            </p>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setCurrentPage('landing')}
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Landing
          </button>
          <button 
            type="button"
            onClick={() => setCurrentPage('chat')}
            className="text-xs text-white hover:underline transition-colors font-medium flex items-center gap-2 cursor-pointer"
          >
            Skip for now
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
