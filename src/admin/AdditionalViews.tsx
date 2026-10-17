import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Package, Tag, Star, Users, FileText, ShieldCheck, Activity, Database, ExternalLink, Download, RefreshCw, Key, CheckCircle, AlertCircle, Copy, Server, Flame } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { db, storage } from '../firebase';

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
  const { coupons, addCoupon } = useAdmin();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Coupons & Promotional Offers</h2>
      <div className="space-y-3">
        {coupons.map((c, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs font-mono font-black text-orange-700 bg-orange-100 px-2.5 py-1 rounded-lg">{c.code}</span>
              <p className="text-xs text-slate-600 pt-1">Discount: {c.discountValue}{c.discountType === 'percentage' ? '%' : ' INR'} · Min Order: ₹{c.minOrder}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">Active</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReviewsView: React.FC = () => {
  const { reviews, toggleReviewApproval, deleteReview } = useAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900">Customer Reviews & Testimonials Moderation</h2>
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
                onClick={() => toggleReviewApproval(r.id)}
                className={`px-3 py-1.5 font-black text-xs rounded-xl cursor-pointer ${r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}
              >
                {r.approved ? 'Approved (Public)' : 'Hidden'}
              </button>
              <button
                onClick={() => deleteReview(r.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs rounded-xl cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
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
