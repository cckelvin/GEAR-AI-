import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Lock, 
  Sparkles, 
  LogOut, 
  Check,
  CreditCard,
  Clock,
  IdCard
} from 'lucide-react';

interface AccountPageProps {
  session: any;
  authEmail: string;
  activeModel: string;
  setCurrentPage: (page: string) => void;
  handleSignOut?: () => void;
}

export default function AccountPage({ session, authEmail, activeModel, setCurrentPage, handleSignOut }: AccountPageProps) {
  const [userName, setUserName] = useState(() => localStorage.getItem('gear_ai_user_name') || 'Gear Builder');
  const [userEmail, setUserEmail] = useState(authEmail || session?.user?.email || 'builder@gearstudio.io');
  const [savedNotice, setSavedNotice] = useState(false);

  const userId = session?.user?.id || 'usr_89230491823901';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gear_ai_user_name', userName);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0A0A0A] text-white relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="pb-6 border-b border-[#1F1F1F]">
          <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">
            User Profile &amp; Credentials
          </span>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <User className="w-7 h-7 text-blue-500" /> Account Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your personal profile, authentication email, user ID, and active membership credentials.
          </p>
        </div>

        {/* Profile Info Card */}
        <div className="p-8 bg-[#0F0F0F] border border-[#222] rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center gap-5 pb-6 border-b border-[#222]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-600/30">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{userName}</h2>
              <p className="text-xs font-mono text-gray-400">{userEmail}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-wider rounded-full">
                  {activeModel.toUpperCase()} GEAR MEMBER
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Account
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Account Email
                </label>
                <input 
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Unique User ID (UUID)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  readOnly
                  value={userId}
                  className="flex-1 bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-xs text-gray-400 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button 
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
              >
                {savedNotice ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{savedNotice ? 'Saved!' : 'Save Account Info'}</span>
              </button>

              {handleSignOut && (
                <button 
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
