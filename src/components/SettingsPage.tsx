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
  Server
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
  onOpenExtensions?: () => void;
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
  onOpenExtensions,
}: SettingsPageProps) {
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingGroq, setTestingGroq] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [groqStatus, setGroqStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const savedGroq = localStorage.getItem('gear_groq_key') || '';
    const savedGemini = localStorage.getItem('gear_gemini_key') || localStorage.getItem('gear_api_key') || '';
    setGroqKey(savedGroq);
    setGeminiKey(savedGemini);
  }, []);

  const handleSaveGroq = async () => {
    const trimmed = groqKey.trim();
    if (!trimmed) {
      localStorage.removeItem('gear_groq_key');
      setGroqStatus({ success: true, message: 'Groq key cleared' });
      return;
    }

    localStorage.setItem('gear_groq_key', trimmed);
    setTestingGroq(true);
    setGroqStatus(null);
    try {
      const res = await fetch('/api/secrets/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'groq', key: trimmed })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGroqStatus({ success: true, message: data.message || 'Groq API Key valid! Open GPT OSS 120B ready.' });
      } else {
        setGroqStatus({ success: false, message: data.error || 'Invalid Groq API Key.' });
      }
    } catch (e: any) {
      setGroqStatus({ success: false, message: e.message || 'Network check failed.' });
    } finally {
      setTestingGroq(false);
    }
  };

  const handleSaveGemini = async () => {
    const trimmed = geminiKey.trim();
    if (!trimmed) {
      localStorage.removeItem('gear_gemini_key');
      localStorage.removeItem('gear_api_key');
      setGeminiStatus({ success: true, message: 'Gemini key cleared' });
      return;
    }

    localStorage.setItem('gear_gemini_key', trimmed);
    localStorage.setItem('gear_api_key', trimmed);
    setTestingGemini(true);
    setGeminiStatus(null);
    try {
      const res = await fetch('/api/secrets/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gemini', key: trimmed })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGeminiStatus({ success: true, message: data.message || 'Gemini API Key valid!' });
      } else {
        setGeminiStatus({ success: false, message: data.error || 'Invalid Gemini API Key.' });
      }
    } catch (e: any) {
      setGeminiStatus({ success: false, message: e.message || 'Network check failed.' });
    } finally {
      setTestingGemini(false);
    }
  };

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
              {/* Model 1: Ionic (GPT OSS 120B) */}
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
                      GPT OSS 120B
                    </span>
                    <span className="p-1 px-2 bg-neutral-800 border border-neutral-700 rounded-full text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                      Deep Architecture
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
                  Ionic — GPT OSS 120B Full Project Builder
                </h3>
                <p className="text-xs mt-1.5 text-neutral-300 leading-relaxed">
                  120B open-weights foundation reasoning architecture. Engineered for deep multi-file scaffolding across Vite, Python 3.11, and Node.js. Excels at complex algorithms, data modeling, backend services, and clean folder structures.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-200">
                    • Vite & React Scaffolding
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-200">
                    • Python 3.11 Data & Scripts
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-amber-200">
                    • Node.js LTS Express & VFS
                  </span>
                </div>
              </div>

              {/* Model 2: Iconic (Groq Compound) */}
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
                      GROQ COMPOUND
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
                  Iconic — Groq Compound Project Builder
                </h3>
                <p className="text-xs mt-1.5 text-neutral-300 leading-relaxed">
                  Ultra-low latency compound AI engine with speculative inference and specialized sub-agents. Delivers sub-second multi-token project generation, instant surgical patching, and live preview updates.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-wrap gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-200">
                    • Sub-Second File Generation
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-200">
                    • Real-Time Surgical Patching
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-blue-200">
                    • Instant Component Iteration
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Installed Gear Studio Extensions */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Puzzle className="w-3.5 h-3.5 text-emerald-400" />
                  Installed Extensions & Runtimes
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Gear Studio is equipped with multi-runtime execution engines. Code and run Vite, Python 3.11, and Node.js directly.
                </p>
              </div>
              {onOpenExtensions && (
                <button
                  onClick={onOpenExtensions}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Puzzle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Manage Extensions</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Vite Runner</span>
                </div>
                <p className="text-[10px] text-neutral-400">Vite Dev Server & HMR Bundler v5.4</p>
                <span className="mt-2 inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  ● Installed & Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Python 3.11</span>
                </div>
                <p className="text-[10px] text-neutral-400">In-Browser Pyodide REPL & Runner</p>
                <span className="mt-2 inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  ● Installed & Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold text-white">Node.js LTS</span>
                </div>
                <p className="text-[10px] text-neutral-400">Node 20 Sandboxed VFS Engine</p>
                <span className="mt-2 inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  ● Installed & Active
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
                  Connect your <strong className="text-amber-300">Groq API Key</strong> to power <code className="text-amber-400 font-mono">Ionic (GPT OSS 120B)</code> and <code className="text-blue-400 font-mono">Iconic (Groq Compound)</code> full project builders.
                </p>
              </div>
            </div>

            {/* Groq Key Input Card (PRIMARY ENGINE) */}
            <div id="groq-key-settings-card" className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/40 ring-1 ring-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-600/60 flex items-center justify-center text-amber-400 font-bold text-xs">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Groq API Key</span>
                      <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[8px] font-mono rounded font-black border border-amber-500/50 uppercase tracking-widest">
                        PRIMARY ENGINE
                      </span>
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Powers both Ionic (GPT OSS 120B) and Iconic (Groq Compound) full project generation across Vite, Python, and Node.js
                    </p>
                  </div>
                </div>

                {localStorage.getItem('gear_groq_key') ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Groq Key Active
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-amber-400/90 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/80">
                    Key Needed
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showGroqKey ? "text" : "password"}
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 pr-9 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                  >
                    {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  id="save-groq-key-button"
                  onClick={handleSaveGroq}
                  disabled={testingGroq}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95"
                >
                  {testingGroq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{testingGroq ? 'Verifying...' : 'Save & Test'}</span>
                </button>
              </div>

              {groqStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  groqStatus.success 
                    ? 'bg-emerald-950/50 border border-emerald-700/60 text-emerald-300' 
                    : 'bg-red-950/50 border border-red-700/60 text-red-300'
                }`}>
                  {groqStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />}
                  <span className="font-mono text-[11px]">{groqStatus.message}</span>
                </div>
              )}
            </div>

            {/* Gemini Key Input Card (Secondary Fallback) */}
            <div id="gemini-key-settings-card" className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-3 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 font-bold text-xs">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <span>Gemini API Key</span>
                      <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-400 text-[8px] font-mono rounded border border-neutral-700">
                        OPTIONAL SECONDARY
                      </span>
                    </h3>
                    <p className="text-[10px] text-neutral-500">
                      Optional secondary fallback if Groq key is not configured
                    </p>
                  </div>
                </div>

                {localStorage.getItem('gear_gemini_key') && (
                  <span className="flex items-center gap-1 text-[9px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Key Saved
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 pr-9 text-xs text-neutral-300 font-mono placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1"
                  >
                    {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  id="save-gemini-key-button"
                  onClick={handleSaveGemini}
                  disabled={testingGemini}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {testingGemini ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  <span>{testingGemini ? 'Testing...' : 'Save'}</span>
                </button>
              </div>

              {geminiStatus && (
                <div className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                  geminiStatus.success 
                    ? 'bg-neutral-900 border border-neutral-700 text-neutral-300' 
                    : 'bg-red-950/50 border border-red-700/60 text-red-300'
                }`}>
                  {geminiStatus.success ? <CheckCircle2 className="w-3 h-3 shrink-0 text-neutral-400" /> : <AlertCircle className="w-3 h-3 shrink-0 text-red-400" />}
                  <span className="font-mono text-[11px]">{geminiStatus.message}</span>
                </div>
              )}
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
