import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Download, X, Smartphone, ArrowUpRight, CheckCircle2, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const InstallPopupNotification: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showBrowserShortcutHint, setShowBrowserShortcutHint] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // If the app is already running in standalone mode (already installed), never show
    if (isInstalled) {
      return;
    }

    // Show popup immediately after loading
    setIsVisible(true);

    // Auto-dismiss strictly after 5 seconds (5000ms) as requested
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
        setTimeout(() => setIsVisible(false), 2000);
      } else {
        setIsVisible(false);
      }
    } else if (isIOS) {
      setIsVisible(false);
      setShowIOSModal(true);
    } else {
      // If browser doesn't expose deferred prompt directly, guide to browser's native install/shortcut
      setShowBrowserShortcutHint(true);
      setTimeout(() => {
        setIsVisible(false);
        setShowBrowserShortcutHint(false);
      }, 4000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && !isInstalled && (
          <motion.div
            id="pwa-install-popup-notification"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] rounded-2xl bg-neutral-900/95 border border-neutral-700/80 shadow-2xl backdrop-blur-xl text-white overflow-hidden p-4 select-none"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="relative w-11 h-11 rounded-xl bg-neutral-950 border border-neutral-700/80 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                <img
                  src="/pwa-192x192.png"
                  alt="Gear Studio Icon"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to SVG if PNG fails to load in preview
                    (e.target as HTMLImageElement).src = '/icon.svg';
                  }}
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white tracking-wide truncate">
                    Install Gear Studio
                  </h4>
                  <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-400 text-[9px] font-mono rounded font-semibold border border-blue-500/30">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                  {installedSuccess
                    ? 'Successfully installed!'
                    : showBrowserShortcutHint
                    ? 'Use browser menu or address bar to Install & Create Shortcut'
                    : 'Install app to home screen & create desktop shortcut'}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    id="pwa-popup-install-button"
                    type="button"
                    onClick={handleInstallClick}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {installedSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Install</span>
                      </>
                    )}
                  </button>

                  <button
                    id="pwa-popup-dismiss-button"
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className="px-2.5 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-neutral-300 hover:text-white text-xs font-medium rounded-xl transition-all flex items-center justify-center cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 5-Second Timer Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800 overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-blue-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari Guided Install Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-5 text-white shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold">Install on iOS / Safari</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white">Share</strong> button{' '}
                    <ArrowUpRight className="w-3.5 h-3.5 inline text-blue-400" /> at the bottom of Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600 text-blue-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
