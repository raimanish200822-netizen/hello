import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, ExternalLink } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { BroadcastNotification } from '../types';
import { getSeenNotificationIds, markNotificationAsSeen } from '../services/notificationService';
import { WHATSAPP_PRIMARY } from '../utils/whatsapp';
import { speakNewOfferAnnouncement } from '../utils/voiceGreeting';

export const NotificationAlertToast: React.FC = () => {
  const { notifications } = useAdmin();
  const [activeAlert, setActiveAlert] = useState<BroadcastNotification | null>(null);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const seenIds = new Set(getSeenNotificationIds());
    const unread = notifications.find((n: BroadcastNotification) => !seenIds.has(n.id));

    if (unread) {
      // Delay slightly so the page finishes loading first
      const timer = setTimeout(() => {
        setActiveAlert(unread);
        speakNewOfferAnnouncement(unread.title);
      }, 1500);
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
    <div className="fixed top-18 right-4 sm:right-6 z-50 max-w-sm w-[90vw] animate-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-purple-900 via-[#50007c] to-indigo-950 text-white p-4 rounded-3xl shadow-2xl border-2 border-amber-400 flex flex-col gap-2.5 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-2.5 pr-6">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Bell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-amber-300 inline-block mb-1">
              {activeAlert.tag || 'Special Offer'}
            </span>
            <h5 className="font-extrabold text-xs text-white leading-tight">
              {activeAlert.title}
            </h5>
            <p className="text-[11px] text-purple-200 mt-1 leading-snug line-clamp-2">
              {activeAlert.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
          {activeAlert.discountCode ? (
            <span className="text-[10px] font-mono font-bold text-amber-300">
              Code: {activeAlert.discountCode}
            </span>
          ) : (
            <span className="text-[10px] text-purple-300">Exclusive Broadcast</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] text-purple-300 hover:text-white font-semibold cursor-pointer"
            >
              Later
            </button>
            <button
              type="button"
              onClick={handleClaim}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
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
