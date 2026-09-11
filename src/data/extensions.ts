import { AIModelConfig, GearExtension } from '../types';

export const AI_MODELS: Record<'ionic' | 'iconic', AIModelConfig> = {
  ionic: {
    id: 'ionic',
    name: 'Ionic',
    codename: 'gpt-oss-120b',
    badge: 'GPT OSS 120B',
    tagline: 'Deep Reasoning & Full Project Architecture Builder',
    description: '120B open-weights foundation reasoning model engineered for deep multi-file project architecture. Excels at generating complete full-stack systems across Vite, Python 3.11, and Node.js, crafting robust algorithms, data models, and backend services.',
    architecture: '120-Billion Parameter Open Foundation Transformer with Recursive Tree Synthesizer',
    specialization: 'Full multi-file scaffolds, Python scripts & FastAPI/Flask services, Node.js backend logic, algorithmic problem-solving, and cross-file refactoring.',
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    accentBorder: 'rgba(245, 158, 11, 0.45)',
    strengths: [
      'Multi-file Full Project Scaffolding',
      'Python 3.11 Algorithms & Data Scripts',
      'Node.js LTS Backend & Server Logic',
      'Vite & React Architecture Patterns',
      'Deep Code Verification & Reasoning'
    ],
    bestFor: 'Building complete applications, Python services, Node.js backends, and complex multi-module systems.'
  },
  iconic: {
    id: 'iconic',
    name: 'Iconic',
    codename: 'groq-compound',
    badge: 'GROQ COMPOUND',
    tagline: 'Ultra-Fast Compound AI & High-Velocity Project Builder',
    description: 'Ultra-low latency compound AI engine built with speculative execution and specialized sub-agents. Delivers instant multi-token file generation, lightning-fast surgical patch refactoring, and instant live preview updates.',
    architecture: 'Compound Agentic Inference with Speculative Token Acceleration & LPU Optimization',
    specialization: 'High-speed code synthesis, live component iteration, surgical patch modification, Vite rapid-reload scaffolds, and responsive bug fixing.',
    color: '#3B82F6',
    accentBg: 'rgba(59, 130, 246, 0.12)',
    accentBorder: 'rgba(59, 130, 246, 0.45)',
    strengths: [
      'Sub-Second Code Generation',
      'Real-Time Surgical Patch Refactoring',
      'Instant Vite UI Prototyping',
      'Zero-Latency Code Iterations',
      'Component-Level Speculative Builds'
    ],
    bestFor: 'Rapid frontend iteration, instant full-file scaffolding, surgical code fixes, and real-time live previewing.'
  }
};

export const INITIAL_EXTENSIONS: GearExtension[] = [
  {
    id: 'vite',
    name: 'Vite Full-Stack Runner',
    identifier: '@gear/extension-vite',
    version: '5.4.1',
    category: 'bundler',
    enabled: true,
    description: 'Provides Vite dev server simulation, lightning-fast HMR module graph bundling, TSX/JSX transpilation, and Tailwind CSS auto-injection for modern web apps.',
    iconName: 'Zap',
    author: 'Gear Core Team',
    fileExtensions: ['.tsx', '.jsx', '.html', '.css', '.ts', 'vite.config.ts', 'package.json'],
    features: [
      'Simulated Vite Dev Server & HMR',
      'Native ES Module Import Map Resolution',
      'React 18 & Modern Component Transpiler',
      'Automatic Tailwind & Lucide Asset Linking'
    ],
    canExecute: true,
    executionEngine: 'Vite Dev Server (Browser Native)'
  },
  {
    id: 'python',
    name: 'Python 3.11 Runtime & REPL',
    identifier: '@gear/extension-python',
    version: '3.11.8',
    category: 'runtime',
    enabled: true,
    description: 'Enables Gear Studio to code, execute, and inspect Python code directly in the workspace. Features in-browser Python 3.11 runtime, stdout/stderr streaming, and standard library support.',
    iconName: 'Code',
    author: 'Gear Core Team',
    fileExtensions: ['.py', 'requirements.txt'],
    features: [
      'In-browser Python 3.11 Execution (Pyodide & Fallback Sandbox)',
      'Stdout and Stderr stream capture to Gear Terminal',
      'Built-in math, random, json, re, datetime, itertools support',
      'Interactive Python REPL and script execution'
    ],
    canExecute: true,
    executionEngine: 'Python 3.11 (Pyodide Engine)'
  },
  {
    id: 'node',
    name: 'Node.js LTS Execution Engine',
    identifier: '@gear/extension-node',
    version: '20.12.2',
    category: 'runtime',
    enabled: true,
    description: 'Executes Node.js scripts, backend logic, and utilities directly inside Gear Studio with simulated process.env, virtual file system, and console output.',
    iconName: 'Server',
    author: 'Gear Core Team',
    fileExtensions: ['.js', '.mjs', '.cjs', 'package.json'],
    features: [
      'Node.js 20 LTS JavaScript runtime sandbox',
      'Virtual File System (VFS) bridge to workspace files',
      'Simulated process.env, Buffer, async/await event loop',
      'Console stream direct pipeline to Gear Terminal'
    ],
    canExecute: true,
    executionEngine: 'Node.js LTS VFS Runner'
  },
  {
    id: 'typescript',
    name: 'TypeScript & ESLint LSP',
    identifier: '@gear/extension-typescript',
    version: '5.3.3',
    category: 'language',
    enabled: true,
    description: 'Language Server Protocol for TypeScript and JavaScript offering real-time diagnostics, type verification, and syntax analysis.',
    iconName: 'FileCode',
    author: 'Gear Core Team',
    fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    features: [
      'TypeScript 5.3 compiler interface',
      'Real-time syntax validation and diagnostics',
      'Automatic type imports and keyword coloring'
    ],
    canExecute: false,
    executionEngine: 'TypeScript LSP'
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS JIT Compiler',
    identifier: '@gear/extension-tailwind',
    version: '3.4.1',
    category: 'tool',
    enabled: true,
    description: 'Just-in-time CSS compilation engine providing on-demand utility generation and dark mode classes.',
    iconName: 'Layers',
    author: 'Gear Core Team',
    fileExtensions: ['.css', '.html', '.tsx', '.jsx'],
    features: [
      'JIT utility class compilation',
      'Arbitrary values & theme extensions',
      'Responsive prefix resolution'
    ],
    canExecute: false,
    executionEngine: 'Tailwind CDN & PostCSS'
  },
  {
    id: 'docker',
    name: 'Docker Container Sandbox',
    identifier: '@gear/extension-docker',
    version: '1.2.0',
    category: 'tool',
    enabled: true,
    description: 'Multi-runtime containerization preview engine for Dockerfiles, container setups, and multi-service manifests.',
    iconName: 'Box',
    author: 'Gear Core Team',
    fileExtensions: ['Dockerfile', 'docker-compose.yml', '.dockerignore'],
    features: [
      'Dockerfile syntax inspection',
      'Container build-step emulation',
      'Deployment preview diagnostics'
    ],
    canExecute: false,
    executionEngine: 'Gear Container Emulation'
  }
];
