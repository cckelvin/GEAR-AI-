import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  GitBranch, 
  GitCommit, 
  Lock, 
  Globe, 
  Layers, 
  RefreshCw, 
  Sparkles, 
  X, 
  ArrowRight, 
  Unlink, 
  FileCode, 
  KeyRound, 
  ChevronRight,
  User,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GitHubService, GitHubUser, GitHubRepo, LinkedRepoInfo, FileToCommit } from '../services/github';

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName: string;
  files: { name: string; content: string }[];
  onRepoLinked?: (info: LinkedRepoInfo) => void;
}

export const GitHubPushModal: React.FC<GitHubPushModalProps> = ({
  isOpen,
  onClose,
  spaceId,
  spaceName,
  files,
  onRepoLinked,
}) => {
  // Authentication State
  const [token, setToken] = useState<string>(() => localStorage.getItem('gear_github_pat') || '');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [showTokenSettings, setShowTokenSettings] = useState(false);

  // Linked Repo State
  const [linkedRepo, setLinkedRepo] = useState<LinkedRepoInfo | null>(null);

  // Form State
  const [activeMode, setActiveMode] = useState<'new' | 'existing'>('new');
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [targetBranch, setTargetBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('');

  // Existing Repos List
  const [userRepos, setUserRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [selectedExistingRepo, setSelectedExistingRepo] = useState<string>('');

  // Push Process State
  const [isPushing, setIsPushing] = useState(false);
  const [pushProgressStep, setPushProgressStep] = useState('');
  const [pushError, setPushError] = useState<string | null>(null);
  const [lastPushResult, setLastPushResult] = useState<{
    commitSha: string;
    commitUrl: string;
    htmlUrl: string;
  } | null>(null);

  // Initialize repo name based on space name
  useEffect(() => {
    if (spaceName) {
      const clean = spaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setRepoName(clean ? `gear-${clean}` : 'gear-app');
      setRepoDescription(`Website built with Gear Studio AI - ${spaceName}`);
    }
  }, [spaceName]);

  // Load linked repo info from localStorage for this space
  useEffect(() => {
    if (spaceId) {
      const stored = localStorage.getItem(`gear_github_repo_${spaceId}`);
      if (stored) {
        try {
          const parsed: LinkedRepoInfo = JSON.parse(stored);
          setLinkedRepo(parsed);
          setTargetBranch(parsed.branch || 'main');
        } catch (e) {
          setLinkedRepo(null);
        }
      } else {
        setLinkedRepo(null);
      }
    }
  }, [spaceId, isOpen]);

  // Set contextual default commit message
  useEffect(() => {
    if (linkedRepo) {
      setCommitMessage(`Update workspace code (${new Date().toLocaleDateString()})`);
    } else {
      setCommitMessage(`Initial commit from Gear Studio`);
    }
  }, [linkedRepo, isOpen]);

  // Auto-verify token on mount if present
  useEffect(() => {
    if (isOpen && token && !user) {
      verifyToken(token);
    }
  }, [isOpen, token]);

  const verifyToken = async (pat: string) => {
    if (!pat.trim()) {
      setTokenError('Please enter a GitHub Personal Access Token');
      return;
    }
    setIsVerifyingToken(true);
    setTokenError(null);
    try {
      const gh = new GitHubService(pat);
      const authenticatedUser = await gh.getAuthenticatedUser();
      setUser(authenticatedUser);
      localStorage.setItem('gear_github_pat', pat.trim());
      setShowTokenSettings(false);

      // Fetch user repos in background
      fetchUserRepos(gh);
    } catch (err: any) {
      setUser(null);
      setTokenError(err.message || 'Invalid GitHub token. Please check permissions (need "repo" scope).');
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const fetchUserRepos = async (gh?: GitHubService) => {
    const service = gh || new GitHubService(token);
    setIsLoadingRepos(true);
    try {
      const repos = await service.listUserRepos();
      setUserRepos(repos);
      if (repos.length > 0 && !selectedExistingRepo) {
        setSelectedExistingRepo(repos[0].full_name);
      }
    } catch (e) {
      console.warn('Could not load user repos:', e);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleDisconnectToken = () => {
    localStorage.removeItem('gear_github_pat');
    setToken('');
    setUser(null);
    setShowTokenSettings(true);
  };

  const handleUnlinkRepo = () => {
    if (confirm('Unlink this space from the GitHub repository? Your code on GitHub will not be deleted.')) {
      localStorage.removeItem(`gear_github_repo_${spaceId}`);
      setLinkedRepo(null);
      setLastPushResult(null);
    }
  };

  // Execute Git Push & Update
  const handlePush = async () => {
    if (!token || !user) {
      setShowTokenSettings(true);
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushProgressStep('Initializing Git sync...');

    try {
      const gh = new GitHubService(token);
      let targetOwner = user.login;
      let targetRepoName = '';
      let isRepoPrivate = isPrivate;

      if (linkedRepo) {
        // Mode 1: Update already linked repository
        targetOwner = linkedRepo.owner;
        targetRepoName = linkedRepo.repoName;
        isRepoPrivate = linkedRepo.isPrivate;
      } else if (activeMode === 'new') {
        // Mode 2: Create brand new repo
        targetRepoName = repoName.trim().replace(/[^a-zA-Z0-9._-]/g, '-');
        if (!targetRepoName) {
          throw new Error('Please specify a valid repository name.');
        }

        setPushProgressStep(`Checking repository "${targetRepoName}" on GitHub...`);
        const existing = await gh.getRepo(targetOwner, targetRepoName);
        
        if (!existing) {
          setPushProgressStep(`Creating repository "${targetOwner}/${targetRepoName}"...`);
          const created = await gh.createRepo({
            name: targetRepoName,
            description: repoDescription,
            isPrivate: isPrivate,
            autoInit: true,
          });
          targetOwner = user.login;
          targetRepoName = created.name;
        }
      } else {
        // Mode 3: Link to existing repo
        if (!selectedExistingRepo) {
          throw new Error('Please select an existing repository.');
        }
        const [owner, name] = selectedExistingRepo.split('/');
        targetOwner = owner;
        targetRepoName = name;
      }

      // Prepare files list
      const filesToPush: FileToCommit[] = files.map(f => ({
        name: f.name,
        content: f.content,
      }));

      // Ensure README.md is present
      const hasReadme = filesToPush.some(f => f.name.toLowerCase() === 'readme.md');
      if (!hasReadme) {
        filesToPush.push({
          name: 'README.md',
          content: `# ${spaceName}\n\nBuilt with [Gear Studio](https://gearstudio.space) and Google AI.\n\n## Overview\nThis project is maintained and synchronized directly from Gear Studio.\n\n## Getting Started\nOpen \`index.html\` in your browser, or serve it with any static web server.\n`,
        });
      }

      // Execute atomic push via Git Data API
      const result = await gh.pushFilesToRepo({
        owner: targetOwner,
        repo: targetRepoName,
        branch: targetBranch || 'main',
        message: commitMessage.trim() || 'Update from Gear Studio',
        files: filesToPush,
        onProgress: (step) => setPushProgressStep(step),
      });

      // Save linked info to localStorage
      const newLinkedInfo: LinkedRepoInfo = {
        repoName: targetRepoName,
        fullName: `${targetOwner}/${targetRepoName}`,
        owner: targetOwner,
        branch: targetBranch || 'main',
        htmlUrl: result.htmlUrl,
        isPrivate: isRepoPrivate,
        lastCommitSha: result.commitSha,
        lastCommitMessage: commitMessage.trim() || 'Update from Gear Studio',
        lastPushedAt: new Date().toISOString(),
      };

      localStorage.setItem(`gear_github_repo_${spaceId}`, JSON.stringify(newLinkedInfo));
      setLinkedRepo(newLinkedInfo);
      setLastPushResult(result);
      onRepoLinked?.(newLinkedInfo);

    } catch (err: any) {
      console.error('GitHub Push failed:', err);
      setPushError(err.message || 'Failed to push code to GitHub. Please verify token permissions and repository access.');
    } finally {
      setIsPushing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-[#0F0F0F] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow-lg">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>{linkedRepo ? 'Update GitHub Repository' : 'Push to GitHub Repository'}</span>
                {linkedRepo && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded-full font-bold">
                    LINKED
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                {spaceName} &bull; {files.length} workspace files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* STEP 1: TOKEN / AUTHENTICATION SECTION */}
          {(!user || showTokenSettings) && (
            <div className="p-4 bg-[#161616] border border-[#2A2A2A] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-neutral-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">GitHub Access Token</span>
                </div>
                {user && (
                  <button
                    onClick={() => setShowTokenSettings(false)}
                    className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Provide a GitHub Personal Access Token (classic with <code className="text-white font-mono bg-neutral-800 px-1 py-0.5 rounded">repo</code> scope or fine-grained token) to create and commit directly to your GitHub repositories.
              </p>

              <div className="space-y-2">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 font-mono focus:outline-none focus:border-white transition-colors"
                />

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Gear%20Studio%20Code%20Sync"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>Generate token on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => verifyToken(token)}
                    disabled={isVerifyingToken || !token.trim()}
                    className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 disabled:opacity-40 text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isVerifyingToken ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Connect GitHub</span>
                    )}
                  </button>
                </div>

                {tokenError && (
                  <div className="p-2.5 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{tokenError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USER ACCOUNT BADGE (when authenticated) */}
          {user && !showTokenSettings && (
            <div className="p-3 bg-[#141414] border border-[#222] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-8 h-8 rounded-full border border-neutral-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{user.name || user.login}</span>
                    <span className="text-[10px] font-mono text-neutral-400">@{user.login}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected to GitHub &bull; {user.public_repos} repos
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowTokenSettings(true)}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Change Token
              </button>
            </div>
          )}

          {/* SUCCESS REPOSITORY CARD (After successful push) */}
          {lastPushResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully Pushed to GitHub!</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={lastPushResult.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Open Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={lastPushResult.commitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <GitCommit className="w-3 h-3 text-neutral-400" />
                  <span>Commit {lastPushResult.commitSha.slice(0, 7)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          )}

          {/* MAIN CONFIGURATION: LINKED REPO VS. NEW REPO */}
          {user && !showTokenSettings && (
            <>
              {linkedRepo ? (
                /* 1. CURRENTLY LINKED REPOSITORY VIEW */
                <div className="space-y-4">
                  <div className="p-4 bg-[#141414] border border-[#2A2A2A] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-white">Target Repository</span>
                      </div>
                      <button
                        onClick={handleUnlinkRepo}
                        className="text-[10px] text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Unlink repository to connect a different one"
                      >
                        <Unlink className="w-3 h-3" />
                        <span>Unlink Repo</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[#222] rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <Github className="w-4 h-4 text-white" />
                        <div>
                          <a
                            href={linkedRepo.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-white hover:underline flex items-center gap-1"
                          >
                            <span>{linkedRepo.fullName}</span>
                            <ExternalLink className="w-3 h-3 text-neutral-500" />
                          </a>
                          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 mt-0.5">
                            Branch: <span className="text-neutral-200">{linkedRepo.branch}</span>
                            &bull; {linkedRepo.isPrivate ? 'Private' : 'Public'}
                          </span>
                        </div>
                      </div>

                      {linkedRepo.lastCommitSha && (
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-neutral-500 block">Last Commit</span>
                          <span className="text-[10px] font-mono text-neutral-300">
                            {linkedRepo.lastCommitSha.slice(0, 7)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Commit Message for Update */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Commit Message</span>
                    </label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="e.g. Add responsive navbar, update brush styling"
                      className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>
              ) : (
                /* 2. CREATE NEW OR LINK EXISTING REPOSITORY */
                <div className="space-y-4">
                  {/* Mode Tabs */}
                  <div className="grid grid-cols-2 bg-[#121212] p-1 rounded-xl border border-[#222]">
                    <button
                      onClick={() => setActiveMode('new')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeMode === 'new'
                          ? 'bg-white text-black shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Repo</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveMode('existing');
                        if (userRepos.length === 0) {
                          fetchUserRepos();
                        }
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeMode === 'existing'
                          ? 'bg-white text-black shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Push to Existing Repo</span>
                    </button>
                  </div>

                  {activeMode === 'new' ? (
                    <div className="space-y-3 p-4 bg-[#141414] border border-[#222] rounded-xl">
                      {/* Repo Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                          Repository Name
                        </label>
                        <div className="flex items-center">
                          <span className="bg-[#1C1C1C] border border-r-0 border-[#333] px-3 py-2 text-xs font-mono text-neutral-400 rounded-l-lg select-none">
                            {user.login}/
                          </span>
                          <input
                            type="text"
                            value={repoName}
                            onChange={(e) => setRepoName(e.target.value)}
                            placeholder="my-cool-app"
                            className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-r-lg px-3 py-2 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={repoDescription}
                          onChange={(e) => setRepoDescription(e.target.value)}
                          placeholder="Project description..."
                          className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      {/* Privacy & Branch */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                            Visibility
                          </label>
                          <div className="grid grid-cols-2 gap-1 bg-[#0A0A0A] p-1 rounded-lg border border-[#333]">
                            <button
                              type="button"
                              onClick={() => setIsPrivate(false)}
                              className={`py-1 text-[11px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                !isPrivate ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              <Globe className="w-3 h-3" />
                              <span>Public</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsPrivate(true)}
                              className={`py-1 text-[11px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                isPrivate ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                              }`}
                            >
                              <Lock className="w-3 h-3" />
                              <span>Private</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                            Branch
                          </label>
                          <input
                            type="text"
                            value={targetBranch}
                            onChange={(e) => setTargetBranch(e.target.value)}
                            placeholder="main"
                            className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 bg-[#141414] border border-[#222] rounded-xl">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                            Select Existing Repository
                          </label>
                          <button
                            onClick={() => fetchUserRepos()}
                            className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${isLoadingRepos ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                          </button>
                        </div>

                        {isLoadingRepos ? (
                          <div className="py-4 text-center text-xs text-neutral-500 font-mono">
                            Loading your repositories...
                          </div>
                        ) : userRepos.length > 0 ? (
                          <select
                            value={selectedExistingRepo}
                            onChange={(e) => setSelectedExistingRepo(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                          >
                            {userRepos.map((r) => (
                              <option key={r.full_name} value={r.full_name}>
                                {r.full_name} {r.private ? '🔒' : '🌐'}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={selectedExistingRepo}
                            onChange={(e) => setSelectedExistingRepo(e.target.value)}
                            placeholder="owner/repo-name"
                            className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                          Target Branch
                        </label>
                        <input
                          type="text"
                          value={targetBranch}
                          onChange={(e) => setTargetBranch(e.target.value)}
                          placeholder="main"
                          className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-white transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Initial Commit Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Commit Message</span>
                    </label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="Initial commit from Gear Studio"
                      className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* FILES TO PUSH PREVIEW */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{files.length} Files Staged for Commit</span>
                  </span>
                  <span>Branch: {targetBranch}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-[#121212] border border-[#222] rounded-xl max-h-24 overflow-y-auto custom-scrollbar">
                  {files.map((file) => (
                    <span
                      key={file.name}
                      className="px-2 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-[10px] font-mono text-neutral-300"
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ERROR NOTIFICATION */}
          {pushError && (
            <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Push Failed</span>
                <p className="leading-relaxed">{pushError}</p>
              </div>
            </div>
          )}

          {/* PROGRESS INDICATOR */}
          {isPushing && (
            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Pushing to GitHub...</span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-indigo-200">{pushProgressStep}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#222] bg-[#141414] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>

          {user && !showTokenSettings && (
            <button
              onClick={handlePush}
              disabled={isPushing}
              className="px-5 py-2.5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isPushing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4 text-black" />
                  <span>{linkedRepo ? 'Push Updates to GitHub' : 'Create & Push Repo'}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GitHubPushModal;
