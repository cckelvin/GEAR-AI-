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
  Moon, 
  Sun, 
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
            <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Active AI Model
            </h2>
            <p className="text-xs text-neutral-400">
              Configure which LLM architecture powers the workspace logic editor, code creations, block diagnostics, and autonomous bug fixing.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Ionic Option */}
              <button
                onClick={() => handleModelChange('ionic')}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  activeModel === 'ionic'
                    ? 'bg-neutral-900 border-white ring-1 ring-white/30'
                    : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-neutral-800 border border-neutral-700 rounded-full text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                      Standard
                    </span>
                  </div>
                  {activeModel === 'ionic' && <Check className="w-4 h-4 text-white" />}
                </div>
                <h3 className="text-sm font-black tracking-tight text-white">Ionic Mode</h3>
                <p className="text-[10px] mt-1 text-neutral-400">
                  Ultra-fast, responsive logical outputs with strict token boundaries. Optimised for iterative code changes.
                </p>
              </button>

              {/* Iconic Option */}
              <button
                onClick={() => handleModelChange('iconic')}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  activeModel === 'iconic'
                    ? 'bg-neutral-900 border-white ring-1 ring-white/30'
                    : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-neutral-800 border border-neutral-700 rounded-full text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                      Premium
                    </span>
                  </div>
                  {activeModel === 'iconic' && <Check className="w-4 h-4 text-white" />}
                </div>
                <h3 className="text-sm font-black tracking-tight text-white">Iconic Mode</h3>
                <p className="text-[10px] mt-1 text-neutral-400">
                  Deep-reasoning full-stack modeling. Perfect for complex APIs, architectural diagrams, multi-screen mapping, and error resolution.
                </p>
              </button>
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
