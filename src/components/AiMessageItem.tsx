import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Brain, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  FileText, 
  CheckCircle2, 
  Search, 
  Layers, 
  Sparkles,
  Zap,
  Box
} from 'lucide-react';
import { Message } from '../types';

interface AiMessageItemProps {
  message: Message;
  activeCodingFile?: string;
  onApplyCode: (fileName: string, code: string) => void;
}

export const AiMessageItem: React.FC<AiMessageItemProps> = ({
  message,
  activeCodingFile,
  onApplyCode,
}) => {
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[92%] p-3 rounded-2xl text-xs bg-neutral-800 text-white border border-neutral-700 shadow-md whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    );
  }

  // Extract thoughts from message text
  let thoughtText = '';
  let mainText = message.text || '';

  const thoughtMatch = mainText.match(/<thought>([\s\S]*?)(?:<\/thought>|$)/i);
  if (thoughtMatch) {
    thoughtText = thoughtMatch[1].trim();
    mainText = mainText.replace(/<thought>[\s\S]*?(?:<\/thought>|$)/i, '').trim();
  }

  // Parse lines to identify v0 / bolt-like step badges
  const lines = mainText.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let bufferText: string[] = [];

  const flushBuffer = (key: string) => {
    if (bufferText.length > 0) {
      const textBlock = bufferText.join('\n').trim();
      if (textBlock) {
        renderedElements.push(
          <div key={key} className="markdown-body text-xs text-neutral-200">
            <Markdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)(?::(.+))?/.exec(className || '');
                  const fileName = match ? match[2] : null;
                  const isBlock = className?.includes('language-');

                  if (isBlock && fileName) {
                    return (
                      <div className="relative group/code my-2">
                        <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                          <button 
                            onClick={() => onApplyCode(fileName, String(children))}
                            className="px-2 py-1 bg-white hover:bg-neutral-200 rounded text-[9px] font-bold uppercase text-black shadow-lg cursor-pointer"
                          >
                            Apply to {fileName}
                          </button>
                        </div>
                        <pre className={className}>
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                  return <code className={className} {...props}>{children}</code>;
                }
              }}
            >
              {textBlock}
            </Markdown>
          </div>
        );
      }
      bufferText = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Check if line represents a step action pill (e.g. "📄 Set up...", "🔍 Explore...", "✓ Confirmed...", "• Step: ...")
    const isFileStep = trimmed.startsWith('📄') || trimmed.startsWith('📝') || /^\[step:\s*([^\]]+)\]/i.test(trimmed);
    const isExploreStep = trimmed.startsWith('🔍') || trimmed.toLowerCase().startsWith('explore •');
    const isCheckStep = trimmed.startsWith('✓') || trimmed.startsWith('✔') || trimmed.startsWith('✅');

    if (isFileStep || isExploreStep || isCheckStep) {
      flushBuffer(`buffer-${idx}`);
      
      let cleanLabel = trimmed
        .replace(/^[📄📝🔍✓✔✅•\s]+/, '')
        .replace(/^\[step:\s*([^\]]+)\]/i, '$1')
        .trim();

      renderedElements.push(
        <div 
          key={`step-${idx}`}
          className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-lg text-[11px] text-neutral-300 transition-colors my-1 w-fit max-w-full"
        >
          {isExploreStep ? (
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          ) : isCheckStep ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
          )}
          <span className="font-mono text-[10.5px] truncate">{cleanLabel}</span>
        </div>
      );
    } else {
      bufferText.push(line);
    }
  });

  flushBuffer('buffer-final');

  return (
    <div className="flex justify-start">
      <div className={`max-w-[95%] p-3.5 rounded-2xl text-xs ${
        message.isError 
          ? 'bg-red-950/30 text-red-300 border border-red-800/50' 
          : 'bg-[#111111] text-neutral-200 border border-neutral-800/80 shadow-sm'
      }`}>
        <div className="space-y-3">
          
          {/* Active File Coding Indicator */}
          {activeCodingFile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-lg">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
              />
              <FileCode className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-mono font-bold text-white">
                Coding <span className="underline">{activeCodingFile}</span>...
              </span>
            </div>
          )}

          {/* v0 / Bolt Style Reasoning Thought Accordion */}
          {thoughtText && (
            <div className="border border-neutral-800 bg-neutral-950/60 rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setIsThoughtOpen(prev => !prev)}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-neutral-900/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="text-[11px] font-medium text-neutral-300 font-mono">
                    {message.status === 'generating' ? 'Reasoning & Planning Architecture...' : 'Thought for a moment'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500 group-hover:text-neutral-300 text-[10px] font-mono">
                  <span>{isThoughtOpen ? 'Hide' : 'Show'}</span>
                  {isThoughtOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isThoughtOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-neutral-900 bg-black/80 px-3 py-2.5"
                  >
                    <div className="text-[10px] font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed select-text">
                      {thoughtText}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Main Structured Response Elements & Steps */}
          {renderedElements.length > 0 ? (
            <div className="space-y-2">
              {renderedElements}
              {message.status === 'generating' && (
                <motion.span 
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-1.5 h-3.5 bg-white ml-1 font-mono align-middle"
                />
              )}
            </div>
          ) : message.status === 'generating' ? (
            <div className="flex items-center gap-2 text-neutral-400 text-xs py-1">
              <motion.span 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-1.5 h-3.5 bg-white font-mono"
              />
              <span className="animate-pulse text-[11px]">Reasoning architecture & exemplars...</span>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};

export default AiMessageItem;
