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
  Loader2
} from 'lucide-react';
import { Space, AIModel } from '../types';

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
            <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Active AI Model
            </h2>
            <p className="text-xs text-neutral-400">
              Configure which LLM architecture powers the workspace logic editor, code creations, block diagnostics, and autonomous bug fixing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
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
                      Fast
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
                      Architect
                    </span>
                  </div>
                  {activeModel === 'iconic' && <Check className="w-4 h-4 text-white" />}
                </div>
                <h3 className="text-sm font-black tracking-tight text-white">Iconic Mode</h3>
                <p className="text-[10px] mt-1 text-neutral-400">
                  Deep-reasoning full-stack modeling. Perfect for complex APIs, architectural diagrams, multi-screen mapping, and error resolution.
                </p>
              </button>

              {/* Gearbox Option */}
              <button
                onClick={() => handleModelChange('gearbox')}
                className={`p-5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  activeModel === 'gearbox'
                    ? 'bg-neutral-900 border-emerald-400 ring-1 ring-emerald-400/30'
                    : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 bg-emerald-950/80 border border-emerald-600/50 rounded-full text-[9px] font-black text-emerald-300 uppercase tracking-widest">
                      Groq • OSS 120B
                    </span>
                  </div>
                  {activeModel === 'gearbox' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  Gearbox Mode
                </h3>
                <p className="text-[10px] mt-1 text-neutral-400">
                  Precision surgical editor. Pinpoints exact files & lines for fast corrections, additions, and folder creations without full retyping.
                </p>
              </button>
            </div>
          </div>

          {/* Section: AI API Keys & Credentials */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  AI API Keys & Model Credentials
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Connect your personal API keys for inbuilt models. Keys are stored safely and encrypted in local session memory.
                </p>
              </div>
            </div>

            {/* Groq Key Input Card */}
            <div id="groq-key-settings-card" className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-bold text-[11px]">
                    G
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Groq API Key (Open GPT OSS 120B)</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono rounded font-bold border border-emerald-500/30">
                        POWERS GEARBOX
                      </span>
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Required for Gearbox surgical edits and Open GPT OSS 120B execution
                    </p>
                  </div>
                </div>

                {localStorage.getItem('gear_groq_key') && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Key Connected
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
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 pr-9 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
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
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
                >
                  {testingGroq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{testingGroq ? 'Testing...' : 'Save & Test'}</span>
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

            {/* Gemini Key Input Card */}
            <div id="gemini-key-settings-card" className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-700/60 flex items-center justify-center text-blue-400 font-bold text-[11px]">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Gemini API Key</span>
                      <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-400 text-[8px] font-mono rounded font-bold border border-blue-500/30">
                        POWERS ICONIC & IONIC
                      </span>
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Required for Iconic architect reasoning & Ionic fast compiler
                    </p>
                  </div>
                </div>

                {localStorage.getItem('gear_gemini_key') && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Key Connected
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
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 pr-9 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
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
                  className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg active:scale-95"
                >
                  {testingGemini ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{testingGemini ? 'Testing...' : 'Save & Test'}</span>
                </button>
              </div>

              {geminiStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  geminiStatus.success 
                    ? 'bg-blue-950/50 border border-blue-700/60 text-blue-300' 
                    : 'bg-red-950/50 border border-red-700/60 text-red-300'
                }`}>
                  {geminiStatus.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-400" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />}
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
