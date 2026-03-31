/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Hammer, 
  Play, 
  MoreVertical, 
  Settings, 
  Lightbulb, 
  ChevronRight, 
  ArrowUp,
  Circle,
  Puzzle,
  Layout,
  Code,
  FileCode,
  Loader2,
  ArrowLeft,
  Download,
  History,
  ToggleRight,
  ToggleLeft,
  Globe,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
  X,
  Square,
  Send,
  MessageSquare,
  ChevronLeft,
  Maximize2,
  Terminal,
  Eye,
  Menu,
  Mic,
  RotateCcw,
  Zap,
  Search,
  Box,
  Cpu,
  Layers,
  Scan,
  FilePlus,
  Share2,
  Library,
  Puzzle as PluginIcon,
  Cpu as BuiltInIcon,
  CheckCircle2,
  User,
  Phone,
  Lock,
  Mail,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { generateCodeResponse, generateCodeResponseStream } from './services/gemini';
import { supabase, isSupabaseConfigured } from './lib/supabase';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  type?: 'text' | 'step' | 'file';
  status?: 'loading' | 'generating' | 'done';
  code?: string;
  fileName?: string;
  groundingSources?: { title: string, uri: string }[];
  isError?: boolean;
};

type Project = {
  id: string;
  name: string;
  updatedAt: string;
  deploymentUrl?: string;
};

