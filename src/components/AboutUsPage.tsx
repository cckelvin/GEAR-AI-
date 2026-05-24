import React from 'react';
import { Target, Users, Landmark, Cpu, Sparkles, Shield, Heart } from 'lucide-react';

export default function AboutUsPage() {
  const values = [
    {
      icon: <Target className="w-5 h-5 text-[#818CF8]" />,
      title: "Our Mission",
      desc: "To democratize fast sandboxing and visual mockups. We empower software builders, marketing designers, and founders to translate high-level language prompts into responsive code blocks in seconds."
    },
    {
      icon: <Users className="w-5 h-5 text-[#818CF8]" />,
      title: "Who We Are",
      desc: "Gear Studio is built by a distributed team of engineers, designers, and open-source advocates passionate about building lightweight, high-performance environments that remove development bottlenecks."
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#818CF8]" />,
      title: "The vision",
      desc: "We look forward to a world where software creation operates at the speed of thought. By coupling advanced AI layout generators with secure sandbox rendering, we hope to build the premier playground for frontend ideas."
    }
  ];

  const team = [
    {
      name: "Doris Njide",
      role: "Lead Platform Engineer",
      bio: "Focuses on runtime sandboxing, micro-proxy configurations, and container systems execution metrics."
    },
    {
      name: "Marcus Vance",
      role: "Principal Product Designer",
      bio: "Crafts the design tokens, fluid layouts, typography setups, and responsive interactions."
    },
    {
      name: "Sven Lindqvist",
      role: "Head of Developer Relations",
      bio: "Directs open-source templates, community pipelines, and GitHub synchronization patterns."
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0A0A0A] text-white relative">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full space-y-12 py-8 relative z-10">
        {/* Title Block */}
        <div className="text-center space-y-3 pb-6 border-b border-[#1F1F1F]">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Our Story</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">About Gear Studio</h1>
          <p className="text-gray-400 text-xs max-w-lg mx-auto">
            Learn more about the team, our core values, and our engineering philosophy behind instant software sandboxing.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-2xl">
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest block">The Genesis</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Building the Future of Development</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Gear Studio arose from a simple observation: developers and designers spend too much time setting up build directories, configuring dependencies, fixing webpack/vite configs, and managing package managers before they can write a single line of layout.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              We combined optimized browser rendering processes with the generation prowess of Google Gemini to create a system where drafting layouts and testing API routes is as effortless as typing a message.
            </p>
          </div>
          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Heart className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-sm">We Care About Craft</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every detail is tailored to offer high visual precision. From Inter/Space Grotesk typography hierarchies to soft slate grays, our application defaults to pristine standards.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <h2 className="text-md font-black uppercase text-gray-500 tracking-wider">Our Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, idx) => (
              <div key={idx} className="p-6 bg-[#0F0F0F]/40 border border-[#1F1F1F] rounded-2xl hover:border-gray-800 transition-colors">
                <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl text-indigo-400 w-10 h-10 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-sm text-white mb-2">{v.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          <h2 className="text-md font-black uppercase text-gray-500 tracking-wider">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((t, idx) => (
              <div key={idx} className="p-6 bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl space-y-2">
                <div>
                  <h3 className="font-bold text-sm text-white">{t.name}</h3>
                  <span className="text-[10px] font-medium text-indigo-400">{t.role}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed pt-1">{t.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
