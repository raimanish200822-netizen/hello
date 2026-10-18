import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { ProductItem, FaqItem, AboutUsItem } from '../types';
import { FAQS } from '../data/faqs';
import { db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { cacheBustProduct, appendCacheBuster, getCacheBustedImageUrl } from '../utils/imageUtils';

export interface AdminUser {
  email: string;
  name: string;
  role: 'Super Admin' | 'Manager' | 'Staff' | 'Designer';
}

export interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  productTitle: string;
  quantity: number;
  options: string;
  totalAmount: number;
  status: 'New' | 'Confirmed' | 'Design Pending' | 'Designing' | 'Printing' | 'Quality Check' | 'Ready' | 'Ready for Pickup' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  date: string;
  files?: string[];
}

export interface AdminQuote {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  service: string;
  quantity: number;
  specifications: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  quotedPrice?: number;
  date: string;
}

export interface WebsiteImage {
  id: string;
  title: string;
  section: string;
  url: string;
  alt: string;
  desktopUrl?: string;
  mobileUrl?: string;
  enabled: boolean;
  sortOrder: number;
  subtitle?: string;
  badge?: string;
  minQty?: string;
  ctaText?: string;
  productId?: string;
  categoryId?: string;
}

export interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  trafficByDay: { day: string; visitors: number; inquiries: number; orders: number }[];
}

const INITIAL_REVIEWS: ReviewItem[] = [
  { id: 'rev-1', name: 'Rohan Sharma', rating: 5, review: 'Amazing quality visiting cards ready in just 5 minutes at Mahavir Enclave store!', date: '2026-10-06', approved: true },
  { id: 'rev-2', name: 'Neha Gupta', rating: 5, review: 'Best flex banner printing in Delhi NCR. Very prompt service.', date: '2026-10-07', approved: true }
];

export interface CouponItem {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  active: boolean;
}

export interface InventoryItem {
  id: string;
  item: string;
  sku: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
  photo?: string;
  authorId?: string;
}

export interface AuditLog {
  id: string;
  admin: string;
  action: string;
  date: string;
  time: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber?: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  productTitle: string;
  quantity: number;
  options?: string;
  totalAmount: number;
  paymentStatus: string;
  date: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: string;
}

