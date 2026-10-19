import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  X, 
  Check, 
  Share, 
  PlusSquare, 
  Bell, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { requestNotificationPermission } from '../services/notificationService';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstalled, isIOS, isDesktop, install, isInstallable, platform } = usePWAInstall();
  const [activePlatformTab, setActivePlatformTab] = useState<'desktop' | 'android' | 'ios'>('desktop');
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Auto-select platform tab based on detected device
  useEffect(() => {
    if (platform === 'ios') {
      setActivePlatformTab('ios');
    } else if (platform === 'android') {
      setActivePlatformTab('android');
    } else {
      setActivePlatformTab('desktop');
    }
  }, [platform, isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      // Also request notification permission so they get offers on desktop/phone
      const notifStatus = await requestNotificationPermission();
      setNotificationEnabled(notifStatus);

      const success = await install();
      if (success) {
        setInstalledSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    if (granted) {
      alert('✅ Notifications Enabled! You will receive offers & order updates.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#28003e] via-[#50007c] to-[#7915a8] p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 shadow-lg border-2 border-amber-400 shrink-0 overflow-hidden flex items-center justify-center">
              <img 
                src="/official_logo.jpg" 
                alt="Shivani Graphics" 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/pwa-192x192.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Desktop PC & Mobile App
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1 truncate">
                Shivani Graphics App
              </h3>
              <p className="text-xs text-purple-200 truncate">
                Install on Desktop, Laptop or Phone for instant printing & fast quotes
              </p>
            </div>
          </div>
        </div>

        {/* Platform Switcher Tabs */}
        <div className="bg-slate-100 p-1.5 border-b border-slate-200 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setActivePlatformTab('desktop')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatformTab === 'desktop'
                ? 'bg-white text-[#50007c] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Desktop / PC</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatformTab('android')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatformTab === 'android'
                ? 'bg-white text-[#50007c] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePlatformTab('ios')}
            className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePlatformTab === 'ios'
                ? 'bg-white text-[#50007c] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">iPhone / iPad</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {installedSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-base font-extrabold text-emerald-950">
                Shivani Graphics App Installed!
              </h4>
              <p className="text-xs text-emerald-800">
                App icon added to your device. You can now launch Shivani Graphics instantly anytime!
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: DESKTOP / PC MODE */}
              {activePlatformTab === 'desktop' && (
                <div className="space-y-4">
                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-black text-[#50007c]">
                      <Monitor className="w-4 h-4 text-[#50007c]" />
                      <span>Desktop Mode Installation (Windows, Mac & Chromebook)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Shivani Graphics can run as a standalone high-speed desktop program on your PC or Laptop without opening browser tabs.
                    </p>
                  </div>

                  {/* Desktop 1-Click Install Button */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      disabled={installing}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
                    >
                      <Download className="w-5 h-5" />
                      <span>{installing ? 'Launching Installer...' : '💻 Download & Install on PC / Laptop (Desktop App)'}</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-500">
                      Compatible with Google Chrome, Microsoft Edge, Brave & Opera on Windows / Mac
                    </p>
                  </div>

                  {/* Browser Address Bar Guide for Desktop */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>How to Install via Browser Address Bar (PC/Laptop):</span>
                    </h5>
                    <ol className="text-xs text-slate-700 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                      <li>
                        Look at the <strong>right side of your browser URL bar</strong> at the top of this window.
                      </li>
                      <li>
                        Click the <strong>Install Shivani Graphics</strong> icon (<Download className="w-3.5 h-3.5 inline text-purple-700 font-bold" /> or 🖥️ icon).
                      </li>
                      <li>
                        Click <strong>"Install"</strong> in the prompt. Done!
                      </li>
                      <li>
                        <span className="text-slate-500">
                          Alternatively, click <strong>⋮ (3 Dots Menu)</strong> in top right &gt; <strong>Save and share</strong> &gt; <strong>Install Shivani Graphics</strong>.
                        </span>
                      </li>
                    </ol>
                  </div>

                  {/* Desktop Advantages */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px]">🖥️ Big Screen Layout</span>
                      <span className="text-[10px] text-slate-500">No alignment issues or squished mobile screens</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px]">⚡ 0ms Fast Startup</span>
                      <span className="text-[10px] text-slate-500">Opens straight from your Windows Taskbar / Mac Dock</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ANDROID MODE */}
              {activePlatformTab === 'android' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      disabled={installing}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
                    >
                      <Download className="w-5 h-5" />
                      <span>{installing ? 'Preparing Android App...' : '🤖 Install App on Android (डाउनलोड ऐप)'}</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-500">
                      1-Tap direct installation · Works in Chrome & Samsung Internet
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                    <p className="font-bold text-slate-900">Manual Chrome Android Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Tap the <strong>⋮ (3 dots)</strong> menu icon at top-right of Chrome.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Tap <strong>Install</strong> to add icon to your phone screen.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* TAB 3: IPHONE / IPAD (IOS) MODE */}
              {activePlatformTab === 'ios' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Share className="w-4 h-4 text-blue-600" />
                    <span>How to Install on iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                    <li>Tap the <strong>Share</strong> icon (square with arrow) at the bottom toolbar of Safari.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />).</li>
                    <li>Tap <strong>"Add"</strong> in the top-right corner. Finished!</li>
                  </ol>
                </div>
              )}

              {/* Notification & Offers Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Bell className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] leading-tight">Enable discount offers & order status alerts on this device</span>
                </div>
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="px-3 py-1.5 bg-[#50007c] text-white rounded-xl text-xs font-bold hover:bg-purple-900 transition-colors shrink-0 cursor-pointer"
                >
                  Turn On Alerts
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const PWAInstallTopPill: React.FC = () => {
  const { isInstalled } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  if (isInstalled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-[11px] rounded-full shadow-xs transition-all cursor-pointer transform hover:scale-105 active:scale-95"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install App</span>
      </button>

      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
