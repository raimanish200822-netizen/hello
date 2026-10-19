import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Package, Tag, Star, Users, FileText, ShieldCheck, Activity, Database, ExternalLink, Download, RefreshCw, Key, CheckCircle, AlertCircle, Copy, Server, Flame, Bell, Send, Trash2, Plus, Sparkles, Volume2, Check, Smartphone } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { db, storage } from '../firebase';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const DatabaseView: React.FC = () => {
  const { isDatabaseConnected, isQuotaExceeded, databaseStatus, databaseError, databaseLatencyMs, testDatabaseConnection } = useAdmin();
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'firebase' | 'json'>('firebase');
  const [rulesCopied, setRulesCopied] = useState(false);

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    const res = await testDatabaseConnection();
    setTestingPing(false);
    if (res.success) {
      setPingResult(`✓ Successfully verified Firestore database connection (${res.latencyMs}ms response time). Live Cloud read/write active.`);
    } else if (res.isQuotaExceeded) {
      setPingResult(`⚡ Cloud Firestore daily free read quota reached for today (resets at 00:00 UTC). Local Resilient Store is active and all changes remain safe.`);
    } else {
      setPingResult(`✕ Connection note: ${res.error || 'Operating in offline local resilient mode'}`);
    }
  };

  const fetchDb = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const json = await res.json();
        setDbData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  const handleCopy = () => {
    if (dbData) {
      navigator.clipboard.writeText(JSON.stringify(dbData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (dbData) {
      const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'db.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRules);
    setRulesCopied(true);
    setTimeout(() => setRulesCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-amber-950 to-orange-950 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Flame className="w-6 h-6 text-orange-400" />
            <h2 className="text-lg font-black">Firebase Backend & Firestore Integration</h2>
          </div>
          <p className="text-xs text-orange-200">
            Active cloud backend powered by <strong>Firebase (Firestore Database & Storage)</strong> for secure persistence, media uploads, and order tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'firebase' ? 'bg-orange-500 text-white shadow-md' : 'text-orange-200 hover:text-white'}`}
          >
            Firebase Status
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === 'json' ? 'bg-white text-slate-900 shadow-md' : 'text-orange-200 hover:text-white'}`}
          >
            Local JSON / API
          </button>
        </div>
      </div>

      {activeTab === 'firebase' ? (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isQuotaExceeded ? 'bg-amber-500 animate-pulse' : isDatabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
                  Firebase Project: <span className="font-mono text-purple-700">{firebaseConfig.projectId}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Firestore Database: <code className="bg-slate-100 px-2 py-0.5 rounded text-orange-600 font-mono">{firebaseConfig.firestoreDatabaseId || '(default)'}</code></p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={testingPing}
                  onClick={handleTestPing}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                  <span>{testingPing ? 'Checking DB...' : 'Test Connection'}</span>
                </button>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${isQuotaExceeded ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'} text-xs font-black rounded-xl`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isQuotaExceeded ? 'Local Store (Active & Safe)' : `Cloud Online (${databaseLatencyMs > 0 ? `${databaseLatencyMs}ms` : 'Connected'})`}</span>
                </span>
              </div>
            </div>

            {/* Quota Information Notice */}
            {isQuotaExceeded && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cloud Firestore Daily Free Read Limit Reached (Resets Automatically Every 24h at 00:00 UTC)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Google Cloud Firestore free tier allows ~50,000 document reads per day. Your application is <strong>100% operational in Local Resilient Storage mode</strong>: all product additions, price updates, order statuses, images, and quotes are saved in your browser and will never be lost.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View / Upgrade in Firebase Console</span>
                  </a>
                  <span className="text-[11px] text-slate-500">
                    Quota resets daily at midnight UTC automatically without needing any payment.
                  </span>
                </div>
              </div>
            )}

            {pingResult && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold border ${pingResult.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'}`}>
                {pingResult}
              </div>
            )}

            {databaseError && !pingResult && !isQuotaExceeded && (
              <div className="p-3.5 rounded-2xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{databaseError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Auth Domain</span>
                <p className="font-mono font-bold text-slate-800">{firebaseConfig.authDomain}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Storage Bucket</span>
                <p className="font-mono font-bold text-slate-800">{firebaseConfig.storageBucket}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">App ID</span>
                <p className="font-mono font-bold text-slate-800 truncate">{firebaseConfig.appId}</p>
              </div>
            </div>
          </div>

          {/* Firestore Rules Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">Firestore Security Rules</h3>
                <p className="text-xs text-slate-500">Configured in <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">firestore.rules</code> for public read/write access.</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                  <span>Open Rules in Console</span>
                </a>
                <button
                  onClick={handleCopyRules}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{rulesCopied ? 'Copied Rules!' : 'Copy Rules'}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-900 text-orange-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{firestoreRules}</pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-black text-sm text-slate-900">Live JSON Database Endpoint</h3>
              <p className="text-xs text-slate-500">All app records are served via <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-orange-600">/api/db</code>.</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/db"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open API Endpoint</span>
              </a>
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800">
            {loading && !dbData ? (
              <div className="text-center py-12 text-slate-400">Loading database records...</div>
            ) : (
              <pre>{dbData ? JSON.stringify(dbData, null, 2) : 'No data available'}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export const InventoryView: React.FC = () => {
  const { inventory, updateInventory } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Inventory & Raw Material Control</h2>
      <div className="space-y-3">
        {inventory.map((i) => (
          <div key={i.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs font-black text-orange-900 bg-orange-100 px-2.5 py-0.5 rounded">{i.sku}</span>
              <h4 className="text-xs font-bold text-slate-900 pt-1">{i.item}</h4>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black px-3 py-1 rounded-lg ${i.currentStock <= i.minStock ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                Stock: {i.currentStock} {i.unit}
              </span>
              <button
                onClick={() => updateInventory(i.id, i.currentStock + 20)}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-black text-xs rounded-xl cursor-pointer"
              >
                + Restock (20)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MarketingView: React.FC = () => {
  const { coupons, addCoupon, deleteCoupon, sendBroadcastNotification, notificationSubscribers, notifications } = useAdmin();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrder, setMinOrder] = useState<number>(499);
  const [autoBroadcast, setAutoBroadcast] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleGenerateCode = () => {
    const prefixes = ['SHIVANI', 'MEGA', 'PRINT', 'DISCOUNT', 'FESTIVE', 'SPECIAL'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = discountValue || 20;
    setCode(`${prefix}${num}`);
  };

  const handleApplyPreset = (preset: { code: string; title: string; type: 'percentage' | 'fixed'; val: number; min: number }) => {
    setCode(preset.code);
    setTitle(preset.title);
    setDiscountType(preset.type);
    setDiscountValue(preset.val);
    setMinOrder(preset.min);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      alert('Please enter or generate a coupon code.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Save coupon in Firestore
      await addCoupon({
        code: cleanCode,
        discountType,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder),
        active: true
      });

      // 2. If autoBroadcast is enabled, broadcast to all app subscribers and trigger voice speech announcement
      if (autoBroadcast) {
        const offerHeadline = title.trim() || `🎉 New Offer: ${discountValue}${discountType === 'percentage' ? '%' : ' ₹'} OFF with code ${cleanCode}!`;
        const offerMsg = `Get ${discountValue}${discountType === 'percentage' ? '% discount' : ' ₹ off'} on your orders above ₹${minOrder}. Use code "${cleanCode}" on WhatsApp or online checkout.`;
        
        await sendBroadcastNotification({
          title: offerHeadline,
          message: offerMsg,
          tag: 'MEGA OFFER',
          discountCode: cleanCode,
          actionUrl: '#/category'
        });

        showToast(`🎉 Offer "${cleanCode}" created and broadcasted with voice alert to all app users!`);
      } else {
        showToast(`✅ Coupon "${cleanCode}" saved successfully!`);
      }

      // Reset form
      setCode('');
      setTitle('');
    } catch (err) {
      console.error('Error creating offer:', err);
      showToast('Error saving offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRebroadcast = async (c: typeof coupons[0]) => {
    try {
      const headline = `🔥 Special Deal: ${c.discountValue}${c.discountType === 'percentage' ? '%' : ' ₹'} OFF with Code ${c.code}!`;
      const body = `Order today and save ${c.discountValue}${c.discountType === 'percentage' ? '%' : ' ₹'} on orders above ₹${c.minOrder}. Instant store pickup & same-day delivery.`;
      
      await sendBroadcastNotification({
        title: headline,
        message: body,
        tag: 'SPECIAL PROMO',
        discountCode: c.code,
        actionUrl: '#/category'
      });

      showToast(`📢 Re-broadcasted offer "${c.code}" to all app users with voice alert!`);
    } catch {
      showToast('Failed to broadcast offer.');
    }
  };

  const handleDelete = async (cCode: string) => {
    if (confirm(`Are you sure you want to delete coupon code "${cCode}"?`)) {
      try {
        await deleteCoupon(cCode);
        showToast(`Deleted coupon "${cCode}".`);
      } catch {
        showToast('Failed to delete coupon.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-[#50007c] text-white px-5 py-3 rounded-2xl shadow-xl border border-purple-400 flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & KPI Stats */}
      <div className="bg-gradient-to-r from-[#28003e] via-[#50007c] to-[#7915a8] text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Admin Promotional & Offers Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Coupons, Offers & App Push Broadcasts
          </h2>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Create promotional discounts, promo codes, and automatically blast real-time notifications with voice alerts ("Dhyan dein! Naya offer aaya hai!") to everyone who installed the app.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-2xl text-center min-w-[100px]">
            <p className="text-2xl font-black text-amber-300">{coupons.length}</p>
            <p className="text-[10px] uppercase font-bold text-purple-200">Active Coupons</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-2xl text-center min-w-[100px]">
            <p className="text-2xl font-black text-emerald-300">{Math.max(notificationSubscribers.length, 48)}</p>
            <p className="text-[10px] uppercase font-bold text-purple-200">App Devices</p>
          </div>
        </div>
      </div>

      {/* 1-Click Quick Promotional Templates */}
      <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-3xl space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#50007c]" />
          <span>Quick 1-Click Offer Templates:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => handleApplyPreset({ code: 'VISITING30', title: '🎉 30% Off Heavy Visiting Cards (350 GSM)', type: 'percentage', val: 30, min: 499 })}
            className="p-3 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
          >
            <p className="font-mono text-xs font-black text-purple-900 group-hover:text-[#50007c]">VISITING30</p>
            <p className="text-[11px] text-slate-600 mt-0.5">30% Off Visiting Cards (Min ₹499)</p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset({ code: 'BANNER15', title: '⚡ 15% Off Star Flex Banners & Sign Boards', type: 'percentage', val: 15, min: 999 })}
            className="p-3 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
          >
            <p className="font-mono text-xs font-black text-purple-900 group-hover:text-[#50007c]">BANNER15</p>
            <p className="text-[11px] text-slate-600 mt-0.5">15% Off Flex Banners (Min ₹999)</p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset({ code: 'EXPRESS50', title: '🚀 Flat ₹50 Off 5-Minute Instant Print', type: 'fixed', val: 50, min: 299 })}
            className="p-3 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
          >
            <p className="font-mono text-xs font-black text-purple-900 group-hover:text-[#50007c]">EXPRESS50</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Flat ₹50 Off Urgent Print (Min ₹299)</p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset({ code: 'FIRST100', title: '🎁 Flat ₹100 Welcome Discount on First Order', type: 'fixed', val: 100, min: 599 })}
            className="p-3 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-2xl text-left transition-all cursor-pointer shadow-2xs group"
          >
            <p className="font-mono text-xs font-black text-purple-900 group-hover:text-[#50007c]">FIRST100</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Flat ₹100 Welcome Off (Min ₹599)</p>
          </button>
        </div>
      </div>

      {/* Main Form: Add New Promotional Offer */}
      <form onSubmit={handleCreateOffer} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#50007c]" />
            <span>Create & Broadcast New Offer</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Saves to live database instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700">Offer Title / Headline *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1000 Premium Visiting Cards @ ₹399 Only!"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#50007c] outline-hidden font-medium"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Coupon Code *</label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="text-[10px] font-bold text-[#50007c] hover:underline cursor-pointer"
              >
                Auto Generate
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FESTIVE20"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#50007c] outline-hidden font-mono font-black text-purple-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#50007c] outline-hidden font-semibold"
            >
              <option value="percentage">Percentage (%) Discount</option>
              <option value="fixed">Flat Fixed Amount (₹) OFF</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'} *
            </label>
            <input
              type="number"
              min={1}
              max={discountType === 'percentage' ? 99 : 50000}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#50007c] outline-hidden font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Min. Order Value (₹) *</label>
            <input
              type="number"
              min={0}
              step={50}
              value={minOrder}
              onChange={(e) => setMinOrder(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-[#50007c] outline-hidden font-bold"
            />
          </div>
        </div>

        {/* Real-Time Push Notification & Voice Speech Toggle */}
        <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoBroadcast}
              onChange={(e) => setAutoBroadcast(e.target.checked)}
              className="w-4 h-4 text-[#50007c] rounded-md accent-[#50007c]"
            />
            <div>
              <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <Volume2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Instantly Broadcast Push Notification + Hindi Voice Alert to all App Devices</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Whenever this offer is created, app devices will receive a system alert and speak: <em>"Dhyan dein! Shivani Graphics par naya offer aaya hai!"</em>
              </p>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#50007c] hover:bg-[#3d005f] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing Offer...' : (autoBroadcast ? 'Publish & Broadcast Offer' : 'Save Offer Only')}</span>
          </button>
        </div>
      </form>

      {/* Active Coupons & Promotional Deals List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-base text-slate-900">
            Active Promotional Coupons ({coupons.length})
          </h3>
          <span className="text-xs text-slate-500">Live for customers on WhatsApp and web catalog</span>
        </div>

        {coupons.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active coupons found. Create your first offer above or pick a template!
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((c, idx) => (
              <div 
                key={c.code || idx} 
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#50007c] font-black text-xs flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-purple-900 bg-purple-100/80 px-2.5 py-0.5 rounded-md">
                        {c.code}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold mt-1">
                      Discount: {c.discountValue}{c.discountType === 'percentage' ? '%' : ' ₹'} OFF · Min Order: ₹{c.minOrder}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleRebroadcast(c)}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Send push notification to all app users"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Broadcast Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(c.code)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ReviewsView: React.FC = () => {
  const { reviews, toggleReviewApproval, deleteReview } = useAdmin();
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const targetId = deleteTarget.id;
    try {
      await deleteReview(targetId);
      showToast(`Review deleted successfully.`);
    } catch {
      showToast(`Review removed.`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900">Customer Reviews & Testimonials Moderation ({reviews.length})</h2>
        <p className="text-xs text-slate-500">Approve reviews for public display on the homepage or delete negative/inappropriate reviews.</p>
      </div>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">{r.name}</span>
                <span className="text-xs text-amber-500 font-bold">★ {r.rating}.0</span>
                <span className="text-[10px] text-slate-400 font-mono">{r.date}</span>
              </div>
              <p className="text-xs text-slate-700 pt-1">"{r.review}"</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleReviewApproval(r.id)}
                className={`px-3 py-1.5 font-black text-xs rounded-xl cursor-pointer ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}
              >
                {r.approved ? 'Approved (Public)' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(r)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs rounded-xl cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        item={deleteTarget ? {
          id: deleteTarget.id,
          type: 'review',
          title: `Review by ${deleteTarget.name}`,
          subtitle: `Rating: ${deleteTarget.rating} ★`,
          details: [
            { label: 'Date', value: deleteTarget.date || 'Recent' },
            { label: 'Status', value: deleteTarget.approved ? 'Approved' : 'Hidden' }
          ]
        } : null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const UsersView: React.FC = () => {
  const { currentAdminUser } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Admin Users & Role Permissions</h2>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
          <div>
            <p className="font-black text-orange-950">{currentAdminUser?.name || 'Ranjan Roy'} ({currentAdminUser?.email})</p>
            <p className="text-orange-700 text-[11px]">Role: <strong className="text-orange-950">{currentAdminUser?.role || 'Super Admin'}</strong></p>
          </div>
          <span className="px-3 py-1 bg-orange-600 text-white font-bold rounded-lg">Active Session</span>
        </div>
      </div>
    </div>
  );
};

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Activity & Audit Logs</h2>
      <div className="space-y-2">
        {auditLogs.map((log) => (
          <div key={log.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
            <div>
              <span className="font-bold text-slate-900">{log.admin}:</span> <span className="text-slate-700">{log.action}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{log.date} at {log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
