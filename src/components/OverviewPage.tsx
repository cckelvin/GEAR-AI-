import React, { useState } from 'react';
import { 
  Bell, 
  Share2, 
  Sparkles, 
  Activity, 
  Clock, 
  Copy, 
  Check, 
  Globe, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  TrendingUp,
  Radio,
  ExternalLink,
  Box
} from 'lucide-react';
import { Space } from '../types';

interface OverviewPageProps {
  spaces: Space[];
  currentSpace: Space;
  setCurrentPage: (page: string) => void;
}

export default function OverviewPage({ spaces, currentSpace, setCurrentPage }: OverviewPageProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'updates' | 'share' | 'activity'>('updates');

  const notifications = [
    {
      id: '1',
      title: 'IONIC GEAR v31 Deployed',
      time: '10m ago',
      desc: 'Enhanced prompt-to-code compiler with strict command mode and faster preview rendering.',
      tag: 'System Update',
      type: 'system'
    },
    {
      id: '2',
      title: 'Space Synced to Team',
      time: '1h ago',
      desc: `Workspace "${currentSpace.name}" was pushed to Team Workspace with active credentials.`,
      tag: 'Team Sync',
      type: 'team'
    },
    {
      id: '3',
      title: 'Security Policy Verified',
      time: '3h ago',
      desc: 'All connected API keys and environment secrets pass security rule checks.',
      tag: 'Security',
      type: 'security'
    }
  ];

  const handleShareCopy = () => {
    const shareUrl = `${window.location.origin}/space/${currentSpace.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0A0A0A] text-white relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">
              Workspace Intelligence
            </span>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Activity className="w-7 h-7 text-blue-500" /> Overview &amp; News
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('updates')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'updates' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-[#111] text-gray-400 hover:text-white border border-[#222]'}`}
            >
              News &amp; Updates
            </button>
            <button 
              onClick={() => setActiveTab('share')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'share' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-[#111] text-gray-400 hover:text-white border border-[#222]'}`}
            >
              Space Share
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Active Spaces</span>
              <Box className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black">{spaces.length}</span>
              <p className="text-[11px] text-gray-500 mt-1">Total sandboxes created</p>
            </div>
          </div>

          <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Current Space</span>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-4">
              <span className="text-lg font-black truncate block">{currentSpace.name}</span>
              <p className="text-[11px] text-emerald-400 font-bold mt-1">Updated {currentSpace.updatedAt}</p>
            </div>
          </div>

          <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Engine Status</span>
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-indigo-400">IONIC 31</span>
              <p className="text-[11px] text-gray-500 mt-1">Strict commands active</p>
            </div>
          </div>

          <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Team Sync</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-purple-400">Connected</span>
              <p className="text-[11px] text-gray-500 mt-1">Ready for push</p>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" /> System News &amp; Activity Notifications
              </h2>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                3 Unread Updates
              </span>
            </div>

            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="p-5 bg-[#0F0F0F] border border-[#222] hover:border-blue-500/40 rounded-2xl transition-all flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-white">{n.title}</h3>
                      <span className="text-[10px] font-mono text-gray-500">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{n.desc}</p>
                    <span className="px-2 py-0.5 bg-[#1A1A1A] border border-[#262626] rounded text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                      {n.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="p-8 bg-[#0F0F0F] border border-[#222] rounded-3xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#222]">
              <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">Space Share &amp; Info</h2>
                <p className="text-xs text-gray-400">Share "{currentSpace.name}" with collaborators and view public access settings.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
                  Shareable Sandbox Web URL
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/space/${currentSpace.id}`} 
                    className="flex-1 bg-[#1A1A1A] border border-[#262626] rounded-xl px-4 py-3 text-xs text-gray-300 font-mono focus:outline-none"
                  />
                  <button 
                    onClick={handleShareCopy}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95"
                  >
                    {copiedShare ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedShare ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#1F1F1F]">
                <div className="p-4 bg-[#141414] border border-[#262626] rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Access Level</span>
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Public Preview Enabled
                  </p>
                </div>
                <div className="p-4 bg-[#141414] border border-[#262626] rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Space ID</span>
                  <p className="text-xs font-mono text-gray-300 truncate">{currentSpace.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
