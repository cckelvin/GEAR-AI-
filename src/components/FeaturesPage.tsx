import React from 'react';
import { Cpu, Zap, Layers, Bug, Sparkles, Terminal, Shield, Workflow } from 'lucide-react';

export default function FeaturesPage() {
  const highlights = [
    {
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      title: "Google Gemini 3.5 AI Engine",
      desc: "Tap into state-of-the-art predictive code writing. Generates fully styled standalone frontends, components, and script models cleanly using semantic structures."
    },
    {
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
      title: "Instant Live Sandboxes",
      desc: "Preview your edits in real-time as the AI writes. Zero complex Docker starts or configuration file troubleshooting required."
    },
    {
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      title: "Clean Modular Outlines",
      desc: "Auto-structures your workspace with separate HTML, state components, and helper utilities following professional separation-of-concerns principles."
    },
    {
      icon: <Bug className="w-5 h-5 text-rose-400" />,
      title: "Auto Healing & Diagnostics",
      desc: "Our preview inspector captures runtime errors and logs, directly feeding them into your AI engineer for instant background bugfixes."
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      title: "Secure Domain Ingress",
      desc: "Instantly buy, connect, and configure custom SSL/DNS for your projects with a single-click built-in payment gateway."
    },
    {
      icon: <Workflow className="w-5 h-5 text-indigo-400" />,
      title: "Git & Deployment Pipelines",
      desc: "Direct endpoints allow syncing your sandboxes onto your personal GitHub repositories or publishing production containers to platforms like Render in under 30 seconds."
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0A0A0A] text-white relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full space-y-12 py-8 relative z-10">
        {/* Title Block */}
        <div className="text-center space-y-3 pb-6 border-b border-[#1F1F1F]">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Product Overview</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Our Core Capabilities</h1>
          <p className="text-gray-400 text-xs max-w-lg mx-auto">
            Everything you need to conceptualize, style, build, sandbox, and launch web templates is integrated into Gear Studio.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl flex items-start gap-4 hover:border-indigo-500/40 transition-colors"
            >
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl shrink-0">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Specs Panel */}
        <div className="p-8 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-4">
          <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Underlying Technology Stack
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Gear Studio operates with cloud-native containers that serve code. The sandboxing uses a modern micro-proxy rendering stack that intercepts calls and isolates execution securely, letting you design, preview, and build with incredible speeds.
          </p>
        </div>
      </div>
    </div>
  );
}
