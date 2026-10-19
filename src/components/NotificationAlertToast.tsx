import React, { useState, useEffect } from 'react';
import { Bell, X, ExternalLink, Tag, Copy, Check } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { BroadcastNotification } from '../types';
import { getSeenNotificationIds, markNotificationAsSeen } from '../services/notificationService';
import { WHATSAPP_PRIMARY } from '../utils/whatsapp';

export const NotificationAlertToast: React.FC = () => {
  const { notifications } = useAdmin();
  const [activeAlert, setActiveAlert] = useState<BroadcastNotification | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    // Retrieve already seen notification IDs from localStorage
    const seenIds = new Set(getSeenNotificationIds());
    const unread = notifications.find((n: BroadcastNotification) => !seenIds.has(n.id));

    if (unread) {
      // Delay slightly so the page finishes loading first
      const timer = setTimeout(() => {
        setActiveAlert(unread);
        // Persistently mark as seen in localStorage immediately upon viewing
        // so it never appears again on subsequent visits or refreshes
        markNotificationAsSeen(unread.id);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!activeAlert) return null;

  const handleDismiss = () => {
    if (activeAlert) {
      markNotificationAsSeen(activeAlert.id);
    }
    setActiveAlert(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClaim = () => {
    if (activeAlert) {
      markNotificationAsSeen(activeAlert.id);
      if (activeAlert.actionUrl && activeAlert.actionUrl.startsWith('http')) {
        window.open(activeAlert.actionUrl, '_blank');
      } else if (activeAlert.actionUrl) {
        window.location.hash = activeAlert.actionUrl.replace(/^#\/?/, '#/');
      } else {
        const text = `Hello Shivani Graphics! I want to claim offer: "${activeAlert.title}". Please guide me.`;
        window.open(`https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(text)}`, '_blank');
      }
    }
    setActiveAlert(null);
  };

  return (
    <div 
      className="fixed top-24 sm:top-28 right-4 sm:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-top-3 fade-in duration-300 select-none"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-gradient-to-br from-slate-950 via-[#50007c] to-indigo-950 text-white p-4 rounded-2xl shadow-2xl border border-amber-400/80 ring-1 ring-amber-400/30 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
        
        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Header */}
        <div className="flex items-start gap-3 pr-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Bell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {activeAlert.tag || 'Special Offer'}
              </span>
            </div>
            <h5 className="font-extrabold text-xs sm:text-sm text-white leading-tight">
              {activeAlert.title}
            </h5>
            <p className="text-[11px] text-purple-100/90 mt-1 leading-snug line-clamp-2">
              {activeAlert.message}
            </p>
          </div>
        </div>

        {/* Action & Voucher Code Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
          {activeAlert.discountCode ? (
            <button
              type="button"
              onClick={() => handleCopyCode(activeAlert.discountCode!)}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-black text-amber-300 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md border border-amber-300/30 transition-colors cursor-pointer"
              title="Click to copy voucher code"
            >
              <Tag className="w-3 h-3" />
              <span>{activeAlert.discountCode}</span>
              {isCopied ? (
                <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
              ) : (
                <Copy className="w-3 h-3 text-amber-200 ml-0.5" />
              )}
            </button>
          ) : (
            <span className="text-[10px] text-purple-200 font-medium">Shivani Special Offer</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] text-purple-200 hover:text-white font-semibold px-2 py-1 transition-colors cursor-pointer"
            >
              Later
            </button>
            <button
              type="button"
              onClick={handleClaim}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform transform active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>View Deal</span>
              <ExternalLink className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
