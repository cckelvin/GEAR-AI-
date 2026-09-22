import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Box, 
  Cpu, 
  Layers, 
  ShoppingCart, 
  Info, 
  Settings, 
  X, 
  Moon, 
  Sun, 
  Sparkles,
  Check,
  Code,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Puzzle,
  Zap,
  Server,
  Globe,
  Palette,
  FileCode,
  Braces
} from 'lucide-react';
import { Space, AIModel } from '../types';
import { AI_MODELS } from '../data/extensions';

interface SettingsPageProps {
  spaces: Space[];
  activeModel: AIModel;
  setActiveModel: (model: AIModel) => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (theme: 'dark' | 'light') => void;
  currentPage: string;
  setCurrentPage: (page: any) => void;
  onClose: () => void;
}

export default function SettingsPage({
  spaces,
  activeModel,
  setActiveModel,
  themeMode,
  setThemeMode,
  currentPage,
  setCurrentPage,
  onClose,
}: SettingsPageProps) {

  const handleModelChange = (model: AIModel) => {
    setActiveModel(model);
    localStorage.setItem('gear_active_model', model);
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    setThemeMode(theme);
    localStorage.setItem('gear_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <div className="w-full h-screen flex select-none font-sans overflow-hidden bg-black text-white">
      
      {/* Fixed Expanded Hamburger Sidebar on the Left */}
      <div className="w-72 h-full border-r flex flex-col p-6 shrink-0 bg-neutral-950 border-neutral-800">
        
        {/* Brand / Title Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white text-black rounded flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <span className="font-black text-xs tracking-tighter uppercase text-white">Gear Studio Map</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg transition-colors cursor-pointer hover:bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sidebar List */}
        <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black uppercase tracking-widest px-3 text-neutral-500">Main Navigation</p>
            
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === 'dashboard' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <Home className="w-4 h-4" />
              <span>Home Page</span>
            </button>

            <button 
              onClick={() => setCurrentPage('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === 'projects' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4" />
                <span>My Projects</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-neutral-900 text-white border border-neutral-700">
                {spaces.length}
              </span>
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-neutral-800">
            <p className="text-[9px] font-black uppercase tracking-widest px-3 text-neutral-500">Product Sections</p>
            
            <button 
              onClick={() => setCurrentPage('features')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === 'features' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <Cpu className="w-4 h-4" />
              <span>Features</span>
            </button>

            <button 
              onClick={() => setCurrentPage('solutions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === 'solutions' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <Layers className="w-4 h-4" />
              <span>Solutions</span>
            </button>

            <button 
              onClick={() => setCurrentPage('pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === 'pricing' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Pricing Plans</span>
            </button>

            <button 
              onClick={() => setCurrentPage('about')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === 'about' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <Info className="w-4 h-4" />
              <span>About Us</span>
            </button>

            <button 
              onClick={() => setCurrentPage('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === 'settings' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Display content Area */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar flex flex-col bg-black">
        <div className="max-w-xl w-full mx-auto space-y-10 text-left">
          
          {/* Header */}
          <div className="border-b border-neutral-800 pb-6">
            <h1 className="text-3xl font-black tracking-tighter text-white">System Settings</h1>
            <p className="text-xs mt-1.5 text-neutral-400">
              Customize your development server, switch active compilation models, and adjust styling preferences.
            </p>
          </div>

          {/* Section 1: Active Model */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Active Full Project Builder Engine
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Choose between two high-capacity full project builders. Both are engineered to scaffold, write, and verify multi-file Vite, Python 3.11, and Node.js projects.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              {/* Model 1: Ionic */}
              <div
                onClick={() => handleModelChange('ionic')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                  activeModel === 'ionic'
                    ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-amber-950/80 border border-amber-600/50 rounded-full text-[9px] font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                      DEEP ARCHITECT
                    </span>
                    <span className="p-1 px-2 bg-neutral-800 border border-neutral-700 rounded-full text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                      High-Capacity Reasoning
                    </span>
                  </div>
                  {activeModel === 'ionic' ? (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold font-mono">
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300">Click to Select</span>
                  )}
                </div>
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  Ionic — Deep Architecture Full Website Builder
                </h3>
                <p className="text-xs mt-1.5 text-neutral-300 leading-relaxed">
                  High-capacity reasoning engine engineered for complete multi-file website development across HTML5, CSS3, JavaScript, and JSON. Excels at complex UI architectures, interactive DOM manipulation, data modeling, and clean project structures.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-200">
                    • HTML5 & Semantic Web
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-200">
                    • CSS3 & Responsive Layouts
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-200">
                    • Modern JavaScript (ESM) & JSON
                  </span>
                </div>
              </div>

              {/* Model 2: Iconic */}
              <div
                onClick={() => handleModelChange('iconic')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                  activeModel === 'iconic'
                    ? 'bg-neutral-900 border-blue-500 ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/5'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-blue-950/80 border border-blue-600/50 rounded-full text-[9px] font-black text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      SPEED ENGINE
                    </span>
                    <span className="p-1 px-2 bg-neutral-800 border border-neutral-700 rounded-full text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                      Speculative Speed
                    </span>
                  </div>
                  {activeModel === 'iconic' ? (
                    <div className="flex items-center gap-1 text-blue-400 text-xs font-bold font-mono">
                      <Check className="w-4 h-4 text-blue-400" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300">Click to Select</span>
                  )}
                </div>
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  Iconic — Compound Speed Website Builder
                </h3>
                <p className="text-xs mt-1.5 text-neutral-300 leading-relaxed">
                  Ultra-low latency compound AI engine with speculative inference and specialized sub-agents. Delivers sub-second multi-token file generation, instant surgical patching, and live preview updates.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-200">
                    • Instant HTML/CSS/JS Scaffolding
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-200">
                    • Real-Time Surgical Patching
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-200">
                    • Live Website Preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Standard Web Architecture */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  Standard Web Architecture & Engine
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Gear Studio builds standard, lightweight websites using native browser technologies without heavy bundlers or build steps.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-2">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-white">HTML5</span>
                </div>
                <p className="text-[10px] text-neutral-400">Semantic markup (index.html)</p>
                <span className="mt-2 inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  ● Native Standard
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">CSS3</span>
                </div>
                <p className="text-[10px] text-neutral-400">Custom styling & animations</p>
                <span className="mt-2 inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  ● Native Standard
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <FileCode className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold text-white">JavaScript</span>
                </div>
                <p className="text-[10px] text-neutral-400">ES Modules & DOM logic (main.js)</p>
                <span className="mt-2 inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  ● Native Standard
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Braces className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">JSON Data</span>
                </div>
                <p className="text-[10px] text-neutral-400">Local data & configs (.json)</p>
                <span className="mt-2 inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  ● Native Standard
                </span>
              </div>
            </div>
          </div>

          {/* Section: AI API Keys & Credentials */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  API Credentials & Engine Access
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  System-managed intelligence engine configurations powering <code className="text-amber-400 font-mono">Ionic</code> and <code className="text-blue-400 font-mono">Iconic</code> models.
                </p>
              </div>
            </div>

            {/* Platform Managed Engine Card */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Platform-Managed API Engine</span>
                      <span className="px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 text-[8px] font-mono rounded font-bold border border-emerald-800/80 uppercase tracking-widest">
                        CONNECTED
                      </span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      API keys are pre-configured in the platform environment. Manual API key entry is disabled.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/80">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Managed Active</span>
                </div>
              </div>

              <div className="text-[10px] text-neutral-400 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-2.5 flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Engine credentials and rate limits are managed directly via server environment variables.</span>
              </div>
            </div>

          </div>

          {/* Section 2: Theme Setup */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-white" />
              Theme Configuration
            </h2>
            <p className="text-xs text-neutral-400">
              Establish the visual appearance of the workspace. Defaulting to strict monochrome high contrast.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Dark Theme */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-neutral-900 border-white ring-1 ring-white/30'
                    : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900'
                }`}
              >
                <div className="p-3 rounded-xl bg-neutral-800 text-white">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Monochrome Dark</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">High contrast dark canvas.</p>
                </div>
              </button>

              {/* Light Theme */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-neutral-900 border-white ring-1 ring-white/30'
                    : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900'
                }`}
              >
                <div className="p-3 rounded-xl bg-neutral-800 text-white">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Monochrome Light</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">High contrast light canvas.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Action Back Button */}
          <div className="pt-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center bg-white text-black hover:bg-neutral-200"
            >
              Apply and Go Back to Workspace
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
