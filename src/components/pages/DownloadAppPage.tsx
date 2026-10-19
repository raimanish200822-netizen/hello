import React, { useEffect, useState } from 'react';
import { 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Monitor, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  HardDrive, 
  RefreshCw, 
  Share2, 
  Laptop, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useAdmin } from '../../context/AdminContext';
import { STORE_ADDRESS, WHATSAPP_PRIMARY } from '../../utils/whatsapp';

interface DownloadAppPageProps {
  onBackToHome: () => void;
}

export const DownloadAppPage: React.FC<DownloadAppPageProps> = ({ onBackToHome }) => {
  const { siteLogo } = useAdmin();
  const { isInstallable, isInstalled, install, platform } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
      }
    }
  };

  const handleShareApp = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({
        title: 'Shivani Graphics App',
        text: 'Install Shivani Graphics Official App on Desktop PC & Mobile for fast commercial printing & orders in Delhi NCR.',
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Breadcrumb & Return Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 sm:top-16 z-30 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#50007c] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home Catalog</span>
          </button>

          <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Official Progressive Web App
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#50007c] via-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-purple-800/60 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-amber-300 text-xs font-black border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Store Downloads · Ultra Fast & Lightweight</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Install Shivani Graphics on <span className="text-amber-400">Desktop PC & Laptop</span>
              </h1>

              <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">
                Add the official Shivani Graphics printing dashboard directly to your Windows Taskbar or Mac Dock. Instant offline catalog access, express order tracking, and high-resolution print proof checks.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                {isInstalled || installSuccess ? (
                  <div className="px-5 py-3 bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>App Installed & Ready on this Device!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>Install App on PC / Laptop Now</span>
                  </button>
                ) : (
                  <div className="px-5 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-amber-300" />
                    <span>Available via Browser Address Bar (Click Install ⊕)</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleShareApp}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/15 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share App Link'}</span>
                </button>
              </div>
            </div>

            {/* App Preview Card Graphic */}
            <div className="w-52 sm:w-64 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl flex flex-col items-center text-center space-y-3 shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white p-1 shadow-md border-2 border-amber-400/80">
                <img 
                  src={siteLogo && !siteLogo.includes('sanishtech.com') ? siteLogo : '/official_logo.jpg'} 
                  alt="Shivani Graphics" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.endsWith('/official_logo.jpg')) target.src = '/official_logo.jpg';
                  }}
                />
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">Shivani Graphics</h4>
                <p className="text-[11px] text-amber-300 font-semibold">Desktop App v2.4</p>
                <p className="text-[10px] text-purple-200 mt-0.5">Commercial Printing Studio</p>
              </div>

              <div className="w-full pt-2 border-t border-white/15 text-[10px] text-purple-100 flex items-center justify-around font-bold">
                <span>⚡ 0MB Storage</span>
                <span>•</span>
                <span>🛡️ Safe & Verified</span>
                <span>•</span>
                <span>🚀 Fast Load</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features & Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#50007c] flex items-center justify-center">
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Instant Desktop Launch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open the printing catalog in an exclusive, borderless application window with full desktop shortcuts, taskbar pinning, and zero browser tab clutter.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Offline Product Catalog</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse visiting cards, flex banners, corporate merchandise, and technical GSM paper specifications even with intermittent or zero internet connectivity.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Automatic Background Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Always runs on the latest version of our price catalog, promotional vouchers, and WhatsApp express ordering without needing manual updates.
            </p>
          </div>
        </div>

        {/* Installation Instructions for Different Browsers */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Desktop PC & Laptop Installation Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Follow these simple steps based on your current web browser:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1: Google Chrome */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#50007c] text-white text-xs font-black flex items-center justify-center">1</span>
                <h4 className="font-extrabold text-sm text-slate-900">Google Chrome</h4>
              </div>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Look for the <strong className="text-slate-900">Install icon (⊕)</strong> on the right side of the address bar.</li>
                <li>Click <strong className="text-slate-900">"Install Shivani Graphics"</strong> when prompted.</li>
                <li>The app opens immediately in its own standalone desktop window.</li>
              </ol>
            </div>

            {/* Step 2: Microsoft Edge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#50007c] text-white text-xs font-black flex items-center justify-center">2</span>
                <h4 className="font-extrabold text-sm text-slate-900">Microsoft Edge</h4>
              </div>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Click the <strong className="text-slate-900">App Available icon (⊞)</strong> in the URL bar.</li>
                <li>Click <strong className="text-slate-900">"Install"</strong>.</li>
                <li>Select "Pin to taskbar" or "Pin to Start" for quick 1-click access.</li>
              </ol>
            </div>

            {/* Step 3: Apple Safari / Mac */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#50007c] text-white text-xs font-black flex items-center justify-center">3</span>
                <h4 className="font-extrabold text-sm text-slate-900">macOS Safari</h4>
              </div>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Click <strong className="text-slate-900">File</strong> in the top menu bar.</li>
                <li>Select <strong className="text-slate-900">"Add to Dock..."</strong>.</li>
                <li>Click <strong className="text-slate-900">"Add"</strong> to keep Shivani Graphics permanently in your Mac Dock.</li>
              </ol>
            </div>

          </div>
        </div>

        {/* Support & Counter Assistance */}
        <div className="p-6 rounded-3xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-[#50007c]">Need Help or Custom Printing Consultation?</h4>
            <p className="text-xs text-slate-600">
              Visit our Delhi NCR Studio at {STORE_ADDRESS} or reach our prepress team on WhatsApp.
            </p>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent('Hello Shivani Graphics! I have a question about installing the desktop app or ordering prints.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0 inline-flex items-center gap-1.5"
          >
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
};
