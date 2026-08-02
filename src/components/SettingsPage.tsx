import React from 'react';
import { 
  Home, 
  Box, 
  Cpu, 
  Layers, 
  ShoppingCart, 
  Info, 
  Settings, 
  X, 
  Cpu as CpuIcon, 
  Moon, 
  Sun, 
  Zap, 
  Sparkles,
  Check,
  Code
} from 'lucide-react';
import { Space } from '../types';

interface SettingsPageProps {
  spaces: Space[];
  activeModel: 'ionic' | 'iconic';
  setActiveModel: (model: 'ionic' | 'iconic') => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (theme: 'dark' | 'light') => void;
  currentPage: string;
  setCurrentPage: (page: 'landing' | 'chat' | 'dashboard' | 'editor' | 'integrations' | 'auth' | 'domains' | 'view' | 'projects' | 'features' | 'solutions' | 'pricing' | 'about' | 'settings') => void;
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

  const handleModelChange = (model: 'ionic' | 'iconic') => {
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
    <div className={`w-full h-screen flex select-none font-sans overflow-hidden ${themeMode === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-[#0A0A0A] text-white'}`}>
      
      {/* Fixed Expanded Hamburger Sidebar on the Left */}
      <div className={`w-72 h-full border-r flex flex-col p-6 shrink-0 ${themeMode === 'light' ? 'bg-white border-slate-200' : 'bg-[#0F0F0F] border-[#262626]'}`}>
        
        {/* Brand / Title Header (styled like Slide Drawer header) */}
        <div className={`flex items-center justify-between mb-8 pb-4 border-b ${themeMode === 'light' ? 'border-slate-100' : 'border-[#262626]'}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className={`font-black text-xs tracking-tighter uppercase ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>Gear Studio Map</span>
          </div>
          <button 
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${themeMode === 'light' ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-[#1A1A1A] text-gray-500 hover:text-white'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sidebar List (Same as Hamburger Menu contents, but Fixed Expanded) */}
        <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
          <div className="space-y-1.5">
            <p className={`text-[9px] font-black uppercase tracking-widest px-3 ${themeMode === 'light' ? 'text-slate-400' : 'text-[#555]'}`}>Main Navigation</p>
            
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentPage === 'dashboard' ? 'bg-indigo-600 text-white' : themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              <Home className="w-4 h-4" />
              <span>Home Page</span>
            </button>

            <button 
              onClick={() => setCurrentPage('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentPage === 'projects' ? 'bg-indigo-600 text-white' : themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4" />
                <span>My Projects</span>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${themeMode === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                {spaces.length}
              </span>
            </button>
          </div>

          <div className={`space-y-1.5 pt-2 border-t ${themeMode === 'light' ? 'border-slate-200' : 'border-[#1A1A1A]'}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest px-3 ${themeMode === 'light' ? 'text-slate-400' : 'text-[#555]'}`}>Product Sections</p>
            
            <button 
              onClick={() => setCurrentPage('features')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentPage === 'features' ? 'bg-[#222] text-white border border-[#333]' : themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Features</span>
            </button>

            <button 
              onClick={() => setCurrentPage('solutions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentPage === 'solutions' ? 'bg-[#222] text-white' : themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Solutions</span>
            </button>

            <button 
              onClick={() => setCurrentPage('pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentPage === 'pricing' ? 'bg-[#222] text-white' : themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <span>Pricing Plans</span>
            </button>

            <button 
              onClick={() => setCurrentPage('about')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentPage === 'about' ? 'bg-[#222] text-white' : themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              <Info className="w-4 h-4 text-indigo-400" />
              <span>About Us</span>
            </button>

            <button 
              onClick={() => setCurrentPage('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${currentPage === 'settings' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : themeMode === 'light' ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'}`}
            >
              <Settings className="w-4 h-4 text-yellow-500" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Settings Display content Area */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar flex flex-col">
        <div className="max-w-xl w-full mx-auto space-y-10 text-left">
          
          {/* Header */}
          <div className={`border-b pb-6 ${themeMode === 'light' ? 'border-slate-200' : 'border-[#262626]'}`}>
            <h1 className="text-3xl font-black tracking-tighter">System Settings</h1>
            <p className={`text-xs mt-1.5 ${themeMode === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
              Customize your development server, switch active compilation models, and adjust styling templates.
            </p>
          </div>

          {/* Section 1: Active Model */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#EAB308] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Active AI Model
            </h2>
            <p className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
              Configure which LLM architecture powers the workspace logic editor, code creations, block diagnostics, and autonomous bug fixing.
            </p>

            <div className={`grid grid-cols-2 gap-4 mt-2`}>
              {/* Ionic Option */}
              <button
                onClick={() => handleModelChange('ionic')}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  activeModel === 'ionic'
                    ? themeMode === 'light'
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                      : 'bg-blue-950/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : themeMode === 'light'
                      ? 'bg-white border-slate-200 hover:bg-slate-50/50'
                      : 'bg-[#0F0F0F] border-[#262626] hover:bg-[#151515]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest">
                      Standard
                    </span>
                  </div>
                  {activeModel === 'ionic' && <Check className="w-4 h-4 text-blue-400" />}
                </div>
                <h3 className={`text-sm font-black tracking-tight ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>Ionic Mode</h3>
                <p className={`text-[10px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  Ultra-fast, responsive logical outputs with strict token boundaries. Optimised for iterative code changes.
                </p>
              </button>

              {/* Iconic Option */}
              <button
                onClick={() => handleModelChange('iconic')}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  activeModel === 'iconic'
                    ? themeMode === 'light'
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400'
                      : 'bg-indigo-950/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : themeMode === 'light'
                      ? 'bg-white border-slate-200 hover:bg-slate-50/50'
                      : 'bg-[#0F0F0F] border-[#262626] hover:bg-[#151515]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                      Premium
                    </span>
                  </div>
                  {activeModel === 'iconic' && <Check className="w-4 h-4 text-indigo-400" />}
                </div>
                <h3 className={`text-sm font-black tracking-tight ${themeMode === 'light' ? 'text-slate-800' : 'text-white'}`}>Iconic Mode</h3>
                <p className={`text-[10px] mt-1 ${themeMode === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                  Deep-reasoning full-stack modeling. Perfect for complex APIs, architectural diagrams, and error resolution.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Theme Setup */}
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#EAB308] flex items-center gap-2">
              <Moon className="w-3.5 h-3.5" />
              Theme Configuration
            </h2>
            <p className={`text-xs ${themeMode === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
              Establish the visual appearance of the workspace. Toggle between standard Dark mode and standard Light mode to fit your preferred workspace style.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Dark Theme */}
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-[#151515] border-yellow-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`p-3 rounded-xl ${themeMode === 'dark' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${themeMode === 'dark' ? 'text-white' : 'text-slate-800'}`}>Dark Theme</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Classic workspace vibe.</p>
                </div>
              </button>

              {/* Light Theme */}
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-blue-50 border-blue-500'
                    : themeMode === 'dark'
                      ? 'bg-[#0F0F0F] border-[#262626] hover:bg-[#1A1A1A]'
                      : 'bg-slate-150 border-slate-300'
                }`}
              >
                <div className={`p-3 rounded-xl ${themeMode === 'light' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-150 text-slate-500'}`}>
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-xs font-black uppercase tracking-wider ${themeMode === 'light' ? 'text-slate-800' : 'text-gray-500'}`}>Light Theme</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Clean high contrast style.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Action Back Button */}
          <div className="pt-6">
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
                themeMode === 'light'
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              Apply and Go Back to Workspace
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
