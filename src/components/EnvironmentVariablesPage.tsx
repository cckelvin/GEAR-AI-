import React, { useState } from 'react';
import { Plus, Trash2, Key, X, Eye, EyeOff, Shield, CheckCircle2, AlertCircle, RefreshCw, Zap, Copy, Check, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Space } from '../types';

interface EnvVar {
  id: string;
  name: string;
  value: string;
}

interface EnvironmentVariablesPageProps {
  currentSpace: Space;
  envVars: EnvVar[];
  saveEnvVars: (vars: EnvVar[]) => void;
  onClose: () => void;
}

const COMMON_PRESETS = [
  { name: 'GEMINI_API_KEY', placeholder: 'AIzaSy...', type: 'ai' },
  { name: 'SUPABASE_URL', placeholder: 'https://xyz.supabase.co', type: 'supabase' },
  { name: 'SUPABASE_KEY', placeholder: 'eyJhbGciOi...', type: 'supabase' },
  { name: 'RENDER_API_KEY', placeholder: 'rnd_...', type: 'render' },
  { name: 'SPACESHIP_API_KEY', placeholder: 'spaceship_key', type: 'spaceship' },
  { name: 'SPACESHIP_API_SECRET', placeholder: 'spaceship_secret', type: 'spaceship' }
];

