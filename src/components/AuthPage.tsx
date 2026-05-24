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
  setCurrentPage: (page: 'landing' | 'chat' | 'dashboard' | 'editor' | 'integrations' | 'auth' | 'domains' | 'view') => void;
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
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#111] border border-[#262626] rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <Box className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {authStep === 'signup' && 'Create Account'}
            {authStep === 'otp' && 'Verify Email'}
            {authStep === 'login' && 'Welcome Back'}
          </h2>
          <p className="text-gray-500 text-sm mt-2 text-center">
            {authStep === 'signup' && 'Join Gear Studio to start building.'}
            {authStep === 'otp' && `We've sent a 6-digit code to ${authEmail}`}
            {authStep === 'login' && 'Sign in to your account.'}
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {authError}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-2 text-amber-400 text-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-bold uppercase tracking-wider">Configuration Required</span>
            </div>
            <p className="leading-relaxed opacity-80">
              Supabase environment variables are missing. Please set <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your space settings to enable authentication and database features.
            </p>
          </div>
        )}

        {authStep === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading || !isSupabaseConfigured}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Already have an account? <button type="button" onClick={() => setAuthStep('login')} className="text-blue-400 hover:underline">Sign In</button>
            </p>
          </form>
        )}

        {authStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 text-center block">Verification Code</label>
              <input 
                type="text" 
                required
                value={authOtp}
                onChange={(e) => setAuthOtp(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-4 text-2xl text-center font-mono focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter Code"
              />
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading || !isSupabaseConfigured}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
            </button>
            <button 
              type="button"
              onClick={() => setAuthStep('signup')}
              className="w-full text-xs text-gray-500 hover:text-white transition-colors"
            >
              Back to Sign Up
            </button>
          </form>
        )}

        {authStep === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading || !isSupabaseConfigured}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Don't have an account? <button type="button" onClick={() => setAuthStep('signup')} className="text-blue-400 hover:underline">Sign Up</button>
            </p>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-[#262626] flex items-center justify-between">
          <button 
            type="button"
            onClick={() => setCurrentPage('landing')}
            className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Landing
          </button>
          <button 
            type="button"
            onClick={() => setCurrentPage('chat')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-2"
          >
            Skip for now
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
