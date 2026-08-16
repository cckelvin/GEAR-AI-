import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  Check, 
  Info, 
  MonitorPlay
} from 'lucide-react';
import { Space } from '../types';

interface MarketPageProps {
  currentSpace: Space;
  setCurrentPage: (page: string) => void;
  setShowPreview: (show: boolean) => void;
}

export default function MarketPage({ currentSpace, setCurrentPage, setShowPreview }: MarketPageProps) {
  const [webName, setWebName] = useState(currentSpace.name);
  const [webDescription, setWebDescription] = useState(currentSpace.description || 'AI Coded web applet built with Gear Studio');
  const [seoKeywords, setSeoKeywords] = useState('react, typescript, gear-studio, web-app');
  const [selectedTier, setSelectedTier] = useState('standard');

  const publishingTiers = [
    {
      id: 'standard',
      name: 'Standard Market Listing',
      price: 'Free',
      features: ['Hosted on gearstudio.app', 'Instant website play launcher', 'Standard SSL encryption']
    },
    {
      id: 'pro',
      name: 'Custom Domain + Brand Info',
      price: '$9/mo',
      features: ['Custom .com or .io domain', 'Custom web name & meta tags', 'Remove powered-by banner']
    },
    {
      id: 'enterprise',
      name: 'Global CDN Market Distribution',
      price: '$29/mo',
      features: ['Worldwide Cloudflare Edge CDN', 'High concurrency traffic scaling', 'Priority SEO indexing']
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-black text-white relative">
      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="pb-6 border-b border-neutral-800">
          <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block mb-1">
            Publish &amp; Distribution
          </span>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2 text-white">
            <ShoppingBag className="w-7 h-7 text-white" /> Market &amp; Website Publishing
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Configure website play preview options, publishing pricing plans, web name, and SEO info details.
          </p>
        </div>

        {/* Website Play Preview Launcher Block */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Website Play Ready</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">Live Applet Preview: {webName}</h2>
            <p className="text-xs text-neutral-400 max-w-lg">
              Launch and test your applet inside the high-performance sandbox preview iframe.
            </p>
          </div>

          <button 
            onClick={() => {
              setCurrentPage('editor');
              setShowPreview(true);
            }}
            className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl active:scale-95 shrink-0 cursor-pointer"
          >
            <MonitorPlay className="w-4 h-4" />
            <span>Launch Website Play</span>
          </button>
        </div>

        {/* Web Name and Info Settings */}
        <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center border border-neutral-700">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-white">Web Name &amp; Info</h2>
              <p className="text-xs text-neutral-400">Specify public application name, info summary, and SEO meta tags.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Website Title / Name
                </label>
                <input 
                  type="text" 
                  value={webName} 
                  onChange={(e) => setWebName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  SEO Keywords &amp; Tags
                </label>
                <input 
                  type="text" 
                  value={seoKeywords} 
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  Website Description &amp; Info
                </label>
                <textarea 
                  value={webDescription} 
                  onChange={(e) => setWebDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white h-28 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Market Pricing Plans */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-white" /> Publishing &amp; Distribution Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishingTiers.map(t => (
              <div 
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`p-6 bg-neutral-950 border rounded-3xl cursor-pointer transition-all flex flex-col justify-between ${selectedTier === t.id ? 'border-white ring-1 ring-white/30 bg-neutral-900' : 'border-neutral-800 hover:border-neutral-700'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white">{t.name}</h3>
                    {selectedTier === t.id && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-2xl font-black text-white block mb-4">{t.price}</span>
                  <ul className="space-y-2">
                    {t.features.map((f, i) => (
                      <li key={i} className="text-xs text-neutral-400 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
