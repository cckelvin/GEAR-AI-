import React, { useState } from 'react';
import { Plus, Trash2, Key, X, Eye, EyeOff, Shield } from 'lucide-react';
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    const formattedKey = newKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    
    // Check if key already exists
    if (envVars.some(v => v.name === formattedKey)) {
      alert(`The variable "${formattedKey}" already exists.`);
      return;
    }

    const newItem: EnvVar = {
      id: Math.random().toString(36).substring(2, 9),
      name: formattedKey,
      value: newValue.trim()
    };

    const updated = [...envVars, newItem];
    saveEnvVars(updated);
    
    setNewKey('');
    setNewValue('');
    
    showToast(`Added ${formattedKey} successfully`);
  };

  const handleDelete = (id: string, name: string) => {
    const updated = envVars.filter(v => v.id !== id);
    saveEnvVars(updated);
    showToast(`Deleted ${name}`);
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const showToast = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => {
      setSavedMessage(null);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-black overflow-y-auto p-8 custom-scrollbar relative text-white">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6 font-sans">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-neutral-900 border border-neutral-700 rounded-full text-[9px] font-black text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="w-2.5 h-2.5 text-white" />
                Secrets Manager
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter">
              {currentSpace.name} Environment Variables
            </h1>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Configure the environment variables (secrets) that run with this project space. Keys are kept safe and injected during runtime.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Add Form */}
          <div className="md:col-span-1 bg-neutral-950 border border-neutral-800 rounded-xl p-5 h-fit">
            <h2 className="text-xs font-black uppercase text-neutral-300 tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-white" />
              Add Variable
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1 ml-1">
                  Variable Name
                </label>
                <input 
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. API_KEY"
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
                className="w-full py-2 bg-white hover:bg-neutral-200 active:scale-95 text-xs text-black font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Space
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                Active Variables ({envVars.length})
              </h2>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-white" /> Secure Storage Enabled
              </div>
            </div>

            {envVars.length === 0 ? (
              <div className="border border-dashed border-neutral-800 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <Key className="w-8 h-8 text-neutral-600 mb-3" />
                <p className="text-xs font-bold text-neutral-400">No Environment Variables Configured</p>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-sm">
                  Add secure secrets on the left to handle API tokens, keys, or database URLs for this space.
                </p>
              </div>
            ) : (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
                {envVars.map((v) => (
                  <div key={v.id} className="p-4 flex items-center justify-between hover:bg-neutral-900 transition-colors">
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white tracking-wide truncate">{v.name}</span>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-neutral-400 break-all select-all">
                          {visibleSecrets[v.id] ? v.value : '••••••••••••••••'}
                        </span>
                        <button 
                          onClick={() => toggleSecretVisibility(v.id)}
                          className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                          title={visibleSecrets[v.id] ? "Hide secret" : "Show secret"}
                        >
                          {visibleSecrets[v.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(v.id, v.name)}
                      className="p-2 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer"
                      title="Remove key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
