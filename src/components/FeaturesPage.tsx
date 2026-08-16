import React from 'react';
import { Cpu, Zap, Layers, Bug, Terminal, Shield, Workflow } from 'lucide-react';

export default function FeaturesPage() {
  const highlights = [
    {
      icon: <Cpu className="w-5 h-5 text-white" />,
      title: "Google Gemini AI Engine",
      desc: "Tap into state-of-the-art predictive code writing. Generates fully styled standalone frontends, components, and script models cleanly using semantic structures."
    },
    {
      icon: <Zap className="w-5 h-5 text-white" />,
      title: "Instant Live Sandboxes",
      desc: "Preview your edits in real-time as the AI writes. Zero complex Docker starts or configuration file troubleshooting required."
    },
    {
      icon: <Layers className="w-5 h-5 text-white" />,
      title: "Clean Modular Outlines",
      desc: "Auto-structures your workspace with separate HTML, state components, and helper utilities following professional separation-of-concerns principles."
    },
    {
      icon: <Bug className="w-5 h-5 text-white" />,
      title: "Auto Diagnostics & Fixes",
      desc: "Our preview inspector captures runtime errors and logs, directly feeding them into your AI engineer for instant background bugfixes."
    },
    {
      icon: <Shield className="w-5 h-5 text-white" />,
      title: "Secure Domain Ingress",
      desc: "Instantly buy, connect, and configure custom SSL/DNS for your projects with a single-click built-in payment gateway."
    },
    {
      icon: <Workflow className="w-5 h-5 text-white" />,
      title: "Git & Deployment Pipelines",
      desc: "Direct endpoints allow syncing your sandboxes onto your personal GitHub repositories or publishing production containers in under 30 seconds."
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-black text-white relative">
      <div className="max-w-4xl mx-auto w-full space-y-12 py-8 relative z-10">
        {/* Title Block */}
        <div className="text-center space-y-3 pb-6 border-b border-neutral-800">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Product Overview</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Our Core Capabilities</h1>
          <p className="text-neutral-400 text-xs max-w-lg mx-auto">
            Everything you need to conceptualize, style, build, sandbox, and launch web templates is integrated into Gear Studio.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((item, idx) => (
            <div 
              key={idx}
              className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-start gap-4 hover:border-white transition-colors"
            >
              <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-xl shrink-0 text-white">
                {item.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-sm text-white">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Specs Panel */}
        <div className="p-8 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Underlying Technology Stack
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Gear Studio operates with cloud-native containers that serve code. The sandboxing uses a modern micro-proxy rendering stack that intercepts calls and isolates execution securely, letting you design, preview, and build with incredible speeds.
          </p>
        </div>
      </div>
    </div>
  );
}