interface AdminContextType {
  isAdminLoggedIn: boolean;
  currentAdminUser: AdminUser | null;
  login: (user: AdminUser) => void;
  logout: () => void;
  products: ProductItem[];
  updateProduct: (product: ProductItem) => Promise<void>;
  addProduct: (product: ProductItem) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  orders: AdminOrder[];
  updateOrderStatus: (id: string, status: AdminOrder['status']) => Promise<void>;
  saveOrder: (order: AdminOrder) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  invoices: InvoiceRecord[];
  saveInvoice: (invoice: InvoiceRecord) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  customers: AdminCustomer[];
  saveCustomer: (customer: AdminCustomer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  quotes: AdminQuote[];
  updateQuoteStatus: (id: string, status: AdminQuote['status'], price?: number) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  websiteImages: WebsiteImage[];
  updateWebsiteImage: (image: WebsiteImage) => Promise<void>;
  addWebsiteImage: (image: WebsiteImage) => Promise<void>;
  deleteWebsiteImage: (id: string) => Promise<void>;
  websiteContent: {
    heroHeading: string;
    heroSubtitle: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    businessName: string;
    aboutTitle?: string;
    aboutDescription?: string;
    aboutMission?: string;
    aboutVision?: string;
    aboutStory?: string;
    aboutImageUrl?: string;
    founderName?: string;
    founderRole?: string;
    founderPhone?: string;
    founderWhatsapp?: string;
    founderImageUrl?: string;
    companyImageUrl?: string;
    founderBio?: string;
    founderQuote?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  };
  updateWebsiteContent: (content: any) => Promise<void>;
  faqs: FaqItem[];
  addFaq: (faq: FaqItem) => Promise<void>;
  updateFaq: (faq: FaqItem) => Promise<void>;
  deleteFaq: (id: string) => Promise<void>;
  aboutUs: AboutUsItem[];
  addAboutUs: (item: AboutUsItem) => Promise<void>;
  updateAboutUs: (item: AboutUsItem) => Promise<void>;
  deleteAboutUs: (id: string) => Promise<void>;
  coupons: CouponItem[];
  addCoupon: (coupon: CouponItem) => Promise<void>;
  inventory: InventoryItem[];
  updateInventory: (id: string, qty: number) => Promise<void>;
  reviews: ReviewItem[];
  toggleReviewApproval: (id: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  addPublicReview: (review: { name: string; rating: number; review: string; photo?: string }) => Promise<void>;
  categories: any[];
  updateCategory: (category: any) => Promise<void>;
  auditLogs: AuditLog[];
  visitorStats: VisitorStats;
  siteLogo: string;
  shareLogo: string;
  appIcon: string;
  updateSiteLogo: (url: string) => Promise<void>;
  updateShareLogo: (url: string) => Promise<void>;
  updateAppIcon: (url: string) => Promise<void>;
  updateBrandingSettings: (settings: { siteLogo?: string; shareLogo?: string; appIcon?: string }) => Promise<void>;
  deleteSiteLogo: () => Promise<void>;
  resetBrandingToDefault: () => Promise<void>;
  logAction: (action: string, adminName: string) => void;
  isFirebaseLoading: boolean;
  isDatabaseConnected: boolean;
  isQuotaExceeded: boolean;
  databaseStatus: 'connected' | 'connecting' | 'error';
  databaseError: string | null;
  databaseLatencyMs: number;
  testDatabaseConnection: () => Promise<{ success: boolean; latencyMs: number; error?: string; isQuotaExceeded?: boolean }>;
  getCacheBustedImageUrl: (url?: string, versionOrTimestamp?: number | string, fallback?: string) => string;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);

  // Local Cache keys to eliminate flash of old images/data on page load
  const CACHE_KEY_LOGO = 'shivani_cached_site_logo';
  const CACHE_KEY_SHARE_LOGO = 'shivani_cached_share_logo';
  const CACHE_KEY_APP_ICON = 'shivani_cached_app_icon';
  const DEFAULT_SITE_LOGO = '/logo.svg';
  const DEFAULT_SHARE_LOGO = '/og-image.png';
  const DEFAULT_APP_ICON = '/icon.svg';

  const sanitizeLogoUrl = (url?: string | null, fallback: string = DEFAULT_SITE_LOGO): string => {
    if (!url || typeof url !== 'string' || !url.trim()) return fallback;
    const trimmed = url.trim();
    if (trimmed.includes('sanishtech.com') || trimmed.includes('Image Expired')) return fallback;
    return trimmed;
  };

  const CACHE_KEY_BANNERS = 'shivani_cached_website_images';
  const CACHE_KEY_CONTENT = 'shivani_cached_website_content';
  const CACHE_KEY_PRODUCTS = 'shivani_cached_products';
  const CACHE_KEY_DELETED_PRODUCTS = 'shivani_deleted_product_ids';
  const CACHE_KEY_ORDERS = 'shivani_cached_orders';
  const CACHE_KEY_DELETED_ORDERS = 'shivani_deleted_order_ids';
  const CACHE_KEY_INVOICES = 'shivani_cached_invoices';
  const CACHE_KEY_DELETED_INVOICES = 'shivani_deleted_invoice_ids';
  const CACHE_KEY_CUSTOMERS = 'shivani_cached_customers';
  const CACHE_KEY_DELETED_CUSTOMERS = 'shivani_deleted_customer_ids';
  const CACHE_KEY_QUOTES = 'shivani_cached_quotes';
  const CACHE_KEY_DELETED_QUOTES = 'shivani_deleted_quote_ids';

  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const delRaw = localStorage.getItem('shivani_deleted_product_ids');
      const deletedSet = new Set<string>(delRaw ? JSON.parse(delRaw) : []);
      const cached = localStorage.getItem('shivani_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p: ProductItem) => p && p.id && !deletedSet.has(p.id));
        }
      }
      return PRODUCTS.filter(p => !deletedSet.has(p.id));
    } catch {}
    return PRODUCTS;
  });

  const [categories, setCategories] = useState<any[]>(CATEGORIES);
  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    try {
      const delRaw = localStorage.getItem(CACHE_KEY_DELETED_ORDERS);
      const deletedSet = new Set<string>(delRaw ? JSON.parse(delRaw) : []);
      const saved = localStorage.getItem(CACHE_KEY_ORDERS) || localStorage.getItem('shivani_orders_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((o: AdminOrder) => o && o.id && !deletedSet.has(o.id));
      }
    } catch {}
    return [];
  });
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => {
    try {
      const delRaw = localStorage.getItem(CACHE_KEY_DELETED_INVOICES);
      const deletedSet = new Set<string>(delRaw ? JSON.parse(delRaw) : []);
      const saved = localStorage.getItem(CACHE_KEY_INVOICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((inv: InvoiceRecord) => inv && inv.id && !deletedSet.has(inv.id));
      }
    } catch {}
    return [];
  });
  const [customers, setCustomers] = useState<AdminCustomer[]>(() => {
    try {
      const delRaw = localStorage.getItem(CACHE_KEY_DELETED_CUSTOMERS);
      const deletedSet = new Set<string>(delRaw ? JSON.parse(delRaw) : []);
      const saved = localStorage.getItem(CACHE_KEY_CUSTOMERS) || localStorage.getItem('shivani_customers_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((c: AdminCustomer) => c && c.id && !deletedSet.has(c.id));
      }
    } catch {}
    return [];
  });
  const [quotes, setQuotes] = useState<AdminQuote[]>(() => {
    try {
      const delRaw = localStorage.getItem(CACHE_KEY_DELETED_QUOTES);
      const deletedSet = new Set<string>(delRaw ? JSON.parse(delRaw) : []);
      const saved = localStorage.getItem(CACHE_KEY_QUOTES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((q: AdminQuote) => q && q.id && !deletedSet.has(q.id));
      }
    } catch {}
    return [];
  });

  const [siteLogo, setSiteLogo] = useState<string>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_LOGO);
      return sanitizeLogoUrl(cached, DEFAULT_SITE_LOGO);
    } catch {}
    return DEFAULT_SITE_LOGO;
  });

  const [shareLogo, setShareLogo] = useState<string>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_SHARE_LOGO);
      return sanitizeLogoUrl(cached, DEFAULT_SHARE_LOGO);
    } catch {}
    return DEFAULT_SHARE_LOGO;
  });

  const [appIcon, setAppIcon] = useState<string>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_APP_ICON);
      return sanitizeLogoUrl(cached, DEFAULT_APP_ICON);
    } catch {}
    return DEFAULT_APP_ICON;
  });

  const [websiteImages, setWebsiteImages] = useState<WebsiteImage[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_BANNERS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { id: 'img-1', title: 'Homepage Hero Main', section: 'Hero', url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80', alt: 'Visiting Cards', enabled: true, sortOrder: 1 },
      { id: 'img-2', title: 'Outdoor Flex Banner', section: 'Hero', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80', alt: 'Flex Banners', enabled: true, sortOrder: 2 }
    ];
  });

  const [websiteContent, setWebsiteContent] = useState(() => {
    const baseContent = {
      heroHeading: 'Shivani Graphics · Commercial Digital Printing Press',
      heroSubtitle: 'Premium digital printing, visiting cards, flex banners, 3D acrylic LED boards & corporate merch in Delhi NCR.',
      phone: '+91-9266944315',
      whatsapp: '919266944315',
      email: 'shivanidigitalprints@gmail.com',
      address: 'D3/50, Gali No. 8A, Mahavir Enclave, New Delhi, Delhi 110045',
      businessName: 'Shivani Graphics',
      aboutTitle: 'About Shivani Graphics - Delhi NCRs Premier Commercial Printing Press',
      aboutDescription: 'Established with a commitment to lightning-fast printing, superior 350 GSM card stock, and state-of-the-art Konica Minolta digital printing press in Mahavir Enclave, Delhi.',
      aboutMission: 'To provide 5-minute visiting cards, bulk flex banners, and 3D acrylic LED boards with unmatched precision and wholesale pricing.',
      aboutVision: 'To be India\'s most trusted digital print & signage partner for small businesses, agencies, and retail brands.',
      aboutStory: 'Founded in Mahavir Enclave, New Delhi, Shivani Graphics started as a boutique digital print desk and grew into a full-fledged high-speed production printing house.',
      aboutImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      founderName: 'Ranjan Roy',
      founderRole: 'Founder & Managing Director',
      founderPhone: '+91-9810157695',
      founderWhatsapp: '919810157695',
      founderImageUrl: (typeof window !== 'undefined' ? localStorage.getItem('shivani_founder_photo') : '') || '',
      companyImageUrl: (typeof window !== 'undefined' ? localStorage.getItem('shivani_company_photo') : '') || '',
      founderBio: 'Ranjan Roy founded Shivani Graphics in 1996 with a singular pledge: to give every business, creator, and individual pristine commercial print quality with personal accountability.',
      founderQuote: 'To me, printing is never just paper and ink. It is someone\'s first business card, a startup\'s pitch deck, an author\'s book, or an enterprise\'s grand banner. Since 1996, that promise has never changed.',
      seoTitle: 'Shivani Graphics · Custom Print & Signage | Delhi NCR',
      seoDescription: 'Premium commercial digital printing in Delhi NCR & Pan-India. Visiting cards, banners, standees, corporate stationery, photo frames, and customized merchandising with instant WhatsApp ordering.',
      seoKeywords: 'printing press, visiting cards, flex banners, signages, delhi ncr, shivani graphics, print shop'
    };

    try {
      const cached = localStorage.getItem(CACHE_KEY_CONTENT);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.heroHeading && (parsed.heroHeading.includes('Printo') || parsed.heroHeading.includes('printo'))) {
          parsed.heroHeading = 'Shivani Graphics · Commercial Digital Printing Press';
          try { localStorage.setItem(CACHE_KEY_CONTENT, JSON.stringify({ ...baseContent, ...parsed })); } catch {}
        }
        return { ...baseContent, ...parsed };
      }
    } catch {}
    return baseContent;
  });
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 'inv-1', item: '350 GSM Art Card Reams', sku: 'PAPER-350GSM', currentStock: 45, minStock: 10, unit: 'Reams' },
    { id: 'inv-2', item: 'Star Flex Vinyl Roll 340 GSM', sku: 'FLEX-340GSM', currentStock: 12, minStock: 3, unit: 'Rolls' },
    { id: 'inv-3', item: 'Matte Lamination Roll', sku: 'LAM-MATTE', currentStock: 8, minStock: 2, unit: 'Rolls' }
  ]);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [faqs, setFaqs] = useState<FaqItem[]>(FAQS);
  const [aboutUs, setAboutUs] = useState<AboutUsItem[]>([
    { id: 'about-1', title: '5-Min Counter & Same-Day Speed', subtitle: 'Mahavir Enclave, New Delhi', description: '5-minute counter pickup and same-day express bike courier delivery across Delhi NCR for urgent meetings and events.', sectionKey: 'mission', order: 1 },
    { id: 'about-2', title: '1200 DPI Industrial Output', subtitle: 'Heavy Art Cardboards', description: 'Heavy 350-400 GSM art cardboards, velvet touch laminations, and raised spot UV tactile embossing.', sectionKey: 'infrastructure', order: 2 }
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', admin: 'Ranjan Roy', action: 'Master Admin Studio Initialized (Firestore Realtime Sync)', date: '2026-10-07', time: '19:10' }
  ]);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 4450,
    todayVisitors: 342,
    trafficByDay: [
      { day: 'Mon', visitors: 420, inquiries: 45, orders: 12 },
      { day: 'Tue', visitors: 530, inquiries: 60, orders: 18 },
      { day: 'Wed', visitors: 610, inquiries: 75, orders: 24 },
      { day: 'Thu', visitors: 580, inquiries: 68, orders: 20 },
      { day: 'Fri', visitors: 720, inquiries: 92, orders: 32 },
      { day: 'Sat', visitors: 890, inquiries: 110, orders: 45 },
      { day: 'Sun', visitors: 650, inquiries: 80, orders: 28 },
    ]
  });

  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(true);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [databaseLatencyMs, setDatabaseLatencyMs] = useState<number>(0);

  const testDatabaseConnection = async () => {
    setDatabaseStatus('connecting');
    const res = await testConnection();
    setDatabaseLatencyMs(res.latencyMs);
    if (res.success) {
      setIsDatabaseConnected(true);
      setIsQuotaExceeded(false);
      setDatabaseStatus('connected');
      setDatabaseError(null);
    } else if (res.isQuotaExceeded) {
      setIsDatabaseConnected(true);
      setIsQuotaExceeded(true);
      setDatabaseStatus('connected');
      setDatabaseError("Cloud Firestore daily free read quota reached (resets daily at 00:00 UTC). Resilient local storage & live catalog active.");
    } else {
      setIsDatabaseConnected(true);
      setDatabaseStatus('connected');
      setDatabaseError(res.error || 'Firestore client in local offline mode');
    }
    return res;
  };

  const handleListenerError = (err: any, path: string) => {
    const msg = err?.message || String(err);
    const isQuota = msg.includes('Quota limit exceeded') || 
                    msg.includes('resource-exhausted') || 
                    msg.includes('quota metric') ||
                    msg.includes('Free daily read units');
    if (isQuota) {
      setIsQuotaExceeded(true);
      setDatabaseError("Cloud Firestore daily free read quota reached (resets daily at 00:00 UTC). Active in Local Offline-Resilient Store mode.");
    } else {
      setDatabaseError(msg);
    }
    setIsDatabaseConnected(true);
    setDatabaseStatus('connected');
    setIsFirebaseLoading(false);
    handleFirestoreError(err, OperationType.GET, path);
  };

  // Real-time Firestore onSnapshot listeners
  useEffect(() => {
    testDatabaseConnection();

    // 1. Products Listener (Preserves admin deletions & updates)
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setIsDatabaseConnected(true);
      setDatabaseStatus('connected');
      setDatabaseError(null);
      setIsQuotaExceeded(false);
      // 1a. If collection in Firestore is completely blank on very first launch, seed once
      if (snapshot.empty) {
        PRODUCTS.forEach(p => {
          setDoc(doc(db, 'products', p.id), p).catch(() => {});
        });
        setProducts(PRODUCTS);
        try {
          localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(PRODUCTS));
        } catch {}
        setIsFirebaseLoading(false);
        return;
      }

      // 1b. Load active products from Firestore and filter out permanently deleted IDs
      let deletedSet = new Set<string>();
      try {
        const delRaw = localStorage.getItem(CACHE_KEY_DELETED_PRODUCTS);
        if (delRaw) deletedSet = new Set(JSON.parse(delRaw));
      } catch {}

      const firestoreItems = snapshot.docs
        .map(doc => doc.data() as ProductItem)
        .filter(p => p && p.id && !deletedSet.has(p.id));

      if (firestoreItems.length > 0) {
        setProducts(firestoreItems);
        try {
          localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(firestoreItems));
        } catch {}
      }
      setIsFirebaseLoading(false);
    }, (error) => {
      handleListenerError(error, 'products');
    });

    // 1b. Deleted products synchronization listener across devices
    const unsubDeleted = onSnapshot(doc(db, 'settings', 'deleted_products'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteIds = docSnap.data()?.ids || [];
        if (Array.isArray(remoteIds) && remoteIds.length > 0) {
          try {
            const localRaw = localStorage.getItem(CACHE_KEY_DELETED_PRODUCTS);
            const localIds = localRaw ? JSON.parse(localRaw) : [];
            const merged = Array.from(new Set<string>([...localIds, ...remoteIds]));
            localStorage.setItem(CACHE_KEY_DELETED_PRODUCTS, JSON.stringify(merged));
            setProducts(prev => prev.filter(p => !merged.includes(p.id)));
          } catch {}
        }
      }
    }, (error) => {
      handleListenerError(error, 'settings/deleted_products');
    });

    // 2. Banners / Website Images Listener
    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as WebsiteImage));
      if (items.length > 0) {
        setWebsiteImages(items);
        try {
          localStorage.setItem(CACHE_KEY_BANNERS, JSON.stringify(items));
        } catch {}
      }
    }, (error) => {
      handleListenerError(error, 'banners');
    });

    // 3. Orders Listener
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      let deletedSet = new Set<string>();
      try {
        const delRaw = localStorage.getItem(CACHE_KEY_DELETED_ORDERS);
        if (delRaw) deletedSet = new Set(JSON.parse(delRaw));
      } catch {}

      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as unknown as AdminOrder))
        .filter(o => o && o.id && !deletedSet.has(o.id));

      setOrders(items);
      try {
        localStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(items));
        localStorage.setItem('shivani_orders_db', JSON.stringify(items));
      } catch {}
    }, (error) => {
      handleListenerError(error, 'orders');
    });

    // 4. Invoices Listener
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snapshot) => {
      let deletedSet = new Set<string>();
      try {
        const delRaw = localStorage.getItem(CACHE_KEY_DELETED_INVOICES);
        if (delRaw) deletedSet = new Set(JSON.parse(delRaw));
      } catch {}

      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as unknown as InvoiceRecord))
        .filter(inv => inv && inv.id && !deletedSet.has(inv.id));

      setInvoices(items);
      try {
        localStorage.setItem(CACHE_KEY_INVOICES, JSON.stringify(items));
      } catch {}
    }, (error) => {
      handleListenerError(error, 'invoices');
    });

    // 4b. Customers Listener
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      let deletedSet = new Set<string>();
      try {
        const delRaw = localStorage.getItem(CACHE_KEY_DELETED_CUSTOMERS);
        if (delRaw) deletedSet = new Set(JSON.parse(delRaw));
      } catch {}

      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as unknown as AdminCustomer))
        .filter(c => c && c.id && !deletedSet.has(c.id));

      setCustomers(items);
      try {
        localStorage.setItem(CACHE_KEY_CUSTOMERS, JSON.stringify(items));
        localStorage.setItem('shivani_customers_db', JSON.stringify(items));
      } catch {}
    }, (error) => {
      handleListenerError(error, 'customers');
    });

    // 5. Quotes Listener (Bulk orders & custom quotes)
    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      let deletedSet = new Set<string>();
      try {
        const delRaw = localStorage.getItem(CACHE_KEY_DELETED_QUOTES);
        if (delRaw) deletedSet = new Set(JSON.parse(delRaw));
      } catch {}

      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as unknown as AdminQuote))
        .filter(q => q && q.id && !deletedSet.has(q.id));

      setQuotes(items);
      try {
        localStorage.setItem(CACHE_KEY_QUOTES, JSON.stringify(items));
      } catch {}
    }, (error) => {
      handleListenerError(error, 'quotes');
    });

    // 6. Reviews Listener
    const unsubReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const firestoreReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as ReviewItem));
      const merged = [...firestoreReviews];
      const firestoreIds = new Set(firestoreReviews.map(r => r.id));
      INITIAL_REVIEWS.forEach(r => {
        if (!firestoreIds.has(r.id)) {
          merged.push(r);
          setDoc(doc(db, 'reviews', r.id), r).catch(() => {});
        }
      });
      setReviews(merged);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reviews');
    });

    // 7. Coupons Listener
    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as CouponItem));
      setCoupons(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'coupons');
    });

    // 8. Inventory Listener
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as InventoryItem));
      setInventory(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'inventory');
    });

    // 8b. Categories Listener
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const firestoreCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const merged = [...firestoreCategories];
      CATEGORIES.forEach(c => {
        if (!merged.find((item: any) => item.id === c.id)) {
          merged.push(c);
          setDoc(doc(db, 'categories', c.id), c).catch(() => {});
        }
      });
      setCategories(merged);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
    });

    // 9. Website Content Listener
    const unsubContent = onSnapshot(doc(db, 'content', 'site_content'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setWebsiteContent(data);
        try {
          localStorage.setItem(CACHE_KEY_CONTENT, JSON.stringify(data));
          if (data.founderImageUrl) localStorage.setItem('shivani_founder_photo', data.founderImageUrl);
          if (data.companyImageUrl) localStorage.setItem('shivani_company_photo', data.companyImageUrl);
        } catch {}
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'content/site_content');
    });

    // 10. FAQs Listener
    const unsubFaqs = onSnapshot(collection(db, 'faqs'), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as FaqItem);
      setFaqs(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'faqs');
    });

    // 11. AboutUs Listener
    const unsubAboutUs = onSnapshot(collection(db, 'about_us'), (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data() as AboutUsItem);
      setAboutUs(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'about_us');
    });

    // 12. Visitor Stats Listener & Session Increment
    const unsubVisitors = onSnapshot(doc(db, 'analytics', 'visitor_stats'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as VisitorStats;
        setVisitorStats(data);
        if (!sessionStorage.getItem('shivani_visitor_tracked')) {
          sessionStorage.setItem('shivani_visitor_tracked', 'true');
          const newTotal = (data.totalVisitors || 4450) + 1;
          const newToday = (data.todayVisitors || 342) + 1;
          setDoc(doc(db, 'analytics', 'visitor_stats'), {
            ...data,
            totalVisitors: newTotal,
            todayVisitors: newToday
          }, { merge: true }).catch(() => {});
        }
      } else {
        const initialStats: VisitorStats = {
          totalVisitors: 4450,
          todayVisitors: 342,
          trafficByDay: [
            { day: 'Mon', visitors: 420, inquiries: 45, orders: 12 },
            { day: 'Tue', visitors: 530, inquiries: 60, orders: 18 },
            { day: 'Wed', visitors: 610, inquiries: 75, orders: 24 },
            { day: 'Thu', visitors: 580, inquiries: 68, orders: 20 },
            { day: 'Fri', visitors: 720, inquiries: 92, orders: 32 },
            { day: 'Sat', visitors: 890, inquiries: 110, orders: 45 },
            { day: 'Sun', visitors: 650, inquiries: 80, orders: 28 },
          ]
        };
        setDoc(doc(db, 'analytics', 'visitor_stats'), initialStats).catch(() => {});
        setVisitorStats(initialStats);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'analytics/visitor_stats');
    });

    // 13. Logo & Branding Settings Listener
    const unsubLogo = onSnapshot(doc(db, 'settings', 'branding'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const validSiteLogo = sanitizeLogoUrl(data.url || data.siteLogo, DEFAULT_SITE_LOGO);
        const validShareLogo = sanitizeLogoUrl(data.shareLogo, DEFAULT_SHARE_LOGO);
        const validAppIcon = sanitizeLogoUrl(data.appIcon, DEFAULT_APP_ICON);

        setSiteLogo(validSiteLogo);
        setShareLogo(validShareLogo);
        setAppIcon(validAppIcon);

        try {
          localStorage.setItem(CACHE_KEY_LOGO, validSiteLogo);
          localStorage.setItem(CACHE_KEY_SHARE_LOGO, validShareLogo);
          localStorage.setItem(CACHE_KEY_APP_ICON, validAppIcon);
        } catch {}

        // If the document had expired URLs, auto-migrate to permanent defaults
        const rawUrl = data.url || data.siteLogo || '';
        const rawShare = data.shareLogo || '';
        const rawApp = data.appIcon || '';
        if (rawUrl.includes('sanishtech.com') || rawShare.includes('sanishtech.com') || rawApp.includes('sanishtech.com')) {
          setDoc(doc(db, 'settings', 'branding'), {
            url: validSiteLogo,
            siteLogo: validSiteLogo,
            shareLogo: validShareLogo,
            appIcon: validAppIcon
          }, { merge: true }).catch(() => {});
        }
      } else {
        setDoc(doc(db, 'settings', 'branding'), {
          url: DEFAULT_SITE_LOGO,
          siteLogo: DEFAULT_SITE_LOGO,
          shareLogo: DEFAULT_SHARE_LOGO,
          appIcon: DEFAULT_APP_ICON
        }, { merge: true }).catch(() => {});
        setSiteLogo(DEFAULT_SITE_LOGO);
        setShareLogo(DEFAULT_SHARE_LOGO);
        setAppIcon(DEFAULT_APP_ICON);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/branding');
    });

    return () => {
      unsubProducts();
      unsubDeleted();
      unsubBanners();
      unsubOrders();
      unsubInvoices();
      unsubCustomers();
      unsubQuotes();
      unsubReviews();
      unsubCoupons();
      unsubInventory();
      unsubContent();
      unsubFaqs();
      unsubAboutUs();
      unsubVisitors();
      unsubLogo();
    };
  }, []);

  // Dynamically synchronize HTML head tags with live branding settings
  useEffect(() => {
    // 1. Social Share Image (OpenGraph & Twitter Cards)
    const effectiveShareImg = shareLogo && !shareLogo.includes('sanishtech.com') ? shareLogo : DEFAULT_SHARE_LOGO;
    const ogImgMeta = document.querySelector('meta[property="og:image"]');
    if (ogImgMeta) ogImgMeta.setAttribute('content', effectiveShareImg);
    const twitterImgMeta = document.querySelector('meta[name="twitter:image"]');
    if (twitterImgMeta) twitterImgMeta.setAttribute('content', effectiveShareImg);

    // 2. Favicon & Apple Touch Icon (PWA & browser tabs)
    const effectiveAppIcon = appIcon && !appIcon.includes('sanishtech.com') ? appIcon : DEFAULT_APP_ICON;
    const appleIconLink = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleIconLink) appleIconLink.setAttribute('href', effectiveAppIcon.endsWith('.svg') ? '/apple-touch-icon.png' : effectiveAppIcon);
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (faviconLink) faviconLink.setAttribute('href', effectiveAppIcon);
    const shortcutLink = document.querySelector('link[rel="shortcut icon"]');
    if (shortcutLink) shortcutLink.setAttribute('href', effectiveAppIcon);
  }, [siteLogo, shareLogo, appIcon]);

  const updateSiteLogo = async (url: string) => {
    const cleanUrl = sanitizeLogoUrl(url, DEFAULT_SITE_LOGO);
    try {
      setSiteLogo(cleanUrl);
      try {
        localStorage.setItem(CACHE_KEY_LOGO, cleanUrl);
      } catch {}
      await setDoc(doc(db, 'settings', 'branding'), { url: cleanUrl, siteLogo: cleanUrl }, { merge: true });
      logAction(`Updated website header/footer logo`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/branding');
    }
  };

  const updateShareLogo = async (url: string) => {
    const cleanUrl = sanitizeLogoUrl(url, DEFAULT_SHARE_LOGO);
    try {
      setShareLogo(cleanUrl);
      try {
        localStorage.setItem(CACHE_KEY_SHARE_LOGO, cleanUrl);
      } catch {}
      await setDoc(doc(db, 'settings', 'branding'), { shareLogo: cleanUrl }, { merge: true });
      logAction(`Updated social share link card image`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/branding');
    }
  };

  const updateAppIcon = async (url: string) => {
    const cleanUrl = sanitizeLogoUrl(url, DEFAULT_APP_ICON);
    try {
      setAppIcon(cleanUrl);
      try {
        localStorage.setItem(CACHE_KEY_APP_ICON, cleanUrl);
      } catch {}
      await setDoc(doc(db, 'settings', 'branding'), { appIcon: cleanUrl }, { merge: true });
      logAction(`Updated app download & PWA icon`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/branding');
    }
  };

  const updateBrandingSettings = async (settings: { siteLogo?: string; shareLogo?: string; appIcon?: string }) => {
    try {
      const updates: Record<string, string> = {};
      if (settings.siteLogo !== undefined) {
        const cleanSite = sanitizeLogoUrl(settings.siteLogo, DEFAULT_SITE_LOGO);
        setSiteLogo(cleanSite);
        try { localStorage.setItem(CACHE_KEY_LOGO, cleanSite); } catch {}
        updates.url = cleanSite;
        updates.siteLogo = cleanSite;
      }
      if (settings.shareLogo !== undefined) {
        const cleanShare = sanitizeLogoUrl(settings.shareLogo, DEFAULT_SHARE_LOGO);
        setShareLogo(cleanShare);
        try { localStorage.setItem(CACHE_KEY_SHARE_LOGO, cleanShare); } catch {}
        updates.shareLogo = cleanShare;
      }
      if (settings.appIcon !== undefined) {
        const cleanApp = sanitizeLogoUrl(settings.appIcon, DEFAULT_APP_ICON);
        setAppIcon(cleanApp);
        try { localStorage.setItem(CACHE_KEY_APP_ICON, cleanApp); } catch {}
        updates.appIcon = cleanApp;
      }
      if (Object.keys(updates).length > 0) {
        await setDoc(doc(db, 'settings', 'branding'), updates, { merge: true });
        logAction(`Updated branding & logo assets`, currentAdminUser?.name || 'Admin');
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/branding');
    }
  };

  const resetBrandingToDefault = async () => {
    try {
      setSiteLogo(DEFAULT_SITE_LOGO);
      setShareLogo(DEFAULT_SHARE_LOGO);
      setAppIcon(DEFAULT_APP_ICON);
      try {
        localStorage.removeItem(CACHE_KEY_LOGO);
        localStorage.removeItem(CACHE_KEY_SHARE_LOGO);
        localStorage.removeItem(CACHE_KEY_APP_ICON);
      } catch {}
      await setDoc(doc(db, 'settings', 'branding'), {
        url: DEFAULT_SITE_LOGO,
        siteLogo: DEFAULT_SITE_LOGO,
        shareLogo: DEFAULT_SHARE_LOGO,
        appIcon: DEFAULT_APP_ICON
      }, { merge: true });
      logAction(`Reset all branding logos to official defaults`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'settings/branding');
    }
  };

  const deleteSiteLogo = resetBrandingToDefault;

  const login = (user: AdminUser) => {
    setIsAdminLoggedIn(true);
    setCurrentAdminUser(user);
    logAction(`Logged in as ${user.role} (${user.email})`, user.name);
  };

  const logout = () => {
    if (currentAdminUser) logAction(`Logged out`, currentAdminUser.name);
    setIsAdminLoggedIn(false);
    setCurrentAdminUser(null);
  };

  const logAction = (action: string, adminName: string) => {
    const now = new Date();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      admin: adminName,
      action,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateProduct = async (updatedProd: ProductItem) => {
    try {
      const now = Date.now();
      const processed = cacheBustProduct(updatedProd, now);

      setProducts(prev => {
        const next = prev.map(p => p.id === processed.id ? processed : p);
        try { localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(next)); } catch {}
        return next;
      });
      await setDoc(doc(db, 'products', processed.id), processed, { merge: true });
      logAction(`Updated product with cache-busted images: ${processed.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `products/${updatedProd.id}`);
    }
  };

  const addProduct = async (newProd: ProductItem) => {
    try {
      const now = Date.now();
      const processed = cacheBustProduct(newProd, now);

      // If this ID was previously deleted, remove from deleted list
      try {
        const delRaw = localStorage.getItem(CACHE_KEY_DELETED_PRODUCTS);
        if (delRaw) {
          const list = (JSON.parse(delRaw) as string[]).filter(id => id !== processed.id);
          localStorage.setItem(CACHE_KEY_DELETED_PRODUCTS, JSON.stringify(list));
        }
      } catch {}

      setProducts(prev => {
        const next = [processed, ...prev];
        try { localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(next)); } catch {}
        return next;
      });
      await setDoc(doc(db, 'products', processed.id), processed);
      logAction(`Added new product: ${processed.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `products/${newProd.id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    const p = products.find(x => x.id === id);
    try {
      // 1. Immediately persist to deleted product ids in localStorage
      let deletedList: string[] = [];
      try {
        const delRaw = localStorage.getItem(CACHE_KEY_DELETED_PRODUCTS);
        deletedList = delRaw ? JSON.parse(delRaw) : [];
      } catch {}
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        try {
          localStorage.setItem(CACHE_KEY_DELETED_PRODUCTS, JSON.stringify(deletedList));
        } catch {}
      }

      // 2. Remove immediately from local state and cached array
      setProducts(prev => {
        const next = prev.filter(x => x.id !== id);
        try { localStorage.setItem(CACHE_KEY_PRODUCTS, JSON.stringify(next)); } catch {}
        return next;
      });

      // 3. Delete from Firestore products collection
      await deleteDoc(doc(db, 'products', id));

      // 4. Record to Firestore settings/deleted_products so it stays permanently deleted across all devices
      await setDoc(doc(db, 'settings', 'deleted_products'), {
        ids: deletedList,
        lastDeletedAt: Date.now()
      }, { merge: true }).catch(() => {});

      logAction(`Deleted product permanently: ${p?.title || id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateOrderStatus = async (id: string, status: AdminOrder['status']) => {
    try {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      await updateDoc(doc(db, 'orders', id), { status });
      logAction(`Updated order ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const saveOrder = async (order: AdminOrder) => {
    try {
      setOrders(prev => {
        const exists = prev.some(o => o.id === order.id);
        const next = exists ? prev.map(o => o.id === order.id ? order : o) : [order, ...prev];
        try {
          localStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(next));
          localStorage.setItem('shivani_orders_db', JSON.stringify(next));
        } catch {}
        return next;
      });
      await setDoc(doc(db, 'orders', order.id), order, { merge: true }).catch(() => {});
      await setDoc(doc(db, 'invoices', order.id), {
        id: order.id,
        invoiceNumber: `INV-${order.id}`,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        address: order.address,
        productTitle: order.productTitle,
        quantity: order.quantity,
        options: order.options,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        date: order.date
      }, { merge: true }).catch(() => {});
      logAction(`Saved order & tracking ID: ${order.id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `orders/${order.id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      // 1. Persist to deleted order IDs in localStorage
      let deletedList: string[] = [];
      try {
        const raw = localStorage.getItem(CACHE_KEY_DELETED_ORDERS);
        deletedList = raw ? JSON.parse(raw) : [];
      } catch {}
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        try { localStorage.setItem(CACHE_KEY_DELETED_ORDERS, JSON.stringify(deletedList)); } catch {}
      }

      // 2. Immediately update state and cache
      setOrders(prev => {
        const next = prev.filter(o => o.id !== id);
        try {
          localStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(next));
          localStorage.setItem('shivani_orders_db', JSON.stringify(next));
        } catch {}
        return next;
      });

      // 3. Delete from Firestore & settings
      await deleteDoc(doc(db, 'orders', id)).catch(() => {});
      await setDoc(doc(db, 'settings', 'deleted_orders'), { ids: deletedList, updatedAt: Date.now() }, { merge: true }).catch(() => {});
      logAction(`Deleted order ID: ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `orders/${id}`);
    }
  };

  const saveInvoice = async (invoice: InvoiceRecord) => {
    try {
      setInvoices(prev => {
        const exists = prev.some(inv => inv.id === invoice.id);
        const next = exists ? prev.map(inv => inv.id === invoice.id ? invoice : inv) : [invoice, ...prev];
        try {
          localStorage.setItem(CACHE_KEY_INVOICES, JSON.stringify(next));
        } catch {}
        return next;
      });
      await setDoc(doc(db, 'invoices', invoice.id), invoice, { merge: true }).catch(() => {});
      logAction(`Saved invoice: ${invoice.id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `invoices/${invoice.id}`);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      // 1. Persist to deleted invoice IDs
      let deletedList: string[] = [];
      try {
        const raw = localStorage.getItem(CACHE_KEY_DELETED_INVOICES);
        deletedList = raw ? JSON.parse(raw) : [];
      } catch {}
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        try { localStorage.setItem(CACHE_KEY_DELETED_INVOICES, JSON.stringify(deletedList)); } catch {}
      }

      // 2. Immediately update state and cache
      setInvoices(prev => {
        const next = prev.filter(inv => inv.id !== id);
        try {
          localStorage.setItem(CACHE_KEY_INVOICES, JSON.stringify(next));
        } catch {}
        return next;
      });

      // 3. Delete from Firestore & settings
      await deleteDoc(doc(db, 'invoices', id)).catch(() => {});
      await setDoc(doc(db, 'settings', 'deleted_invoices'), { ids: deletedList, updatedAt: Date.now() }, { merge: true }).catch(() => {});
      logAction(`Deleted invoice: ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `invoices/${id}`);
    }
  };

  const saveCustomer = async (customer: AdminCustomer) => {
    try {
      setCustomers(prev => {
        const exists = prev.some(c => c.id === customer.id);
        const next = exists ? prev.map(c => c.id === customer.id ? customer : c) : [customer, ...prev];
        try {
          localStorage.setItem(CACHE_KEY_CUSTOMERS, JSON.stringify(next));
          localStorage.setItem('shivani_customers_db', JSON.stringify(next));
        } catch {}
        return next;
      });
      await setDoc(doc(db, 'customers', customer.id), customer, { merge: true }).catch(() => {});
      logAction(`Saved customer: ${customer.name}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `customers/${customer.id}`);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      // 1. Persist to deleted customer IDs
      let deletedList: string[] = [];
      try {
        const raw = localStorage.getItem(CACHE_KEY_DELETED_CUSTOMERS);
        deletedList = raw ? JSON.parse(raw) : [];
      } catch {}
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        try { localStorage.setItem(CACHE_KEY_DELETED_CUSTOMERS, JSON.stringify(deletedList)); } catch {}
      }

      // 2. Immediately update state and cache
      setCustomers(prev => {
        const next = prev.filter(c => c.id !== id);
        try {
          localStorage.setItem(CACHE_KEY_CUSTOMERS, JSON.stringify(next));
          localStorage.setItem('shivani_customers_db', JSON.stringify(next));
        } catch {}
        return next;
      });

      // 3. Delete from Firestore & settings
      await deleteDoc(doc(db, 'customers', id)).catch(() => {});
      await setDoc(doc(db, 'settings', 'deleted_customers'), { ids: deletedList, updatedAt: Date.now() }, { merge: true }).catch(() => {});
      logAction(`Deleted customer ID: ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `customers/${id}`);
    }
  };

  const updateCategory = async (category: any) => {
    try {
      await setDoc(doc(db, 'categories', category.id), category, { merge: true }).catch(() => {});
      logAction(`Updated category: ${category.label}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `categories/${category.id}`);
    }
  };

  const updateQuoteStatus = async (id: string, status: AdminQuote['status'], price?: number) => {
    try {
      setQuotes(prev => {
        const next = prev.map(q => q.id === id ? { ...q, status, quotedPrice: price } : q);
        try {
          localStorage.setItem(CACHE_KEY_QUOTES, JSON.stringify(next));
        } catch {}
        return next;
      });
      await updateDoc(doc(db, 'quotes', id), { status, quotedPrice: price }).catch(() => {});
      logAction(`Updated quote ${id} status to ${status}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `quotes/${id}`);
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      // 1. Persist to deleted quote IDs
      let deletedList: string[] = [];
      try {
        const raw = localStorage.getItem(CACHE_KEY_DELETED_QUOTES);
        deletedList = raw ? JSON.parse(raw) : [];
      } catch {}
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        try { localStorage.setItem(CACHE_KEY_DELETED_QUOTES, JSON.stringify(deletedList)); } catch {}
      }

      // 2. Immediately update state and cache
      setQuotes(prev => {
        const next = prev.filter(q => q.id !== id);
        try {
          localStorage.setItem(CACHE_KEY_QUOTES, JSON.stringify(next));
        } catch {}
        return next;
      });

      // 3. Delete from Firestore & settings
      await deleteDoc(doc(db, 'quotes', id)).catch(() => {});
      await setDoc(doc(db, 'settings', 'deleted_quotes'), { ids: deletedList, updatedAt: Date.now() }, { merge: true }).catch(() => {});
      logAction(`Deleted quote: ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `quotes/${id}`);
    }
  };

  const updateWebsiteImage = async (img: WebsiteImage) => {
    try {
      setWebsiteImages(prev => {
        const next = prev.map(b => b.id === img.id ? img : b);
        try { localStorage.setItem(CACHE_KEY_BANNERS, JSON.stringify(next)); } catch {}
        return next;
      });
      await setDoc(doc(db, 'banners', img.id), img, { merge: true });
      logAction(`Updated website image/banner: ${img.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `banners/${img.id}`);
    }
  };

  const addWebsiteImage = async (img: WebsiteImage) => {
    try {
      setWebsiteImages(prev => {
        const next = [img, ...prev];
        try { localStorage.setItem(CACHE_KEY_BANNERS, JSON.stringify(next)); } catch {}
        return next;
      });
      await setDoc(doc(db, 'banners', img.id), img);
      logAction(`Added website image/banner: ${img.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `banners/${img.id}`);
    }
  };

  const deleteWebsiteImage = async (id: string) => {
    try {
      setWebsiteImages(prev => {
        const next = prev.filter(b => b.id !== id);
        try { localStorage.setItem(CACHE_KEY_BANNERS, JSON.stringify(next)); } catch {}
        return next;
      });
      await deleteDoc(doc(db, 'banners', id));
      logAction(`Deleted website image/banner ID: ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `banners/${id}`);
    }
  };

  const updateWebsiteContent = async (content: any) => {
    try {
      try {
        localStorage.setItem(CACHE_KEY_CONTENT, JSON.stringify(content));
      } catch {}
      if (content.founderImageUrl !== undefined) {
        if (content.founderImageUrl) {
          localStorage.setItem('shivani_founder_photo', content.founderImageUrl);
        } else {
          localStorage.removeItem('shivani_founder_photo');
        }
      }
      if (content.companyImageUrl !== undefined) {
        if (content.companyImageUrl) {
          localStorage.setItem('shivani_company_photo', content.companyImageUrl);
        } else {
          localStorage.removeItem('shivani_company_photo');
        }
      }
      setWebsiteContent(content);
      await setDoc(doc(db, 'content', 'site_content'), content, { merge: true });
      logAction(`Updated website CMS content`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'content/site_content');
    }
  };

  const addCoupon = async (c: CouponItem) => {
    try {
      await setDoc(doc(db, 'coupons', c.code), c);
      logAction(`Created coupon: ${c.code}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `coupons/${c.code}`);
    }
  };

  const updateInventory = async (id: string, qty: number) => {
    try {
      await updateDoc(doc(db, 'inventory', id), { currentStock: qty });
      logAction(`Updated inventory stock for item ID ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `inventory/${id}`);
    }
  };

  const toggleReviewApproval = async (id: string) => {
    const rev = reviews.find(r => r.id === id);
    if (!rev) return;
    const newStatus = !rev.approved;
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: newStatus });
      logAction(`Toggled review approval for ID ${id} to ${newStatus}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `reviews/${id}`);
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', id));
      logAction(`Deleted review ID ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `reviews/${id}`);
    }
  };

  const addPublicReview = async (review: { name: string; rating: number; review: string; photo?: string }) => {
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: review.name,
      rating: review.rating,
      review: review.review,
      date: new Date().toISOString().split('T')[0],
      approved: true,
      photo: review.photo
    };
    try {
      await setDoc(doc(db, 'reviews', newRev.id), newRev);
      logAction(`Added public review by ${review.name}`, 'Customer');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `reviews/${newRev.id}`);
    }
  };

  const addFaq = async (faq: FaqItem) => {
    try {
      await setDoc(doc(db, 'faqs', faq.id), faq);
      logAction(`Added FAQ: ${faq.question}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `faqs/${faq.id}`);
    }
  };

  const updateFaq = async (faq: FaqItem) => {
    try {
      await setDoc(doc(db, 'faqs', faq.id), faq, { merge: true });
      logAction(`Updated FAQ: ${faq.question}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `faqs/${faq.id}`);
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'faqs', id));
      logAction(`Deleted FAQ ID ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `faqs/${id}`);
    }
  };

  const addAboutUs = async (item: AboutUsItem) => {
    try {
      await setDoc(doc(db, 'about_us', item.id), item);
      logAction(`Added About Us section: ${item.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `about_us/${item.id}`);
    }
  };

  const updateAboutUs = async (item: AboutUsItem) => {
    try {
      await setDoc(doc(db, 'about_us', item.id), item, { merge: true });
      logAction(`Updated About Us section: ${item.title}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `about_us/${item.id}`);
    }
  };

  const deleteAboutUs = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'about_us', id));
      logAction(`Deleted About Us section ID ${id}`, currentAdminUser?.name || 'Admin');
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `about_us/${id}`);
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdminLoggedIn,
      currentAdminUser,
      login,
      logout,
      products,
      updateProduct,
      addProduct,
      deleteProduct,
      orders,
      updateOrderStatus,
      saveOrder,
      deleteOrder,
      invoices,
      saveInvoice,
      deleteInvoice,
      customers,
      saveCustomer,
      deleteCustomer,
      quotes,
      updateQuoteStatus,
      deleteQuote,
      websiteImages,
      updateWebsiteImage,
      addWebsiteImage,
      deleteWebsiteImage,
      websiteContent,
      updateWebsiteContent,
      faqs,
      addFaq,
      updateFaq,
      deleteFaq,
      aboutUs,
      addAboutUs,
      updateAboutUs,
      deleteAboutUs,
      coupons,
      addCoupon,
      inventory,
      updateInventory,
      reviews,
      toggleReviewApproval,
      deleteReview,
      addPublicReview,
      categories,
      updateCategory,
      auditLogs,
      visitorStats,
      siteLogo,
      shareLogo,
      appIcon,
      updateSiteLogo,
      updateShareLogo,
      updateAppIcon,
      updateBrandingSettings,
      deleteSiteLogo,
      resetBrandingToDefault,
      logAction,
      isFirebaseLoading,
      isDatabaseConnected,
      isQuotaExceeded,
      databaseStatus,
      databaseError,
      databaseLatencyMs,
      testDatabaseConnection,
      getCacheBustedImageUrl
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
