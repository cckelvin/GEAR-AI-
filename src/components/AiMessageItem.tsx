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
  Code2,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  Palette,
  Globe,
  Braces,
  Terminal
} from 'lucide-react';
import { Message } from '../types';

export interface ExtractedFileItem {
  fileName: string;
  dirName: string;
  baseName: string;
  language: string;
  isPatch: boolean;
  content: string;
  lineCount: number;
  isGenerating?: boolean;
}

interface AiMessageItemProps {
  message: Message;
  activeCodingFile?: string;
  onApplyCode?: (fileName: string, code: string) => void;
  onOpenFile?: (fileName: string) => void;
}

function getFileVisualInfo(fileName: string, isPatch?: boolean) {
  const lower = fileName.toLowerCase();
  
  if (lower.endsWith('.py')) {
    return {
      icon: Terminal,
      badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      typeLabel: 'Python'
    };
  }
  if (lower.includes('vite.config')) {
    return {
      icon: Zap,
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      typeLabel: 'Vite Config'
    };
  }
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return {
      icon: Globe,
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      typeLabel: 'HTML'
    };
  }
  if (lower.endsWith('.css') || lower.endsWith('.scss')) {
    return {
      icon: Palette,
      badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      typeLabel: 'CSS'
    };
  }
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) {
    return {
      icon: Code2,
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      typeLabel: isPatch ? 'TS Patch' : 'TypeScript'
    };
  }
  if (lower.endsWith('.json')) {
    return {
      icon: Braces,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      typeLabel: lower === 'package.json' ? 'Node Pkg' : 'JSON'
    };
  }
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) {
    return {
      icon: Terminal,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      typeLabel: 'Shell'
    };
  }
  if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs')) {
    return {
      icon: Code2,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      typeLabel: isPatch ? 'JS Patch' : 'JavaScript'
    };
  }

  return {
    icon: FileCode,
    badgeColor: 'text-neutral-400 bg-neutral-800 border-neutral-700',
    typeLabel: isPatch ? 'Patch' : 'Module'
  };
}

interface FileCardProps {
  file: ExtractedFileItem;
  onOpen: () => void;
  onApply?: () => void;
}

