import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Lock, 
  MessageSquare, 
  FolderPlus, 
  Check, 
  Send, 
  Plus,
  Box,
  Building
} from 'lucide-react';
import { Space } from '../types';

interface TeamsPageProps {
  spaces: Space[];
  currentSpace: Space;
}

export default function TeamsPage({ spaces, currentSpace }: TeamsPageProps) {
  const [engineerId, setEngineerId] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    { id: 'usr_1', name: 'Alex Rivera', role: 'Lead Architect', email: 'alex@gearstudio.io', status: 'active' },
    { id: 'usr_2', name: 'Sarah Chen', role: 'Senior Engineer', email: 'sarah@gearstudio.io', status: 'active' }
  ]);
  const [policyPassword, setPolicyPassword] = useState('••••••••••••');
  const [isPasswordLocked, setIsPasswordLocked] = useState(true);
  const [selectedSpaceId, setSelectedSpaceId] = useState(currentSpace.id);
  const [connectedTeamProjects, setConnectedTeamProjects] = useState<string[]>([currentSpace.id]);

  // Team Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Alex Rivera', text: 'Hey team, I synced the latest IONIC v31 engine rules.', time: '10:42 AM' },
    { id: '2', sender: 'Sarah Chen', text: 'Awesome! Checking the build policy and permissions now.', time: '10:45 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleAddEngineer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engineerId.trim()) return;
    const newEng = {
      id: `usr_${Date.now()}`,
      name: engineerId.includes('@') ? engineerId.split('@')[0] : `Eng-${engineerId}`,
      role: 'Engineer',
      email: engineerId.includes('@') ? engineerId : `${engineerId}@team.io`,
      status: 'active'
    };
    setTeamMembers(prev => [...prev, newEng]);
    setEngineerId('');
  };

  const handleConnectProject = () => {
    if (!connectedTeamProjects.includes(selectedSpaceId)) {
      setConnectedTeamProjects(prev => [...prev, selectedSpaceId]);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'You (Owner)',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-black text-white relative">
      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="pb-6 border-b border-neutral-800">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">
            Organization &amp; Permissions
          </span>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-white">
            <Users className="w-7 h-7 text-white" /> Teams Workspace
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Connect engineers by ID, manage shared projects, enforce build security policies, and chat with team members.
          </p>
        </div>

        {/* Top Grid: Add Engineers + Connect Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Engineers Panel */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
              <div className="w-9 h-9 bg-neutral-900 text-white rounded-xl flex items-center justify-center border border-neutral-700">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Connect Users through ID</h3>
                <p className="text-[11px] text-neutral-400">Add engineers by User ID or Email</p>
              </div>
            </div>

            <form onSubmit={handleAddEngineer} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Engineer ID / Email
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={engineerId}
                    onChange={(e) => setEngineerId(e.target.value)}
                    placeholder="e.g. eng_9012 or user@company.com"
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Connect Projects Panel */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
              <div className="w-9 h-9 bg-neutral-900 text-white rounded-xl flex items-center justify-center border border-neutral-700">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Connect Projects to Team</h3>
                <p className="text-[11px] text-neutral-400">Attach workspace sandboxes to team space</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Select Project Space
                </label>
                <div className="flex gap-2">
                  <select 
                    value={selectedSpaceId}
                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                  >
                    {spaces.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleConnectProject}
                    className="px-4 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Connect
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 flex items-center gap-2 pt-1">
                <Box className="w-3.5 h-3.5 text-white" />
                <span>{connectedTeamProjects.length} Projects currently connected to team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Build Policy & Password Lock */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-900 text-white rounded-xl flex items-center justify-center border border-neutral-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">Build Policy &amp; Password 🔒</h3>
                <p className="text-[11px] text-neutral-400">Enforce password protection and engineer deployment restriction policies</p>
              </div>
            </div>

            <button 
              onClick={() => setIsPasswordLocked(!isPasswordLocked)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${isPasswordLocked ? 'bg-neutral-900 text-white border-neutral-700' : 'bg-white text-black border-white'}`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isPasswordLocked ? 'Password Locked' : 'Unlocked'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Team Policy Password</label>
              <div className="flex gap-2">
                <input 
                  type={isPasswordLocked ? "password" : "text"}
                  value={policyPassword}
                  onChange={(e) => setPolicyPassword(e.target.value)}
                  disabled={isPasswordLocked}
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none disabled:opacity-60"
                />
                <button 
                  onClick={() => setIsPasswordLocked(!isPasswordLocked)}
                  className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isPasswordLocked ? 'Unlock' : 'Lock'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Engineer Restrictions</label>
              <select className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer">
                <option value="strict">Strict: Admin approval required for code push</option>
                <option value="moderate">Moderate: Direct push enabled for verified engineers</option>
                <option value="open">Open: All team members can deploy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Teams List + Team Chat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teams List */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-white" /> Teams List &amp; Engineers
              </h3>

              <div className="space-y-2">
                {teamMembers.map((m) => (
                  <div key={m.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.name}</h4>
                      <span className="text-[10px] font-mono text-neutral-400">{m.email}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700 text-[9px] font-bold uppercase rounded">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-neutral-500 italic pt-2 border-t border-neutral-800">
              Total 2 Active Engineers connected to team space.
            </p>
          </div>

          {/* Team Chat */}
          <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4 flex flex-col justify-between h-[340px]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-white" /> Team Chat &amp; Messaging
              </h3>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {chatMessages.map(msg => (
                <div key={msg.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white">{msg.sender}</span>
                    <span className="text-neutral-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2 border-t border-neutral-800">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message team engineers..."
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button 
                type="submit"
                className="w-9 h-9 bg-white hover:bg-neutral-200 text-black rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