type FileData = {
  name: string;
  content: string;
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'chat' | 'dashboard' | 'editor' | 'integrations' | 'auth'>('landing');
  const [authStep, setAuthStep] = useState<'signup' | 'otp' | 'login'>('signup');
  const [session, setSession] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showShelf, setShowShelf] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [integrationsTab, setIntegrationsTab] = useState<'builtin' | 'plugins'>('builtin');
  const [configuringIntegration, setConfiguringIntegration] = useState<string | null>(null);
  const [integrationFields, setIntegrationFields] = useState<Record<string, string>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>({ id: '0', name: 'UNTITLED PROJECT', updatedAt: 'Just now' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [images, setImages] = useState<{ data: string; mimeType: string }[]>([]);

  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [codingFile, setCodingFile] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  const handleNewProject = () => {
    const newProject: Project = {
      id: generateId(),
      name: 'NEW PROJECT ' + (projects.length + 1),
      updatedAt: 'Just now'
    };
    setProjects([newProject, ...projects]);
    setCurrentProject(newProject);
    setMessages([]);
    setFiles([
      { name: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Project</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-gray-50 text-gray-900 font-sans">\n  <div id="app" class="p-8">\n    <h1 class="text-4xl font-black tracking-tighter mb-4">Hello World</h1>\n    <p class="text-gray-500">Welcome to your new Gear Studio project.</p>\n  </div>\n</body>\n</html>' }
    ]);
    setActiveFileIndex(0);
    setCurrentPage('chat');
    setShowPreview(false);
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(projects.filter(p => p.id !== id));
    if (currentProject.id === id) {
      setCurrentProject(projects[0] || { id: '0', name: 'NO PROJECT', updatedAt: '' });
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
      setAuthStep('otp');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const { error, data: { session } } = await supabase.auth.verifyOtp({
        email: authEmail,
        token: authOtp,
        type: 'signup',
      });
      if (error) throw error;
      setSession(session);
      setCurrentPage('chat');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) throw error;
      setCurrentPage('chat');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentPage('landing');
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    
    // Auto-connect waveDB if environment variables are present
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setConnectedIntegrations(prev => prev.includes('wavedb') ? prev : [...prev, 'wavedb']);
    }
    
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { 
          data: (reader.result as string).split(',')[1], 
          mimeType: file.type 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const [aiMode, setAiMode] = useState<'fast' | 'complex'>('complex');
  const [combinedCode, setCombinedCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleApplyCode = (fileName: string, content: string) => {
    const index = files.findIndex(f => f.name === fileName);
    if (index > -1) {
      const newFiles = [...files];
      newFiles[index] = { ...newFiles[index], content: content.trim() };
      setFiles(newFiles);
      setActiveFileIndex(index);
    } else {
      const newFiles = [...files, { name: fileName, content: content.trim() }];
      setFiles(newFiles);
      setActiveFileIndex(newFiles.length - 1);
    }
    setCurrentPage('editor');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSyncing(true);
      const htmlFile = files.find(f => f.name === 'index.html');
      let html = htmlFile?.content || '<div id="root"></div>';
      
      // Extract body content if index.html is a full document
      let bodyContent = html;
      let headContent = '';
      
      if (html.includes('<head')) {
        const headMatch = html.match(/<head[^>]*>([\s\S]*)<\/head>/i);
        if (headMatch) headContent = headMatch[1];
      }
      
      if (html.includes('<body')) {
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) bodyContent = bodyMatch[1];
      }

      // Collect all CSS files
      const cssFiles = files.filter(f => f.name.endsWith('.css'));
      const cssContent = cssFiles.map(f => `/* ${f.name} */\n${f.content}`).join('\n\n');

      // Collect all JS files as modules
      const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts'));
      const scripts = jsFiles.map(f => `
        <script type="module" data-filename="${f.name}">
          ${f.content}
        </script>
      `).join('\n');

      const combined = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/lucide@latest"></script>
            ${headContent}
            <style>
              ${cssContent}
              body { margin: 0; padding: 0; background: #000; color: #fff; min-height: 100vh; }
              #root { min-height: 100vh; }
              .markdown-body { color: inherit; }
            </style>
          </head>
          <body>
            ${bodyContent}
            ${scripts}
            <script type="module">
              // Initialize Lucide icons
              const initLucide = () => {
                if (window.lucide && typeof window.lucide.createIcons === 'function') {
                  window.lucide.createIcons();
                }
              };

              if (document.readyState === 'complete') {
                initLucide();
              } else {
                window.addEventListener('load', initLucide);
              }

              // Also watch for DOM changes to re-initialize icons
              const observer = new MutationObserver((mutations) => {
                // Throttled re-init
                if (window.lucideTimeout) clearTimeout(window.lucideTimeout);
                window.lucideTimeout = setTimeout(initLucide, 100);
              });
              observer.observe(document.body, { childList: true, subtree: true });
            </script>
          </body>
        </html>
      `;
      setCombinedCode(combined);
      setTimeout(() => setIsSyncing(false), 800);
    }, 1000);
    return () => clearTimeout(timer);
  }, [files]);

  const handleDeploy = async () => {
    if (files.length === 0) return;
    if (currentProject.deploymentUrl) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `⚠️ **Deployment already exists for this project.**\n\nYou can view it here: [${currentProject.deploymentUrl}](${currentProject.deploymentUrl})\n\nTo prevent unnecessary costs and multiple links, Gear Studio only allows one deployment per project.`,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentPage('chat');
      return;
    }
    setIsDeploying(true);
    setShowDeployModal(false);
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentProject.name.toLowerCase().replace(/\s+/g, '-'),
          files: files
        })
      });
      const data = await response.json();
      if (response.ok) {
        const deploymentUrl = data.url;
        const aiMessage: Message = {
          id: generateId(),
          role: 'ai',
          text: `🚀 **Project deployed successfully!**\n\nYour project is live at: [${deploymentUrl}](${deploymentUrl})\n\nInspect deployment: [Vercel Dashboard](${data.inspectUrl})`,
          status: 'done'
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Update current project and projects list with deployment URL
        const updatedProject = { ...currentProject, deploymentUrl };
        setCurrentProject(updatedProject);
        setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
        
        setCurrentPage('chat');
      } else {
        throw new Error(data.error || 'Deployment failed');
      }
    } catch (error: any) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `❌ **Deployment failed**\n\n${error.message}`,
        isError: true,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentPage('chat');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && images.length === 0) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsGenerating(true);
    setShowPreview(false);
    const aiMessageId = generateId();

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));
      
      const stream = await generateCodeResponseStream(currentInput, history, images, files);
      let fullResponse = "";
      
      // Add initial AI message
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'ai',
        text: '',
        status: 'generating'
      }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (!chunkText) continue;
        
        fullResponse += chunkText;
        
        // 1. Update Chat Text (filter out code blocks)
        let currentChatText = fullResponse.replace(/```[\s\S]*?(?:```|$)/g, '').trim();
        setMessages(prev => prev.map(m => 
          m.id === aiMessageId ? { ...m, text: currentChatText || "Generating..." } : m
        ));

        // 2. Incremental File Parsing
        const codeBlockRegex = /```(\w+)?(?::([a-zA-Z0-9._\-/]+))?\n([\s\S]*?)(?:```|$)/g;
        const fileTagRegex = /FILE:\s*([a-zA-Z0-9._-]+)\n([\s\S]*?)(?=FILE:|$|```)/g;
        
        let currentFiles = [...files];
        let activeCodingFile = "";

        // Parse code blocks
        let blockMatch;
        while ((blockMatch = codeBlockRegex.exec(fullResponse)) !== null) {
          const fileName = blockMatch[2];
          const content = blockMatch[3].trim();
          
          if (fileName) {
            activeCodingFile = fileName;
            const index = currentFiles.findIndex(f => f.name === fileName);
            if (index > -1) {
              currentFiles[index] = { ...currentFiles[index], content };
            } else {
              currentFiles.push({ name: fileName, content });
            }
          }
        }

        // Parse FILE: tags
        let tagMatch;
        while ((tagMatch = fileTagRegex.exec(fullResponse)) !== null) {
          const fileName = tagMatch[1].trim();
          const content = tagMatch[2].trim();
          
          if (fileName) {
            activeCodingFile = fileName;
            const index = currentFiles.findIndex(f => f.name === fileName);
            if (index > -1) {
              currentFiles[index] = { ...currentFiles[index], content };
            } else {
              currentFiles.push({ name: fileName, content });
            }
          }
        }

        if (activeCodingFile) {
          setFiles(currentFiles);
          setCodingFile(activeCodingFile);
          const newIndex = currentFiles.findIndex(f => f.name === activeCodingFile);
          if (newIndex > -1) {
            setActiveFileIndex(newIndex);
            setCurrentPage('editor');
          }
        }
      }

      setCodingFile(null);

      // Final processing for project name
      if (currentProject.id === '0' && messages.length === 0) {
        setCurrentProject(prev => ({ ...prev, name: currentInput.toUpperCase().slice(0, 20) }));
      }

      let chatText = fullResponse.replace(/```[\s\S]*?```/g, '').trim();
      if (!chatText) chatText = "I've updated the project files in the editor.";

      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, text: chatText, status: 'done' } : m
      ));

    } catch (error: any) {
      console.error("Error generating code:", error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Handle the specific 429 and 403 error structures
      try {
        const errorData = typeof error === 'string' ? JSON.parse(error) : error;
        if (errorData?.error?.code === 429 || errorData?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429')) {
          errorMessage = "⚠️ Quota Exceeded: You've reached the limit for your Gemini API key. Please check your billing details or wait a moment before trying again. You can monitor usage at https://ai.dev/rate-limit.";
        } else if (errorData?.error?.code === 403 || errorData?.status === 'PERMISSION_DENIED' || error?.message?.includes('403')) {
          errorMessage = "⚠️ Permission Denied: The Gemini API key does not have permission to access the requested model or tool. This often happens on free-tier keys when using restricted features like Google Search.";
        } else if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        if (error?.message) errorMessage = error.message;
      }

      setMessages(prev => {
        const exists = prev.some(m => m.id === aiMessageId);
        if (exists) {
          return prev.map(m => m.id === aiMessageId ? { ...m, text: errorMessage, isError: true, status: 'done' } : m);
        }
        return [...prev, {
          id: generateId(),
          role: 'ai',
          text: errorMessage,
          isError: true,
          status: 'done'
        }];
      });
    } finally {
      setIsGenerating(false);
      setImages([]);
    }
  };

  const handleAnalyze = () => {
    if (images.length === 0) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: "Please upload an image first so I can analyze it for you! 📸",
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      return;
    }
    setInputValue("Analyze these images and tell me how I can implement them or improve my code based on them.");
    handleSendMessage();
  };

  if (currentPage === 'auth') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#111] border border-[#262626] rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <Box className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {authStep === 'signup' && 'Create Account'}
              {authStep === 'otp' && 'Verify Email'}
              {authStep === 'login' && 'Welcome Back'}
            </h2>
            <p className="text-gray-500 text-sm mt-2 text-center">
              {authStep === 'signup' && 'Join Gear Studio to start building.'}
              {authStep === 'otp' && `We've sent a 6-digit code to ${authEmail}`}
              {authStep === 'login' && 'Sign in to your account.'}
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-2 text-amber-400 text-xs">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-bold uppercase tracking-wider">Configuration Required</span>
              </div>
              <p className="leading-relaxed opacity-80">
                Supabase environment variables are missing. Please set <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your project settings to enable authentication and database features.
              </p>
            </div>
          )}

          {authStep === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isAuthLoading || !isSupabaseConfigured}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Already have an account? <button type="button" onClick={() => setAuthStep('login')} className="text-blue-400 hover:underline">Sign In</button>
              </p>
            </form>
          )}

          {authStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 text-center block">Verification Code</label>
                <input 
                  type="text" 
                  required
                  value={authOtp}
                  onChange={(e) => setAuthOtp(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl px-4 py-4 text-2xl text-center font-mono focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter Code"
                />
              </div>
              <button 
                type="submit"
                disabled={isAuthLoading || !isSupabaseConfigured}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
              </button>
              <button 
                type="button"
                onClick={() => setAuthStep('signup')}
                className="w-full text-xs text-gray-500 hover:text-white transition-colors"
              >
                Back to Sign Up
              </button>
            </form>
          )}

          {authStep === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="password" 
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isAuthLoading || !isSupabaseConfigured}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isAuthLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Don't have an account? <button type="button" onClick={() => setAuthStep('signup')} className="text-blue-400 hover:underline">Sign Up</button>
              </p>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#262626] flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage('landing')}
              className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Landing
            </button>
            <button 
              onClick={() => setCurrentPage('chat')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-2"
            >
              Skip for now
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentPage === 'integrations') {
    const integrations = {
      builtin: [
        { 
          id: 'wavedb', 
          name: 'waveDB', 
          desc: 'Built-in database powered by Supabase. Schema: users, projects, files, deployments.', 
          icon: <Box className="w-5 h-5 text-blue-500" />, 
          fields: [
            { label: 'Supabase URL', value: import.meta.env.VITE_SUPABASE_URL || '' },
            { label: 'Anon Key', value: import.meta.env.VITE_SUPABASE_ANON_KEY || '' }
          ] 
        },
        { 
          id: 'vercel', 
          name: 'Vercel', 
          desc: 'Deploy your projects directly to Vercel.', 
          icon: <Globe className="w-5 h-5" />, 
          fields: [
            { label: 'Vercel Token', value: import.meta.env.VERCEL_TOKEN || '' },
            { label: 'Team ID', value: import.meta.env.VERCEL_TEAM_ID || '' }
          ] 
        },
        { 
          id: 'gemini', 
          name: 'Gemini AI', 
          desc: 'Power your app with the latest Google AI models.', 
          icon: <Zap className="w-5 h-5 text-blue-400" />, 
          fields: [
            { label: 'Gemini API Key', value: import.meta.env.VITE_GEAR_API || '' }
          ] 
        },
        { id: 'lucide', name: 'Lucide Icons', desc: 'Access 1000+ beautiful icons out of the box.', icon: <PluginIcon className="w-5 h-5 text-purple-400" /> },
        { id: 'tailwind', name: 'Tailwind CSS', desc: 'Utility-first CSS framework for rapid UI development.', icon: <Layers className="w-5 h-5 text-cyan-400" /> }
      ],
      plugins: [
        { id: 'github', name: 'GitHub', desc: 'Sync your code with GitHub repositories.', icon: <Code className="w-5 h-5" />, fields: [{ label: 'Personal Access Token', value: '' }, { label: 'Repo Name', value: '' }] },
        { id: 'firebase', name: 'Firebase', desc: 'Add database, auth, and hosting to your app.', icon: <Box className="w-5 h-5 text-orange-400" />, fields: [{ label: 'Config JSON', value: '' }] },
        { id: 'stripe', name: 'Stripe', desc: 'Accept payments and manage subscriptions.', icon: <Circle className="w-5 h-5 text-indigo-400" />, fields: [{ label: 'Secret Key', value: '' }, { label: 'Webhook Secret', value: '' }] },
        { id: 'supabase', name: 'Supabase', desc: 'Open source Firebase alternative with Postgres.', icon: <Cpu className="w-5 h-5 text-emerald-400" />, fields: [{ label: 'Project URL', value: '' }, { label: 'Anon Key', value: '' }] }
      ]
    };

    const handleConnect = (id: string) => {
      const item = [...integrations.builtin, ...integrations.plugins].find(i => i.id === id);
      if (item?.fields) {
        setConfiguringIntegration(id);
      } else {
        toggleIntegration(id);
      }
    };

    const toggleIntegration = (id: string) => {
      if (connectedIntegrations.includes(id)) {
        setConnectedIntegrations(prev => prev.filter(i => i !== id));
      } else {
        setConnectedIntegrations(prev => [...prev, id]);
      }
      setConfiguringIntegration(null);
    };

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
        {/* Integrations Header */}
        <header className="h-16 border-b border-[#1A1A1A] flex items-center justify-between px-6 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-[60]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('editor')}
              className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Integrations</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowShelf(!showShelf)}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${showShelf ? 'bg-blue-600 text-white' : 'hover:bg-[#1A1A1A] text-gray-400'}`}
              title="Connected Integrations"
            >
              <Library className="w-5 h-5" />
              <span className="text-xs font-semibold">Shelf</span>
              {connectedIntegrations.length > 0 && (
                <span className="bg-white text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {connectedIntegrations.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Fixed Sub-navigation Bar */}
        {!showShelf && (
          <div className="h-12 border-b border-[#1A1A1A] bg-[#0A0A0A] sticky top-16 z-50 flex items-center px-8 gap-8">
            <button 
              onClick={() => setIntegrationsTab('builtin')}
              className={`text-xs font-bold uppercase tracking-widest transition-all relative h-full flex items-center ${integrationsTab === 'builtin' ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
            >
              Built-in
              {integrationsTab === 'builtin' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
            </button>
            <button 
              onClick={() => setIntegrationsTab('plugins')}
              className={`text-xs font-bold uppercase tracking-widest transition-all relative h-full flex items-center ${integrationsTab === 'plugins' ? 'text-purple-500' : 'text-gray-500 hover:text-white'}`}
            >
              Plug-in
              {integrationsTab === 'plugins' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
            </button>
          </div>
        )}

        <main className="flex-1 max-w-6xl mx-auto w-full p-8 space-y-12">
          {showShelf ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Connected Shelf</h2>
                <button onClick={() => setShowShelf(false)} className="text-xs text-blue-400 hover:underline">Back to all</button>
              </div>
              {connectedIntegrations.length === 0 ? (
                <div className="p-12 border border-dashed border-[#262626] rounded-2xl text-center">
                  <Library className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Your shelf is empty. Connect some integrations to see them here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...integrations.builtin, ...integrations.plugins]
                    .filter(i => connectedIntegrations.includes(i.id))
                    .map(item => (
                      <div key={item.id} className="p-6 bg-[#111] border border-[#262626] rounded-2xl flex items-start gap-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl">{item.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                          <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Active Tab Content */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${integrationsTab === 'builtin' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                    {integrationsTab === 'builtin' ? <BuiltInIcon className="w-5 h-5 text-blue-500" /> : <PluginIcon className="w-5 h-5 text-purple-500" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{integrationsTab === 'builtin' ? 'Built-in' : 'Plug-in'}</h2>
                    <p className="text-xs text-gray-500">
                      {integrationsTab === 'builtin' ? 'Core features that power Gear Studio projects.' : 'Extend your app with third-party services.'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations[integrationsTab].map(item => (
                    <div key={item.id} className={`group p-6 bg-[#111] border rounded-2xl transition-all ${configuringIntegration === item.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-[#262626] hover:border-gray-700'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl group-hover:scale-110 transition-transform">{item.icon}</div>
                        <button 
                          onClick={() => handleConnect(item.id)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${connectedIntegrations.includes(item.id) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                          {connectedIntegrations.includes(item.id) ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                      
                      {configuringIntegration === item.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-6 pt-6 border-t border-[#262626] space-y-4"
                        >
                          {item.fields?.map(field => (
                            <div key={field.label} className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{field.label}</label>
                              <input 
                                type="password" 
                                className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                                placeholder={`Enter your ${field.label}`}
                                defaultValue={field.value}
                              />
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => toggleIntegration(item.id)}
                              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                              Save & Connect
                            </button>
                            <button 
                              onClick={() => setConfiguringIntegration(null)}
                              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    );
  }

  if (currentPage === 'landing') {
    return (
      <>
        <AnimatePresence>
          {showSplash && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center overflow-hidden"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-full h-full flex items-center justify-center p-8"
              >
                <img
                  src="https://www.dropbox.com/scl/fi/u97h69xds0zmerbe69pmw/1774586031153-2.png?rlkey=tg24ppj129i9xv5286n8owh5m&st=dp6m0lrf&dl=1"
                  alt="Gear Studio Splash"
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                  <div className="w-48 h-1 bg-[#262626] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                      className="h-full bg-blue-600"
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Initializing Gear Studio...</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Navigation */}
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">Gear<span className="text-indigo-600">Studio</span></span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
                <a href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
                {session ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-600">Hi, {session.user.user_metadata?.username || session.user.email}</span>
                    <button 
                      onClick={() => setCurrentPage('chat')}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                    >
                      Go to App
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setCurrentPage('auth');
                      setAuthStep('signup');
                    }}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main>
          <div className="relative overflow-hidden pt-16 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
                  Build faster with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Precision Engineering</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10">
                  Turn your natural language ideas into production-ready web applications in seconds. High-performance, scalable, and beautifully designed by default.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => {
                      if (session) {
                        setCurrentPage('chat');
                      } else {
                        setCurrentPage('auth');
                        setAuthStep('signup');
                      }
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                  >
                    {session ? 'Open Workspace' : 'Start Building Now'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                    View Documentation
                  </button>
                </div>
              </div>
            </div>
            
            {/* Abstract background shape */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 blur-[120px] rounded-full"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-200 blur-[120px] rounded-full"></div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI Powered</h3>
                  <p className="text-slate-600 leading-relaxed">Advanced language models drive the engineering process, ensuring code quality and architectural integrity.</p>
                </div>
                <div className="group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Instant Preview</h3>
                  <p className="text-slate-600 leading-relaxed">See your changes in real-time as you type. Our environment syncs instantly with your development workflow.</p>
                </div>
                <div className="group">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Clean Architecture</h3>
                  <p className="text-slate-600 leading-relaxed">We don't just write code; we build structured, maintainable projects using industry best practices.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200 py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
            <p>© 2024 Gear Studio. Built with Gear AI.</p>
          </div>
        </footer>
      </div>
    </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0A0A0A] flex items-center justify-center overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-full h-full flex items-center justify-center p-8"
            >
              <img
                src="https://www.dropbox.com/scl/fi/u97h69xds0zmerbe69pmw/1774586031153-2.png?rlkey=tg24ppj129i9xv5286n8owh5m&st=dp6m0lrf&dl=1"
                alt="Gear Studio Splash"
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                <div className="w-48 h-1 bg-[#262626] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="h-full bg-blue-600"
                  />
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse">Initializing Gear Studio...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-12 border-b border-[#262626] flex items-center justify-between px-4 bg-[#0F0F0F] z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xs tracking-tighter uppercase">GEAR STUDIO</span>
          </div>
          <div className="h-4 w-[1px] bg-[#262626]" />
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-[#262626] rounded text-gray-500 hover:text-white transition-colors" title="See Backend Logs">
              <Terminal className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`p-1.5 rounded transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-[#262626]'}`}
              title="Preview Project"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setCurrentPage('editor');
                setShowPreview(false);
              }}
              className={`p-1.5 rounded transition-colors ${currentPage === 'editor' && !showPreview ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-white hover:bg-[#262626]'}`}
              title="View Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-[#262626] mx-1" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#1A1A1A] border border-[#333] rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {currentProject.name}
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-1.5 rounded transition-colors ${isMenuOpen ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-white hover:bg-[#262626]'}`}
          >
            <Menu className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsMenuOpen(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-[#0F0F0F] border border-[#262626] rounded-xl shadow-2xl z-40 overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        // Export logic
                        const blob = new Blob([JSON.stringify({ project: currentProject, files }, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}-export.json`;
                        a.click();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Project</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        // Versions logic (placeholder)
                        const aiMessage: Message = {
                          id: generateId(),
                          role: 'ai',
                          text: `📜 **Version History**\n\n- **v1.0.0** (Initial Build): ${currentProject.updatedAt}\n\n*Version control is currently in beta. More features coming soon!*`,
                          status: 'done'
                        };
                        setMessages(prev => [...prev, aiMessage]);
                        setCurrentPage('chat');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Version History</span>
                    </button>
                    <div className="h-[1px] bg-[#262626] my-1" />
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (currentProject.deploymentUrl) {
                          window.open(currentProject.deploymentUrl, '_blank');
                        } else {
                          setShowDeployModal(true);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-blue-500 hover:bg-blue-500/10 transition-all"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{currentProject.deploymentUrl ? 'View Deployment' : 'Deploy to Vercel'}</span>
                    </button>
                    <div className="h-[1px] bg-[#262626] my-1" />
                    <button 
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await supabase.auth.signOut();
                        setCurrentPage('landing');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: File Explorer */}
        <div className="w-64 border-r border-[#262626] flex flex-col bg-[#0F0F0F]">
          <div className="p-4 border-b border-[#262626]">
            <p className="text-[9px] font-bold text-gray-500 leading-tight uppercase tracking-wider">
              AI Coded Files & Folders
              <br />
              <span className="text-blue-500/50 italic lowercase font-normal">click to edit manually</span>
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {files.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => {
                  setActiveFileIndex(idx);
                  setCurrentPage('editor');
                  setShowPreview(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-3 transition-all group ${
                  activeFileIndex === idx && currentPage === 'editor'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
                    : 'hover:bg-[#1A1A1A] text-gray-500 hover:text-gray-300'
                } ${codingFile === file.name ? 'ring-1 ring-blue-500/50 animate-pulse' : ''}`}
              >
                <FileCode className={`w-3.5 h-3.5 ${activeFileIndex === idx && currentPage === 'editor' ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                <span className="truncate flex-1">{file.name}</span>
                {codingFile === file.name && (
                  <div className="flex gap-0.5">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-blue-500 rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-[#262626]">
            <button 
              onClick={handleNewProject}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all"
            >
              <Plus className="w-3 h-3" />
              New Project
            </button>
          </div>
        </div>

        {/* Middle Section: Content Area */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] relative">
          {currentPage === 'chat' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-600/20">
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter mb-2">What are we building today?</h1>
              <p className="text-gray-500 text-sm max-w-md mb-8">
                Describe your idea and I'll generate the code, design, and structure for you.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                <button 
                  onClick={() => {
                    setInputValue("Build a modern landing page for a SaaS product");
                    setShowPreview(false);
                  }}
                  className="p-4 bg-[#0F0F0F] border border-[#262626] rounded-xl text-left hover:border-blue-600/50 transition-all group"
                >
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Landing Page</p>
                  <p className="text-xs text-gray-400 group-hover:text-gray-200">Modern SaaS landing page with dark theme</p>
                </button>
                <button 
                  onClick={() => {
                    setInputValue("Create a real-time chat application with glassmorphism UI");
                    setShowPreview(false);
                  }}
                  className="p-4 bg-[#0F0F0F] border border-[#262626] rounded-xl text-left hover:border-blue-600/50 transition-all group"
                >
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Web App</p>
                  <p className="text-xs text-gray-400 group-hover:text-gray-200">Real-time chat with glassmorphism design</p>
                </button>
              </div>
            </div>
          ) : showPreview ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {isSyncing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-widest animate-pulse">Bundling Project...</p>
                </div>
              )}
              <iframe
                srcDoc={combinedCode}
                className="w-full h-full border-none"
                title="Preview"
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-10 border-b border-[#262626] flex items-center px-4 bg-[#0F0F0F] gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1A1A1A] border border-[#333] rounded-t-lg border-b-0 h-full mt-1">
                  <span className="text-[10px] font-bold text-gray-400">{files[activeFileIndex]?.name}</span>
                  <X className="w-3 h-3 text-gray-600 hover:text-white cursor-pointer" />
                </div>
                <div className="flex-1" />
                <button className="p-1.5 hover:bg-[#262626] rounded text-gray-500 hover:text-white transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Line Numbers */}
                <div className="w-12 bg-[#0F0F0F] border-r border-[#262626] pt-4 flex flex-col items-end pr-3 text-[11px] font-mono text-gray-600 select-none leading-[20px]">
                  {Array.from({ length: Math.max(20, (files[activeFileIndex]?.content || '').split('\n').length) }).map((_, i) => (
                    <div key={i} className="h-[20px]">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={files[activeFileIndex]?.content}
                  onChange={(e) => {
                    const newFiles = [...files];
                    newFiles[activeFileIndex] = { ...newFiles[activeFileIndex], content: e.target.value };
                    setFiles(newFiles);
                  }}
                  className="flex-1 bg-[#0A0A0A] text-gray-300 p-4 pt-4 font-mono text-[13px] focus:outline-none resize-none leading-[20px] custom-scrollbar"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-blue-600/5 pointer-events-none animate-pulse flex items-center justify-center z-30">
              <div className="bg-[#1A1A1A] border border-blue-600/30 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  {codingFile ? `Coding ${codingFile}...` : 'AI Thinking...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Chat */}
        <div className="w-80 border-l border-[#262626] flex flex-col bg-[#0F0F0F]">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">AI Assistant</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setAiMode('fast')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${aiMode === 'fast' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                Fast
              </button>
              <button 
                onClick={() => setAiMode('complex')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${aiMode === 'complex' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                Complex
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-2xl text-xs ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : message.isError 
                      ? 'error-message' 
                      : 'bg-[#1A1A1A] text-gray-300 border border-[#333]'
                }`}>
                  {message.role === 'ai' ? (
                    <div className="markdown-body">
                      <Markdown
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)(?::(.+))?/.exec(className || '');
                            const fileName = match ? match[2] : null;
                            const isBlock = className?.includes('language-');

                            if (isBlock && fileName) {
                              return (
                                <div className="relative group/code">
                                  <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10">
                                    <button 
                                      onClick={() => handleApplyCode(fileName, String(children))}
                                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-[9px] font-bold uppercase text-white shadow-lg"
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
                        {message.text}
                      </Markdown>
                    </div>
                  ) : message.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-[#262626] space-y-3">
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={`data:${img.mimeType};base64,${img.data}`} 
                      alt="Upload" 
                      className="w-12 h-12 rounded-lg object-cover border border-[#333]"
                    />
                    <button 
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload} 
              />
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask AI to code something..."
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-3 pr-10 text-xs focus:outline-none focus:border-blue-500 transition-all resize-none min-h-[80px] max-h-[200px] custom-scrollbar"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isGenerating || !inputValue.trim()}
                className="absolute right-2 bottom-2 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-all shadow-lg shadow-blue-600/20"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    const name = prompt("File name (e.g. style.css):");
                    if (name) {
                      setFiles(prev => [...prev, { name, content: '' }]);
                    }
                  }}
                  className="p-1.5 hover:bg-[#262626] rounded text-gray-500 hover:text-white transition-colors" 
                  title="Add File"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:bg-[#262626] rounded text-gray-500 hover:text-white transition-colors" title="Voice Input">
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setMessages([])}
                  className="p-1.5 hover:bg-[#262626] rounded text-gray-500 hover:text-white transition-colors" 
                  title="Reset Chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-[#262626] rounded text-gray-500 hover:text-white transition-colors">
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 hover:bg-[#262626] rounded text-gray-500 hover:text-white transition-colors">
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="pt-1">
              <button 
                onClick={() => setCurrentPage('integrations')}
                className="w-full py-2 px-4 bg-[#1A1A1A] border border-[#333] hover:border-[#444] rounded-lg text-[10px] uppercase tracking-wider font-semibold text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Cpu className="w-3 h-3" />
                Integrations
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <AnimatePresence>
      {showDeployModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeployModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-[#111] border border-[#262626] rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Deploy Project</h3>
              <p className="text-sm text-gray-400 mb-6">
                Ready to take your project live? We'll deploy your code to Vercel and provide you with a public URL.
              </p>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying || files.length === 0}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Deployment'}
                </button>
                <button 
                  onClick={() => setShowDeployModal(false)}
                  className="w-full py-3 bg-transparent hover:bg-[#1A1A1A] text-gray-400 hover:text-white font-medium rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

