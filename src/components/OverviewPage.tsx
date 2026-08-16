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
  ShieldCheck
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
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-black relative text-white">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neutral-800 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neutral-900 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-start py-6 space-y-10">
        
        {/* Navigation Tabs between Build Faster and Space Info */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block">
              Workspace Overview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('build')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'build' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Build Faster</span>
            </button>
            <button 
              onClick={() => setActiveTab('share')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'share' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Space</span>
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'news' ? 'bg-white text-black shadow-lg shadow-white/10' : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Updates</span>
            </button>
          </div>
        </div>

        {activeTab === 'build' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <div className="text-center space-y-4 pt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-[10px] font-black uppercase text-neutral-300 tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Welcome back, {userName}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                Build faster with <span className="text-white underline decoration-neutral-600 underline-offset-8">Precision Engineering</span>
              </h1>
              
              <p className="max-w-2xl mx-auto text-sm text-neutral-400 leading-relaxed">
                Turn your natural language ideas into production-ready web applications in seconds.
                High-performance, scalable, and beautifully designed in monochrome precision.
              </p>
            </div>

            {/* Central Launchpad Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group hover:border-neutral-700 transition-all">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 justify-center md:justify-start">
                    <Terminal className="w-4 h-4 text-white" />
                    <span>Ready to engineer your next workspace?</span>
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md">
                    Launch a clean space instantly. Standard template modules bootstrap with Tailwind CSS, Lucide icons, and serverless options.
                  </p>
                  {aiSettings && (
                    <div className="pt-2 text-[10px] text-neutral-400 font-medium">
                      Assistant <strong>{assistantName}</strong> is ready using the <strong>{tone}</strong> persona.
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {handleNewSpace && (
                    <button 
                      type="button"
                      onClick={handleNewSpace}
                      className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Space</span>
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => setCurrentPage('chat')}
                    className="flex items-center gap-2 px-5 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95"
                  >
                    <span>Open Editor</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Prompt Starters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-white" /> Instant Build Prompts
                </h3>
                <span className="text-[10px] text-neutral-500">Click to start building immediately</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {promptStarters.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(item.prompt)}
                    className="p-4 bg-neutral-950 border border-neutral-800 hover:border-white rounded-xl text-left transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-white border border-neutral-700">
                        {item.tag}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-neutral-200 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
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
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Box className="w-3.5 h-3.5 text-white" /> Active Sandboxes ({spaces.length})
                  </h3>
                  <button 
                    onClick={() => setCurrentPage('projects')}
                    className="text-[11px] font-bold text-white hover:underline flex items-center gap-1"
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
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected ? 'bg-neutral-900 border-white shadow-lg' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 truncate">
                            <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-neutral-500'}`} />
                            <span className="text-xs font-bold truncate text-white">{space.name}</span>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] bg-white text-black font-bold px-1.5 py-0.5 rounded">Active</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-[10px] text-neutral-400">
                          <span>Updated {space.updatedAt}</span>
                          <span className="text-white font-medium">Open &rarr;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Features Trio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl hover:border-neutral-600 transition-all text-left">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center mb-4 border border-neutral-700">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2 tracking-tight">AI Powered</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Advanced language models drive the engineering process, ensuring code quality and architectural integrity.
                </p>
              </div>

              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl hover:border-neutral-600 transition-all text-left">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center mb-4 border border-neutral-700">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2 tracking-tight">Instant Preview</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  See your changes in real-time as you type. Our environment syncs instantly with your development workflow.
                </p>
              </div>

              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl hover:border-neutral-600 transition-all text-left">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center mb-4 border border-neutral-700">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white mb-2 tracking-tight">Clean Architecture</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  We don't just write code; we build structured, maintainable spaces using industry best practices.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'share' && (
          <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
              <div className="w-12 h-12 bg-neutral-900 border border-neutral-700 text-white rounded-2xl flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">Space Share &amp; Info</h2>
                <p className="text-xs text-neutral-400">Share "{currentSpace.name}" with collaborators and view public access settings.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-2">
                  Shareable Sandbox Web URL
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/space/${currentSpace.id}`} 
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-white"
                  />
                  <button 
                    onClick={handleShareCopy}
                    className="px-5 py-3 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                  >
                    {copiedShare ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedShare ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Access Level</span>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-neutral-300" /> Public Preview Enabled
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Space ID</span>
                  <p className="text-xs font-mono text-neutral-300 truncate">{currentSpace.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">Monochrome Engineering Engine Active</h3>
                  <span className="text-[10px] font-mono text-neutral-400">Online</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                  Enhanced reasoning thought processes with multi-screen interface mapping and instant compilation in high-contrast black &amp; white.
                </p>
                <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                  Engine v31
                </span>
              </div>
            </div>

            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">Environment Variables &amp; Secrets Synchronized</h3>
                  <span className="text-[10px] font-mono text-neutral-400">Secured</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                  All sandbox configurations and API secrets are encrypted and isolated per space.
                </p>
                <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 rounded text-[9px] font-bold text-white uppercase tracking-wider">
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
