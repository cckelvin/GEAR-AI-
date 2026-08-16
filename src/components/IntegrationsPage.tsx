import React from 'react';
import { 
  Globe, 
  Zap, 
  Layers, 
  Code, 
  ArrowLeft, 
  Library,
  CheckCircle2,
  Cpu as BuiltInIcon,
  Puzzle as PluginIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface IntegrationsPageProps {
  setCurrentPage: (page: any) => void;
  showShelf: boolean;
  setShowShelf: (show: boolean) => void;
  connectedIntegrations: string[];
  setConnectedIntegrations: React.Dispatch<React.SetStateAction<string[]>>;
  integrationsTab: 'builtin' | 'plugins';
  setIntegrationsTab: (tab: 'builtin' | 'plugins') => void;
  configuringIntegration: string | null;
  setConfiguringIntegration: (id: string | null) => void;
}

export default function IntegrationsPage({
  setCurrentPage,
  showShelf,
  setShowShelf,
  connectedIntegrations,
  setConnectedIntegrations,
  integrationsTab,
  setIntegrationsTab,
  configuringIntegration,
  setConfiguringIntegration,
}: IntegrationsPageProps) {
  const integrations = {
    builtin: [
      { 
        id: 'render', 
        name: 'Render', 
        desc: 'Deploy your spaces directly to Render.', 
        icon: <Globe className="w-5 h-5 text-white" />, 
        fields: [
          { label: 'Render API Key', value: '' },
          { label: 'Service ID', value: '' }
        ] 
      },
      { 
        id: 'gemini', 
        name: 'Gemini AI', 
        desc: 'Power your app with the latest Google AI models.', 
        icon: <Zap className="w-5 h-5 text-white" />, 
        fields: [
          { label: 'Gemini API Key', value: import.meta.env.VITE_GEAR_API || '' }
        ] 
      },
      { id: 'lucide', name: 'Lucide Icons', desc: 'Access 1000+ beautiful icons out of the box.', icon: <PluginIcon className="w-5 h-5 text-white" /> },
      { id: 'tailwind', name: 'Tailwind CSS', desc: 'Utility-first CSS framework for rapid UI development.', icon: <Layers className="w-5 h-5 text-white" /> }
    ],
    plugins: [
      { id: 'github', name: 'GitHub', desc: 'Sync your code with GitHub repositories.', icon: <Code className="w-5 h-5 text-white" />, fields: [{ label: 'Personal Access Token', value: '' }, { label: 'Repo Name', value: '' }] }
    ]
  };

  const handleConnect = (id: string) => {
    const item = [...integrations.builtin, ...integrations.plugins].find(i => i.id === id);
    if (item?.fields) {
      setConfiguringIntegration(id);
    } else {
      toggleIntegration(id);
    }
  };

  const toggleIntegration = (id: string) => {
    if (connectedIntegrations.includes(id)) {
      setConnectedIntegrations(prev => prev.filter(i => i !== id));
    } else {
      setConnectedIntegrations(prev => [...prev, id]);
    }
    setConfiguringIntegration(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Integrations Header */}
      <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-black/80 backdrop-blur-md sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="p-2 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Integrations</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setShowShelf(!showShelf)}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${showShelf ? 'bg-white text-black' : 'hover:bg-neutral-900 text-neutral-400'}`}
            title="Connected Integrations"
          >
            <Library className="w-5 h-5" />
            <span className="text-xs font-semibold">Shelf</span>
            {connectedIntegrations.length > 0 && (
              <span className="bg-neutral-800 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {connectedIntegrations.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Fixed Sub-navigation Bar */}
      {!showShelf && (
        <div className="h-12 border-b border-neutral-800 bg-black sticky top-16 z-50 flex items-center px-8 gap-8">
          <button 
            type="button"
            onClick={() => setIntegrationsTab('builtin')}
            className={`text-xs font-bold uppercase tracking-widest transition-all relative h-full flex items-center cursor-pointer ${integrationsTab === 'builtin' ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
          >
            Built-in
            {integrationsTab === 'builtin' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button 
            type="button"
            onClick={() => setIntegrationsTab('plugins')}
            className={`text-xs font-bold uppercase tracking-widest transition-all relative h-full flex items-center cursor-pointer ${integrationsTab === 'plugins' ? 'text-white' : 'text-neutral-500 hover:text-white'}`}
          >
            Plug-in
            {integrationsTab === 'plugins' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 space-y-12">
        {showShelf ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Connected Shelf</h2>
              <button type="button" onClick={() => setShowShelf(false)} className="text-xs text-white hover:underline cursor-pointer">Back to all</button>
            </div>
            {connectedIntegrations.length === 0 ? (
              <div className="p-12 border border-dashed border-neutral-800 rounded-2xl text-center">
                <Library className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-400">Your shelf is empty. Connect some integrations to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...integrations.builtin, ...integrations.plugins]
                  .filter(i => connectedIntegrations.includes(i.id))
                  .map(item => (
                    <div key={item.id} className="p-6 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-start gap-4">
                      <div className="p-3 bg-neutral-900 rounded-xl text-white">{item.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-xs text-neutral-400 mt-1">{item.desc}</p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-white font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          Connected
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Active Tab Content */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-700">
                  {integrationsTab === 'builtin' ? <BuiltInIcon className="w-5 h-5 text-white" /> : <PluginIcon className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{integrationsTab === 'builtin' ? 'Built-in' : 'Plug-in'}</h2>
                  <p className="text-xs text-neutral-500">
                    {integrationsTab === 'builtin' ? 'Core features that power Gear Studio spaces.' : 'Extend your app with third-party services.'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations[integrationsTab].map(item => (
                  <div key={item.id} className={`group p-6 bg-neutral-950 border rounded-2xl transition-all ${configuringIntegration === item.id ? 'border-white ring-1 ring-white/40' : 'border-neutral-800 hover:border-neutral-600'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-neutral-900 rounded-xl text-white group-hover:scale-110 transition-transform">{item.icon}</div>
                      <button 
                        type="button"
                        onClick={() => handleConnect(item.id)}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all cursor-pointer ${connectedIntegrations.includes(item.id) ? 'bg-neutral-900 text-white border border-neutral-700' : 'bg-white text-black hover:bg-neutral-200'}`}
                      >
                        {connectedIntegrations.includes(item.id) ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.desc}</p>
                    
                    {configuringIntegration === item.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-6 pt-6 border-t border-neutral-800 space-y-4"
                      >
                        {item.fields?.map(field => (
                          <div key={field.label} className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">{field.label}</label>
                            <input 
                              type="password" 
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-white text-white"
                              placeholder={`Enter your ${field.label}`}
                              defaultValue={field.value}
                            />
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                          <button 
                            type="button"
                            onClick={() => toggleIntegration(item.id)}
                            className="flex-1 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Save & Connect
                          </button>
                          <button 
                            type="button"
                            onClick={() => setConfiguringIntegration(null)}
                            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
