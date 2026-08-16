import React from 'react';
import { Check, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: "Starter Sandbox",
      price: "Free",
      period: "forever",
      desc: "Perfect for testing layouts, drafting CSS headers, and exploring prompt-driven creation.",
      features: [
        "Up to 3 design workspaces",
        "Standard Assistant chat",
        "Instant live sandbox rendering",
        "Public preview links",
        "Github synchronization"
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
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-black text-white relative">
      <div className="max-w-5xl mx-auto w-full space-y-12 py-8 relative z-10">
        {/* Title Block */}
        <div className="text-center space-y-3 pb-6 border-b border-neutral-800">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">Affordable Access</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Flexible Pricing Plans</h1>
          <p className="text-neutral-400 text-xs max-w-lg mx-auto">
            Choose the membership tier that aligns with your engineering, sandboxing, and web template scaling goals.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, idx) => (
            <div 
              key={idx}
              className={`p-8 bg-neutral-950 border rounded-2xl flex flex-col justify-between hover:border-white transition-colors relative ${p.popular ? 'border-white ring-1 ring-white/30' : 'border-neutral-800'}`}
            >
              {p.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-white border border-neutral-300 text-[9px] font-black uppercase tracking-wider rounded-full text-black flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-black" /> Most Popular
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-md text-white">{p.name}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  {p.period && <span className="text-xs text-neutral-400 font-bold">/ {p.period}</span>}
                </div>

                <ul className="space-y-3 pt-2">
                  {p.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-neutral-400">
                      <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${p.popular ? 'bg-white hover:bg-neutral-200 text-black shadow-lg' : 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700'}`}
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
