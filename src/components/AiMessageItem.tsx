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
  Terminal,
  Loader2,
  Clock
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
  
  if (lower.endsWith('.html')) {
    return {
      icon: Globe,
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      typeLabel: 'HTML'
    };
  }
  if (lower.endsWith('.css')) {
    return {
      icon: Palette,
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      typeLabel: 'CSS'
    };
  }
  if (lower.endsWith('.json')) {
    return {
      icon: Braces,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      typeLabel: 'JSON'
    };
  }
  if (lower.endsWith('.js') || lower.endsWith('.mjs')) {
    return {
      icon: FileCode,
      badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      typeLabel: 'JavaScript'
    };
  }
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) {
    return {
      icon: Code2,
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      typeLabel: 'TypeScript'
    };
  }
  
  return {
    icon: isPatch ? Sparkles : FileCode,
    badgeColor: isPatch 
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
      : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    typeLabel: isPatch ? 'Patch' : 'Module'
  };
}

interface StepItemData {
  id: string;
  iconType: 'file' | 'clock' | 'search' | 'check';
  label: string;
  fileName?: string;
  content?: string;
}

// Collapsible Step Group Component
const StepGroup: React.FC<{
  steps: StepItemData[];
  onOpenFile?: (fileName: string) => void;
}> = ({ steps, onOpenFile }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (steps.length === 0) return null;

  // If only 1 step, render the single row directly
  if (steps.length === 1) {
    const step = steps[0];
    return (
      <div 
        onClick={() => step.fileName && onOpenFile?.(step.fileName)}
        className="flex items-center justify-between gap-3 px-3 py-2 bg-neutral-900/80 hover:bg-neutral-800/90 border border-neutral-800/80 hover:border-neutral-700/80 rounded-xl text-xs text-neutral-200 transition-all cursor-pointer group shadow-sm my-1 max-w-xl"
      >
        <div className="flex items-center gap-2 min-w-0">
          {step.iconType === 'clock' ? (
            <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          ) : step.iconType === 'search' ? (
            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          ) : step.iconType === 'check' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          )}
          <span className="font-mono text-[11.5px] truncate text-neutral-300 group-hover:text-white">
            {step.label}
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors shrink-0" />
      </div>
    );
  }

  // Multiple steps: show "N steps >" collapsible button
  return (
    <div className="my-1.5 space-y-1.5 max-w-xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 text-xs text-neutral-400 hover:text-neutral-200 transition-colors font-medium cursor-pointer group select-none shadow-sm"
      >
        <span className="font-mono text-[11.5px] font-medium">{steps.length} steps</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden space-y-1.5 pl-1.5 border-l border-neutral-800/80 my-1"
          >
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => step.fileName && onOpenFile?.(step.fileName)}
                className="flex items-center justify-between gap-3 px-3 py-1.5 bg-neutral-900/70 hover:bg-neutral-800/80 border border-neutral-800/70 rounded-xl text-xs text-neutral-300 hover:text-white transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {step.iconType === 'clock' ? (
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  ) : step.iconType === 'check' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  )}
                  <span className="font-mono text-[11px] truncate">{step.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-neutral-500 group-hover:text-neutral-300 shrink-0" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// File Grid Card
const FileGridCard: React.FC<{
  file: ExtractedFileItem;
  onOpen: () => void;
  onApply?: () => void;
}> = ({ file, onOpen, onApply }) => {
  const visual = getFileVisualInfo(file.fileName, file.isPatch);
  const IconComponent = visual.icon;
  const [copied, setCopied] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

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
      onClick={onOpen}
      className="group relative flex flex-col p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all cursor-pointer shadow-sm text-left select-none"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-lg border shrink-0 ${visual.badgeColor}`}>
            <IconComponent className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.5px] font-mono font-medium text-neutral-200 group-hover:text-white truncate">
              {file.baseName}
            </div>
            {file.dirName && (
              <div className="text-[9.5px] font-mono text-neutral-500 truncate -mt-0.5">
                {file.dirName}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPeeking(!isPeeking);
            }}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
            title={isPeeking ? "Hide preview" : "Peek code"}
          >
            {isPeeking ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isPeeking && file.content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mt-2 pt-2 border-t border-neutral-800"
          >
            <div className="bg-black/90 rounded-lg max-h-48 overflow-y-auto custom-scrollbar border border-neutral-800 p-2 text-[10px] font-mono text-neutral-300">
              <pre className="whitespace-pre overflow-x-auto">{file.content}</pre>
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
  const [showFilesGrid, setShowFilesGrid] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] sm:max-w-[80%] p-3.5 rounded-2xl text-xs bg-neutral-800/90 text-white border border-neutral-700/80 shadow-md whitespace-pre-wrap leading-relaxed">
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

  // 1. EXTRACT ALL FILES FROM CODE BLOCKS
  const filesMap = new Map<string, ExtractedFileItem>();

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

  // Match labeled code blocks: ```lang:path/to/file.ext\n[code]```
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

  // Match filename comments e.g. // path/to/file.ext
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

  // Generic blocks
  const genericCodeBlockRegex = /```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)(?:```|$)/g;
  let genericMatch;
  let unnamedCount = 1;
  while ((genericMatch = genericCodeBlockRegex.exec(rawText)) !== null) {
    const rawTag = (genericMatch[1] || '').trim().toLowerCase();
    if (rawTag.includes(':')) continue;
    const code = genericMatch[2] || '';
    if (!code.trim()) continue;

    const alreadyCaptured = Array.from(filesMap.values()).some(f => f.content.trim() === code.trim());
    if (alreadyCaptured) continue;

    let inferredName = '';
    if (rawTag === 'html') inferredName = 'index.html';
    else if (rawTag === 'css') inferredName = 'styles.css';
    else if (rawTag === 'javascript' || rawTag === 'js') inferredName = 'main.js';
    else if (rawTag === 'typescript' || rawTag === 'ts') inferredName = 'main.js';
    else if (rawTag === 'json') inferredName = 'data.json';
    else inferredName = `script_${unnamedCount++}.${rawTag || 'js'}`;

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

  const filesList = Array.from(filesMap.values());

  // 2. PARSE CONVERSATION FLOW (matching the user's reference Claude-like chat UI)
  // Strip code blocks and scope declaration disclaimers out of conversational flow
  let cleanConversationText = rawText
    .replace(/```[\s\S]*?(?:```|$)/g, '')
    .replace(/FILE:\s*[a-zA-Z0-9._\-/]+\r?\n[\s\S]*?(?=FILE:|$|```)/g, '')
    .replace(/^[#*\s]*Scope\s+Declaration[^\n]*\n?/gim, '')
    .replace(/^[#*\s]*Scope\s*:\s*[^\n]*\n?/gim, '')
    .trim();

  const lines = cleanConversationText ? cleanConversationText.split('\n') : [];
  const conversationBlocks: React.ReactNode[] = [];
  let currentTextLines: string[] = [];
  let currentStepGroup: StepItemData[] = [];

  const flushTextLines = (key: string) => {
    if (currentTextLines.length > 0) {
      const block = currentTextLines.join('\n').trim();
      if (block) {
        conversationBlocks.push(
          <div key={key} className="markdown-body text-[13px] text-neutral-300 leading-relaxed space-y-2 select-text">
            <Markdown>{block}</Markdown>
          </div>
        );
      }
      currentTextLines = [];
    }
  };

  const flushStepGroup = (key: string) => {
    if (currentStepGroup.length > 0) {
      const stepsToRender = [...currentStepGroup];
      conversationBlocks.push(
        <StepGroup
          key={key}
          steps={stepsToRender}
          onOpenFile={onOpenFile}
        />
      );
      currentStepGroup = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check if line is an explicit step marker
    const isStepMarker = /^\[step:\s*([^\]]+)\]/i.test(trimmed) || 
      trimmed.startsWith('📄') || 
      trimmed.startsWith('⏱️') || 
      trimmed.startsWith('✓') || 
      trimmed.startsWith('✅') || 
      /^•\s*(Creating|Building|Setting up|Writing)\s+/i.test(trimmed);

    // Check if line represents an explicit "N steps >" pattern from text
    const isStepSummaryMarker = /^(\d+)\s+steps\s*>/i.test(trimmed);

    if (isStepMarker) {
      flushTextLines(`text-${idx}`);
      const cleanLabel = trimmed
        .replace(/^\[step:\s*([^\]]+)\]/i, '$1')
        .replace(/^[📄⏱️✓✅•\s]+/, '')
        .replace(/>\s*$/, '')
        .trim();

      const iconType = trimmed.startsWith('⏱️') ? 'clock' : (trimmed.startsWith('✓') || trimmed.startsWith('✅')) ? 'check' : 'file';

      // Find matching file if any
      const matchingFile = filesList.find(f => cleanLabel.toLowerCase().includes(f.fileName.toLowerCase()) || cleanLabel.toLowerCase().includes(f.baseName.toLowerCase()));

      currentStepGroup.push({
        id: `step-${idx}`,
        iconType,
        label: cleanLabel,
        fileName: matchingFile?.fileName
      });
    } else if (isStepSummaryMarker) {
      // Handled automatically via grouped steps
      flushTextLines(`text-${idx}`);
    } else {
      // Natural transition or narrative line
      if (currentStepGroup.length > 0) {
        flushStepGroup(`group-${idx}`);
      }
      currentTextLines.push(line);
    }
  });

  flushTextLines('text-final');
  flushStepGroup('group-final');

  // If there are files discovered from code blocks that were not explicitly mentioned as steps, add them to a step group
  if (filesList.length > 0 && conversationBlocks.length <= 1) {
    const fileSteps: StepItemData[] = filesList.map((f, i) => ({
      id: `file-step-${i}`,
      iconType: 'file',
      label: `Creating ${f.fileName}`,
      fileName: f.fileName,
      content: f.content
    }));
    
    conversationBlocks.push(
      <StepGroup
        key="extracted-file-steps"
        steps={fileSteps}
        onOpenFile={onOpenFile}
      />
    );
  }

  return (
    <div className="flex justify-start w-full">
      <div className={`w-full max-w-[96%] sm:max-w-[92%] p-4 sm:p-5 rounded-2xl text-xs transition-all ${
        message.isError 
          ? 'bg-red-950/20 text-red-300 border border-red-800/40' 
          : 'bg-[#141416] text-neutral-200 border border-neutral-800/80 shadow-md'
      }`}>
        <div className="space-y-3.5">
          
          {/* Active Coding File Indicator */}
          {activeCodingFile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-md">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
              />
              <FileCode className="w-3.5 h-3.5 text-white" />
              <span className="text-[10.5px] font-mono font-bold text-white">
                Coding <span className="underline">{activeCodingFile}</span>...
              </span>
            </div>
          )}

          {/* Reasoning Thought Accordion */}
          {thoughtText && (
            <div className="border border-neutral-800/80 bg-neutral-950/60 rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setIsThoughtOpen(prev => !prev)}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-neutral-900/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                  <span className="text-[11px] font-medium text-neutral-300 font-mono">
                    {message.status === 'generating' ? 'Reasoning Architecture...' : 'Thought process'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-neutral-500 group-hover:text-neutral-300 text-[10px] font-mono">
                  <span>{isThoughtOpen ? 'Hide' : 'Show'}</span>
                  {isThoughtOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {isThoughtOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-t border-neutral-800/80 bg-black/80 px-3 py-2.5"
                  >
                    <div className="text-[10.5px] font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed select-text">
                      {thoughtText}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Claude-Style Conversational Blocks */}
          <div className="space-y-3">
            {conversationBlocks}
          </div>

          {/* In-Progress "Still working on it..." Loader */}
          {message.status === 'generating' && (
            <div className="flex items-center gap-2.5 text-neutral-400 text-xs py-1.5 font-medium select-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                className="w-4 h-4 text-neutral-400 shrink-0"
              >
                <Loader2 className="w-4 h-4 text-neutral-400" />
              </motion.div>
              <span className="text-[12px] text-neutral-400 font-sans tracking-tight">
                Still working on it...
              </span>
            </div>
          )}

          {/* Optional Workspace Files Grid Toggle */}
          {filesList.length > 0 && (
            <div className="pt-2 border-t border-neutral-800/60">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowFilesGrid(!showFilesGrid)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer select-none"
                >
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Workspace Files ({filesList.length})</span>
                  {showFilesGrid ? (
                    <ChevronDown className="w-3 h-3 text-neutral-500" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-neutral-500" />
                  )}
                </button>
                <span className="text-[9.5px] text-neutral-500 font-mono">
                  Click step or card to open
                </span>
              </div>

              <AnimatePresence>
                {showFilesGrid && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    {filesList.map((file) => (
                      <FileGridCard
                        key={file.fileName}
                        file={file}
                        onOpen={() => onOpenFile ? onOpenFile(file.fileName) : onApplyCode?.(file.fileName, file.content)}
                        onApply={() => onApplyCode?.(file.fileName, file.content)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AiMessageItem;