export default function EnvironmentVariablesPage({
  currentSpace,
  envVars,
  saveEnvVars,
  onClose,
}: EnvironmentVariablesPageProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    showToast(`Copied ${label} snippet`);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    const formattedKey = newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    
    // If key already exists, update its value
    const existingIndex = envVars.findIndex(v => v.name === formattedKey);
    let updated: EnvVar[];
    
    if (existingIndex >= 0) {
      updated = [...envVars];
      updated[existingIndex] = { ...updated[existingIndex], value: newValue.trim() };
      showToast(`Updated ${formattedKey} successfully`);
    } else {
      const newItem: EnvVar = {
        id: Math.random().toString(36).substring(2, 9),
        name: formattedKey,
        value: newValue.trim()
      };
      updated = [...envVars, newItem];
      showToast(`Added ${formattedKey} successfully`);
    }

    saveEnvVars(updated);

    // If it's a Gemini or AI API key, sync immediately to local storage
    if (['GEMINI_API_KEY', 'API_KEY', 'GEAR_API', 'VITE_GEAR_API'].includes(formattedKey)) {
      localStorage.setItem('gear_gemini_key', newValue.trim());
      localStorage.setItem('gear_api_key', newValue.trim());
    }
    
    setNewKey('');
    setNewValue('');
  };

  const handleDelete = (id: string, name: string) => {
    const updated = envVars.filter(v => v.id !== id);
    saveEnvVars(updated);
    
    if (['GEMINI_API_KEY', 'API_KEY', 'GEAR_API'].includes(name)) {
      localStorage.removeItem('gear_gemini_key');
      localStorage.removeItem('gear_api_key');
    }

    showToast(`Deleted ${name}`);
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const testConnection = async (v: EnvVar) => {
    setTestingId(v.id);
    try {
      let testType = 'generic';
      if (v.name.includes('GEMINI') || v.name.includes('AI_KEY') || v.name === 'API_KEY') {
        testType = 'gemini';
      } else if (v.name.includes('SPACESHIP')) {
        testType = 'spaceship';
      } else if (v.name.includes('RENDER')) {
        testType = 'render';
      }

      // Check if there's a paired secret for spaceship
      const pairedSecret = envVars.find(item => item.name === 'SPACESHIP_API_SECRET')?.value;

      const res = await fetch('/api/secrets/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testType,
          key: v.value,
          secret: pairedSecret
        })
      });

      const data = await res.json();
      setTestResults(prev => ({
        ...prev,
        [v.id]: {
          success: data.success ?? res.ok,
          message: data.message || (data.success ? 'Connected & Verified!' : (data.error || 'Connection failed'))
        }
      }));
    } catch (e: any) {
      setTestResults(prev => ({
        ...prev,
        [v.id]: {
          success: false,
          message: e.message || 'Test request failed'
        }
      }));
    } finally {
      setTestingId(null);
    }
  };

  const showToast = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => {
      setSavedMessage(null);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-black overflow-y-auto p-8 custom-scrollbar relative text-white">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6 font-sans">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-neutral-900 border border-neutral-700 rounded-full text-[9px] font-black text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="w-2.5 h-2.5 text-white" />
                Secrets & Key Manager
              </span>
              <span className="p-1 px-2.5 bg-neutral-900 text-white border border-neutral-800 rounded-full text-[9px] font-bold">
                Auto-Injected into Runtime
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter">
              {currentSpace.name} Environment Variables
            </h1>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Manage secret keys, API tokens, and credentials. All variables are instantly bound to <code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded text-xs font-mono">process.env</code> and <code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded text-xs font-mono">import.meta.env</code> in preview and deployment.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Back to Code Editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-3 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-white" />
            Quick Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_PRESETS.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setNewKey(preset.name);
                }}
                className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 rounded-lg text-xs font-mono text-neutral-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3 text-neutral-400" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Add Form */}
          <div className="md:col-span-1 bg-neutral-950 border border-neutral-800 rounded-xl p-5 h-fit">
            <h2 className="text-xs font-black uppercase text-neutral-300 tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-white" />
              Add / Update Variable
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1 ml-1">
                  Variable Key Name
                </label>
                <input 
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. GEMINI_API_KEY"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white transition-all font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1 ml-1">
                  Secret Value
                </label>
                <input 
                  type="password"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white transition-all font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white hover:bg-neutral-200 active:scale-95 text-xs text-black font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Save to Space
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                Configured Secrets ({envVars.length})
              </h2>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-white" /> Real-time Runtime Injected
              </div>
            </div>

            {envVars.length === 0 ? (
              <div className="border border-dashed border-neutral-800 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <Key className="w-8 h-8 text-neutral-600 mb-3" />
                <p className="text-xs font-bold text-neutral-400">No Environment Variables Configured</p>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-sm">
                  Add secure secrets to connect API tokens, Gemini keys, Supabase credentials, or database connection strings for this project space.
                </p>
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
                {envVars.map((v) => (
                  <div key={v.id} className="p-4 flex flex-col gap-3 hover:bg-neutral-900/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white tracking-wide truncate">{v.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
                            Connected
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-neutral-400 break-all select-all">
                            {visibleSecrets[v.id] ? v.value : '••••••••••••••••••••'}
                          </span>
                          <button 
                            type="button"
                            onClick={() => toggleSecretVisibility(v.id)}
                            className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                            title={visibleSecrets[v.id] ? "Hide secret" : "Show secret"}
                          >
                            {visibleSecrets[v.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => testConnection(v)}
                          disabled={testingId === v.id}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Test key connection"
                        >
                          <RefreshCw className={`w-3 h-3 ${testingId === v.id ? 'animate-spin' : ''}`} />
                          Test
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(v.id, v.name)}
                          className="p-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                          title="Remove key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Test result banner if available */}
                    {testResults[v.id] && (
                      <div className={`p-2 rounded-lg text-xs flex items-center gap-2 ${testResults[v.id].success ? 'bg-neutral-900 border border-neutral-700 text-neutral-200' : 'bg-red-950/30 border border-red-900 text-red-300'}`}>
                        {testResults[v.id].success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        )}
                        <span className="text-[11px]">{testResults[v.id].message}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* How to Access in Your Code Guide */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Code className="w-3.5 h-3.5 text-white" />
              How to Access Secrets in Your Project Code
            </h3>
            <span className="text-[10px] text-neutral-500 font-mono">Auto-Injected at Runtime</span>
          </div>

          <p className="text-xs text-neutral-400">
            All configured secrets are injected directly into your project's preview and deployment. You can access any variable using any of the standard methods below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Snippet 1 */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between gap-2">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-wider mb-1">
                  1. Standard Process.env
                </div>
                <code className="text-white break-all">
                  const key = process.env.{envVars[0]?.name || 'GEMINI_API_KEY'};
                </code>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`const key = process.env.${envVars[0]?.name || 'GEMINI_API_KEY'};`, 'process.env')}
                className="self-end px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-[10px] flex items-center gap-1 font-sans cursor-pointer transition-colors"
              >
                {copiedSnippet === 'process.env' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                {copiedSnippet === 'process.env' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Snippet 2 */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between gap-2">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-wider mb-1">
                  2. Window / Global ENV
                </div>
                <code className="text-white break-all">
                  const key = window.ENV.{envVars[0]?.name || 'GEMINI_API_KEY'};
                </code>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`const key = window.ENV.${envVars[0]?.name || 'GEMINI_API_KEY'};`, 'window.ENV')}
                className="self-end px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-[10px] flex items-center gap-1 font-sans cursor-pointer transition-colors"
              >
                {copiedSnippet === 'window.ENV' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                {copiedSnippet === 'window.ENV' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Snippet 3 */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between gap-2">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-wider mb-1">
                  3. Vite / ESM Style
                </div>
                <code className="text-white break-all">
                  const key = import.meta.env.{envVars[0]?.name || 'GEMINI_API_KEY'};
                </code>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`const key = import.meta.env.${envVars[0]?.name || 'GEMINI_API_KEY'};`, 'import.meta.env')}
                className="self-end px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-[10px] flex items-center gap-1 font-sans cursor-pointer transition-colors"
              >
                {copiedSnippet === 'import.meta.env' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                {copiedSnippet === 'import.meta.env' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Snippet 4 */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between gap-2">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-sans font-bold tracking-wider mb-1">
                  4. Built-in Getter Helper
                </div>
                <code className="text-white break-all">
                  const key = getSecret('{envVars[0]?.name || 'GEMINI_API_KEY'}');
                </code>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`const key = getSecret('${envVars[0]?.name || 'GEMINI_API_KEY'}');`, 'getSecret')}
                className="self-end px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded text-[10px] flex items-center gap-1 font-sans cursor-pointer transition-colors"
              >
                {copiedSnippet === 'getSecret' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                {copiedSnippet === 'getSecret' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating toast notification */}
      <AnimatePresence>
        {savedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900 border border-neutral-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl backdrop-blur-md z-50 flex items-center gap-2"
          >
            <Shield className="w-3.5 h-3.5 text-white" />
            {savedMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
