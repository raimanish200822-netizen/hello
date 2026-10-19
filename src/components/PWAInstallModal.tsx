import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, Check, Share, PlusSquare, Bell, Zap, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { requestNotificationPermission } from '../services/notificationService';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      // Also request notification permission so they get offers on their phone!
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
      alert('✅ Phone Notifications Enabled! You will receive offers & updates directly on your phone.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#28003e] via-[#50007c] to-[#7915a8] p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-amber-400 shrink-0 overflow-hidden flex items-center justify-center">
              <img 
                src="/pwa-192x192.png" 
                alt="Shivani Graphics" 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://img.sanishtech.com/u/5467f9a9329e92601bbe9217b2523cff.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Official Android & iOS App
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white mt-1">
                Shivani Graphics App
              </h3>
              <p className="text-xs text-purple-200">
                Install on your phone for instant offers & fast orders
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {installedSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-base font-extrabold text-emerald-950">
                App Successfully Installed!
              </h4>
              <p className="text-xs text-emerald-800">
                Shivani Graphics has been added to your phone's home screen. You will now receive exclusive print offers & updates!
              </p>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div className="w-8 h-8 rounded-xl bg-[#50007c] text-amber-300 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">Phone Offers & Discount Alerts</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Whenever new offers or discounts are released by Admin, your phone receives an instant alert!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">5-Minute Express Order Tracking</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Check live print status, download PDF invoices, and reorder visiting cards with 1 tap.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">Lightweight & Works Offline</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Zero storage wasted (&lt;2 MB). Opens like a fast native app without browser URL bars.
                    </p>
                  </div>
                </div>
              </div>

              {/* iOS Guide vs Android Install Button */}
              {isIOS ? (
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Share className="w-4 h-4 text-blue-600" />
                    <span>How to Install on iPhone (Safari):</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                    <li>Tap the <strong>Share</strong> icon (box with arrow) at the bottom of Safari.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />).</li>
                    <li>Tap <strong>"Add"</strong> in the top right. Done!</li>
                  </ol>
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="w-full mt-2 py-2.5 px-4 bg-[#50007c] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-900 cursor-pointer transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-300" />
                    <span>Enable Phone Offer Alerts</span>
                  </button>
                </div>
              ) : isInstalled ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>App is already installed on this device!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                  >
                    Turn on Alerts
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98"
                  >
                    <Download className="w-5 h-5" />
                    <span>{installing ? 'Preparing App...' : 'Install App & Enable Offers (डाउनलोड ऐप)'}</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-500">
                    Instant 1-Click install · No Play Store account required
                  </p>
                </div>
              )}
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
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-[11px] rounded-full shadow-sm transition-all cursor-pointer transform hover:scale-105 active:scale-95"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install App</span>
      </button>

      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
