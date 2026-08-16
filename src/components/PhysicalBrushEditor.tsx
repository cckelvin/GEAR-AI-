import React, { useState, useEffect, useRef } from 'react';
import { 
  Paintbrush, 
  Type, 
  Palette, 
  Trash2, 
  Copy, 
  Sparkles, 
  X, 
  Check, 
  Move, 
  Maximize, 
  Sliders, 
  Layers, 
  CornerDownRight,
  PenTool,
  RotateCcw,
  Send,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Square,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface InspectedElementData {
  tag: string;
  id?: string;
  classes: string;
  text: string;
  html: string;
  selector: string;
  styles: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    textAlign?: string;
    display?: string;
    borderColor?: string;
    borderWidth?: string;
  };
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface PhysicalBrushEditorProps {
  isBrushActive: boolean;
  onToggleBrush: (active: boolean) => void;
  inspectedElement: InspectedElementData | null;
  onApplyUpdate: (updates: {
    text?: string;
    classes?: string;
    style?: Record<string, string>;
    remove?: boolean;
    duplicate?: boolean;
  }) => void;
  onSendAiPrompt: (prompt: string, elementContext?: InspectedElementData) => void;
  onClearSelection: () => void;
  // Freehand Drawing props
  isDrawingMode: boolean;
  onToggleDrawingMode: (active: boolean) => void;
  onSendDrawingToAi: (canvasDataUrl: string) => void;
}

const COLOR_PRESETS = [
  { name: 'Pure White', value: '#ffffff', text: '#000000' },
  { name: 'Deep Black', value: '#0a0a0a', text: '#ffffff' },
  { name: 'Indigo Brand', value: '#4f46e5', text: '#ffffff' },
  { name: 'Emerald Green', value: '#10b981', text: '#ffffff' },
  { name: 'Sky Blue', value: '#0284c7', text: '#ffffff' },
  { name: 'Amber Gold', value: '#f59e0b', text: '#000000' },
  { name: 'Rose Pink', value: '#e11d48', text: '#ffffff' },
  { name: 'Neutral Slate', value: '#334155', text: '#ffffff' },
  { name: 'Transparent', value: 'transparent', text: '#ffffff' },
];

export const PhysicalBrushEditor: React.FC<PhysicalBrushEditorProps> = ({
  isBrushActive,
  onToggleBrush,
  inspectedElement,
  onApplyUpdate,
  onSendAiPrompt,
  onClearSelection,
  isDrawingMode,
  onToggleDrawingMode,
  onSendDrawingToAi,
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'text' | 'ai' | 'draw'>('style');
  const [editedText, setEditedText] = useState('');
  const [editedClasses, setEditedClasses] = useState('');
  const [aiElementPrompt, setAiElementPrompt] = useState('');
  const [customBgColor, setCustomBgColor] = useState('#4f46e5');
  const [customTextColor, setCustomTextColor] = useState('#ffffff');
  const [selectedRadius, setSelectedRadius] = useState('rounded-xl');
  const [selectedPadding, setSelectedPadding] = useState('p-4');

  // Freehand Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(4);
  const [hasDrawnContent, setHasDrawnContent] = useState(false);

  // Sync state with newly inspected element
  useEffect(() => {
    if (inspectedElement) {
      setEditedText(inspectedElement.text || '');
      setEditedClasses(inspectedElement.classes || '');
      if (inspectedElement.styles.backgroundColor && inspectedElement.styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        setCustomBgColor(inspectedElement.styles.backgroundColor);
      }
      if (inspectedElement.styles.color) {
        setCustomTextColor(inspectedElement.styles.color);
      }
      setActiveTab('style');
    }
  }, [inspectedElement]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnContent(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnContent(false);
  };

  const handleSendDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSendDrawingToAi(dataUrl);
    clearCanvas();
    onToggleDrawingMode(false);
  };

  return (
    <>
      {/* Freehand Brush Canvas Overlay */}
      {isDrawingMode && (
        <div className="absolute inset-0 z-40 flex flex-col pointer-events-auto bg-black/30 backdrop-blur-[2px]">
          {/* Drawing Top Toolbar */}
          <div className="bg-[#121212]/95 border-b border-[#2A2A2A] px-4 py-2 flex items-center justify-between shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
                <PenTool className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Physical Freehand Brush Mode
                </span>
              </div>
              
              {/* Color Selectors */}
              <div className="flex items-center gap-1.5 bg-[#1C1C1C] p-1 rounded-lg border border-[#333]">
                {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ffffff'].map(c => (
                  <button
                    key={c}
                    onClick={() => setDrawColor(c)}
                    className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${drawColor === c ? 'scale-110 ring-2 ring-white border-transparent' : 'border-neutral-600 hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Stroke Size */}
              <div className="flex items-center gap-1.5 bg-[#1C1C1C] px-2 py-1 rounded-lg border border-[#333] text-[11px] font-mono text-neutral-300">
                <span className="text-neutral-500 font-bold">Size:</span>
                {[2, 4, 8, 14].map(s => (
                  <button
                    key={s}
                    onClick={() => setBrushSize(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${brushSize === s ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCanvas}
                className="px-2.5 py-1 bg-[#222] hover:bg-[#2A2A2A] border border-[#3A3A3A] text-neutral-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Clear all drawings"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                disabled={!hasDrawnContent}
                onClick={handleSendDrawing}
                className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 disabled:opacity-40 text-black rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Send Sketch to AI</span>
              </button>

              <button
                onClick={() => onToggleDrawingMode(false)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#222] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div className="flex-1 relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={window.innerWidth}
              height={window.innerHeight}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full block"
            />
          </div>
        </div>
      )}

      {/* Floating / Docked Physical Brush Inspector Card */}
      <AnimatePresence>
        {isBrushActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 right-4 w-[380px] max-w-[calc(100%-32px)] bg-[#0E0E0E]/95 border border-[#2A2A2A] rounded-2xl shadow-2xl z-30 overflow-hidden flex flex-col backdrop-blur-md"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#141414] border-b border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center shadow-md">
                  <Paintbrush className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Physical Brush Tool</span>
                    {inspectedElement ? (
                      <span className="px-1.5 py-0.2 bg-indigo-900/60 border border-indigo-700 text-indigo-200 font-mono text-[9px] rounded">
                        &lt;{inspectedElement.tag}&gt;
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 bg-neutral-800 text-neutral-400 font-mono text-[9px] rounded">
                        TAP ANY ELEMENT
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {inspectedElement ? inspectedElement.selector : 'Click anywhere on live preview to apprehend & edit'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Freehand Draw toggle */}
                <button
                  onClick={() => onToggleDrawingMode(!isDrawingMode)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isDrawingMode ? 'bg-red-500 text-white shadow' : 'text-neutral-400 hover:text-white hover:bg-[#222]'}`}
                  title="Toggle Freehand Drawing Brush over canvas"
                >
                  <PenTool className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onToggleBrush(false)}
                  className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 border-b border-[#222] bg-[#0A0A0A] p-1 gap-1">
              <button
                onClick={() => setActiveTab('style')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'style' 
                    ? 'bg-[#1E1E1E] text-white border border-[#333]' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Physical Styles</span>
              </button>

              <button
                onClick={() => setActiveTab('text')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'text' 
                    ? 'bg-[#1E1E1E] text-white border border-[#333]' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Type className="w-3 h-3" />
                <span>Text & Classes</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'ai' 
                    ? 'bg-white text-black font-black' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Brush</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-3.5 space-y-3.5 max-h-[380px] overflow-y-auto custom-scrollbar">
              {/* STYLES TAB */}
              {activeTab === 'style' && (
                <div className="space-y-3">
                  {/* Background Color Brush */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                        <Palette className="w-3 h-3 text-neutral-400" />
                        <span>Background Color</span>
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">{customBgColor}</span>
                    </div>

                    <div className="grid grid-cols-9 gap-1">
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => {
                            setCustomBgColor(p.value);
                            onApplyUpdate({
                              style: { backgroundColor: p.value }
                            });
                          }}
                          className={`h-6 rounded-md border transition-all cursor-pointer ${customBgColor === p.value ? 'ring-2 ring-white scale-105 border-transparent' : 'border-neutral-700 hover:scale-105'}`}
                          style={{ backgroundColor: p.value }}
                          title={p.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text Color Brush */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                        <Type className="w-3 h-3 text-neutral-400" />
                        <span>Text Color</span>
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">{customTextColor}</span>
                    </div>

                    <div className="grid grid-cols-9 gap-1">
                      {COLOR_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => {
                            setCustomTextColor(p.value);
                            onApplyUpdate({
                              style: { color: p.value }
                            });
                          }}
                          className={`h-6 rounded-md border transition-all cursor-pointer ${customTextColor === p.value ? 'ring-2 ring-white scale-105 border-transparent' : 'border-neutral-700 hover:scale-105'}`}
                          style={{ backgroundColor: p.value }}
                          title={p.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Physical Shape & Spacing Presets */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Border Radius */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 block">
                        Border Radius
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: '0', val: '0px' },
                          { label: 'sm', val: '6px' },
                          { label: 'lg', val: '16px' },
                          { label: 'full', val: '9999px' },
                        ].map(r => (
                          <button
                            key={r.label}
                            onClick={() => {
                              onApplyUpdate({
                                style: { borderRadius: r.val }
                              });
                            }}
                            className="py-1 text-[10px] font-mono font-bold bg-[#1A1A1A] hover:bg-neutral-800 border border-[#333] text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 block">
                        Text Align
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { icon: AlignLeft, val: 'left' },
                          { icon: AlignCenter, val: 'center' },
                          { icon: AlignRight, val: 'right' },
                        ].map(a => (
                          <button
                            key={a.val}
                            onClick={() => {
                              onApplyUpdate({
                                style: { textAlign: a.val }
                              });
                            }}
                            className="py-1 flex items-center justify-center bg-[#1A1A1A] hover:bg-neutral-800 border border-[#333] text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <a.icon className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Typography Scale
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: 'XS', val: '12px' },
                        { label: 'SM', val: '14px' },
                        { label: 'BASE', val: '16px' },
                        { label: 'LG', val: '20px' },
                        { label: '2XL', val: '28px' },
                      ].map(s => (
                        <button
                          key={s.label}
                          onClick={() => {
                            onApplyUpdate({
                              style: { fontSize: s.val }
                            });
                          }}
                          className="py-1 text-[9px] font-mono font-bold bg-[#1A1A1A] hover:bg-neutral-800 border border-[#333] text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Element Actions: Duplicate / Delete */}
                  <div className="flex gap-2 pt-2 border-t border-[#222]">
                    <button
                      onClick={() => onApplyUpdate({ duplicate: true })}
                      className="flex-1 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#333] text-neutral-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      onClick={() => onApplyUpdate({ remove: true })}
                      className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TEXT & CLASSES TAB */}
              {activeTab === 'text' && (
                <div className="space-y-3">
                  {/* Inline Text Content */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      Element Text Content
                    </label>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      placeholder="Type text to update this element directly..."
                      rows={3}
                      className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors custom-scrollbar"
                    />
                    <button
                      onClick={() => onApplyUpdate({ text: editedText })}
                      className="w-full py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>Apply Physical Text</span>
                    </button>
                  </div>

                  {/* Tailwind CSS Classes */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                      CSS / Tailwind Classes
                    </label>
                    <input
                      type="text"
                      value={editedClasses}
                      onChange={(e) => setEditedClasses(e.target.value)}
                      placeholder="e.g. px-4 py-2 bg-indigo-600 rounded-xl text-white shadow-lg"
                      className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-2.5 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white transition-colors"
                    />
                    <button
                      onClick={() => onApplyUpdate({ classes: editedClasses })}
                      className="w-full py-1.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#333] text-neutral-200 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Apply Classes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI BRUSH TAB */}
              {activeTab === 'ai' && (
                <div className="space-y-3">
                  <div className="p-2.5 bg-[#141414] border border-[#262626] rounded-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-bold text-white">Targeted Element Prompting</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono leading-relaxed">
                      Instruct Gear AI to restyle, animate, or rebuild this specific element ({inspectedElement ? `<${inspectedElement.tag}>` : 'entire space'}).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={aiElementPrompt}
                      onChange={(e) => setAiElementPrompt(e.target.value)}
                      placeholder={
                        inspectedElement 
                          ? `e.g. "Add a pulsing glowing shadow, center text, and add hover scale transition to this ${inspectedElement.tag}"`
                          : "Describe what to change across this website..."
                      }
                      rows={3}
                      className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors custom-scrollbar"
                    />

                    {/* Quick Suggestion Chips */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Make it a glassmorphism card',
                        'Add modern hover animation',
                        'Change to high-contrast dark theme',
                        'Make it responsive grid',
                      ].map(chip => (
                        <button
                          key={chip}
                          onClick={() => setAiElementPrompt(chip)}
                          className="px-2 py-0.5 bg-[#181818] hover:bg-[#222] border border-[#333] rounded-full text-[9px] text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={!aiElementPrompt.trim()}
                      onClick={() => {
                        onSendAiPrompt(aiElementPrompt, inspectedElement || undefined);
                        setAiElementPrompt('');
                      }}
                      className="w-full py-2.5 bg-white hover:bg-neutral-200 disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>Execute with Gear AI</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Banner */}
            <div className="px-3.5 py-2 bg-[#0A0A0A] border-t border-[#222] flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Physical Brush Active
              </span>
              <button
                onClick={onClearSelection}
                className="text-neutral-400 hover:text-white underline cursor-pointer"
              >
                Clear Target
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhysicalBrushEditor;
