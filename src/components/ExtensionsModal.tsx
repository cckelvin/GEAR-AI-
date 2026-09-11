import React, { useState } from 'react';
import { 
  Puzzle, 
  Check, 
  X, 
  Zap, 
  Code, 
  Server, 
  FileCode, 
  Layers, 
  Box, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  Terminal,
  ChevronRight
} from 'lucide-react';
import { GearExtension } from '../types';

interface ExtensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  extensions: GearExtension[];
  onToggleExtension: (id: string) => void;
  onRunDiagnostic?: () => void;
  diagnosticStatus?: string | null;
}

export default function ExtensionsModal({
  isOpen,
  onClose,
  extensions,
  onToggleExtension,
  onRunDiagnostic,
  diagnosticStatus
}: ExtensionsModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExtension, setSelectedExtension] = useState<GearExtension | null>(extensions[0] || null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Extensions' },
    { id: 'runtime', label: 'Runtimes (Python & Node)' },
    { id: 'bundler', label: 'Bundlers (Vite)' },
    { id: 'language', label: 'Languages' },
    { id: 'tool', label: 'Tools & Utilities' }
  ];

  const filteredExtensions = extensions.filter(ext => {
    const matchesCategory = activeCategory === 'all' || ext.category === activeCategory;
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ext.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (name: string) => {
    switch (name) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Code': return <Code className="w-5 h-5 text-emerald-400" />;
      case 'Server': return <Server className="w-5 h-5 text-green-400" />;
      case 'FileCode': return <FileCode className="w-5 h-5 text-blue-400" />;
      case 'Layers': return <Layers className="w-5 h-5 text-cyan-400" />;
      case 'Box': return <Box className="w-5 h-5 text-purple-400" />;
      default: return <Puzzle className="w-5 h-5 text-neutral-300" />;
    }
  };

  const activeCount = extensions.filter(e => e.enabled).length;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-neutral-800 rounded-2xl w-full max-w-4xl h-[620px] flex flex-col shadow-2xl overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Puzzle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Gear Studio Extensions</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/80">
                  {activeCount} Installed & Active
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Multi-runtime engines powering Vite, Python 3.11, and Node.js execution inside Gear Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRunDiagnostic && (
              <button
                onClick={onRunDiagnostic}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-300 hover:text-white transition-all flex items-center gap-1.5"
                title="Test all runtime extension engines"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Test Runtimes</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {diagnosticStatus && (
          <div className="px-6 py-2 bg-blue-950/40 border-b border-blue-900/40 text-[11px] font-mono text-blue-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{diagnosticStatus}</span>
          </div>
        )}

        {/* Body Layout: Sidebar + List + Details */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Categories Sidebar */}
          <div className="w-56 border-r border-neutral-800 p-3 space-y-1 bg-neutral-950/40 shrink-0">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
              Extension Types
            </div>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  activeCategory === cat.id
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <span>{cat.label}</span>
                {cat.id === 'all' && (
                  <span className="text-[10px] font-mono text-neutral-500">{extensions.length}</span>
                )}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-neutral-800 px-3">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Supported Runtimes
              </div>
              <div className="space-y-1.5 text-[11px] text-neutral-400 font-mono">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Vite (TSX/React)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Python 3.11</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span>Node.js LTS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extensions List */}
          <div className="w-72 border-r border-neutral-800 flex flex-col bg-neutral-900/30 shrink-0">
            <div className="p-3 border-b border-neutral-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search extensions..."
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {filteredExtensions.map(ext => {
                const isSelected = selectedExtension?.id === ext.id;
                return (
                  <div
                    key={ext.id}
                    onClick={() => setSelectedExtension(ext)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-neutral-800/90 border-blue-500/80 shadow-md'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-900/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getIcon(ext.iconName)}
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">{ext.name}</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                        ext.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-neutral-800 text-neutral-500'
                      }`}>
                        v{ext.version}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-1">{ext.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Pane */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col bg-neutral-950/20">
            {selectedExtension ? (
              <div className="space-y-6">
                
                {/* Title & Toggle */}
                <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                      {getIcon(selectedExtension.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{selectedExtension.name}</h3>
                        <span className="text-[10px] font-mono text-neutral-400">{selectedExtension.identifier}</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">Author: {selectedExtension.author} • Version {selectedExtension.version}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleExtension(selectedExtension.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedExtension.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    {selectedExtension.enabled ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <span>Disabled</span>
                    )}
                  </button>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Overview</h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">{selectedExtension.description}</p>
                </div>

                {/* Runtime Capabilities Card */}
                <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-blue-400" />
                      Execution Engine
                    </span>
                    <span className="text-[11px] font-mono text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">
                      {selectedExtension.executionEngine}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Can Execute Scripts Directly:</span>
                    <span className={`font-mono font-bold ${selectedExtension.canExecute ? 'text-emerald-400' : 'text-neutral-500'}`}>
                      {selectedExtension.canExecute ? 'Yes (Interactive REPL & CLI)' : 'Static Parsing & LSP'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-neutral-400 block mb-1.5">Associated File Patterns:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedExtension.fileExtensions.map((fe, i) => (
                        <span key={i} className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded font-mono text-[10px] text-neutral-300">
                          {fe}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Extension Features</h4>
                  <div className="space-y-1.5">
                    {selectedExtension.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
                Select an extension from the list to view its configuration
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">Runtimes: Vite Dev Server • Python 3.11 • Node.js LTS</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white text-black font-bold rounded-lg text-xs hover:bg-neutral-200 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
