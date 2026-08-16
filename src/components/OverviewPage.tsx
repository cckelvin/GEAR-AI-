import React, { useState } from 'react';
import { 
  Plus, 
  Box, 
  ChevronRight, 
  Cpu, 
  Zap, 
  Layers, 
  Sparkles, 
  Terminal, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Radio, 
  Code,
  ShieldCheck,
  Play
} from 'lucide-react';
import { Space } from '../types';

interface OverviewPageProps {
  spaces: Space[];
  currentSpace: Space;
  setCurrentSpace?: (space: Space) => void;
  loadSpaceFiles?: (spaceId: string) => void;
  loadSpaceMessages?: (spaceId: string) => void;
  setCurrentPage: (page: string) => void;
  setShowPreview?: (show: boolean) => void;
  handleNewSpace?: () => void;
  deleteSpace?: (id: string, e: React.MouseEvent) => void;
  aiSettings?: any;
  setInputValue?: (val: string) => void;
}

export default function OverviewPage({
  spaces,
  currentSpace,
  setCurrentSpace,
  loadSpaceFiles,
  loadSpaceMessages,
  setCurrentPage,
  setShowPreview,
  handleNewSpace,
  aiSettings,
  setInputValue,
}: OverviewPageProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'share' | 'news'>('build');

  const assistantName = aiSettings?.assistantName || 'Gear AI';
  const userName = aiSettings?.userName || 'developer';
  const tone = aiSettings?.tone || 'Precise & Technical';

  const handleShareCopy = () => {
    const shareUrl = `${window.location.origin}/space/${currentSpace.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSelectSpace = (space: Space) => {
    if (setCurrentSpace && loadSpaceFiles && loadSpaceMessages) {
      setCurrentSpace(space);
      loadSpaceFiles(space.id);
      loadSpaceMessages(space.id);
      localStorage.setItem('gear_current_space_id', space.id);
      setCurrentPage('chat');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (setInputValue) {
      setInputValue(prompt);
    }
    if (setShowPreview) {
      setShowPreview(false);
    }
    setCurrentPage('chat');
  };

  const promptStarters = [
    {
      title: "Real-Time Chat App",
      desc: "Instant messaging with rooms, typing indicators, and modern dark UI",
      tag: "Web App",
      prompt: "Build a real-time chat application with private messaging, channels, and dark theme UI"
    },
    {
      title: "SaaS Analytics Dashboard",
      desc: "Interactive charts, metrics counters, user management, and filterable tables",
      tag: "Dashboard",
      prompt: "Create a modern SaaS analytics dashboard with interactive data charts, stats cards, and filterable tables"
    },
    {
      title: "E-Commerce Product Portal",
      desc: "Product grid, dynamic cart drawer, checkout modal, and category filters",
      tag: "Storefront",
      prompt: "Build an e-commerce product store with category filters, shopping cart drawer, and checkout modal"
    },
    {
      title: "Modern Landing Page",
      desc: "Hero section, interactive feature showcase, testimonials, and contact form",
      tag: "Landing",
      prompt: "Build a modern high-converting landing page with smooth interactive sections and Tailwind styling"
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0A0A0A] relative text-white">
      {/* Visual background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-start py-6 space-y-10">
        
        {/* Navigation Tabs between Build Faster and Space Info */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block">
              Workspace Overview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('build')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'build' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'}`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-300" />
              <span>Build Faster</span>
            </button>
            <button 
              onClick={() => setActiveTab('share')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'share' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'}`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Share Space</span>
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'news' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Updates</span>
            </button>
          </div>
        </div>

        {activeTab === 'build' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-4 pt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Welcome back, {userName}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                Build faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500">Precision Engineering</span>
              </h1>
              
              <p className="max-w-2xl mx-auto text-sm text-gray-400 leading-relaxed">
                Turn your natural language ideas into production-ready web applications in seconds.
                High-performance, scalable, and beautifully designed by default.
              </p>
            </div>

            {/* Central Launchpad Card */}
            <div className="bg-[#0F0F0F] border border-[#262626] rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#3a3a3a] transition-all">
              <div className="absolute top-0 right-0 p-8 w-60 h-60 bg-indigo-600/5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 justify-center md:justify-start">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <span>Ready to engineer your next workspace?</span>
                  </h3>
                  <p className="text-xs text-gray-500 max-w-md">
                    Launch a clean space instantly. Standard template modules will bootstrap with Tailwind CSS, Lucide icons, and serverless options.
                  </p>
                  {aiSettings && (
                    <div className="pt-2 text-[10px] text-indigo-400/80 font-medium">
                      🤖 Assistant <strong>{assistantName}</strong> is ready using the <strong>{tone}</strong> persona.
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {handleNewSpace && (
                    <button 
                      type="button"
                      onClick={handleNewSpace}
                      className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Space</span>
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => setCurrentPage('chat')}
                    className="flex items-center gap-2 px-5 py-3.5 bg-[#1C1C1C] hover:bg-[#252525] text-gray-200 border border-[#333] rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95"
                  >
                    <span>Open Editor</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Prompt Starters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Instant Build Prompts
                </h3>
                <span className="text-[10px] text-gray-500">Click to start building immediately</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {promptStarters.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    className="p-4 bg-[#0F0F0F] border border-[#222] hover:border-indigo-500/50 rounded-xl text-left transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.tag}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Spaces Quick Switcher */}
            {spaces.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Box className="w-3.5 h-3.5 text-indigo-400" /> Active Sandboxes ({spaces.length})
                  </h3>
                  <button 
                    onClick={() => setCurrentPage('projects')}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {spaces.slice(0, 3).map((space) => {
                    const isSelected = space.id === currentSpace.id;
                    return (
                      <div 
                        key={space.id}
                        onClick={() => handleSelectSpace(space)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-[#0F0F0F] border-[#222] hover:border-gray-700'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 truncate">
                            <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400 animate-pulse' : 'text-gray-500'}`} />
                            <span className="text-xs font-bold truncate text-white">{space.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">Active</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C] text-[10px] text-gray-500">
                          <span>Updated {space.updatedAt}</span>
                          <span className="text-indigo-400 font-medium">Open &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Features Trio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 bg-[#0F0F0F]/50 border border-[#1A1A1A] rounded-2xl hover:border-gray-800 hover:bg-[#0F0F0F] transition-all text-left">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2 tracking-tight">AI Powered</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Advanced language models drive the engineering process, ensuring code quality and architectural integrity.
                </p>
              </div>

              <div className="p-6 bg-[#0F0F0F]/50 border border-[#1A1A1A] rounded-2xl hover:border-gray-800 hover:bg-[#0F0F0F] transition-all text-left">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2 tracking-tight">Instant Preview</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  See your changes in real-time as you type. Our environment syncs instantly with your development workflow.
                </p>
              </div>

              <div className="p-6 bg-[#0F0F0F]/50 border border-[#1A1A1A] rounded-2xl hover:border-gray-800 hover:bg-[#0F0F0F] transition-all text-left">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2 tracking-tight">Clean Architecture</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  We don't just write code; we build structured, maintainable spaces using industry best practices.
                </p>
              </div>
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
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
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

        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">Full Intelligence AI Studio Engine Deployed</h3>
                  <span className="text-[10px] font-mono text-gray-500">Active</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">
                  Enhanced reasoning thought processes with multi-screen interface mapping and instant compilation.
                </p>
                <span className="px-2 py-0.5 bg-[#1A1A1A] border border-[#262626] rounded text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                  Engine v31
                </span>
              </div>
            </div>

            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">Environment Variables &amp; Secrets Synchronized</h3>
                  <span className="text-[10px] font-mono text-gray-500">Secured</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">
                  All sandbox configurations and API secrets are encrypted and isolated per space.
                </p>
                <span className="px-2 py-0.5 bg-[#1A1A1A] border border-[#262626] rounded text-[9px] font-bold text-gray-300 uppercase tracking-wider">
                  Security
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
