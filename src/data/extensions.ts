import { AIModelConfig } from '../types';

export const AI_MODELS: Record<'ionic' | 'iconic', AIModelConfig> = {
  ionic: {
    id: 'ionic',
    name: 'Ionic',
    codename: 'gemini-3-flash',
    badge: 'GEMINI 3 FLASH',
    tagline: 'Deep Architecture & Scalable Web Engine',
    description: 'Powered by Gemini 3 Flash. Engineered for complete multi-file website development, structural layout reasoning, semantic HTML5, modern CSS3 styling, and scalable client-side logic.',
    architecture: 'Gemini 3 Flash Multimodal Reasoning Engine with Structural Web Synthesis',
    specialization: 'Full multi-file website scaffolding, semantic HTML5, modern CSS3 styling, JavaScript modules, and client-side JSON data architectures.',
    color: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    accentBorder: 'rgba(245, 158, 11, 0.45)',
    strengths: [
      'Multi-file Website Scaffolding (HTML/CSS/JS/JSON)',
      'Semantic HTML5 & Accessible Markup',
      'Modern CSS3 Layouts & Animations',
      'Modular JavaScript (ES Modules) Architecture',
      'Deep Code Verification & Layout Refactoring'
    ],
    bestFor: 'Building complete website architectures, interactive web apps, responsive designs, and multi-file codebases.'
  },
  iconic: {
    id: 'iconic',
    name: 'Iconic',
    codename: 'gemini-3.1-flash-lite',
    badge: 'GEMINI 3.1 FLASH LITE',
    tagline: 'High-Velocity Code Synthesis & Instant Prototyping',
    description: 'Powered by Gemini 3.1 Flash Lite with automatic fallback to Gemini 3.5 Flash Lite. Ultra-low latency code generation, surgical live refactoring, and instant preview rendering.',
    architecture: 'Gemini 3.1 Flash Lite with Gemini 3.5 Flash Lite Fallback Pipeline',
    specialization: 'High-speed code synthesis, live UI component iteration, surgical patch modification, and rapid website prototyping.',
    color: '#3B82F6',
    accentBg: 'rgba(59, 130, 246, 0.12)',
    accentBorder: 'rgba(59, 130, 246, 0.45)',
    strengths: [
      'Sub-Second Code Generation',
      'Real-Time Surgical Patch Refactoring',
      'Instant HTML, CSS, JS Prototyping',
      'Zero-Latency Code Iterations',
      'Seamless High-Availability Fallback'
    ],
    bestFor: 'Rapid frontend iteration, instant website scaffolding, surgical code fixes, and real-time live previewing.'
  }
};
