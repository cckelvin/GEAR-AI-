import React, { useState } from 'react';
import { Search, Plus, Box, Trash2, ChevronRight, Sparkles, AlertCircle, LayoutGrid, ListFilter, Pin, MoreVertical, Users } from 'lucide-react';
import { Space } from '../types';

interface ProjectsPageProps {
  spaces: Space[];
  currentSpace: Space;
  setCurrentSpace: (space: Space) => void;
  loadSpaceFiles: (spaceId: string) => void;
  loadSpaceMessages: (spaceId: string) => void;
  setCurrentPage: (page: string) => void;
  setShowPreview: (show: boolean) => void;
  handleNewSpace: () => void;
  deleteSpace: (id: string, e: React.MouseEvent) => void;
}

export default function ProjectsPage({
  spaces,
  currentSpace,
  setCurrentSpace,
  loadSpaceFiles,
  loadSpaceMessages,
  setCurrentPage,
  setShowPreview,
  handleNewSpace,
  deleteSpace,
}: ProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'updated'>('updated');
  const [pinnedSpaces, setPinnedSpaces] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [teamPushSuccess, setTeamPushSuccess] = useState<string | null>(null);

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedSpaces(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePushToTeam = (spaceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setTeamPushSuccess(spaceName);
    setTimeout(() => setTeamPushSuccess(null), 3000);
  };

  const filteredSpaces = spaces
    .filter(space => 
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (space.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aPinned = pinnedSpaces.includes(a.id);
      const bPinned = pinnedSpaces.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar bg-[#0A0A0A] text-white relative">
      {/* Visual background gradient accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      {teamPushSuccess && (
        <div className="fixed top-16 right-6 z-50 bg-purple-600 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Users className="w-4 h-4" />
          <span>Pushed "{teamPushSuccess}" to Team Space successfully!</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest block mb-1">Spaces &amp; Sandboxes</span>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              <Box className="w-7 h-7 text-indigo-500" /> Spaces List &amp; Create
            </h1>
          </div>
          <button 
            type="button"
            onClick={handleNewSpace}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 max-w-max self-start active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create / Build Space
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search spaces by name or keywords..."
              className="w-full bg-[#111] border border-[#222] hover:border-gray-800 focus:border-indigo-500/80 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="px-3 py-2 bg-[#111] border border-[#222] rounded-xl text-xs text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
              <ListFilter className="w-3.5 h-3.5" />
              <span>Sort by</span>
            </div>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#111] border border-[#222] rounded-xl text-xs px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer text-gray-200"
            >
              <option value="updated">Recent Activity</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Spaces Grid */}
        {filteredSpaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSpaces.map(space => {
              const isActive = currentSpace.id === space.id;
              const isPinned = pinnedSpaces.includes(space.id);
              return (
                <div
                  key={space.id}
                  onClick={() => {
                    setCurrentSpace(space);
                    loadSpaceFiles(space.id);
                    loadSpaceMessages(space.id);
                    setCurrentPage('editor');
                    setShowPreview(true);
                  }}
                  className={`p-6 bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl text-left hover:border-indigo-500/50 transition-all duration-300 group relative overflow-visible cursor-pointer flex flex-col justify-between h-[220px] ${isActive ? 'ring-1 ring-indigo-500/50 border-indigo-500/30' : ''}`}
                >
                  {/* Decorative glowing gradient path */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

                  {/* Top Bar with Icon, Pin button & Three dots menu */}
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                        <Box className="w-5 h-5 text-indigo-400" />
                      </div>
                      
                      <div className="flex items-center gap-1 relative">
                        <button 
                          type="button"
                          onClick={(e) => togglePin(space.id, e)}
                          className={`p-1.5 rounded-lg transition-all ${isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-white hover:bg-[#222]'}`}
                          title={isPinned ? 'Unpin space' : 'Pin space to top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === space.id ? null : space.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222] rounded-lg transition-all"
                          title="Space Options (Three Dots)"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === space.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-44 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl z-30 p-1 space-y-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={(e) => togglePin(space.id, e)}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#222] rounded-lg flex items-center gap-2"
                            >
                              <Pin className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isPinned ? 'Unpin Space' : 'Pin Space'}</span>
                            </button>
                            <button 
                              onClick={(e) => handlePushToTeam(space.name, e)}
                              className="w-full text-left px-3 py-1.5 text-xs text-purple-400 hover:bg-purple-500/10 rounded-lg flex items-center gap-2"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Push to Team</span>
                            </button>
                            <button 
                              onClick={(e) => deleteSpace(space.id, e)}
                              className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Space</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{space.name}</h3>
                        {isPinned && <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Pinned</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 h-8 leading-relaxed">
                        {space.description || 'Click to launch workspace editor and start coding.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer with Metadata & Push to Team action */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1F1F1F] mt-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Updated {space.updatedAt}</span>
                    <button 
                      onClick={(e) => handlePushToTeam(space.name, e)}
                      className="px-2.5 py-1 bg-purple-600/10 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <Users className="w-3 h-3" />
                      <span>Push to Team</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-[#1F1F1F] rounded-3xl flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-[#111] rounded-2xl flex items-center justify-center border border-[#222] mb-4 text-gray-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {searchTerm ? 'No search matches found' : 'No spaces found'}
            </p>
            {!searchTerm && (
              <button 
                type="button"
                onClick={handleNewSpace}
                className="mt-6 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                Create / Build Space
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
