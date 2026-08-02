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
  Minimize2,
  Terminal,
  Bug,
  Eye,
  Menu,
  Home,
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
  AlertCircle,
  Sparkles,
  Brain,
  Info,
  Heart,
  Sliders,
  Key,
  HelpCircle,
  Upload,
  Users,
  ArrowRight,
  Paintbrush,
  Smartphone,
  Tablet,
  Monitor,
  Tv,
  RotateCw,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { generateCodeResponse, generateCodeResponseStream } from './services/gemini';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Message, Space, FileData } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import IntegrationsPage from './components/IntegrationsPage';
import Dashboard from './components/Dashboard';
import ProjectsPage from './components/ProjectsPage';
import FeaturesPage from './components/FeaturesPage';
import SolutionsPage from './components/SolutionsPage';
import PricingPage from './components/PricingPage';
import AboutUsPage from './components/AboutUsPage';
import EnvironmentVariablesPage from './components/EnvironmentVariablesPage';
import SettingsPage from './components/SettingsPage';
import OverviewPage from './components/OverviewPage';
import TeamsPage from './components/TeamsPage';
import MarketPage from './components/MarketPage';
import AccountPage from './components/AccountPage';

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
  const [currentPage, setCurrentPage] = useState<string>('landing');
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
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [activeModel, setActiveModel] = useState<'ionic' | 'iconic'>(() => {
    return (localStorage.getItem('gear_active_model') as 'ionic' | 'iconic') || 'iconic';
  });
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('gear_theme') as 'dark' | 'light') || 'dark';
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'pc' | 'tablet' | 'phone' | 'tv'>('pc');
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [isInspectorActive, setIsInspectorActive] = useState(false);
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
  const [aiSettings, setAiSettings] = useState({
    assistantName: localStorage.getItem('gear_ai_name') || 'Gear AI',
    userName: localStorage.getItem('gear_ai_user_name') || 'developer',
    tone: localStorage.getItem('gear_ai_tone') || 'Precise & Technical',
    length: localStorage.getItem('gear_ai_length') || 'Concise & Direct',
    emojiLevel: localStorage.getItem('gear_ai_emoji') || 'Standard',
    customRules: localStorage.getItem('gear_ai_rules') || ''
  });
  const [strictCommands, setStrictCommands] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTeamPushNotice, setShowTeamPushNotice] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);

  // Auto-sync session username to gear_ai_user_name
  useEffect(() => {
    if (session?.user) {
      const email = session.user.email || '';
      const emailPrefix = email.split('@')[0];
      const username = session.user.user_metadata?.username || emailPrefix || 'developer';
      setAiSettings(prev => {
        if (!localStorage.getItem('gear_ai_user_name') || prev.userName === 'developer') {
          localStorage.setItem('gear_ai_user_name', username);
          return { ...prev, userName: username };
        }
        return prev;
      });
    }
  }, [session]);

  const [showSplash, setShowSplash] = useState(true);
  const [deploymentName, setDeploymentName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const [showEnvPage, setShowEnvPage] = useState(false);
  const [envVars, setEnvVars] = useState<{ id: string, name: string, value: string }[]>([]);

  // Load environment variables for the current space
  useEffect(() => {
    if (currentSpace?.id && currentSpace.id !== '0') {
      const stored = localStorage.getItem(`gear_env_${currentSpace.id}`);
      if (stored) {
        try {
          setEnvVars(JSON.parse(stored));
        } catch (e) {
          setEnvVars([]);
        }
      } else {
        setEnvVars([]);
      }
    } else {
      setEnvVars([]);
    }
  }, [currentSpace?.id]);

  // Handler to save environment variables
  const saveEnvVars = (varsList: { id: string, name: string, value: string }[]) => {
    setEnvVars(varsList);
    if (currentSpace?.id && currentSpace.id !== '0') {
      localStorage.setItem(`gear_env_${currentSpace.id}`, JSON.stringify(varsList));
      
      // Keep .env.json inside files array as well so it gets backed up/synchronized in Supabase space_files
      const envJsonStr = JSON.stringify(varsList, null, 2);
      setFiles(prev => {
        const idx = prev.findIndex(f => f.name === '.env.json');
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { name: '.env.json', content: envJsonStr };
          return updated;
        } else {
          return [...prev, { name: '.env.json', content: envJsonStr }];
        }
      });
    }
  };

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
        const loadedFiles = data.map(f => ({ name: f.file_name, content: f.content }));
        setFiles(loadedFiles);

        // Look for .env.json inside loaded space files to restore environment variables
        const envFile = loadedFiles.find(f => f.name === '.env.json');
        if (envFile) {
          try {
            const parsed = JSON.parse(envFile.content);
            if (Array.isArray(parsed)) {
              setEnvVars(parsed);
              localStorage.setItem(`gear_env_${spaceId}`, JSON.stringify(parsed));
            }
          } catch (e) {
            console.error('Error parsing .env.json:', e);
          }
        } else {
          const stored = localStorage.getItem(`gear_env_${spaceId}`);
          if (stored) {
            try {
              setEnvVars(JSON.parse(stored));
            } catch (e) {
              setEnvVars([]);
            }
          } else {
            setEnvVars([]);
          }
        }
      } else {
        // Space has no saved files yet - set a clean template
        setFiles([
          {
            name: 'index.html',
            content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Space</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">\n  <div class="text-center space-y-4">\n    <h1 class="text-3xl font-bold text-indigo-400">Welcome</h1>\n    <p class="text-gray-400 text-sm">Start chatting with Gear AI to build your application.</p>\n  </div>\n</body>\n</html>`
          }
        ]);
        setEnvVars([]);
      }
    } catch (err) {
      console.error('Error loading space files:', err);
      setFiles([
        {
          name: 'index.html',
          content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Space</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">\n  <div class="text-center space-y-4">\n    <h1 class="text-3xl font-bold text-indigo-400">Welcome</h1>\n    <p class="text-gray-400 text-sm">Start chatting with Gear AI to build your application.</p>\n  </div>\n</body>\n</html>`
        }
      ]);
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
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading space messages:', err);
      setMessages([]);
    }
  };

  const handleSelectSpace = (space: Space) => {
    setCurrentSpace(space);
    setFiles([]);
    setMessages([]);
    setCodingFiles({});
    localStorage.setItem('gear_current_space_id', space.id);
    loadSpaceFiles(space.id);
    loadSpaceMessages(space.id);
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
    setCurrentPage('editor');
    setShowPreview(true);

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
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(img, 0, 0, 512, 512);
            const imgData = ctx.getImageData(0, 0, 512, 512);
            const data = imgData.data;

            const quantizeColor = (r: number, g: number, b: number, a: number): string => {
              if (a < 32) return '#transparent';
              const qr = Math.min(255, Math.max(0, Math.round(r / 32) * 32));
              const qg = Math.min(255, Math.max(0, Math.round(g / 32) * 32));
              const qb = Math.min(255, Math.max(0, Math.round(b / 32) * 32));

              const toHex = (val: number) => {
                const hex = val.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              };
              return '#' + toHex(qr) + toHex(qg) + toHex(qb);
            };

            let runs: string[] = [];
            let startPixel = 1;
            let currentHex = quantizeColor(data[0], data[1], data[2], data[3]);

            const totalPixels = 512 * 512;
            for (let i = 1; i < totalPixels; i++) {
              const idx = i * 4;
              const hex = quantizeColor(data[idx], data[idx+1], data[idx+2], data[idx+3]);
              if (hex !== currentHex) {
                runs.push(`${startPixel}-${i}|${currentHex}`);
                startPixel = i + 1;
                currentHex = hex;
              }
            }
            runs.push(`${startPixel}-${totalPixels}|${currentHex}`);
            const rleOutput = `[${runs.join(',')}]`;

            setInputValue(prev => {
              const prefix = prev ? prev + '\n\n' : '';
              return prefix + `[IMAGE_FILE: ${file.name} (RLE encoded 512x512 pixels to save token cost)]\nFormat is [start_pixel-end_pixel|#hex_color]:\n${rleOutput}\n`;
            });
          };
          img.src = reader.result as string;
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

    e.target.value = '';
  };

  const handleDebug = () => {
    const errorLogs = logs.filter(l => l.type === 'error');
    if (errorLogs.length === 0) {
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: "🔍 **No error found in logs.**",
        status: 'done'
      };
      setMessages(prev => [...prev, aiMessage]);
      return;
    }

    // Is an error is found it should just only send the line of error in the log
    const errorLine = errorLogs[errorLogs.length - 1].message;
    const debugPrompt = `🚨 **Error Found in Log:**\n\`${errorLine}\``;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: debugPrompt,
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Trigger AI passing the exact files and the single line of error to debug
    const fullDebugPrompt = `DEBUGGING REQUEST:\nAn error occurred in the workspace logs:\n"Error: ${errorLine}"\n\nHere are the files in the workspace:\n${files.map(f => `File: ${f.name}\n${f.content}`).join('\n\n')}\n\nPlease analyze and fix the bug specifically linked with this error line.`;
    
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

    // Build environment variables object
    const envObj: Record<string, string> = {};
    envVars.forEach(v => {
      envObj[v.name] = v.value;
    });

    // Collect all JS files as modules
    const jsFiles = spaceFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx'));
    const scripts = jsFiles.map(f => {
      let content = f.content.replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '');
      // Ensure import.meta.env gets rewritten to window.importMetaEnv
      content = content.replace(/import\.meta\.env/g, 'window.importMetaEnv');
      return `
        <script type="module" data-filename="${f.name}">
          ${content}
        </script>
      `;
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script>
            (function() {
              window.process = window.process || {};
              window.process.env = ${JSON.stringify(envObj)};
              window.importMetaEnv = ${JSON.stringify(envObj)};
            })();
          </script>
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

              // Prevent loading Gear Studio inside this iframe via relative links
              document.addEventListener('click', function(e) {
                const anchor = e.target.closest('a');
                if (anchor) {
                  const href = anchor.getAttribute('href');
                  if (href) {
                    if (href.startsWith('#')) return;
                    const isRelative = !/^[a-z]+:\/\//i.test(href);
                    const isHostDomain = href.includes(window.location.host);
                    if (isRelative || isHostDomain) {
                      e.preventDefault();
                      sendToParent('warn', ['Navigation within preview prevented to avoid reloading workspace.']);
                    }
                  }
                }
              }, true);
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

      // 2. Deploy to Render (for backend/CDN reliability)
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: slug,
          files: files,
          platform: 'render'
        })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Render deployment failed');
      }

      const renderUrl = data.url;
      const folderUrl = `https://gearstudio.space/${slug}`;
      
      // 3. Update current space and spaces list
      const updatedSpace: Space = { 
        ...currentSpace, 
        deploymentUrl: folderUrl, // Primary URL is the folder
        vercelProjectName: slug,
        status: 'deployed'
      };
      
      setCurrentSpace(updatedSpace);
      setSpaces(prev => prev.map(s => s.id === currentSpace.id ? updatedSpace : s));
      
      if (session?.user?.id) {
        await syncSpaceToSupabase(updatedSpace, files, messages);
        await syncDeploymentToSupabase(currentSpace.id, folderUrl, data.inspectUrl);
      }
      
      const aiMessage: Message = {
        id: generateId(),
        role: 'ai',
        text: `🚀 **Space published successfully!**\n\nYour space is live at: [${folderUrl}](${folderUrl})\n\nTemporary Render URL: [${renderUrl}](${renderUrl})\n\nIt's now accessible like a folder on our website.`,
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
      
      const stream = await generateCodeResponseStream(currentInput, history, images, files, aiSettings);
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

  if (currentPage === 'settings') {
    return (
      <SettingsPage
        spaces={spaces}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onClose={() => setCurrentPage('dashboard')}
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage
        authStep={authStep}
        setAuthStep={setAuthStep}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authOtp={authOtp}
        setAuthOtp={setAuthOtp}
        authError={authError}
        isAuthLoading={isAuthLoading}
        isSupabaseConfigured={isSupabaseConfigured}
        handleSignUp={handleSignUp}
        handleVerifyOtp={handleVerifyOtp}
        handleLogin={handleLogin}
        setCurrentPage={setCurrentPage}
      />
    );
  }

  if (currentPage === 'integrations') {
    return (
      <IntegrationsPage
        setCurrentPage={setCurrentPage}
        showShelf={showShelf}
        setShowShelf={setShowShelf}
        connectedIntegrations={connectedIntegrations}
        setConnectedIntegrations={setConnectedIntegrations}
        integrationsTab={integrationsTab}
        setIntegrationsTab={setIntegrationsTab}
        configuringIntegration={configuringIntegration}
        setConfiguringIntegration={setConfiguringIntegration}
      />
    );
  }

  if (currentPage === 'landing') {
    return (
      <LandingPage
        session={session}
        showSplash={showSplash}
        setCurrentPage={setCurrentPage}
        setAuthStep={setAuthStep}
      />
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
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Render Domain</p>
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
            {['dashboard', 'projects', 'features', 'solutions', 'pricing', 'about', 'overview', 'teams', 'market', 'account'].includes(currentPage) ? (
              <header className="h-12 border-b border-[#262626] flex items-center justify-between px-4 bg-[#0F0F0F] z-10">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsLeftMenuOpen(true)}
                    className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#262626] transition-colors"
                    title="Open Menu"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                  <span className="font-black text-xs tracking-tighter uppercase text-gray-300 ml-1">GEAR STUDIO</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{spaces.length} Spaces Connected</span>
                </div>
              </header>
            ) : (
              <header className="h-12 border-b border-[#262626] flex items-center justify-between px-3 bg-[#0F0F0F] z-20 select-none">
                {/* Left controls: Back button + Mode icons (>_ </ > ▶ ⚙) */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="w-7 h-7 rounded-full bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-sm"
                    title="Back to Dashboard"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-[1px] bg-[#262626] mx-0.5" />

                  <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#222]">
                    <button 
                      onClick={() => setShowLogs(!showLogs)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${showLogs ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
                      title="Console / Terminal (>_)"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">&gt;_</span>
                    </button>

                    <button 
                      onClick={() => {
                        setCurrentPage('editor');
                        setShowPreview(false);
                        setShowEnvPage(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${currentPage === 'editor' && !showPreview && !showEnvPage ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
                      title="Code Editor (</>)"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">&lt;/&gt;</span>
                    </button>

                    <button 
                      onClick={() => {
                        setShowPreview(!showPreview);
                        setShowEnvPage(false);
                        if (currentPage !== 'editor') {
                          setCurrentPage('editor');
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${showPreview ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
                      title="Play / Preview (▶)"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button 
                      onClick={() => setCurrentPage('settings')}
                      className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center ${(currentPage as string) === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
                      title="Settings (⚙)"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Center: VERSION (31) badge */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-[#141414] border border-[#2A2A2A] rounded-full flex items-center gap-2 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[11px] font-extrabold tracking-wider text-gray-300 font-mono">
                      VERSION <span className="text-blue-400">(31)</span>
                    </span>
                  </div>
                </div>

                {/* Right controls: Secrets, Plugins, Export, Help, PUSH TO TEAM */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setShowEnvPage(true);
                      setShowPreview(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 border ${showEnvPage ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-[#141414] text-gray-300 hover:text-white border-[#262626] hover:bg-[#1A1A1A]'}`}
                    title="Secrets & Environment Variables"
                  >
                    <Key className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Secrets</span>
                  </button>

                  <button 
                    onClick={() => setCurrentPage('integrations')}
                    className="px-2.5 py-1 bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] text-gray-300 hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5"
                    title="Plugins & Integrations"
                  >
                    <PluginIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Plugins</span>
                  </button>

                  <button 
                    onClick={() => {
                      const blob = new Blob([JSON.stringify({ space: currentSpace, files }, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${currentSpace.name.toLowerCase().replace(/\s+/g, '-')}-export.json`;
                      a.click();
                    }}
                    className="px-2.5 py-1 bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] text-gray-300 hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5"
                    title="Export Space Code"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export</span>
                  </button>

                  <button 
                    onClick={() => setShowHelpModal(true)}
                    className="w-7 h-7 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] text-gray-400 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                    title="Help & Info"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>

                  <button 
                    onClick={() => setShowTeamPushNotice(true)}
                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
                    title="Push workspace changes to team"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>PUSH TO TEAM</span>
                  </button>

                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-1.5 rounded-lg transition-colors ${isMenuOpen ? 'bg-[#262626] text-white' : 'text-gray-500 hover:text-white hover:bg-[#262626]'}`}
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
                                setShowDeployModal(true);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Deploy to Render</span>
                            </button>
                            <button 
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowEnvPage(true);
                                setShowPreview(false); // To render the config page inside the middle content area
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#EAB308] hover:bg-yellow-500/10 transition-all"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Environment Variables</span>
                            </button>
                            <button 
                              onClick={() => {
                                setIsMenuOpen(false);
                                setCurrentPage('integrations');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all"
                            >
                              <Code className="w-3.5 h-3.5" />
                              <span>Sync to GitHub</span>
                            </button>
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
                              <span>Download Space</span>
                            </button>

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
    )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: File Explorer */}
        {!showPreview && currentPage !== 'dashboard' && (
          <div className="w-48 border-r border-[#262626] flex flex-col bg-[#0F0F0F]">
            <div className="p-4 border-b border-[#262626]">
              <p className="text-[9px] font-bold text-gray-500 leading-tight uppercase tracking-wider">
                AI Coded Files & Folders
                <br />
                <span className="text-blue-500/50 italic lowercase font-normal">click to edit manually</span>
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {files.map((file, idx) => {
                if (file.name === '.env.json') return null;
                return (
                  <button
                    key={file.name}
                    onClick={() => {
                      setActiveFileIndex(idx);
                      setCurrentPage('editor');
                      setShowPreview(false);
                      setShowEnvPage(false);
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
                );
              })}
            </div>
            

          </div>
        )}

        {/* Middle Section: Content Area */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] relative">
          {currentPage === 'dashboard' ? (
            <Dashboard
              spaces={spaces}
              currentSpace={currentSpace}
              setCurrentSpace={setCurrentSpace}
              loadSpaceFiles={loadSpaceFiles}
              loadSpaceMessages={loadSpaceMessages}
              setCurrentPage={setCurrentPage}
              setShowPreview={setShowPreview}
              handleNewSpace={handleNewSpace}
              deleteSpace={deleteSpace}
              aiSettings={aiSettings}
            />
          ) : currentPage === 'projects' ? (
            <ProjectsPage
              spaces={spaces}
              currentSpace={currentSpace}
              setCurrentSpace={setCurrentSpace}
              loadSpaceFiles={loadSpaceFiles}
              loadSpaceMessages={loadSpaceMessages}
              setCurrentPage={setCurrentPage}
              setShowPreview={setShowPreview}
              handleNewSpace={handleNewSpace}
              deleteSpace={deleteSpace}
            />
          ) : currentPage === 'overview' ? (
            <OverviewPage
              spaces={spaces}
              currentSpace={currentSpace}
              setCurrentPage={setCurrentPage}
            />
          ) : currentPage === 'teams' ? (
            <TeamsPage
              spaces={spaces}
              currentSpace={currentSpace}
            />
          ) : currentPage === 'market' ? (
            <MarketPage
              currentSpace={currentSpace}
              setCurrentPage={setCurrentPage}
              setShowPreview={setShowPreview}
            />
          ) : currentPage === 'account' ? (
            <AccountPage
              session={session}
              authEmail={authEmail}
              activeModel={activeModel}
              setCurrentPage={setCurrentPage}
              handleSignOut={async () => {
                await supabase.auth.signOut();
                setCurrentPage('landing');
              }}
            />
          ) : currentPage === 'features' ? (
            <FeaturesPage />
          ) : currentPage === 'solutions' ? (
            <SolutionsPage />
          ) : currentPage === 'pricing' ? (
            <PricingPage />
          ) : currentPage === 'about' ? (
            <AboutUsPage />
          ) : currentPage === 'chat' ? (
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
          ) : showEnvPage ? (
            <EnvironmentVariablesPage
              currentSpace={currentSpace}
              envVars={envVars}
              saveEnvVars={saveEnvVars}
              onClose={() => setShowEnvPage(false)}
            />
          ) : showPreview ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A] relative">
              {/* Preview Header / Device Bar */}
              <div className="h-11 border-b border-[#262626] bg-[#0F0F0F] flex items-center justify-between px-4 select-none shrink-0 gap-3">
                {/* Left: Preview Title & Paintbrush Inspector */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="h-4 w-[1px] bg-[#262626] mx-1" />
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mr-1">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Preview</span>
                  </span>

                  {/* Paintbrush Inspector Button */}
                  <button 
                    onClick={() => setIsInspectorActive(!isInspectorActive)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${isInspectorActive ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30' : 'bg-[#141414] text-gray-400 hover:text-white border-[#262626] hover:bg-[#222]'}`}
                    title="Paintbrush Tool: Click to tap and apprehend any element on the website"
                  >
                    <Paintbrush className={`w-3.5 h-3.5 ${isInspectorActive ? 'animate-bounce' : 'text-indigo-400'}`} />
                    <span className="hidden sm:inline">Inspector</span>
                  </button>
                </div>
                
                {/* Center: Device View Selector Dropdown (showing active device only) & Rotate button */}
                <div className="flex-1 max-w-xl flex items-center gap-2 justify-center">
                  {/* Single Device Dropdown button showing only active device */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#3a3a3a] rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                      title="Device preview mode"
                    >
                      {previewDevice === 'pc' && <Monitor className="w-3.5 h-3.5 text-indigo-400" />}
                      {previewDevice === 'tablet' && <Tablet className="w-3.5 h-3.5 text-indigo-400" />}
                      {previewDevice === 'phone' && <Smartphone className="w-3.5 h-3.5 text-indigo-400" />}
                      {previewDevice === 'tv' && <Tv className="w-3.5 h-3.5 text-indigo-400" />}
                      <span>Device ({previewDevice === 'pc' ? 'PC' : previewDevice === 'tablet' ? 'Tablet' : previewDevice === 'phone' ? 'Phone' : 'TV'})</span>
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${showDeviceMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showDeviceMenu && (
                      <div 
                        className="absolute left-0 top-full mt-1.5 w-44 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl z-50 p-1 space-y-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setPreviewDevice('pc');
                            setShowDeviceMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'pc' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>PC / Desktop</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewDevice('tablet');
                            setShowDeviceMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'tablet' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
                        >
                          <Tablet className="w-3.5 h-3.5" />
                          <span>Tablet (768px)</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewDevice('phone');
                            setShowDeviceMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'phone' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Phone (375px)</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewDevice('tv');
                            setShowDeviceMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'tv' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
                        >
                          <Tv className="w-3.5 h-3.5" />
                          <span>TV (Widescreen)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Rotate Orientation Button */}
                  <button 
                    onClick={() => setIsRotated(!isRotated)}
                    className={`p-1.5 border rounded-xl transition-all cursor-pointer ${isRotated ? 'bg-indigo-600 text-white border-indigo-400 shadow' : 'bg-[#141414] border-[#262626] text-gray-400 hover:text-white hover:bg-[#222]'}`}
                    title={`Rotate Orientation (${isRotated ? 'Landscape' : 'Portrait'})`}
                  >
                    <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isRotated ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Refresh icon button */}
                  <button 
                    onClick={() => setPreviewKey(k => k + 1)}
                    className="p-1.5 bg-[#141414] hover:bg-[#222] border border-[#262626] rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Refresh Live Preview"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right: Open in Browser button & Expand toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const blob = new Blob([combinedCode], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    }}
                    className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] hover:border-[#444] rounded-lg text-xs font-black uppercase tracking-wider text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    title="Open live preview in external browser tab"
                  >
                    <span>Open in Browser</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  </button>

                  <button 
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="p-1.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400 hover:text-white border border-[#333] rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    title={isPreviewExpanded ? "Collapse View" : "Expand Full Screen"}
                  >
                    {isPreviewExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Inspector Banner Notification */}
              {isInspectorActive && (
                <div className="bg-indigo-600 text-white text-xs font-bold py-1.5 px-4 flex items-center justify-between shrink-0 shadow-inner z-20">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 animate-bounce" />
                    <span>Paintbrush Inspector Active: Click any element in the preview below to apprehend & inspect it!</span>
                  </div>
                  <button 
                    onClick={() => setIsInspectorActive(false)} 
                    className="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-800 rounded text-[10px] font-black uppercase tracking-wider text-white cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Responsive Device Viewport Container */}
              <div className="flex-1 bg-[#0A0A0A] relative overflow-auto flex items-center justify-center p-4 custom-scrollbar">
                {isSyncing && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                    <p className="text-sm font-bold text-gray-900 uppercase tracking-widest animate-pulse">Bundling Space...</p>
                  </div>
                )}
                
                <div 
                  className={`transition-all duration-300 bg-white relative shadow-2xl ${
                    previewDevice === 'phone'
                      ? isRotated 
                        ? 'w-[667px] h-[375px] max-w-full rounded-2xl border-4 border-[#1F1F1F]' 
                        : 'w-[375px] h-[667px] max-h-full rounded-2xl border-4 border-[#1F1F1F]'
                      : previewDevice === 'tablet'
                      ? isRotated 
                        ? 'w-[900px] h-[650px] max-w-full rounded-2xl border-4 border-[#1F1F1F]' 
                        : 'w-[768px] h-[880px] max-h-full rounded-2xl border-4 border-[#1F1F1F]'
                      : previewDevice === 'tv'
                      ? 'w-full h-full max-w-[1440px] rounded-xl border border-[#222]'
                      : 'w-full h-full'
                  } ${isInspectorActive ? 'ring-4 ring-indigo-500/80' : ''}`}
                >
                  <iframe
                    key={previewKey}
                    srcDoc={combinedCode}
                    className="w-full h-full border-none rounded-lg"
                    title="Preview"
                    sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                  />
                </div>
              </div>

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
        {(!showPreview || !isPreviewExpanded) && currentPage === 'editor' && (
          <div className="w-80 border-l border-[#262626] flex flex-col bg-[#0F0F0F] relative">
          <div className="p-4 border-b border-[#262626] flex items-center justify-between col-span-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {aiSettings.assistantName}
            </span>
            <div className="flex items-center gap-1.5">
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
              <button 
                onClick={() => setShowAiSettings(!showAiSettings)}
                className={`p-1 rounded transition-all ${showAiSettings ? 'text-indigo-400 bg-[#1A1A1A] border border-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                title="Personalize AI Coder"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showAiSettings && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-[#262626] bg-[#0A0A0A] p-4 space-y-3 text-xs overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" /> Persona Customizer
                  </span>
                  <button 
                    onClick={() => {
                      const defaults = {
                        assistantName: 'Gear AI',
                        userName: session?.user?.user_metadata?.username || 'developer',
                        tone: 'Precise & Technical',
                        length: 'Concise & Direct',
                        emojiLevel: 'Standard',
                        customRules: ''
                      };
                      setAiSettings(defaults);
                      localStorage.setItem('gear_ai_name', defaults.assistantName);
                      localStorage.setItem('gear_ai_user_name', defaults.userName);
                      localStorage.setItem('gear_ai_tone', defaults.tone);
                      localStorage.setItem('gear_ai_length', defaults.length);
                      localStorage.setItem('gear_ai_emoji', defaults.emojiLevel);
                      localStorage.setItem('gear_ai_rules', defaults.customRules);
                    }}
                    className="text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500">AI Name</label>
                    <input 
                      type="text" 
                      value={aiSettings.assistantName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAiSettings(prev => ({ ...prev, assistantName: val }));
                        localStorage.setItem('gear_ai_name', val);
                      }}
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Gear AI"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Your Name</label>
                    <input 
                      type="text" 
                      value={aiSettings.userName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAiSettings(prev => ({ ...prev, userName: val }));
                        localStorage.setItem('gear_ai_user_name', val);
                      }}
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. Doris"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500">AI Tone & Attitude</label>
                  <select 
                    value={aiSettings.tone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAiSettings(prev => ({ ...prev, tone: val }));
                      localStorage.setItem('gear_ai_tone', val);
                    }}
                    className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Precise & Technical">Precise & Technical (Expert)</option>
                    <option value="Friendly & Encouraging">Friendly & Encouraging</option>
                    <option value="Socratic Coach">Socratic Coach</option>
                    <option value="Witty & Humorous">Witty & Humorous</option>
                    <option value="Snarky Code Critic">Snarky Code Critic</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Response Detail</label>
                    <select 
                      value={aiSettings.length}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAiSettings(prev => ({ ...prev, length: val }));
                        localStorage.setItem('gear_ai_length', val);
                      }}
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Concise & Direct">Concise</option>
                      <option value="Detailed & Explanatory">Detailed</option>
                      <option value="Raw code only">Raw Code Only</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Emoji Level</label>
                    <select 
                      value={aiSettings.emojiLevel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAiSettings(prev => ({ ...prev, emojiLevel: val }));
                        localStorage.setItem('gear_ai_emoji', val);
                      }}
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Standard">Standard</option>
                      <option value="✨ Enthusiastic">✨ Enthusiastic</option>
                      <option value="🚫 None">None</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Custom Rules / Instructions</label>
                  <textarea 
                    value={aiSettings.customRules}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAiSettings(prev => ({ ...prev, customRules: val }));
                      localStorage.setItem('gear_ai_rules', val);
                    }}
                    className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-indigo-500 h-12 max-h-24 resize-y custom-scrollbar"
                    placeholder="e.g., Always use Tailwind, write CSS in German tags, etc."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => {
              const activeCodingFile = codingFiles[message.id];
              let thoughtText = '';
              let mainText = message.text;

              if (message.role === 'ai') {
                const thoughtMatch = message.text.match(/<thought>([\s\S]*?)(?:<\/thought>|$)/i);
                if (thoughtMatch) {
                  thoughtText = thoughtMatch[1].trim();
                  mainText = message.text.replace(/<thought>[\s\S]*?(?:<\/thought>|$)/i, '').trim();
                }
              }

              return (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[92%] p-3 rounded-2xl text-xs ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : message.isError 
                        ? 'error-message' 
                        : 'bg-[#18181F] text-gray-300 border border-[#2D2D3D]'
                  }`}>
                    {message.role === 'ai' ? (
                      <div className="space-y-3">
                        {/* File Coding Tab Badge with Rolling Animation */}
                        {activeCodingFile && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121826] border border-blue-500/40 rounded-xl shadow-lg">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full"
                            />
                            <FileCode className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[11px] font-mono font-bold text-blue-300">
                              Coding <span className="underline">{activeCodingFile}</span>...
                            </span>
                          </div>
                        )}

                        {/* Google AI Studio Reasoning Thought Box */}
                        {thoughtText && (
                          <div className="bg-[#0F0F16] border border-[#252538] rounded-xl overflow-hidden shadow-2xl">
                            <div className="px-3 py-1.5 bg-[#171724] border-b border-[#252538] flex items-center justify-between text-[10px] font-mono text-purple-300">
                              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                <span>Reasoning Thought</span>
                              </div>
                              <span className="text-[9px] text-gray-500 font-sans">Google AI Studio Process</span>
                            </div>
                            <div className="p-3 text-[11px] font-mono text-gray-400 whitespace-pre-wrap leading-relaxed select-text">
                              {thoughtText}
                            </div>
                          </div>
                        )}

                        {/* Main Markdown Response Body */}
                        {mainText ? (
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
                              {mainText}
                            </Markdown>
                            {message.status === 'generating' && (
                              <motion.span 
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8 }}
                                className="inline-block w-2 h-4 bg-blue-500 ml-1 font-mono align-middle"
                              />
                            )}
                          </div>
                        ) : message.status === 'generating' ? (
                          <div className="flex items-center gap-2 text-gray-400 text-xs py-1">
                            <motion.span 
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="inline-block w-2 h-4 bg-blue-500 font-mono"
                            />
                            <span className="animate-pulse">Reasoning...</span>
                          </div>
                        ) : null}
                      </div>
                    ) : message.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="p-2.5 border-t border-[#262626] space-y-2">
            {images.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-0.5">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img 
                      src={`data:${img.mimeType};base64,${img.data}`} 
                      alt="Upload" 
                      className="w-10 h-10 rounded-lg object-cover border border-[#333]"
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
                placeholder="Imagine..."
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl px-3 py-2 pr-10 text-xs focus:outline-none focus:border-blue-500 transition-all resize-none min-h-[42px] max-h-[110px] custom-scrollbar shadow-inner"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isGenerating || !inputValue.trim()}
                className="absolute right-1.5 bottom-1.5 w-7 h-7 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-full transition-all shadow-md shadow-blue-600/30 flex items-center justify-center active:scale-95 cursor-pointer"
                title="Send Prompt (->)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sketch Toolbar: Upload file (+), Mic (🎙), Strict Commands (!), Model selection (IONIC GEAR ⚙) */}
            <div className="flex items-center justify-between px-0.5 pt-0.5">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-6 h-6 rounded-full bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer" 
                  title="Upload file (+)"
                >
                  <Plus className="w-3 h-3" />
                </button>

                <button 
                  className="w-6 h-6 rounded-full bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer" 
                  title="Mic (Voice Input)"
                >
                  <Mic className="w-3 h-3" />
                </button>

                <button 
                  onClick={() => setStrictCommands(!strictCommands)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                    strictCommands 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm' 
                      : 'bg-[#1A1A1A] text-gray-400 hover:text-gray-200 border-[#333] hover:bg-[#262626]'
                  }`}
                  title="Toggle Strict Commands mode"
                >
                  <span className="font-mono font-black text-amber-400">!</span>
                  <span>Strict Commands</span>
                </button>
              </div>

              {/* Model selection pill */}
              <div className="flex items-center">
                <button 
                  onClick={() => {
                    const nextModel = activeModel === 'ionic' ? 'iconic' : 'ionic';
                    setActiveModel(nextModel);
                    localStorage.setItem('gear_active_model', nextModel);
                  }}
                  className="px-2 py-0.5 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] hover:border-[#444] rounded-full text-[9px] font-black uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Model Selection"
                >
                  <span>{activeModel === 'ionic' ? 'IONIC GEAR' : 'ICONIC GEAR'}</span>
                  <Settings className="w-2.5 h-2.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>


        </div>
        )}
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
      {isLeftMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Overlay background */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLeftMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
          
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="relative w-72 h-full bg-[#0F0F0F] border-r border-[#262626] p-6 flex flex-col z-40 shadow-2xl"
          >
            {/* Drawer Title & Close Button */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-xs tracking-tighter uppercase text-white">Gear Studio Map</span>
              </div>
              <button 
                onClick={() => setIsLeftMenuOpen(false)}
                className="p-1 hover:bg-[#1A1A1A] rounded-lg transition-colors text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Options - Hand Drawn Sketch Menu List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1 pt-2">
              <button 
                onClick={() => {
                  setCurrentPage('overview');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'overview' ? 'bg-[#1E1E1E] text-white border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>OVERVIEW</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('projects');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'projects' || currentPage === 'spaces' ? 'bg-[#1E1E1E] text-white border-indigo-500 shadow-lg shadow-indigo-500/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Box className="w-4 h-4 text-indigo-400" />
                  <span>SPACES</span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-md font-bold">{spaces.length}</span>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('market');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'market' ? 'bg-[#1E1E1E] text-white border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>MARKET</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('teams');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'teams' ? 'bg-[#1E1E1E] text-white border-purple-500 shadow-lg shadow-purple-500/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>TEAMS</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('pricing');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'pricing' ? 'bg-[#1E1E1E] text-white border-amber-500 shadow-lg shadow-amber-500/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>PRICING</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('account');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'account' ? 'bg-[#1E1E1E] text-white border-cyan-500 shadow-lg shadow-cyan-500/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>ACCOUNT</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('integrations');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'integrations' ? 'bg-[#1E1E1E] text-white border-teal-500 shadow-lg shadow-teal-500/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <PluginIcon className="w-4 h-4 text-teal-400" />
                  <span>CONNECTION</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('settings');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'settings' ? 'bg-[#1E1E1E] text-white border-gray-400 shadow-lg shadow-gray-400/10' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>SETTINGS</span>
                </div>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#262626] space-y-2">
              <button 
                onClick={async () => {
                  setIsLeftMenuOpen(false);
                  await supabase.auth.signOut();
                  setCurrentPage('landing');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
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
                Ready to take your space live? We'll deploy your code to Render and provide you with a public URL.
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

    {/* Help Modal */}
    <AnimatePresence>
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelpModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[#111] border border-[#262626] rounded-2xl p-6 shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#222]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Help & Keyboard Shortcuts</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-gray-300">
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">&gt;_ Terminal / Logs</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-blue-400">Toggle Icon</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">&lt;/&gt; Code View</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-blue-400">Editor Mode</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">▶ Live Preview</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-blue-400">Preview Mode</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">! Strict Commands</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-amber-400">Strict AI Enforcement</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">Secrets / .env</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-yellow-400">Key Icon</kbd>
              </div>
            </div>
            <button 
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Push to Team Modal */}
    <AnimatePresence>
      {showTeamPushNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTeamPushNotice(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-[#111] border border-[#262626] rounded-2xl p-6 shadow-2xl text-center z-10"
          >
            <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Push to Team Space</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Synchronizing all space code, environment variables, and active model preferences with your organization workspace team members.
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setShowTeamPushNotice(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Confirm Push to Team
              </button>
              <button 
                onClick={() => setShowTeamPushNotice(false)}
                className="w-full py-2.5 bg-transparent hover:bg-[#1A1A1A] text-gray-400 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}

