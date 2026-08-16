import React from 'react';
import { Plus, Cpu, Zap, Layers, Sparkles, Terminal } from 'lucide-react';
import { Space } from '../types';

interface DashboardProps {
  spaces: Space[];
  currentSpace: Space;
  setCurrentSpace: (space: Space) => void;
  loadSpaceFiles: (spaceId: string) => void;
  loadSpaceMessages: (spaceId: string) => void;
  setCurrentPage: (page: any) => void;
  setShowPreview: (show: boolean) => void;
  handleNewSpace: () => void;
  deleteSpace: (id: string, e: React.MouseEvent) => void;
  aiSettings?: any;
}

export default function Dashboard({
  spaces,
  currentSpace,
  setCurrentSpace,
  loadSpaceFiles,
  loadSpaceMessages,
  setCurrentPage,
  setShowPreview,
  handleNewSpace,
  deleteSpace,
  aiSettings,
}: DashboardProps) {
  const assistantName = aiSettings?.assistantName || 'Gear AI';
  const userName = aiSettings?.userName || 'developer';
  const tone = aiSettings?.tone || 'Precise & Technical';

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-black relative text-white">
      {/* Monochrome background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neutral-800 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neutral-900 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-[10px] font-black uppercase text-neutral-300 tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {userName}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
            Build faster with <span className="text-white underline decoration-neutral-600 underline-offset-8">Precision Engineering</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-sm text-neutral-400 leading-relaxed">
            Turn your natural language ideas into production-ready web applications in seconds.
            High-performance, scalable, and engineered with monochrome precision.
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
                Launch a clean space instantly. Standard template modules will bootstrap with Tailwind CSS, Lucide icons, and serverless options.
              </p>
              {aiSettings && (
                <div className="pt-2 text-[10px] text-neutral-400 font-medium">
                  Assistant <strong>{assistantName}</strong> is ready using the <strong>{tone}</strong> persona.
                </div>
              )}
            </div>
            
            <button 
              type="button"
              onClick={handleNewSpace}
              className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Space</span>
            </button>
          </div>
        </div>

        {/* Navigation Note banner */}
        <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
          <p className="text-xs text-neutral-400">
            💡 Tap the <strong className="text-white">Hamburger Menu (☰)</strong> on the top left to browse, manage, or jump into your existing space sandboxes.
          </p>
        </div>

        {/* Features Trio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
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
    </div>
  );
}
