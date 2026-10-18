import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Trash2, 
  Upload, 
  Check, 
  Sparkles, 
  Share2, 
  Smartphone, 
  Globe, 
  MessageCircle, 
  ExternalLink, 
  Copy, 
  Eye, 
  RefreshCw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ImageUploader } from './ImageUploader';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useToast } from '../context/ToastContext';

export const LogoSettingsView: React.FC = () => {
  const { 
    siteLogo, 
    shareLogo, 
    appIcon, 
    updateSiteLogo, 
    updateShareLogo, 
    updateAppIcon, 
    updateBrandingSettings,
    resetBrandingToDefault 
  } = useAdmin();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'web' | 'share' | 'app' | 'overview'>('web');
  
  // Local inputs
  const [webLogoInput, setWebLogoInput] = useState(siteLogo);
  const [shareLogoInput, setShareLogoInput] = useState(shareLogo);
  const [appIconInput, setAppIconInput] = useState(appIcon);

  const [isSaved, setIsSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Sync inputs when context updates
  useEffect(() => {
    setWebLogoInput(siteLogo);
  }, [siteLogo]);

  useEffect(() => {
    setShareLogoInput(shareLogo);
  }, [shareLogo]);

  useEffect(() => {
    setAppIconInput(appIcon);
  }, [appIcon]);

  const triggerSaveNotification = (msg: string) => {
    setSavedMessage(msg);
    setIsSaved(true);
    showToast(msg, 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveWebLogo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!webLogoInput.trim()) return;
    await updateSiteLogo(webLogoInput.trim());
    triggerSaveNotification('Website header & footer logo updated successfully!');
  };

  const handleSaveShareLogo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!shareLogoInput.trim()) return;
    await updateShareLogo(shareLogoInput.trim());
    triggerSaveNotification('Social media & WhatsApp share card image updated successfully!');
  };

  const handleSaveAppIcon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!appIconInput.trim()) return;
    await updateAppIcon(appIconInput.trim());
    triggerSaveNotification('App download & PWA home screen icon updated successfully!');
  };

  const handleSaveAll = async () => {
    await updateBrandingSettings({
      siteLogo: webLogoInput.trim(),
      shareLogo: shareLogoInput.trim(),
      appIcon: appIconInput.trim()
    });
    triggerSaveNotification('All branding logos (Web, Share Link, App Download) synced successfully!');
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetBrandingToDefault();
      setWebLogoInput('/logo.svg');
      setShareLogoInput('/og-image.png');
      setAppIconInput('/icon.svg');
      triggerSaveNotification('Reset all brand logos to official Shivani Graphics assets!');
    } finally {
      setIsResetting(false);
      setShowConfirmReset(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    showToast('Website link copied to clipboard! Share on WhatsApp to preview card.', 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-[#50007c] to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-purple-500/10 pointer-events-none blur-2xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete Brand & Logo Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Website, Link Share & App Download Logo
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
              Control your brand identity in one place: Website header/footer logo, WhatsApp & social link preview card, and smartphone home screen App Download icon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyShareLink}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4 text-orange-400" />
              <span>Copy Share Link</span>
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restore Official Assets</span>
            </button>
          </div>
        </div>

        {/* 3 Active Logo Quick Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white p-1 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
              <img src={siteLogo} alt="Web Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">1. Website Logo</span>
              <span className="text-xs font-black text-white truncate block">Header & Footer</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
              <img src={shareLogo} alt="Share Card" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-orange-200 block">2. Link Share Card</span>
              <span className="text-xs font-black text-white truncate block">WhatsApp & Social</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-white p-1 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
              <img src={appIcon} alt="App Icon" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">3. App Download Icon</span>
              <span className="text-xs font-black text-white truncate block">PWA Home Screen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{savedMessage || 'Brand logos successfully updated and synced across the app!'}</span>
          </div>
          <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black">
            Live Synced
          </span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-2 bg-white p-2 rounded-2xl border shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('web')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'web'
              ? 'bg-[#50007c] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Website Logo (Header & Footer)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('share')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'share'
              ? 'bg-[#50007c] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          <span>Link Share Card (WhatsApp Preview)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('app')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'app'
              ? 'bg-[#50007c] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-4 h-4 text-purple-400" />
          <span>App Download Icon (PWA)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#50007c] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>All Brand Previews</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: WEBSITE LOGO */}
      {activeTab === 'web' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#50007c]" />
                <span>Website Navigation Header & Footer Logo</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This logo is displayed in the main website header, mobile slide-out drawer, bottom footer, and printed customer invoices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setWebLogoInput('/logo.svg');
                updateSiteLogo('/logo.svg');
                triggerSaveNotification('Set to official SVG logo!');
              }}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#50007c] text-xs font-bold rounded-xl border border-purple-200 transition cursor-pointer shrink-0"
            >
              Use Official Vector SVG
            </button>
          </div>

          {/* Live Preview Cards (Light & Dark) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Light Header Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Preview: Light Header (Desktop & Mobile)
              </span>
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-purple-200 flex items-center justify-center overflow-hidden shadow-xs">
                    <img 
                      src={webLogoInput} 
                      alt="Logo preview" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 leading-tight">Shivani Graphics</h4>
                    <p className="text-[10px] text-purple-700 font-bold">Digital Printing Press</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-slate-400">Header Preview</div>
              </div>
            </div>

            {/* Dark Footer Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Preview: Dark Purple Footer
              </span>
              <div className="p-4 bg-[#50007c] text-white rounded-xl shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden shadow-sm">
                    <img 
                      src={webLogoInput} 
                      alt="Footer logo preview" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white leading-tight">Shivani Graphics</h4>
                    <p className="text-[10px] text-purple-200 font-semibold">Delhi NCR · Pan India</p>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-purple-300">Footer Preview</div>
              </div>
            </div>
          </div>

          {/* Form to update Website Logo */}
          <form onSubmit={handleSaveWebLogo} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Website Logo Image (Upload from phone/PC or Enter URL)
              </label>
              <ImageUploader
                value={webLogoInput}
                onChange={async (url) => {
                  setWebLogoInput(url);
                  await updateSiteLogo(url);
                  triggerSaveNotification('Website logo updated and saved directly!');
                }}
                label="Upload Website Logo (PNG, SVG, JPG)"
                folder="branding"
              />
              <p className="text-[11px] text-slate-500">
                Default: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#50007c] font-mono">/logo.svg</code> (Permanent vector image, never expires).
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Save Website Logo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: LINK SHARE LOGO / SOCIAL PREVIEW CARD */}
      {activeTab === 'share' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>Link Share Card Logo & Preview (WhatsApp, Facebook, Twitter)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Jab aap website ka link WhatsApp, Facebook, iMessage ya Twitter par share karte hain, tab jo visual card aur photo dikhai deti hai (<code className="font-mono text-[#50007c]">og:image</code>).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShareLogoInput('/og-image.png');
                updateShareLogo('/og-image.png');
                triggerSaveNotification('Set to official 1200x630 share card banner!');
              }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer shrink-0"
            >
              Use Official 1200x630 Banner
            </button>
          </div>

          {/* Real-time WhatsApp Share Simulation */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>Live WhatsApp Link Preview Simulator</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">1200 × 630 px</span>
            </div>

            {/* WhatsApp Chat Bubble */}
            <div className="max-w-md mx-auto bg-[#eef2f5] p-3 rounded-2xl shadow-lg border border-slate-300">
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                {/* Share Image */}
                <div className="relative aspect-[1200/630] w-full bg-purple-900 overflow-hidden">
                  <img 
                    src={shareLogoInput} 
                    alt="WhatsApp Share Card Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/og-image.png';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    HD Link Card
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="p-3 bg-slate-50 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {window.location.hostname || 'shivanigraphics.web.app'}
                  </p>
                  <h4 className="font-black text-xs text-slate-900 leading-tight">
                    Shivani Graphics - Custom Printing & Online Catalog
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    Premium commercial digital printing in Delhi NCR. Visiting cards, flex banners, standees & corporate gifts in Mahavir Enclave.
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400 mt-1 font-medium">
                12:45 PM · Delivered ✓✓
              </div>
            </div>
          </div>

          {/* Form to update Share Logo */}
          <form onSubmit={handleSaveShareLogo} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Link Share Image URL or Upload (Best resolution: 1200 × 630 pixels)
              </label>
              <ImageUploader
                value={shareLogoInput}
                onChange={async (url) => {
                  setShareLogoInput(url);
                  await updateShareLogo(url);
                  triggerSaveNotification('Link share image updated & synced to meta tags!');
                }}
                label="Upload Social Share Banner (1200x630)"
                folder="branding"
              />
              <p className="text-[11px] text-slate-500">
                Recommended: Use a 12:6.3 aspect ratio image (e.g. 1200x630). Default: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#50007c] font-mono">/og-image.png</code>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Save Link Share Card
              </button>

              <button
                type="button"
                onClick={copyShareLink}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center gap-2 border border-slate-300"
              >
                <Share2 className="w-4 h-4" /> Copy & Test on WhatsApp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: APP DOWNLOAD ICON (PWA) */}
      {activeTab === 'app' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#50007c]" />
                <span>App Download Icon (PWA & Mobile Home Screen)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Jab user phone par &quot;Download App&quot; ya &quot;Install App&quot; click karta hai, tab phone home screen par aane wala app icon aur splash screen logo (<code className="font-mono text-[#50007c]">apple-touch-icon</code> & Web App Manifest).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAppIconInput('/icon.svg');
                updateAppIcon('/icon.svg');
                triggerSaveNotification('Set to official SVG PWA app icon!');
              }}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#50007c] text-xs font-bold rounded-xl border border-purple-200 transition cursor-pointer shrink-0"
            >
              Use Official App Icon
            </button>
          </div>

          {/* Smartphone Home Screen Simulation */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Phone Mockup */}
            <div className="w-56 h-80 rounded-[36px] bg-slate-800 p-3 border-4 border-slate-700 shadow-2xl relative flex flex-col justify-between overflow-hidden">
              {/* Dynamic Island / Notch */}
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />

              {/* Home Screen Icons Grid */}
              <div className="grid grid-cols-3 gap-3 p-2 my-auto">
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500 shadow-xs" />
                  <span className="text-[8px] text-white">Browser</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500 shadow-xs" />
                  <span className="text-[8px] text-white">WhatsApp</span>
                </div>
                {/* YOUR APP ICON */}
                <div className="flex flex-col items-center gap-1 scale-110">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg ring-2 ring-orange-400 overflow-hidden flex items-center justify-center">
                      <img 
                        src={appIconInput} 
                        alt="App icon preview" 
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                        }}
                      />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                  </div>
                  <span className="text-[9px] font-black text-white tracking-tight drop-shadow-sm">
                    Shivani
                  </span>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-16 h-1 bg-white/40 rounded-full mx-auto mb-1" />
            </div>

            {/* In-App Install Prompt Banner Preview */}
            <div className="max-w-xs space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                In-App Install Prompt Preview
              </span>
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-purple-200 shadow-xs overflow-hidden flex items-center justify-center">
                    <img 
                      src={appIconInput} 
                      alt="App install preview" 
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-slate-900">Install Shivani Graphics App</h5>
                    <p className="text-[10px] text-slate-500">Fast 1-click mobile catalog</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full py-2 bg-[#50007c] text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Download App (PWA)
                </button>
              </div>
            </div>
          </div>

          {/* Form to update App Icon */}
          <form onSubmit={handleSaveAppIcon} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                App Icon Image (Upload square 512x512 image or enter URL)
              </label>
              <ImageUploader
                value={appIconInput}
                onChange={async (url) => {
                  setAppIconInput(url);
                  await updateAppIcon(url);
                  triggerSaveNotification('App download icon updated and saved!');
                }}
                label="Upload App Icon (Square 512x512)"
                folder="branding"
              />
              <p className="text-[11px] text-slate-500">
                Square format with 1:1 aspect ratio. Default: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[#50007c] font-mono">/icon.svg</code>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Save App Download Icon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: COMPLETE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">
              Live Brand Assets Diagnostic & Status
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              All branding assets are verified active and securely persisted in real-time Cloud Firestore (<code className="font-mono text-[#50007c]">settings/branding</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Web Logo */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">1. Website Logo</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="h-28 rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-center overflow-hidden">
                <img src={siteLogo} alt="Web Logo" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <p><strong>Used in:</strong> Navigation Header, Drawer, Footer, Invoices</p>
                <p className="truncate font-mono text-[10px] text-slate-600">URL: {siteLogo}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('web')}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Change Website Logo
              </button>
            </div>

            {/* 2. Share Logo */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">2. Link Share Card</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="h-28 rounded-xl bg-purple-900 border border-purple-800 p-1 flex items-center justify-center overflow-hidden">
                <img src={shareLogo} alt="Share Card" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <p><strong>Used in:</strong> WhatsApp, Facebook, Twitter, iMessage Cards</p>
                <p className="truncate font-mono text-[10px] text-slate-600">URL: {shareLogo}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('share')}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Change Link Share Card
              </button>
            </div>

            {/* 3. App Download Icon */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">3. App Download Icon</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="h-28 rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-center overflow-hidden">
                <img src={appIcon} alt="App Icon" className="max-h-full max-w-full object-contain rounded-xl" />
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <p><strong>Used in:</strong> PWA Home Screen, Browser Tab Favicon, iOS Icon</p>
                <p className="truncate font-mono text-[10px] text-slate-600">URL: {appIcon}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('app')}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Change App Icon
              </button>
            </div>
          </div>

          {/* Quick Save All Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              className="w-full sm:w-auto px-6 py-3 bg-[#50007c] hover:bg-purple-900 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Save & Sync All Logos
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="w-full sm:w-auto px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 border border-red-200"
            >
              <Trash2 className="w-4 h-4" /> Reset All Logos to Default
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showConfirmReset}
        item={{
          id: 'site-logo-all',
          type: 'banner',
          title: 'Reset All Brand Logos & Cards',
          subtitle: 'Revert Website Logo, WhatsApp Link Share Card, and App Download Icon to official permanent assets',
          details: [
            { label: 'Website Logo', value: '/logo.svg (Official Vector)' },
            { label: 'Share Link Card', value: '/og-image.png (1200x630 Banner)' },
            { label: 'App Download Icon', value: '/icon.svg (PWA Icon)' }
          ]
        }}
        onClose={() => setShowConfirmReset(false)}
        onConfirm={handleConfirmReset}
        isDeleting={isResetting}
      />
    </div>
  );
};
