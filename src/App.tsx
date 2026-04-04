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
  ShoppingCart,
  Check,
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
  Bug,
  Eye,
  Menu,
  Mic,
  RotateCcw,
  RefreshCw,
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

type Space = {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  deploymentUrl?: string;
  vercelProjectName?: string;
  customDomain?: string;
  status?: 'draft' | 'deployed';
  isPrivate?: boolean;
};

type FileData = {
  name: string;
  content: string;
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback to a UUID-like string if randomUUID is not available
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'chat' | 'dashboard' | 'editor' | 'integrations' | 'auth' | 'domains' | 'view'>('landing');
  const [viewSpace, setViewSpace] = useState<{ space: Space, files: FileData[] } | null>(null);
  const [viewCombinedCode, setViewCombinedCode] = useState('');
  const [isViewLoading, setIsViewLoading] = useState(false);
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
  const [currentSpace, setCurrentSpace] = useState<Space>({ id: '0', name: 'UNTITLED SPACE', updatedAt: 'Just now' });
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDescription, setNewSpaceDescription] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeTasksCount, setActiveTasksCount] = useState(0);
  const isGenerating = activeTasksCount > 0;
  const [codingFiles, setCodingFiles] = useState<Record<string, string>>({}); // messageId -> fileName
  const [showSplash, setShowSplash] = useState(true);
  const [deploymentName, setDeploymentName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  // Initialize deployment name when modal opens
  useEffect(() => {
    if (showDeployModal) {
      if (currentSpace.deploymentUrl?.includes('gearstudio.space/')) {
        const slug = currentSpace.deploymentUrl.split('/').pop();
        if (slug) {
          setDeploymentName(slug);
          return;
        }
      }
      setDeploymentName(currentSpace.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 7));
    }
  }, [showDeployModal, currentSpace.name, currentSpace.deploymentUrl]);

  // Path-based routing for space viewing
  useEffect(() => {
    const path = window.location.pathname.split('/').filter(Boolean);
    const reservedPaths = ['chat', 'editor', 'dashboard', 'integrations', 'auth', 'domains'];
    
    if (path.length === 1 && !reservedPaths.includes(path[0])) {
      const slug = path[0];
      handleLoadSpaceBySlug(slug);
    }
  }, []);

  const handleLoadSpaceBySlug = async (slug: string) => {
    setIsViewLoading(true);
    setCurrentPage('view');
    try {
      // Try to find space by vercel_project_name (which we use as slug) or ID
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .select('*')
        .or(`vercel_project_name.eq.${slug},id.eq.${slug}`)
        .single();

      if (spaceError || !spaceData) throw new Error('Space not found');

      const { data: filesData, error: filesError } = await supabase
        .from('space_files')
        .select('*')
        .eq('space_id', spaceData.id);

      if (filesError) throw filesError;

      const space: Space = {
        id: spaceData.id,
        name: spaceData.name,
        updatedAt: new Date(spaceData.updated_at).toLocaleString(),
        deploymentUrl: spaceData.deployment_url,
        vercelProjectName: spaceData.vercel_project_name,
        customDomain: spaceData.custom_domain,
        status: spaceData.status,
        isPrivate: spaceData.is_private
      };

      const files: FileData[] = filesData.map(f => ({ name: f.file_name, content: f.content }));
      const combined = generateCombinedCode(files);
      setViewCombinedCode(combined);
      setViewSpace({ space, files });
    } catch (err) {
      console.error('Error loading space for view:', err);
      setCurrentPage('landing');
    } finally {
      setIsViewLoading(false);
    }
  };
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [isBuyingDomain, setIsBuyingDomain] = useState(false);
  const [domainSearch, setDomainSearch] = useState('');
  const [domainResult, setDomainResult] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [images, setImages] = useState<{ data: string; mimeType: string }[]>([]);
  const [logs, setLogs] = useState<{ type: 'log' | 'error' | 'warn'; message: string; timestamp: string }[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  // Load spaces from Supabase
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadSpaces = async () => {
      try {
        const { data, error } = await supabase
          .from('spaces')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const formattedSpaces: Space[] = data.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            updatedAt: new Date(s.updated_at).toLocaleString(),
            deploymentUrl: s.deployment_url,
            vercelProjectName: s.vercel_project_name,
            customDomain: s.custom_domain,
            status: s.status,
            isPrivate: s.is_private
          }));
          setSpaces(formattedSpaces);
          
          // If no space is selected, select the first one
          if (currentSpace.id === '0' && formattedSpaces.length > 0) {
            setCurrentSpace(formattedSpaces[0]);
            loadSpaceFiles(formattedSpaces[0].id);
            loadSpaceMessages(formattedSpaces[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading spaces:', err);
      }
    };

    loadSpaces();
  }, [session]);

  const loadSpaceFiles = async (spaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('space_files')
        .select('*')
        .eq('space_id', spaceId);

      if (error) throw error;
      if (data && data.length > 0) {
        setFiles(data.map(f => ({ name: f.file_name, content: f.content })));
      }
    } catch (err) {
      console.error('Error loading space files:', err);
    }
  };

  const loadSpaceMessages = async (spaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('space_messages')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setMessages(data.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'ai',
          text: m.text,
          type: m.type as any,
          status: m.status as any
        })));
      }
    } catch (err) {
      console.error('Error loading space messages:', err);
    }
  };

  const syncSpaceToSupabase = async (space: Space, spaceFiles: FileData[], spaceMessages: Message[]) => {
    if (!session?.user?.id || space.id === '0') return;

    try {
      setIsSyncing(true);
      // 1. Upsert Space
      const { error: spaceError } = await supabase
        .from('spaces')
        .upsert({
          id: space.id,
          user_id: session.user.id,
          name: space.name,
          description: space.description,
          deployment_url: space.deploymentUrl,
          status: space.status || 'draft',
          is_private: space.isPrivate ?? true,
          updated_at: new Date().toISOString()
        });

      if (spaceError) throw spaceError;

      // 2. Sync Files
      for (const file of spaceFiles) {
        const { error: fileError } = await supabase
          .from('space_files')
          .upsert({
            space_id: space.id,
            file_name: file.name,
            content: file.content,
            updated_at: new Date().toISOString()
          }, { onConflict: 'space_id,file_name' });
        
        if (fileError) throw fileError;
      }

      // 3. Sync Messages
      if (spaceMessages.length > 0) {
        const messagesToSync = spaceMessages.map(m => ({
          id: m.id,
          space_id: space.id,
          role: m.role,
          text: m.text,
          type: m.type || 'text',
          status: m.status || 'done',
          created_at: new Date().toISOString()
        }));

        const { error: msgError } = await supabase
          .from('space_messages')
          .upsert(messagesToSync, { onConflict: 'id' });

        if (msgError) throw msgError;
      }
    } catch (err) {
      console.error('Error syncing to Supabase:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Debounced sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSpace.id !== '0') {
        syncSpaceToSupabase(currentSpace, files, messages);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentSpace, files, messages, session]);

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;

    const newId = generateId();
    const newSpace: Space = {
      id: newId,
      name: newSpaceName,
      description: newSpaceDescription,
      updatedAt: 'Just now',
      status: 'draft'
    };
    
    const initialFiles = [
      { name: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>' + newSpaceName + '</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-gray-50 text-gray-900 font-sans">\n  <div id="app" class="p-8">\n    <h1 class="text-4xl font-black tracking-tighter mb-4">' + newSpaceName + '</h1>\n    <p class="text-gray-500">' + (newSpaceDescription || 'Welcome to your new Gear Studio space.') + '</p>\n  </div>\n</body>\n</html>' }
    ];

    setSpaces([newSpace, ...spaces]);
    setCurrentSpace(newSpace);
    setFiles(initialFiles);
    setMessages([]);
    setNewSpaceName('');
    setNewSpaceDescription('');
    setShowCreateSpaceModal(false);
    setCurrentPage('chat');

    if (session?.user?.id) {
      await syncSpaceToSupabase(newSpace, initialFiles, []);
    }
  };

  const handleNewSpace = () => {
    setShowCreateSpaceModal(true);
  };

  const deleteSpace = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSpaces(spaces.filter(s => s.id !== id));
    
    if (session?.user?.id) {
      try {
        await supabase.from('spaces').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting space from Supabase:', err);
      }
    }

    if (currentSpace.id === id) {
      setCurrentSpace(spaces[0] || { id: '0', name: 'NO SPACE', updatedAt: '' });
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_LOG') {
        setLogs(prev => [...prev, event.data.log].slice(-100));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onloadend = () => {
          setImages(prev => [...prev, { 
            data: (reader.result as string).split(',')[1], 
            mimeType: file.type 
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onloadend = () => {
          const content = reader.result as string;
          setInputValue(prev => prev + `\n\nUploaded file: ${file.name}\n\`\`\`\n${content}\n\`\`\``);
        };
        reader.readAsText(file);
      }
    });
  };

  const handleDebug = () => {
    const errorLogs = logs.filter(l => l.type === 'error');
    if (logs.length === 0) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: "🔍 **No logs detected yet.**\n\nPlease run your preview and interact with it to generate logs. If you're seeing a specific issue, you can also describe it to me directly!",
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      return;
    }

    const debugPrompt = errorLogs.length > 0 
      ? `🚨 **FAULT DETECTED**\n\nI've analyzed the preview logs and found the following errors:\n\n${errorLogs.map(l => `\`[ERROR] ${l.message}\``).join('\n')}\n\nI am now analyzing the code to fix these faults automatically. Please wait...`
      : `🔍 **LOG ANALYSIS**\n\nI'm reviewing the current logs to ensure everything is running smoothly:\n\n${logs.slice(-5).map(l => `\`[${l.type.toUpperCase()}] ${l.message}\``).join('\n')}\n\nI'll check for any hidden logic issues or optimizations.`;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: debugPrompt,
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Trigger AI with the actual logs for debugging
    const fullDebugPrompt = `DEBUGGING REQUEST:\n\nLogs:\n${logs.map(l => `[${l.type.toUpperCase()}] ${l.message}`).join('\n')}\n\nFiles:\n${files.map(f => `File: ${f.name}\n${f.content}`).join('\n\n')}\n\nPlease identify and fix any errors or faults found in the logs.`;
    
    setInputValue('');
    handleSendMessage(fullDebugPrompt);
  };

  const [aiMode, setAiMode] = useState<'fast' | 'complex'>('complex');
  const [combinedCode, setCombinedCode] = useState('');

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

  const generateCombinedCode = (spaceFiles: FileData[]) => {
    const htmlFile = spaceFiles.find(f => f.name === 'index.html');
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
    const cssFiles = spaceFiles.filter(f => f.name.endsWith('.css'));
    const cssContent = cssFiles.map(f => `/* ${f.name} */\n${f.content}`).join('\n\n');

    // Collect all JS files as modules
    const jsFiles = spaceFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx'));
    const scripts = jsFiles.map(f => `
      <script type="module" data-filename="${f.name}">
        ${f.content.replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')}
      </script>
    `).join('\n');

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/lucide@latest"></script>
          <script>
            (function() {
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;
              
              const sendToParent = (type, args) => {
                window.parent.postMessage({
                  type: 'PREVIEW_LOG',
                  log: {
                    type,
                    message: args.map(arg => {
                      try {
                        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                      } catch (e) {
                        return String(arg);
                      }
                    }).join(' '),
                    timestamp: new Date().toLocaleTimeString()
                  }
                }, '*');
              };

              console.log = (...args) => {
                originalLog.apply(console, args);
                sendToParent('log', args);
              };
              console.error = (...args) => {
                originalError.apply(console, args);
                sendToParent('error', args);
              };
              console.warn = (...args) => {
                originalWarn.apply(console, args);
                sendToParent('warn', args);
              };

              window.onerror = (message, source, lineno, colno, error) => {
                sendToParent('error', [message, \`at \${lineno}:\${colno}\`]);
              };
            })();
          </script>
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
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSyncing(true);
      const combined = generateCombinedCode(files);
      setCombinedCode(combined);
      setTimeout(() => setIsSyncing(false), 800);
    }, 1000);
    return () => clearTimeout(timer);
  }, [files]);

  const handleAddToCart = (domain: any) => {
    if (!cart.some(item => item.domain === domain.domain)) {
      setCart(prev => [...prev, domain]);
    }
  };

  const handleRemoveFromCart = (domainName: string) => {
    setCart(prev => prev.filter(item => item.domain !== domainName));
  };

  const handleCheckDomain = async () => {
    if (!domainSearch.trim()) return;
    setIsCheckingDomain(true);
    setDomainResult(null);
    try {
      const response = await fetch(`/api/domains/check?domain=${domainSearch}`);
      const data = await response.json();
      if (response.ok) {
        setDomainResult(data);
      } else {
        throw new Error(data.error || 'Failed to check domain');
      }
    } catch (error: any) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `❌ **Domain check failed**\n\n${error.message}`,
        isError: true,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentPage('chat');
    } finally {
      setIsCheckingDomain(false);
    }
  };

  const handleBuyDomain = async (domainToBuy?: any) => {
    const target = domainToBuy || cart[0];
    if (!target) return;
    
    setIsBuyingDomain(true);
    try {
      const response = await fetch('/api/domains/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: target.domain,
          vercelProjectId: currentSpace.vercelProjectName || currentSpace.name.toLowerCase().replace(/\s+/g, '-') || 'gear-studio-space'
        })
      });
      const data = await response.json();
      if (response.ok) {
        const aiMessage: Message = {
          id: generateId(),
          role: 'ai',
          text: `🎉 **Domain ${target.domain} purchased and configured!**\n\nYour space will be accessible at https://${target.domain} once DNS propagation is complete (usually 5-10 minutes).`,
          status: 'done'
        };
        setMessages(prev => [...prev, aiMessage]);
        setCart(prev => prev.filter(item => item.domain !== target.domain));
        
        // Update space deployment URL
        const deploymentUrl = `https://${target.domain}`;
        const updatedSpace = { 
          ...currentSpace, 
          deploymentUrl,
          customDomain: target.domain,
          vercelProjectName: currentSpace.vercelProjectName || currentSpace.name.toLowerCase().replace(/\s+/g, '-')
        };
        setCurrentSpace(updatedSpace);
        setSpaces(prev => prev.map(s => s.id === currentSpace.id ? updatedSpace : s));
        
        if (session?.user?.id) {
          await syncSpaceToSupabase(updatedSpace, files, messages);
        }
        
        setCurrentPage('chat');
      } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error: any) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `❌ **Purchase failed**\n\n${error.message}`,
        isError: true,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentPage('chat');
    } finally {
      setIsBuyingDomain(false);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsBuyingDomain(true);
    setShowCart(false);
    
    const results = [];
    const errors = [];

    for (const item of cart) {
      try {
        const response = await fetch('/api/domains/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: item.domain,
            vercelProjectId: process.env.VERCEL_PROJECT_ID || 'gear-studio-project'
          })
        });
        const data = await response.json();
        if (response.ok) {
          results.push(item.domain);
        } else {
          errors.push({ domain: item.domain, error: data.error || 'Purchase failed' });
        }
      } catch (error: any) {
        errors.push({ domain: item.domain, error: error.message });
      }
    }

    if (results.length > 0) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `🎉 **Successfully purchased ${results.length} domain${results.length > 1 ? 's' : ''}!**\n\n${results.map(d => `- ${d}`).join('\n')}\n\nYour spaces will be accessible once DNS propagation is complete (usually 5-10 minutes).`,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      setCart(prev => prev.filter(item => !results.includes(item.domain)));

        // Update space deployment URL with the first successful domain
        if (results.length > 0) {
          const deploymentUrl = `https://${results[0]}`;
          const updatedSpace = { ...currentSpace, deploymentUrl, customDomain: results[0] };
          setCurrentSpace(updatedSpace);
          setSpaces(prev => prev.map(s => s.id === currentSpace.id ? updatedSpace : s));
          
          if (session?.user?.id) {
            await syncSpaceToSupabase(updatedSpace, files, messages);
          }
        }
    }

    if (errors.length > 0) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `❌ **Failed to purchase ${errors.length} domain${errors.length > 1 ? 's' : ''}:**\n\n${errors.map(e => `- ${e.domain}: ${e.error}`).join('\n')}`,
        isError: true,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
    }

    setIsBuyingDomain(false);
    setCurrentPage('chat');
  };

  const syncDeploymentToSupabase = async (spaceId: string, url: string, inspectUrl: string | null) => {
    if (!session?.user?.id || spaceId === '0') return;

    try {
      const { error } = await supabase
        .from('deployments')
        .insert({
          space_id: spaceId,
          url: url,
          inspect_url: inspectUrl,
          status: 'ready',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error syncing deployment to Supabase:', err);
    }
  };

  const handleDeploy = async () => {
    if (files.length === 0) return;
    
    const slug = (deploymentName || currentSpace.name).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    if (!slug) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `❌ **Invalid URL name.** Please provide a valid name for your space URL.`,
        isError: true,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      return;
    }

    setIsDeploying(true);
    setShowDeployModal(false);
    try {
      // 1. Check if slug is already taken by another space
      const { data: existingSpace } = await supabase
        .from('spaces')
        .select('id')
        .eq('vercel_project_name', slug)
        .neq('id', currentSpace.id)
        .maybeSingle();
        
      if (existingSpace) {
        throw new Error(`The URL gearstudio.space/${slug} is already taken. Please choose a different name.`);
      }

      const deploymentUrl = `https://gearstudio.space/${slug}`;
      
      // 2. Update current space and spaces list with deployment URL
      const updatedSpace: Space = { 
        ...currentSpace, 
        deploymentUrl,
        vercelProjectName: slug,
        status: 'deployed'
      };
      
      setCurrentSpace(updatedSpace);
      setSpaces(prev => prev.map(s => s.id === currentSpace.id ? updatedSpace : s));
      
      if (session?.user?.id) {
        await syncSpaceToSupabase(updatedSpace, files, messages);
        await syncDeploymentToSupabase(currentSpace.id, deploymentUrl, null);
      }
      
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `🚀 **Space published successfully!**\n\nYour space is live at: [${deploymentUrl}](${deploymentUrl})\n\nIt's now accessible like a folder on our website.`,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentPage('chat');
      
    } catch (error: any) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `❌ **Publishing failed**\n\n${error.message}`,
        isError: true,
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      setCurrentPage('chat');
    } finally {
      setIsDeploying(false);
    }
  };

  const logUsageToSupabase = async (model: string, promptTokens?: number, completionTokens?: number) => {
    if (!session?.user?.id) return;

    try {
      await supabase
        .from('usage_logs')
        .insert({
          user_id: session.user.id,
          space_id: currentSpace.id === '0' ? null : currentSpace.id,
          model: model,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          created_at: new Date().toISOString()
        });
    } catch (err) {
      console.error('Error logging usage to Supabase:', err);
    }
  };

  const handleSendMessage = async (overrideInput?: string) => {
    const inputToUse = overrideInput || inputValue;
    if (!inputToUse.trim() && images.length === 0) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: inputToUse,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputToUse;
    if (!overrideInput) setInputValue('');
    setImages([]); // Clear images after sending
    setActiveTasksCount(prev => prev + 1);
    setShowPreview(false);
    const aiMessageId = generateId();

    try {
      const history = messages.reduce((acc: { role: "user" | "model"; parts: { text: string }[] }[], m) => {
        const role = m.role === 'user' ? 'user' : 'model';
        // Ensure alternating roles
        if (acc.length > 0 && acc[acc.length - 1].role === role) {
          acc[acc.length - 1].parts[0].text += `\n\n${m.text}`;
        } else {
          acc.push({ role, parts: [{ text: m.text }] });
        }
        return acc;
      }, []);
      
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
        
        let updates: { name: string, content: string }[] = [];
        let lastFile = "";

        let blockMatch;
        while ((blockMatch = codeBlockRegex.exec(fullResponse)) !== null) {
          if (blockMatch[2]) {
            updates.push({ name: blockMatch[2], content: blockMatch[3].trim() });
            lastFile = blockMatch[2];
          }
        }

        let tagMatch;
        while ((tagMatch = fileTagRegex.exec(fullResponse)) !== null) {
          updates.push({ name: tagMatch[1].trim(), content: tagMatch[2].trim() });
          lastFile = tagMatch[1].trim();
        }

        if (updates.length > 0) {
          setFiles(prev => {
            const next = [...prev];
            updates.forEach(update => {
              const idx = next.findIndex(f => f.name === update.name);
              if (idx > -1) {
                next[idx] = { ...next[idx], content: update.content };
              } else {
                next.push(update);
              }
            });
            return next;
          });
          
          if (lastFile) {
            setCodingFiles(prev => ({ ...prev, [aiMessageId]: lastFile }));
          }
        }
      }

      setCodingFiles(prev => {
        const next = { ...prev };
        delete next[aiMessageId];
        return next;
      });

      // Final processing for space name
      if (currentSpace.id === '0' && messages.length === 0) {
        const generatedName = currentInput.toUpperCase().slice(0, 20);
        const slug = generatedName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
        const deploymentUrl = `https://gearstudio.space/${slug}`;
        const newSpace: Space = { 
          ...currentSpace, 
          name: generatedName, 
          id: generateId(), 
          deploymentUrl,
          status: 'draft'
        };
        setCurrentSpace(newSpace);
        setSpaces(prev => [newSpace, ...prev]);
        if (session?.user?.id) {
          await syncSpaceToSupabase(newSpace, files, messages);
        }
      } else if (currentSpace.id !== '0' && session?.user?.id) {
        await syncSpaceToSupabase(currentSpace, files, messages);
      }

      let chatText = fullResponse.replace(/```[\s\S]*?```/g, '').trim();
      if (!chatText) chatText = "I've updated the space files in the editor.";

      setMessages(prev => prev.map(m => 
        m.id === aiMessageId ? { ...m, text: chatText, status: 'done' } : m
      ));

      if (session?.user?.id) {
        await logUsageToSupabase('gemini-3-flash-preview');
      }

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
        } else if (error?.message?.includes('http status code: 0')) {
          errorMessage = "⚠️ Connection Error: The request to the Gemini API failed (Status 0). This often happens if your network is unstable, a browser extension is blocking the request, or your API key is invalid. Please check your internet connection and try again.";
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
      setActiveTasksCount(prev => Math.max(0, prev - 1));
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
                Supabase environment variables are missing. Please set <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> in your space settings to enable authentication and database features.
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
          desc: 'Built-in database powered by Supabase. Schema: users, spaces, space_files, deployments, db_tables, db_columns, db_rows, db_cells.', 
          icon: <Box className="w-5 h-5 text-blue-500" />, 
          fields: [
            { label: 'Supabase URL', value: import.meta.env.VITE_SUPABASE_URL || '' },
            { label: 'Anon Key', value: import.meta.env.VITE_SUPABASE_ANON_KEY || '' }
          ] 
        },
        { 
          id: 'vercel', 
          name: 'Vercel', 
          desc: 'Deploy your spaces directly to Vercel.', 
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
                      {integrationsTab === 'builtin' ? 'Core features that power Gear Studio spaces.' : 'Extend your app with third-party services.'}
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
                  <p className="text-slate-600 leading-relaxed">We don't just write code; we build structured, maintainable spaces using industry best practices.</p>
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

  if (currentPage === 'view') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center">
        {isViewLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-sm text-gray-500 uppercase tracking-widest font-black animate-pulse">Loading Space...</p>
          </div>
        ) : viewSpace ? (
          <div className="w-full h-screen flex flex-col">
            <div className="h-12 border-b border-[#262626] flex items-center justify-between px-6 bg-[#0F0F0F] z-50">
               <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-indigo-600/20 rounded flex items-center justify-center">
                    <Zap className="w-3 h-3 text-indigo-500" />
                  </div>
                  <h1 className="text-[10px] font-black text-white uppercase tracking-widest">{viewSpace.space.name}</h1>
               </div>
               <div className="flex items-center gap-4">
                 <button 
                   onClick={() => setCurrentPage('landing')}
                   className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                 >
                   Built with Gear Studio
                 </button>
               </div>
            </div>
            <div className="flex-1 bg-white relative">
               <iframe 
                 srcDoc={viewCombinedCode}
                 className="w-full h-full border-none"
                 title={viewSpace.space.name}
                 sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
               />
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-[#111] border border-[#262626] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-2">Space Not Found</h2>
            <p className="text-gray-500 text-sm mb-8">The space you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => setCurrentPage('landing')} 
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase rounded-xl transition-all"
            >
              Go Back Home
            </button>
          </div>
        )}
      </div>
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

      {currentPage === 'domains' ? (
        <div className="flex flex-col h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
          {/* Domain Header */}
          <div className="h-16 border-b border-[#262626] flex items-center justify-between px-8 bg-[#0F0F0F] z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-500" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Domain Management</h2>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 hover:bg-[#262626] rounded-lg transition-all group"
              >
                <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-white" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setCurrentPage('chat')}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] rounded-lg text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-widest transition-all"
              >
                Back to Workspace
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-16">
              {/* Connected Domains */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Connected Domains</h3>
                    <p className="text-sm text-gray-400">Manage your active domains and subdomains</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentSpace.deploymentUrl ? (
                    <div className="p-6 bg-[#0F0F0F] border border-[#262626] rounded-2xl flex flex-col justify-between group hover:border-indigo-500/50 transition-all shadow-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="px-2 py-1 bg-green-500/10 rounded text-[8px] font-bold text-green-500 uppercase tracking-widest">
                          Active
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{currentSpace.deploymentUrl.replace('https://', '')}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Vercel Subdomain</p>
                      </div>
                      <div className="mt-6 pt-6 border-t border-[#262626] flex items-center justify-between">
                        <button 
                          onClick={() => window.open(currentSpace.deploymentUrl, '_blank')}
                          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2"
                        >
                          Visit Site <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="col-span-full p-12 border border-dashed border-[#262626] rounded-3xl flex flex-col items-center justify-center text-center bg-[#0F0F0F]/50">
                      <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-6">
                        <Globe className="w-8 h-8 text-gray-600" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">No domains connected</h4>
                      <p className="text-sm text-gray-500 mb-8 max-w-sm">
                        Deploy your space to get a free subdomain or search below to register a custom domain.
                      </p>
                      <button 
                        onClick={() => setShowDeployModal(true)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-2xl shadow-blue-600/20 flex items-center gap-3"
                      >
                        <Zap className="w-4 h-4" />
                        Get URL
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#262626] to-transparent" />

              {/* Search Section */}
              <section>
                <div className="text-center mb-12">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Register Custom Domain</h3>
                  <h4 className="text-3xl font-black text-white tracking-tighter">Find your perfect identity</h4>
                </div>
                
                <div className="relative max-w-3xl mx-auto">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-all" />
                  <div className="relative flex items-center">
                    <input 
                      type="text"
                      value={domainSearch}
                      onChange={(e) => setDomainSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckDomain()}
                      placeholder="Search for your perfect domain (e.g. mycoolapp.com)"
                      className="w-full bg-[#0F0F0F] border border-[#262626] rounded-3xl px-8 py-6 text-lg focus:outline-none focus:border-indigo-500/50 transition-all shadow-2xl"
                    />
                    <button 
                      onClick={handleCheckDomain}
                      disabled={isCheckingDomain || !domainSearch.trim()}
                      className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold uppercase rounded-2xl transition-all flex items-center gap-3 shadow-xl"
                    >
                      {isCheckingDomain ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                      Search
                    </button>
                  </div>
                </div>

                {/* Results */}
                {domainResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 max-w-3xl mx-auto"
                  >
                    <div className={`p-8 rounded-3xl border flex items-center justify-between shadow-2xl ${domainResult.available ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${domainResult.available ? 'bg-indigo-600/20' : 'bg-red-500/20'}`}>
                          {domainResult.available ? <Globe className="w-8 h-8 text-indigo-500" /> : <X className="w-8 h-8 text-red-500" />}
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-white tracking-tight">{domainResult.domain}</h4>
                          <p className={`text-xs font-bold uppercase tracking-widest ${domainResult.available ? 'text-indigo-400' : 'text-red-400'}`}>
                            {domainResult.available ? 'Available for registration' : (domainResult.status || 'Already taken')}
                          </p>
                        </div>
                      </div>
                      
                      {domainResult.available && (
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Yearly Price</p>
                            <p className="text-3xl font-black text-white">${domainResult.price} <span className="text-xs font-normal text-gray-500">{domainResult.currency}</span></p>
                          </div>
                          <button 
                            onClick={() => handleAddToCart(domainResult)}
                            className="px-8 py-4 bg-white text-black hover:bg-indigo-500 hover:text-white font-bold rounded-2xl transition-all shadow-2xl"
                          >
                            Add to Cart
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </section>
            </div>
          </div>
        </div>
        ) : (
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
          {activeTasksCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-spin" />
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">
                {activeTasksCount} Active Tasks
              </span>
            </div>
          )}
          <div className="h-4 w-[1px] bg-[#262626]" />
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowLogs(!showLogs)}
              className={`p-1.5 rounded transition-colors ${showLogs ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-[#262626]'}`}
              title="See Preview Logs"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDebug}
              className={`p-1.5 rounded transition-colors ${logs.some(l => l.type === 'error') ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-500 hover:text-white hover:bg-[#262626]'}`} 
              title="AI Debug Faults"
            >
              <Bug className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`p-1.5 rounded transition-colors ${showPreview ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-[#262626]'}`}
              title="Preview Space"
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
          <div className="px-3 py-1 bg-[#1A1A1A] border border-[#333] rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            {currentSpace.name}
            <span className={`w-1.5 h-1.5 rounded-full ${currentSpace.status === 'deployed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {isSyncing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-2.5 h-2.5 text-blue-500" />
              </motion.div>
            )}
          </div>
          {activeTasksCount > 0 && (
            <div className="px-2 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <Zap className="w-2.5 h-2.5" />
              {activeTasksCount} Active {activeTasksCount === 1 ? 'Task' : 'Tasks'}
            </div>
          )}
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
                        const blob = new Blob([JSON.stringify({ space: currentSpace, files }, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${currentSpace.name.toLowerCase().replace(/\s+/g, '-')}-export.json`;
                        a.click();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Space</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        // Versions logic (placeholder)
                        const aiMessage: Message = {
                          id: generateId(),
                          role: 'ai',
                          text: `📜 **Version History**\n\n- **v1.0.0** (Initial Build): ${currentSpace.updatedAt}\n\n*Version control is currently in beta. More features coming soon!*`,
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
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setCurrentPage('domains');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Domain</span>
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
        {!showPreview && (
          <div className="w-48 border-r border-[#262626] flex flex-col bg-[#0F0F0F]">
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
                  } ${Object.values(codingFiles).includes(file.name) ? 'ring-1 ring-blue-500/50 animate-pulse' : ''}`}
                >
                  <FileCode className={`w-3.5 h-3.5 ${activeFileIndex === idx && currentPage === 'editor' ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                  <span className="truncate flex-1">{file.name}</span>
                  {Object.values(codingFiles).includes(file.name) && (
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
                onClick={handleNewSpace}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-all"
              >
                <Plus className="w-3 h-3" />
                New Space
              </button>
            </div>
          </div>
        )}

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
            <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
              {isSyncing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-widest animate-pulse">Bundling Space...</p>
                </div>
              )}
              <iframe
                srcDoc={combinedCode}
                className="w-full h-full border-none"
                title="Preview"
                sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
              />

              {showLogs && (
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-[#0F0F0F] border-t border-[#262626] z-40 flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[#262626] bg-[#141414]">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Preview Logs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setLogs([])}
                        className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-wider"
                      >
                        Clear
                      </button>
                      <button onClick={() => setShowLogs(false)} className="text-gray-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 custom-scrollbar bg-[#0A0A0A]">
                    {logs.length === 0 ? (
                      <p className="text-gray-600 italic">No logs yet. Interact with your preview to see logs here.</p>
                    ) : (
                      logs.map((log, i) => (
                        <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
                          <span className="text-gray-600 shrink-0 select-none">{log.timestamp}</span>
                          <span className={`
                            ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-gray-300'}
                          `}>
                            [{log.type.toUpperCase()}] {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
            <div className="absolute inset-0 bg-blue-600/5 pointer-events-none animate-pulse flex flex-col items-center justify-center gap-2 z-30">
              {Object.entries(codingFiles).map(([id, file]) => (
                <div key={id} className="bg-[#1A1A1A] border border-blue-600/30 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    Coding {file}...
                  </span>
                </div>
              ))}
              {activeTasksCount > Object.keys(codingFiles).length && (
                <div className="bg-[#1A1A1A] border border-blue-600/30 px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    AI Thinking...
                  </span>
                </div>
              )}
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
                accept="*/*" 
                multiple 
                onChange={handleFileUpload} 
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
                onClick={() => handleSendMessage()}
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
    )}

      <AnimatePresence>
        {showCart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-[#0F0F0F] border-l border-[#262626] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-[#262626] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-white">Your Cart</h3>
              </div>
              <button 
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-[#262626] rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-400">Your cart is empty</p>
                  <button 
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-xs font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.domain} className="p-4 bg-[#1A1A1A] border border-[#262626] rounded-xl flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-bold text-white">{item.domain}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">1 Year Registration</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-bold text-white">${item.price}</p>
                      <button 
                        onClick={() => handleRemoveFromCart(item.domain)}
                        className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[#262626] bg-[#0A0A0A] space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Total</p>
                  <p className="text-xl font-black text-white">
                    ${cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2)}
                  </p>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isBuyingDomain}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                  {isBuyingDomain ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Checkout & Connect'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showCreateSpaceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateSpaceModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#111] border border-[#262626] rounded-2xl p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Box className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">Create New Space</h3>
              <p className="text-sm text-gray-400 mb-8">
                Give your new creation a name and a brief description to get started.
              </p>

              <div className="w-full space-y-4 text-left mb-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2 ml-1">
                    Space Name
                  </label>
                  <input 
                    type="text"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="e.g. My Awesome App"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-black mb-2 ml-1">
                    Description (Optional)
                  </label>
                  <textarea 
                    value={newSpaceDescription}
                    onChange={(e) => setNewSpaceDescription(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl py-4 px-5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all resize-none h-24"
                    placeholder="What are you building?"
                  />
                </div>
              </div>
              
              <div className="w-full flex gap-3">
                <button 
                  onClick={() => setShowCreateSpaceModal(false)}
                  className="flex-1 py-4 bg-transparent hover:bg-[#1A1A1A] text-gray-400 hover:text-white font-bold rounded-xl transition-all border border-[#262626]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateSpace}
                  disabled={!newSpaceName.trim()}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-600/20"
                >
                  Create Space
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

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
              <h3 className="text-lg font-bold text-white mb-2">Deploy Space</h3>
              <p className="text-sm text-gray-400 mb-6">
                Ready to take your space live? We'll deploy your code to Vercel and provide you with a public URL.
              </p>

              <div className="w-full mb-6 text-left">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 ml-1">
                  Space Subdomain
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={deploymentName}
                    onChange={(e) => setDeploymentName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all pr-24"
                    placeholder="space-name"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-medium">
                    .vercel.app
                  </div>
                </div>
                <p className="mt-2 text-[9px] text-gray-500 px-1">
                  Lowercase, numbers, and hyphens only.
                </p>
              </div>
              
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

