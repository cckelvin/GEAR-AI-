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
  ChevronDown,
  ChevronUp,
  Clock,
  GitBranch,
  Github
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
import AiMessageItem from './components/AiMessageItem';
import PhysicalBrushEditor, { InspectedElementData } from './components/PhysicalBrushEditor';
import GitHubPushModal from './components/GitHubPushModal';
import { LinkedRepoInfo } from './services/github';

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
  const [inspectedElement, setInspectedElement] = useState<InspectedElementData | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
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
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [spaceVersions, setSpaceVersions] = useState<Array<{
    id: string;
    versionNumber: number;
    label: string;
    timestamp: string;
    filesCount: number;
    author: string;
    filesSnapshot?: FileData[];
  }>>([
    { id: 'v31', versionNumber: 31, label: 'Current Working Copy (Live)', timestamp: 'Just now', filesCount: 3, author: 'You' },
    { id: 'v30', versionNumber: 30, label: 'Exemplar Benchmark & Chat Plan', timestamp: '12 mins ago', filesCount: 3, author: 'Gear AI' },
    { id: 'v29', versionNumber: 29, label: 'Navigation & Component Architecture', timestamp: '35 mins ago', filesCount: 3, author: 'Gear AI' },
    { id: 'v28', versionNumber: 28, label: 'Initial Project Scaffold', timestamp: '1 hour ago', filesCount: 2, author: 'System' },
  ]);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [teamPushCommitMsg, setTeamPushCommitMsg] = useState('Updated workspace code and architecture');
  const [isPushingToTeam, setIsPushingToTeam] = useState(false);
  const [teamPushSuccess, setTeamPushSuccess] = useState(false);
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
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [linkedRepoInfo, setLinkedRepoInfo] = useState<LinkedRepoInfo | null>(null);

  // Load linked GitHub repo for current space
  useEffect(() => {
    if (currentSpace?.id) {
      const stored = localStorage.getItem(`gear_github_repo_${currentSpace.id}`);
      if (stored) {
        try {
          setLinkedRepoInfo(JSON.parse(stored));
        } catch (e) {
          setLinkedRepoInfo(null);
        }
      } else {
        setLinkedRepoInfo(null);
      }
    } else {
      setLinkedRepoInfo(null);
    }
  }, [currentSpace?.id]);

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
  const [images, setImages] = useState<{ data: string; mimeType: string; name?: string }[]>([]);
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
      if (event.data?.type === 'BRUSH_ELEMENT_SELECTED') {
        setInspectedElement(event.data.element);
      }
      if (event.data?.type === 'BRUSH_HTML_MUTATED') {
        const newFullHtml = event.data.fullHtml;
        if (newFullHtml) {
          setFiles(prev => {
            const idx = prev.findIndex(f => f.name === 'index.html');
            if (idx >= 0) {
              let cleanHtml = newFullHtml.replace(/<div id="__brush_inspector_overlay"[\s\S]*?<\/div><\/div>/g, '');
              cleanHtml = cleanHtml.replace(/<div id="__brush_inspector_overlay"[\s\S]*?<\/div>/g, '');
              const updated = [...prev];
              updated[idx] = { ...updated[idx], content: cleanHtml };
              return updated;
            }
            return prev;
          });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Post brush active state to preview iframe whenever it toggles
  useEffect(() => {
    if (previewIframeRef.current && previewIframeRef.current.contentWindow) {
      previewIframeRef.current.contentWindow.postMessage({
        type: 'SET_BRUSH_ACTIVE',
        active: isInspectorActive
      }, '*');
    }
  }, [isInspectorActive]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          // Extract base64 data for Gemini inlineData
          const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
          const mimeType = file.type || 'image/png';
          
          setImages(prev => [
            ...prev,
            {
              data: base64Data,
              mimeType,
              name: file.name
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onloadend = () => {
          const content = reader.result as string;
          setInputValue(prev => {
            const prefix = prev ? prev + '\n\n' : '';
            return prefix + `[ATTACHED FILE: ${file.name}]\n\`\`\`\n${content}\n\`\`\``;
          });
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

  const handleApplyPhysicalBrushUpdate = (updates: {
    text?: string;
    classes?: string;
    style?: Record<string, string>;
    remove?: boolean;
    duplicate?: boolean;
  }) => {
    if (previewIframeRef.current && previewIframeRef.current.contentWindow) {
      previewIframeRef.current.contentWindow.postMessage({
        type: 'APPLY_PHYSICAL_BRUSH_UPDATE',
        selector: inspectedElement?.selector,
        updates
      }, '*');
    }
  };

  const handleBrushAiPrompt = (prompt: string, elementContext?: InspectedElementData) => {
    let fullPrompt = prompt;
    if (elementContext) {
      fullPrompt = `[PHYSICAL BRUSH TARGET ELEMENT]:\nTag: <${elementContext.tag}>\nSelector: ${elementContext.selector}\nClasses: "${elementContext.classes}"\nCurrent HTML:\n\`\`\`html\n${elementContext.html}\n\`\`\`\n\nUSER REQUEST FOR THIS SPECIFIC ELEMENT:\n${prompt}`;
    }
    handleSendMessage(fullPrompt);
  };

  const handleSendDrawingToAi = (dataUrl: string) => {
    const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    setImages(prev => [
      ...prev,
      {
        data: base64Data,
        mimeType: 'image/png',
        name: 'brush_sketch_annotation.png'
      }
    ]);
    const drawingPrompt = `[PHYSICAL FREEHAND BRUSH SKETCH]: I have physically drawn annotations and visual notes over the application preview canvas. Please analyze the highlighted regions/arrows/marks in the attached sketch and implement the corresponding visual and layout changes in the workspace code.`;
    handleSendMessage(drawingPrompt);
  };

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
          <script>
            // Physical Brush Inspector and DOM Mutation Bridge
            (function() {
              let isBrushActive = ${isInspectorActive ? 'true' : 'false'};
              let hoveredEl = null;
              let selectedEl = null;
              let highlightOverlay = null;

              function ensureOverlay() {
                if (!highlightOverlay) {
                  highlightOverlay = document.createElement('div');
                  highlightOverlay.id = '__brush_inspector_overlay';
                  highlightOverlay.style.position = 'fixed';
                  highlightOverlay.style.pointerEvents = 'none';
                  highlightOverlay.style.zIndex = '999999';
                  highlightOverlay.style.border = '2px dashed #6366f1';
                  highlightOverlay.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                  highlightOverlay.style.borderRadius = '6px';
                  highlightOverlay.style.transition = 'all 0.05s ease';
                  highlightOverlay.style.display = 'none';
                  
                  const badge = document.createElement('div');
                  badge.id = '__brush_badge';
                  badge.style.position = 'absolute';
                  badge.style.top = '-22px';
                  badge.style.left = '0';
                  badge.style.backgroundColor = '#4f46e5';
                  badge.style.color = '#ffffff';
                  badge.style.fontFamily = 'ui-monospace, monospace';
                  badge.style.fontSize = '10px';
                  badge.style.padding = '2px 6px';
                  badge.style.borderRadius = '4px';
                  badge.style.whiteSpace = 'nowrap';
                  badge.style.fontWeight = 'bold';
                  badge.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5)';
                  highlightOverlay.appendChild(badge);

                  document.body.appendChild(highlightOverlay);
                }
              }

              function getElementSelector(el) {
                if (!el || el === document.body || el === document.documentElement) return 'body';
                if (el.id) return '#' + el.id;
                let path = [];
                while (el && el.nodeType === Node.ELEMENT_NODE && el !== document.body && el !== document.documentElement) {
                  let selector = el.nodeName.toLowerCase();
                  if (el.className && typeof el.className === 'string' && el.className.trim()) {
                    const firstClass = el.className.trim().split(/\s+/)[0];
                    if (firstClass && !firstClass.includes(':') && !firstClass.includes('[')) {
                      selector += '.' + firstClass;
                    }
                  }
                  let siblingIndex = 1;
                  let sibling = el.previousElementSibling;
                  while (sibling) {
                    if (sibling.nodeName.toLowerCase() === el.nodeName.toLowerCase()) {
                      siblingIndex++;
                    }
                    sibling = sibling.previousElementSibling;
                  }
                  selector += ':nth-of-type(' + siblingIndex + ')';
                  path.unshift(selector);
                  el = el.parentElement;
                }
                return path.join(' > ');
              }

              function updateOverlay(el) {
                ensureOverlay();
                if (!el || el === document.body || el === document.documentElement || el.id === '__brush_inspector_overlay' || (highlightOverlay && highlightOverlay.contains(el))) {
                  if (highlightOverlay) highlightOverlay.style.display = 'none';
                  return;
                }
                const rect = el.getBoundingClientRect();
                highlightOverlay.style.display = 'block';
                highlightOverlay.style.top = rect.top + 'px';
                highlightOverlay.style.left = rect.left + 'px';
                highlightOverlay.style.width = rect.width + 'px';
                highlightOverlay.style.height = rect.height + 'px';
                
                const badge = document.getElementById('__brush_badge');
                if (badge) {
                  let tagText = '<' + el.tagName.toLowerCase();
                  if (el.id) tagText += '#' + el.id;
                  else if (el.classList && el.classList.length > 0) tagText += '.' + el.classList[0];
                  tagText += '>';
                  badge.textContent = tagText + ' ' + Math.round(rect.width) + '×' + Math.round(rect.height);
                }
              }

              window.addEventListener('mousemove', function(e) {
                if (!isBrushActive) return;
                const target = e.target;
                if (target && target !== highlightOverlay && (!highlightOverlay || !highlightOverlay.contains(target))) {
                  hoveredEl = target;
                  updateOverlay(target);
                }
              }, true);

              window.addEventListener('click', function(e) {
                if (!isBrushActive) return;
                e.preventDefault();
                e.stopPropagation();
                
                const target = e.target;
                if (target && target !== highlightOverlay && (!highlightOverlay || !highlightOverlay.contains(target))) {
                  selectedEl = target;
                  updateOverlay(target);
                  
                  const computed = window.getComputedStyle(target);
                  const rect = target.getBoundingClientRect();
                  
                  window.parent.postMessage({
                    type: 'BRUSH_ELEMENT_SELECTED',
                    element: {
                      tag: target.tagName.toLowerCase(),
                      id: target.id || '',
                      classes: target.className || '',
                      text: target.innerText || target.textContent || '',
                      html: target.outerHTML,
                      selector: getElementSelector(target),
                      styles: {
                        color: computed.color,
                        backgroundColor: computed.backgroundColor,
                        fontSize: computed.fontSize,
                        fontWeight: computed.fontWeight,
                        padding: computed.padding,
                        margin: computed.margin,
                        borderRadius: computed.borderRadius,
                        textAlign: computed.textAlign,
                        display: computed.display,
                        borderColor: computed.borderColor,
                        borderWidth: computed.borderWidth
                      },
                      rect: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                      }
                    }
                  }, '*');
                }
              }, true);

              // Listen for physical brush updates from parent
              window.addEventListener('message', function(event) {
                if (!event.data) return;
                
                if (event.data.type === 'SET_BRUSH_ACTIVE') {
                  isBrushActive = !!event.data.active;
                  if (!isBrushActive && highlightOverlay) {
                    highlightOverlay.style.display = 'none';
                  }
                }

                if (event.data.type === 'APPLY_PHYSICAL_BRUSH_UPDATE') {
                  const { selector, updates } = event.data;
                  let target = null;
                  if (selector) {
                    try {
                      target = document.querySelector(selector);
                    } catch(e) {}
                  }
                  if (!target && selectedEl) target = selectedEl;
                  
                  if (target) {
                    if (updates.text !== undefined) {
                      target.innerText = updates.text;
                    }
                    if (updates.classes !== undefined) {
                      target.className = updates.classes;
                    }
                    if (updates.style) {
                      Object.assign(target.style, updates.style);
                    }
                    if (updates.remove) {
                      target.remove();
                      if (highlightOverlay) highlightOverlay.style.display = 'none';
                    }
                    if (updates.duplicate) {
                      const clone = target.cloneNode(true);
                      target.parentNode?.insertBefore(clone, target.nextSibling);
                    }
                    
                    if (!updates.remove) {
                      updateOverlay(target);
                    }

                    if (highlightOverlay) highlightOverlay.style.display = 'none';
                    const fullDocHtml = document.documentElement.outerHTML;

                    window.parent.postMessage({
                      type: 'BRUSH_HTML_MUTATED',
                      fullHtml: fullDocHtml
                    }, '*');
                  }
                }
              });
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
    const currentImages = [...images];
    const inputToUse = overrideInput || inputValue || (currentImages.length > 0 ? 'Analyze the attached image/file and build the complete application matching this design and layout.' : '');
    if (!inputToUse.trim() && currentImages.length === 0) return;

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
      
      const stream = await generateCodeResponseStream(currentInput, history, currentImages, files, { ...aiSettings, activeModel });
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
                      className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${showLogs ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
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
                      className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${currentPage === 'editor' && !showPreview && !showEnvPage ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
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
                      className={`px-2 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${showPreview ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
                      title="Play / Preview (▶)"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button 
                      onClick={() => setCurrentPage('settings')}
                      className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center ${(currentPage as string) === 'settings' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white hover:bg-[#222]'}`}
                      title="Settings (⚙)"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right controls: Secrets, Plugins, Export, Help, Three Dot Menu (containing Versions & Push to Team) */}
                <div className="flex items-center gap-2 relative">
                  <button 
                    onClick={() => {
                      setShowEnvPage(true);
                      setShowPreview(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 border ${showEnvPage ? 'bg-neutral-800 text-white border-neutral-600' : 'bg-[#141414] text-gray-300 hover:text-white border-[#262626] hover:bg-[#1A1A1A]'}`}
                    title="Secrets & Environment Variables"
                  >
                    <Key className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Secrets</span>
                  </button>

                  <button 
                    onClick={() => setCurrentPage('integrations')}
                    className="px-2.5 py-1 bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] text-gray-300 hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5"
                    title="Plugins & Integrations"
                  >
                    <PluginIcon className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Plugins</span>
                  </button>

                  {/* GitHub Direct Sync Button */}
                  <button 
                    id="header-github-push-button"
                    onClick={() => setShowGitHubModal(true)}
                    className={`px-2.5 py-1 border rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      linkedRepoInfo
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
                        : 'bg-[#141414] hover:bg-[#1C1C1C] text-neutral-300 hover:text-white border-[#262626]'
                    }`}
                    title={linkedRepoInfo ? `Linked to ${linkedRepoInfo.fullName} (Click to push updates)` : 'Push code to GitHub repository'}
                  >
                    <Github className="w-3.5 h-3.5 text-white" />
                    <span>{linkedRepoInfo ? 'Update GitHub' : 'GitHub'}</span>
                    {linkedRepoInfo && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
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
                    className="px-2.5 py-1 bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] text-gray-300 hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Export Space Code JSON"
                  >
                    <Upload className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Export</span>
                  </button>

                  <button 
                    onClick={() => setShowHelpModal(true)}
                    className="w-7 h-7 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] text-gray-400 hover:text-white flex items-center justify-center transition-all text-xs font-bold"
                    title="Help & Info"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>

                  {/* Three Dot Options Button (contains Versions, Push to Team, Deploy, etc.) */}
                  <button 
                    id="three-dot-options-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isMenuOpen ? 'bg-white text-black' : 'text-neutral-400 hover:text-white hover:bg-[#262626]'}`}
                    title="Workspace Options (Versions, Push to Team, Deploy)"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setIsMenuOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-2 w-64 bg-[#0F0F0F] border border-[#262626] rounded-2xl shadow-2xl z-40 overflow-hidden"
                        >
                          {/* Header / Current Space Status */}
                          <div className="px-3.5 py-2.5 border-b border-[#222] bg-[#141414] flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-bold block">Space Workspace</span>
                              <span className="text-xs font-bold text-white truncate block">{currentSpace.name}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-200 font-mono text-[9px] font-bold rounded-full">
                              v{spaceVersions[0]?.versionNumber || 31}
                            </span>
                          </div>

                          {/* Primary Actions: Versions & Push to Team */}
                          <div className="p-2 space-y-1.5 bg-[#0F0F0F]">
                            {/* Versions option */}
                            <button 
                              id="menu-versions-button"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowVersionsModal(true);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-white transition-all group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-black border border-neutral-700 flex items-center justify-center text-white">
                                  <History className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                  <span className="font-bold block text-[11px] leading-tight text-white">Versions</span>
                                  <span className="text-[9px] text-neutral-400 font-mono leading-tight">
                                    Version ({spaceVersions[0]?.versionNumber || 31}) • {spaceVersions.length} snapshots
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>

                            {/* Push to GitHub repository option */}
                            <button 
                              id="menu-push-to-github-button"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowGitHubModal(true);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs bg-[#1C1C1C] hover:bg-[#252525] text-white font-bold transition-all border border-[#2E2E2E] group cursor-pointer shadow-sm"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center shadow-sm">
                                  <Github className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <span className="font-bold block text-[11px] leading-tight text-white flex items-center gap-1.5">
                                    {linkedRepoInfo ? 'Update GitHub Repo' : 'Push to GitHub'}
                                    {linkedRepoInfo && (
                                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[8px] font-mono rounded font-bold">
                                        LINKED
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[9px] text-neutral-400 font-medium normal-case font-mono leading-tight truncate max-w-[140px] block">
                                    {linkedRepoInfo ? linkedRepoInfo.fullName : 'Commit code directly'}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>

                            {/* Push to team option */}
                            <button 
                              id="menu-push-to-team-button"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowTeamPushNotice(true);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-wider transition-all shadow-md group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white">
                                  <Users className="w-3.5 h-3.5" />
                                </div>
                                <div className="text-left">
                                  <span className="font-black block text-[11px] leading-tight text-black">Push to Team</span>
                                  <span className="text-[9px] text-neutral-700 font-medium normal-case font-mono leading-tight">
                                    Sync space & preferences
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </div>

                          <div className="h-[1px] bg-[#222] my-0.5 mx-2" />

                          {/* Secondary options */}
                          <div className="p-2 pt-1 space-y-0.5">
                            <button 
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowDeployModal(true);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-[#1A1A1A] transition-all cursor-pointer"
                            >
                              <Globe className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Deploy to Render</span>
                            </button>
                            <button 
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowEnvPage(true);
                                setShowPreview(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-[#1A1A1A] transition-all cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Secrets & Environment</span>
                            </button>
                            <button 
                              onClick={() => {
                                setIsMenuOpen(false);
                                setShowGitHubModal(true);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-[#1A1A1A] transition-all cursor-pointer"
                            >
                              <Code className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Sync to GitHub ({linkedRepoInfo ? 'Linked' : 'Setup'})</span>
                            </button>
                            <button 
                              onClick={() => {
                                setIsMenuOpen(false);
                                const blob = new Blob([JSON.stringify({ space: currentSpace, files }, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${currentSpace.name.toLowerCase().replace(/\s+/g, '-')}-export.json`;
                                a.click();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-[#1A1A1A] transition-all cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Export Space JSON</span>
                            </button>

                            <div className="h-[1px] bg-[#222] my-1" />

                            <button 
                              onClick={async () => {
                                setIsMenuOpen(false);
                                await supabase.auth.signOut();
                                setCurrentPage('landing');
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
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
        {/* Left Sidebar: File Explorer - ONLY shown when inside the project editor */}
        {!showPreview && currentPage === 'editor' && (
          <div className="w-48 border-r border-[#262626] flex flex-col bg-[#0F0F0F]">
            <div className="p-4 border-b border-[#262626]">
              <p className="text-[9px] font-bold text-gray-500 leading-tight uppercase tracking-wider">
                AI Coded Files & Folders
                <br />
                <span className="text-neutral-500 italic lowercase font-normal">click to edit manually</span>
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
                        ? 'bg-white text-black font-semibold border border-neutral-300' 
                        : 'hover:bg-[#1A1A1A] text-gray-500 hover:text-gray-300'
                    } ${Object.values(codingFiles).includes(file.name) ? 'ring-1 ring-white/50 animate-pulse' : ''}`}
                  >
                    <FileCode className={`w-3.5 h-3.5 ${activeFileIndex === idx && currentPage === 'editor' ? 'text-black' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    <span className="truncate flex-1">{file.name}</span>
                    {Object.values(codingFiles).includes(file.name) && (
                      <div className="flex gap-0.5">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-white rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-white rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-white rounded-full" />
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
              setCurrentSpace={setCurrentSpace}
              loadSpaceFiles={loadSpaceFiles}
              loadSpaceMessages={loadSpaceMessages}
              setCurrentPage={setCurrentPage}
              setShowPreview={setShowPreview}
              handleNewSpace={handleNewSpace}
              deleteSpace={deleteSpace}
              aiSettings={aiSettings}
              setInputValue={setInputValue}
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
          ) : currentPage === 'integrations' ? (
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
              onOpenGitHubModal={() => setShowGitHubModal(true)}
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
                    <Eye className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Preview</span>
                  </span>

                  {/* Physical Brush & Inspector Button */}
                  <button 
                    onClick={() => {
                      const nextState = !isInspectorActive;
                      setIsInspectorActive(nextState);
                      if (!nextState) {
                        setInspectedElement(null);
                        setIsDrawingMode(false);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${isInspectorActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/50' : 'bg-[#141414] text-gray-400 hover:text-white border-[#262626] hover:bg-[#222]'}`}
                    title="Physical Brush Tool: Directly edit styles, text, classes or sketch physical annotations with freehand brush"
                  >
                    <Paintbrush className={`w-3.5 h-3.5 ${isInspectorActive ? 'animate-pulse text-white' : 'text-neutral-300'}`} />
                    <span className="font-extrabold tracking-wide">Physical Brush</span>
                    {isInspectorActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />}
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
                      {previewDevice === 'pc' && <Monitor className="w-3.5 h-3.5 text-neutral-300" />}
                      {previewDevice === 'tablet' && <Tablet className="w-3.5 h-3.5 text-neutral-300" />}
                      {previewDevice === 'phone' && <Smartphone className="w-3.5 h-3.5 text-neutral-300" />}
                      {previewDevice === 'tv' && <Tv className="w-3.5 h-3.5 text-neutral-300" />}
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
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'pc' ? 'bg-white text-black' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>PC / Desktop</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewDevice('tablet');
                            setShowDeviceMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'tablet' ? 'bg-white text-black' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
                        >
                          <Tablet className="w-3.5 h-3.5" />
                          <span>Tablet (768px)</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewDevice('phone');
                            setShowDeviceMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'phone' ? 'bg-white text-black' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Phone (375px)</span>
                        </button>
                        <button
                          onClick={() => {
                            setPreviewDevice('tv');
                            setShowDeviceMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-left ${previewDevice === 'tv' ? 'bg-white text-black' : 'text-gray-300 hover:bg-[#222] hover:text-white'}`}
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
                    className={`p-1.5 border rounded-xl transition-all cursor-pointer ${isRotated ? 'bg-white text-black border-white shadow' : 'bg-[#141414] border-[#262626] text-gray-400 hover:text-white hover:bg-[#222]'}`}
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
                  } ${isInspectorActive ? 'ring-4 ring-indigo-500/80 shadow-indigo-500/20' : ''}`}
                >
                  <iframe
                    ref={previewIframeRef}
                    key={previewKey}
                    srcDoc={combinedCode}
                    className="w-full h-full border-none rounded-lg"
                    title="Preview"
                    sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                  />
                </div>

                {/* Physical Brush Inspector & Canvas Overlay Tool */}
                {(isInspectorActive || inspectedElement || isDrawingMode) && (
                  <PhysicalBrushEditor
                    isBrushActive={isInspectorActive}
                    onToggleBrush={setIsInspectorActive}
                    inspectedElement={inspectedElement}
                    onClearSelection={() => setInspectedElement(null)}
                    onApplyUpdate={handleApplyPhysicalBrushUpdate}
                    onSendAiPrompt={handleBrushAiPrompt}
                    onSendDrawingToAi={handleSendDrawingToAi}
                    isDrawingMode={isDrawingMode}
                    onToggleDrawingMode={setIsDrawingMode}
                  />
                )}
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
          <div className="p-3 border-b border-[#262626] flex items-center justify-between col-span-1 bg-[#0F0F0F]">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {aiSettings.assistantName}
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setAiMode('fast')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${aiMode === 'fast' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              >
                Fast
              </button>
              <button 
                onClick={() => setAiMode('complex')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${aiMode === 'complex' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
              >
                Complex
              </button>
              <button 
                onClick={() => setShowAiSettings(!showAiSettings)}
                className={`p-1 rounded transition-all ${showAiSettings ? 'text-white bg-neutral-800 border border-neutral-700' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                title="Personalize AI Coder"
              >
                <Sparkles className="w-3.5 h-3.5" />
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
                  <span className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-white" /> Persona Customizer
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
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-neutral-500"
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
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-neutral-500"
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
                    className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
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
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
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
                      className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
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
                    className="w-full bg-[#111] border border-[#262626] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-neutral-500 h-12 max-h-24 resize-y custom-scrollbar"
                    placeholder="e.g., Always use Tailwind, write CSS in German tags, etc."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {messages.map((message) => {
              const activeCodingFile = codingFiles[message.id];
              return (
                <AiMessageItem
                  key={message.id}
                  message={message}
                  activeCodingFile={activeCodingFile}
                  onApplyCode={handleApplyCode}
                />
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Compact Input Toolbar Section */}
          <div className="p-2 border-t border-[#262626] bg-[#0C0C0C] space-y-1.5 shrink-0">
            {images.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 px-1 py-1 bg-[#141414] border border-[#222] rounded-xl mb-1">
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono px-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini Multimodal Analysis ({images.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group flex items-center gap-1.5 bg-[#1C1C1C] border border-[#333] pl-1 pr-2 py-0.5 rounded-lg">
                      <img 
                        src={`data:${img.mimeType};base64,${img.data}`} 
                        alt={img.name || "Upload"} 
                        className="w-6 h-6 rounded object-cover border border-[#444]"
                      />
                      <span className="text-[10px] text-neutral-300 max-w-[90px] truncate font-medium">
                        {img.name || `image_${idx + 1}`}
                      </span>
                      <button 
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-0.5 rounded"
                        title="Remove image"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,.txt,.js,.ts,.tsx,.json,.html,.css,.md" 
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
                placeholder={images.length > 0 ? "Describe changes or press enter to analyze image with Gemini..." : "Imagine..."}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 pr-8 text-xs text-white focus:outline-none focus:border-neutral-500 transition-all resize-none min-h-[38px] max-h-[85px] custom-scrollbar shadow-inner"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isGenerating || (!inputValue.trim() && images.length === 0)}
                className="absolute right-1.5 bottom-1.5 w-6 h-6 bg-white hover:bg-neutral-200 disabled:opacity-30 text-black rounded-full transition-all shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
                title="Send Prompt (->)"
              >
                <ArrowRight className="w-3 h-3 text-black" />
              </button>
            </div>

            {/* Ultra-compact Sketch Toolbar */}
            <div className="flex items-center justify-between px-0.5 pt-0.5">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-5 h-5 rounded-full bg-[#161616] hover:bg-[#262626] border border-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer" 
                  title="Upload file (+)"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>

                <button 
                  className="w-5 h-5 rounded-full bg-[#161616] hover:bg-[#262626] border border-[#333] text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer" 
                  title="Mic (Voice Input)"
                >
                  <Mic className="w-2.5 h-2.5" />
                </button>

                <button 
                  onClick={() => setStrictCommands(!strictCommands)}
                  className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                    strictCommands 
                      ? 'bg-neutral-800 text-white border-neutral-600 shadow-sm' 
                      : 'bg-[#161616] text-neutral-400 hover:text-white border-[#333] hover:bg-[#222]'
                  }`}
                  title="Toggle Strict Commands mode"
                >
                  <span className="font-mono font-black text-white">!</span>
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
                  className="px-2 py-0.5 bg-[#161616] hover:bg-[#222] border border-[#333] hover:border-[#555] rounded-full text-[8px] font-black uppercase tracking-wider text-white transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                  title="Model Selection"
                >
                  <span>{activeModel === 'ionic' ? 'IONIC GEAR' : 'ICONIC GEAR'}</span>
                  <Settings className="w-2 h-2 text-neutral-400" />
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
                <ShoppingCart className="w-5 h-5 text-white" />
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
                    className="mt-4 text-xs font-bold text-white hover:underline uppercase tracking-widest"
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
                        className="p-2 text-gray-600 hover:text-white transition-colors"
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
                  className="w-full py-4 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                  {isBuyingDomain ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : 'Checkout & Connect'}
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
              <div className="w-16 h-16 bg-neutral-900 border border-neutral-700 rounded-2xl flex items-center justify-center mb-6">
                <Box className="w-8 h-8 text-white" />
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
                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl py-4 px-5 text-sm text-white focus:outline-none focus:border-neutral-500 transition-all"
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
                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl py-4 px-5 text-sm text-white focus:outline-none focus:border-neutral-500 transition-all resize-none h-24"
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
                  className="flex-1 py-4 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-bold rounded-xl transition-all shadow-xl"
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
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <Code className="w-4 h-4 text-black" />
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

            {/* Navigation Options */}
            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1 pt-2">
              <button 
                onClick={() => {
                  setCurrentPage('overview');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'overview' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Zap className={`w-4 h-4 ${currentPage === 'overview' ? 'text-black' : 'text-neutral-300'}`} />
                  <span>BUILD FASTER</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${currentPage === 'overview' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}`}>PRO</span>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('projects');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'projects' || currentPage === 'spaces' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Box className={`w-4 h-4 ${currentPage === 'projects' || currentPage === 'spaces' ? 'text-black' : 'text-neutral-300'}`} />
                  <span>SPACES</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${currentPage === 'projects' || currentPage === 'spaces' ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-300'}`}>{spaces.length}</span>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('market');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'market' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className={`w-4 h-4 ${currentPage === 'market' ? 'text-black' : 'text-neutral-300'}`} />
                  <span>MARKET</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('teams');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'teams' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${currentPage === 'teams' ? 'text-black' : 'text-neutral-300'}`} />
                  <span>TEAMS</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('pricing');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'pricing' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className={`w-4 h-4 ${currentPage === 'pricing' ? 'text-black' : 'text-neutral-300'}`} />
                  <span>PRICING</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('account');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'account' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <User className={`w-4 h-4 ${currentPage === 'account' ? 'text-black' : 'text-neutral-300'}`} />
                  <span>ACCOUNT</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('integrations');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'integrations' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <PluginIcon className={`w-4 h-4 ${currentPage === 'integrations' ? 'text-black' : 'text-neutral-300'}`} />
                  <span>CONNECTION</span>
                </div>
              </button>

              <button 
                onClick={() => {
                  setCurrentPage('settings');
                  setIsLeftMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${currentPage === 'settings' ? 'bg-white text-black border-white shadow-lg' : 'bg-[#141414] text-gray-300 border-[#262626] hover:bg-[#1C1C1C] hover:text-white hover:border-gray-700'}`}
              >
                <div className="flex items-center gap-3">
                  <Settings className={`w-4 h-4 ${currentPage === 'settings' ? 'text-black' : 'text-neutral-300'}`} />
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
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
              <div className="w-12 h-12 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
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
                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-neutral-500 transition-all pr-24"
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
                  className="w-full py-3 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isDeploying ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Confirm Deployment'}
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
                <HelpCircle className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Help & Keyboard Shortcuts</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-gray-300">
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">&gt;_ Terminal / Logs</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-white">Toggle Icon</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">&lt;/&gt; Code View</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-white">Editor Mode</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">▶ Live Preview</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-white">Preview Mode</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">! Strict Commands</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-white">Strict AI Enforcement</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#1A1A1A] rounded-lg border border-[#262626]">
                <span className="font-medium text-gray-400">Secrets / .env</span>
                <kbd className="px-2 py-0.5 bg-[#262626] rounded text-[10px] font-mono text-white">Key Icon</kbd>
              </div>
            </div>
            <button 
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Versions Modal */}
    <AnimatePresence>
      {showVersionsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVersionsModal(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#222] bg-[#141414] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Versions & Snapshots
                    <span className="px-2 py-0.5 bg-white text-black font-mono text-[9px] font-black rounded-full">
                      v{spaceVersions[0]?.versionNumber || 31} ACTIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {currentSpace.name} • {spaceVersions.length} recorded versions
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowVersionsModal(false)} 
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create Checkpoint Bar */}
            <div className="p-4 border-b border-[#222] bg-[#0A0A0A]">
              <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1.5">
                Create Version Checkpoint
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSnapshotLabel}
                  onChange={(e) => setNewSnapshotLabel(e.target.value)}
                  placeholder="e.g. Added responsive layout and auth flow"
                  className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  onClick={() => {
                    const nextNum = (spaceVersions[0]?.versionNumber || 31) + 1;
                    const newVer = {
                      id: `v${nextNum}`,
                      versionNumber: nextNum,
                      label: newSnapshotLabel.trim() || `Manual Snapshot v${nextNum}`,
                      timestamp: 'Just now',
                      filesCount: files.length,
                      author: 'You',
                      filesSnapshot: JSON.parse(JSON.stringify(files))
                    };
                    setSpaceVersions([newVer, ...spaceVersions]);
                    setNewSnapshotLabel('');
                  }}
                  className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl transition-all shadow cursor-pointer shrink-0"
                >
                  Snapshot
                </button>
              </div>
            </div>

            {/* Versions List */}
            <div className="p-4 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar">
              {spaceVersions.map((ver, idx) => (
                <div 
                  key={ver.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    idx === 0 
                      ? 'bg-neutral-900/60 border-neutral-700 shadow-sm' 
                      : 'bg-[#121212] border-[#222] hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white bg-black px-2 py-0.5 rounded border border-neutral-800">
                          v{ver.versionNumber}
                        </span>
                        <span className="text-xs font-semibold text-neutral-200">{ver.label}</span>
                        {idx === 0 && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {ver.timestamp}
                        </span>
                        <span>•</span>
                        <span>{ver.filesCount} Files</span>
                        <span>•</span>
                        <span>By {ver.author}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {idx !== 0 && (
                        <button
                          onClick={() => {
                            if (ver.filesSnapshot && ver.filesSnapshot.length > 0) {
                              setFiles(ver.filesSnapshot);
                            }
                            // Move restored version to top
                            const updated = [
                              {
                                ...ver,
                                label: `Restored from v${ver.versionNumber}: ${ver.label}`,
                                timestamp: 'Just now',
                                author: 'You'
                              },
                              ...spaceVersions.filter(v => v.id !== ver.id)
                            ];
                            setSpaceVersions(updated);
                            setShowVersionsModal(false);
                          }}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 hover:text-white rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                          title="Restore files to this version"
                        >
                          Restore
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowVersionsModal(false);
                          setShowTeamPushNotice(true);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-black rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                        title="Push this version to team"
                      >
                        Push
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#222] bg-[#141414] flex items-center justify-between">
              <span className="text-[11px] font-mono text-neutral-400">
                Auto-saved locally and synchronized
              </span>
              <button 
                onClick={() => {
                  setShowVersionsModal(false);
                  setShowTeamPushNotice(true);
                }}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl transition-all shadow cursor-pointer flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-black" />
                <span>Push Current to Team</span>
              </button>
            </div>
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
            onClick={() => {
              if (!isPushingToTeam) setShowTeamPushNotice(false);
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 shadow-2xl z-10 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#222]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center shadow-md">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Push to Team Space</h3>
                  <p className="text-[10px] text-neutral-400 font-mono">Organization Workspace Sync</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTeamPushNotice(false)} 
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {teamPushSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto shadow-xl">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-white">Successfully Pushed to Team!</h4>
                <p className="text-xs text-neutral-400 font-mono">
                  All workspace files, version v{spaceVersions[0]?.versionNumber || 31}, and environment variables are live for team collaborators.
                </p>
                <button
                  onClick={() => {
                    setTeamPushSuccess(false);
                    setShowTeamPushNotice(false);
                  }}
                  className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black text-xs font-bold rounded-xl transition-all cursor-pointer mt-4"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Space & Version Summary */}
                <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-400 font-mono text-[11px]">Space</span>
                    <span className="font-bold text-white">{currentSpace.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-400 font-mono text-[11px]">Active Version</span>
                    <span className="font-mono bg-black px-2 py-0.5 rounded border border-neutral-800 text-white text-[10px]">
                      v{spaceVersions[0]?.versionNumber || 31}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-400 font-mono text-[11px]">Files Synced</span>
                    <span className="font-mono text-neutral-200 text-[11px]">{files.length} code files</span>
                  </div>
                </div>

                {/* Commit/Sync Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                    Sync Note / Commit Message
                  </label>
                  <input
                    type="text"
                    value={teamPushCommitMsg}
                    onChange={(e) => setTeamPushCommitMsg(e.target.value)}
                    placeholder="Describe what changed in this version..."
                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button 
                    disabled={isPushingToTeam}
                    onClick={async () => {
                      setIsPushingToTeam(true);
                      // Perform Supabase sync if user logged in
                      if (session?.user?.id) {
                        await syncSpaceToSupabase(currentSpace, files, messages);
                      }
                      setTimeout(() => {
                        setIsPushingToTeam(false);
                        setTeamPushSuccess(true);
                      }, 900);
                    }}
                    className="w-full py-3 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isPushingToTeam ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                        />
                        <span>Pushing to Team...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3.5 h-3.5 text-black" />
                        <span>Confirm Push to Team</span>
                      </>
                    )}
                  </button>
                  <button 
                    disabled={isPushingToTeam}
                    onClick={() => setShowTeamPushNotice(false)}
                    className="w-full py-2.5 bg-transparent hover:bg-[#1A1A1A] text-neutral-400 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
      {/* GitHub Push & Update Modal */}
      <GitHubPushModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        spaceId={currentSpace?.id || '0'}
        spaceName={currentSpace?.name || 'Untitled Space'}
        files={files}
        onRepoLinked={(info) => setLinkedRepoInfo(info)}
      />
    </>
  );
}