const FileGridCard: React.FC<FileCardProps> = ({ file, onOpen, onApply }) => {
  const [isPeeking, setIsPeeking] = useState(false);
  const [copied, setCopied] = useState(false);

  const visual = getFileVisualInfo(file.fileName, file.isPatch);
  const IconComponent = visual.icon;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.content) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div 
      className="bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-2.5 transition-all flex flex-col justify-between shadow-sm group"
    >
      <div>
        {/* Card Header: Icon, Type Badge, and Status */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={`p-1 rounded-md border shrink-0 ${visual.badgeColor}`}>
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${visual.badgeColor}`}>
              {visual.typeLabel}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {file.isGenerating ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[9.5px] font-mono font-medium animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Writing...
              </span>
            ) : file.isPatch ? (
              <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded text-[9.5px] font-mono">
                Patch
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-neutral-950 border border-neutral-800 text-neutral-400 rounded text-[9.5px] font-mono">
                {file.lineCount} lines
              </span>
            )}
          </div>
        </div>

        {/* File Path Breakdown */}
        <div 
          onClick={onOpen}
          className="cursor-pointer select-none py-0.5 group/path"
          title={`Click to open ${file.fileName} in editor`}
        >
          {file.dirName && (
            <div className="text-[10px] text-neutral-500 font-mono truncate leading-tight">
              {file.dirName}
            </div>
          )}
          <div className="text-xs font-mono font-semibold text-white truncate group-hover/path:text-white transition-colors">
            {file.baseName}
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-neutral-800/80">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-200 text-black rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Code2 className="w-3 h-3 text-black" />
          <span>Open in Editor</span>
        </button>

        <div className="flex items-center gap-1">
          {file.content && (
            <>
              <button
                type="button"
                onClick={() => setIsPeeking(prev => !prev)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isPeeking 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/80'
                }`}
                title={isPeeking ? "Hide code peek" : "Quick peek code"}
              >
                {isPeeking ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-md transition-colors cursor-pointer"
                title="Copy file code"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Optional In-Card Collapsible Quick Peek */}
      <AnimatePresence>
        {isPeeking && file.content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mt-2 pt-2 border-t border-neutral-800/80"
          >
            <div className="bg-black/90 rounded-lg max-h-56 overflow-y-auto custom-scrollbar border border-neutral-800/80 text-[10px] font-mono flex">
              {/* Line numbers column */}
              <div className="bg-neutral-950/90 border-r border-neutral-800/80 py-2.5 px-2.5 select-none text-right text-neutral-600 shrink-0 font-mono">
                {file.content.split('\n').map((_, i) => (
                  <div key={i} className="h-[18px] leading-[18px] min-w-[1.25rem]">{i + 1}</div>
                ))}
              </div>
              {/* Code content column */}
              <div className="flex-1 overflow-x-auto py-2.5 px-3 custom-scrollbar">
                <pre className="text-neutral-300 font-mono whitespace-pre">
                  {file.content.split('\n').map((line, i) => (
                    <div key={i} className="h-[18px] leading-[18px]">{line || ' '}</div>
                  ))}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AiMessageItem: React.FC<AiMessageItemProps> = ({
  message,
  activeCodingFile,
  onApplyCode,
  onOpenFile
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
  let rawText = message.text || '';

  const thoughtMatch = rawText.match(/<thought>([\s\S]*?)(?:<\/thought>|$)/i);
  if (thoughtMatch) {
    thoughtText = thoughtMatch[1].trim();
    rawText = rawText.replace(/<thought>[\s\S]*?(?:<\/thought>|$)/i, '').trim();
  }

  // 1. EXTRACT ALL FILES FROM CODE BLOCKS (so code is NEVER dropped into the conversation)
  const filesMap = new Map<string, ExtractedFileItem>();

  // Helper to register an extracted file
  const registerFile = (fileName: string, content: string, language = '', isPatch = false) => {
    const cleanName = fileName.trim().replace(/^['"`]+|['"`]+$/g, '');
    if (!cleanName || cleanName.includes(' ') || cleanName.length < 2) return;

    const parts = cleanName.split('/');
    const baseName = parts.pop() || cleanName;
    const dirName = parts.length > 0 ? parts.join('/') + '/' : '';
    const lineCount = content.trim().split(/\r?\n/).length;

    filesMap.set(cleanName, {
      fileName: cleanName,
      dirName,
      baseName,
      language,
      isPatch,
      content,
      lineCount
    });
  };

  // Match standard labeled code blocks: ```lang:path/to/file.ext\n[code]```
  const codeBlockRegex = /```(\w+)?(?::([^\n\r]+))\r?\n([\s\S]*?)(?:```|$)/g;
  let match;
  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const lang = match[1] || '';
    const fileName = match[2];
    const code = match[3] || '';
    const isPatch = lang === 'patch' || lang === 'diff' || (code.includes('<<<<<<< SEARCH') && code.includes('======='));
    if (fileName) {
      registerFile(fileName, code, lang, isPatch);
    }
  }

  // Match FILE: path/to/file tags
  const fileTagRegex = /FILE:\s*([a-zA-Z0-9._\-/]+)\r?\n([\s\S]*?)(?=FILE:|$|```)/g;
  while ((match = fileTagRegex.exec(rawText)) !== null) {
    const fileName = match[1];
    const code = match[2] || '';
    const isPatch = code.includes('<<<<<<< SEARCH') && code.includes('=======');
    if (fileName) {
      registerFile(fileName, code, '', isPatch);
    }
  }

  // Also check if any generic code block starts with a filename comment (e.g. // src/components/navbar.js)
  const commentFileRegex = /```(\w+)?\r?\n(?:\/\/|\/\*|<!--|#)\s*([a-zA-Z0-9._\-/]+\.[a-zA-Z0-9]+)[\s\S]*?\r?\n([\s\S]*?)(?:```|$)/g;
  while ((match = commentFileRegex.exec(rawText)) !== null) {
    const lang = match[1] || '';
    const fileName = match[2];
    const code = match[3] || '';
    const isPatch = lang === 'patch' || (code.includes('<<<<<<< SEARCH') && code.includes('======='));
    if (fileName && !filesMap.has(fileName)) {
      registerFile(fileName, code, lang, isPatch);
    }
  }

  // Also capture any generic unnamed code blocks and map them to their corresponding runtime file
  const genericCodeBlockRegex = /```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)(?:```|$)/g;
  let genericMatch;
  let unnamedCount = 1;
  while ((genericMatch = genericCodeBlockRegex.exec(rawText)) !== null) {
    const rawTag = (genericMatch[1] || '').trim().toLowerCase();
    // Skip if it contains colon or already processed
    if (rawTag.includes(':')) continue;
    const code = genericMatch[2] || '';
    if (!code.trim()) continue;

    // Check if this code content was already captured by one of the files
    const alreadyCaptured = Array.from(filesMap.values()).some(f => f.content.trim() === code.trim());
    if (alreadyCaptured) continue;

    let inferredName = '';
    if (rawTag === 'html') inferredName = 'index.html';
    else if (rawTag === 'css') inferredName = 'styles.css';
    else if (rawTag === 'python' || rawTag === 'py') inferredName = 'main.py';
    else if (rawTag === 'javascript' || rawTag === 'js') inferredName = 'main.js';
    else if (rawTag === 'typescript' || rawTag === 'ts') inferredName = 'src/main.ts';
    else if (rawTag === 'tsx') inferredName = 'src/App.tsx';
    else if (rawTag === 'jsx') inferredName = 'src/App.jsx';
    else if (rawTag === 'json') inferredName = 'package.json';
    else if (rawTag === 'sh' || rawTag === 'bash') inferredName = 'run.sh';
    else inferredName = `module_${unnamedCount++}.${rawTag || 'txt'}`;

    let finalName = inferredName;
    let counter = 2;
    while (filesMap.has(finalName)) {
      const dotIndex = inferredName.lastIndexOf('.');
      if (dotIndex !== -1) {
        finalName = `${inferredName.slice(0, dotIndex)}_${counter++}${inferredName.slice(dotIndex)}`;
      } else {
        finalName = `${inferredName}_${counter++}`;
      }
    }

    const isPatch = rawTag === 'patch' || (code.includes('<<<<<<< SEARCH') && code.includes('======='));
    registerFile(finalName, code, rawTag, isPatch);
  }

  // Include activeCodingFile if AI is currently streaming code for it
  if (activeCodingFile && !filesMap.has(activeCodingFile)) {
    const parts = activeCodingFile.split('/');
    const baseName = parts.pop() || activeCodingFile;
    const dirName = parts.length > 0 ? parts.join('/') + '/' : '';
    filesMap.set(activeCodingFile, {
      fileName: activeCodingFile,
      dirName,
      baseName,
      language: '',
      isPatch: false,
      content: '',
      lineCount: 0,
      isGenerating: true
    });
  } else if (activeCodingFile && filesMap.has(activeCodingFile) && message.status === 'generating') {
    const item = filesMap.get(activeCodingFile)!;
    item.isGenerating = true;
  }

  const filesList = Array.from(filesMap.values());

  // 2. STRIP ALL MULTI-LINE CODE BLOCKS FROM CONVERSATION TEXT
  // User directive: "instead of also dropping code in conversation only grid should be shown for each file"
  let cleanConversationText = rawText
    .replace(/```[\s\S]*?(?:```|$)/g, '')
    .replace(/FILE:\s*[a-zA-Z0-9._\-/]+\r?\n[\s\S]*?(?=FILE:|$|```)/g, '')
    .trim();

  // If text is empty because response was pure code, provide a neat intro
  if (!cleanConversationText && filesList.length > 0) {
    cleanConversationText = `Built application across ${filesList.length} workspace file${filesList.length > 1 ? 's' : ''}:`;
  }

  // 3. Parse lines to identify v0 / bolt-like step badges
  const lines = cleanConversationText ? cleanConversationText.split('\n') : [];
  const renderedElements: React.ReactNode[] = [];
  let bufferText: string[] = [];

  const flushBuffer = (key: string) => {
    if (bufferText.length > 0) {
      const textBlock = bufferText.join('\n').trim();
      if (textBlock) {
        renderedElements.push(
          <div key={key} className="markdown-body text-xs text-neutral-200 leading-relaxed">
            <Markdown>{textBlock}</Markdown>
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
      
      const cleanLabel = trimmed
        .replace(/^[📄📝🔍✓✔✅•\s]+/, '')
        .replace(/^\[step:\s*([^\]]+)\]/i, '$1')
        .trim();

      renderedElements.push(
        <div 
          key={`step-${idx}`}
          className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-lg text-[11px] text-neutral-300 transition-colors my-1 w-fit max-w-full shadow-sm"
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

  const handleOpenFile = (fileName: string, content: string) => {
    if (onOpenFile) {
      onOpenFile(fileName);
    } else if (onApplyCode) {
      onApplyCode(fileName, content);
    }
  };

  return (
    <div className="flex justify-start">
      <div className={`max-w-[96%] sm:max-w-[92%] p-3.5 rounded-2xl text-xs ${
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

          {/* Reasoning Thought Accordion */}
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

          {/* Conversational Explanation & Steps (NO raw code dropped here) */}
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
              <span className="animate-pulse text-[11px]">Architecting modular files...</span>
            </div>
          ) : null}

          {/* DEDICATED FILE GRID: Only grid is shown for each file */}
          {filesList.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-neutral-800/80">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-300">
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Workspace Files ({filesList.length})</span>
                </div>
                <span className="text-[9.5px] text-neutral-500 font-mono">
                  Click card to open in editor
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filesList.map((file) => (
                  <FileGridCard
                    key={file.fileName}
                    file={file}
                    onOpen={() => handleOpenFile(file.fileName, file.content)}
                    onApply={() => onApplyCode?.(file.fileName, file.content)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AiMessageItem;
