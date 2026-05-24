import React from 'react';
import { Check, Sparkles, HelpCircle, Shield, CreditCard } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: "Starter Sandbox",
      price: "Free",
      period: "forever",
      desc: "Perfect for testing layouts, drafting CSS headers, and exploring prompt-driven creation.",
      features: [
        "Up to 3 design workspaces",
        "Standard Gemini 3.5 Assistant chat",
        "Instant live sandbox rendering",
        "Public preview links",
        "Github OAuth synchronization"
      ],
      cta: "Current Tier",
      popular: false
    },
    {
      name: "Ionic Gear",
      price: "$10",
      period: "month",
      desc: "Excellent value for busy freelance web designers, agency builders, and developers.",
      features: [
        "Unlimited sandbox workspaces",
        "High-priority complex generation mode",
        "Advanced personalization persona engine",
        "Private repository synchronization",
        "Instant custom subdomain setups",
        "Fast container deployment triggers"
      ],
      cta: "Upgrade to Ionic",
      popular: true
    },
    {
      name: "Iconic Gear",
      price: "$20",
      period: "month",
      desc: "Engineered specifically for teams, high-traffic agencies, and multi-tenant applications.",
      features: [
        "Everything in Ionic Gear",
        "Priority dedicated container resources",
        "Multi-domain SSL configurations",
        "Advanced API proxy gateway routing",
        "Team workspace collaboration controls",
        "24/7 dedicated engineering support"
      ],
      cta: "Upgrade to Iconic",
      popular: false
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0A0A0A] text-white relative">
      <div className="absolute top-12 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full space-y-12 py-8 relative z-10">
        {/* Title Block */}
        <div className="text-center space-y-3 pb-6 border-b border-[#1F1F1F]">
          <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Affordable Access</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Flexible Pricing Plans</h1>
          <p className="text-gray-400 text-xs max-w-lg mx-auto">
            Choose the membership tier that aligns with your engineering, sandboxing, and web template scaling goals.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, idx) => (
            <div 
              key={idx}
              className={`p-8 bg-[#0F0F0F] border rounded-2xl flex flex-col justify-between hover:border-indigo-500/50 transition-colors relative ${p.popular ? 'border-indigo-600 ring-1 ring-indigo-500/30' : 'border-[#1F1F1F]'}`}
            >
              {p.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider rounded-full text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-md text-white">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  {p.period && <span className="text-xs text-gray-500 font-bold">/ {p.period}</span>}
                </div>

                <ul className="space-y-3 pt-2">
                  {p.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-gray-400">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  type="button"
                  className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${p.popular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10' : 'bg-[#161616] hover:bg-[#1E1E1E] text-gray-300'}`}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
