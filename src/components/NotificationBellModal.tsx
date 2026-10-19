import React, { useState } from 'react';
import { Bell, Sparkles, X, Tag, ExternalLink, Smartphone, Check, Clock, Volume2 } from 'lucide-react';
import { BroadcastNotification } from '../types';
import { requestNotificationPermission, markNotificationAsSeen } from '../services/notificationService';
import { WHATSAPP_PRIMARY } from '../utils/whatsapp';

interface NotificationBellModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BroadcastNotification[];
  subscriberCount?: number;
}

export const NotificationBellModal: React.FC<NotificationBellModalProps> = ({
  isOpen,
  onClose,
  notifications,
  subscriberCount = 0
}) => {
  const [permissionGranted, setPermissionGranted] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  if (!isOpen) return null;

  const handleEnableAlerts = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      alert('🎉 Phone Notifications Enabled! You will now receive instant offers directly on your phone lock screen.');
    }
  };

  const handleActionClick = (notif: BroadcastNotification) => {
    markNotificationAsSeen(notif.id);
    if (notif.actionUrl && notif.actionUrl.startsWith('http')) {
      window.open(notif.actionUrl, '_blank');
    } else if (notif.actionUrl) {
      window.location.hash = notif.actionUrl.replace(/^#\/?/, '#/');
      onClose();
    } else {
      // Default action: Open WhatsApp with offer enquiry
      const text = `Hello Shivani Graphics! I saw your offer: "${notif.title}". Please share details and pricing.`;
      window.open(`https://wa.me/${WHATSAPP_PRIMARY}?text=${encodeURIComponent(text)}`, '_blank');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#28003e] via-[#50007c] to-[#7915a8] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-tight text-white">
                  Exclusive Offers & Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  {notifications.length} Active
                </span>
              </div>
              <p className="text-[11px] text-purple-200 mt-0.5">
                Official broadcasts from Shivani Graphics Admin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner if not enabled */}
        {!permissionGranted && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Get notifications on your phone lock screen?</span>
            </div>
            <button
              type="button"
              onClick={handleEnableAlerts}
              className="px-3 py-1.5 bg-[#50007c] text-white rounded-xl font-bold text-xs hover:bg-purple-900 shrink-0 cursor-pointer shadow-xs"
            >
              Enable Alerts
            </button>
          </div>
        )}

        {/* Notification List Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-purple-50 text-[#50007c] flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">No Active Offers Right Now</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  When new discounts or seasonal offers are posted by Admin, they will show up here and alert your phone!
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="pt-3 first:pt-0 space-y-2 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-[#50007c]">
                        {notif.tag || 'Special Offer'}
                      </span>
                      {notif.discountCode && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                          Code: {notif.discountCode}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#50007c] transition-colors">
                      {notif.title}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {notif.message}
                </p>

                {notif.imageUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img 
                      src={notif.imageUrl} 
                      alt={notif.title} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform" 
                    />
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {notif.sentBy ? `Sent by ${notif.sentBy}` : 'Shivani Graphics Team'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleActionClick(notif)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#50007c] hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Claim Offer / Order</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>Over <strong>{subscriberCount || 40}+</strong> registered app users</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
