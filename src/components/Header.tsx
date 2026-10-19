import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  ShoppingBag, 
  X, 
  MapPin, 
  Truck, 
  Sparkles,
  CreditCard,
  Megaphone,
  Shirt,
  Gift,
  Briefcase,
  Package,
  Layers,
  FileText,
  Heart,
  Printer,
  Bell,
  Download,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductItem, BroadcastNotification } from '../types';
import { CATEGORIES } from '../data/products';
import { useAdmin } from '../context/AdminContext';
import { getCacheBustedImageUrl } from '../utils/imageUtils';
import { PWAInstallModal } from './PWAInstallModal';
import { NotificationBellModal } from './NotificationBellModal';
import { getSeenNotificationIds } from '../services/notificationService';

interface HeaderProps {
  products: ProductItem[];
  selectedCategoryId: string;
  onSelectProduct: (product: ProductItem) => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenMobileMenu: () => void;
  cartCount: number;
  onOpenCartModal: () => void;
  onOpenStoreModal: () => void;
  onOpenHelpCenter: () => void;
  onNavigateHome: () => void;
  onNavigateTrack: () => void;
  onNavigateAbout: () => void;
  onNavigateFounder?: () => void;
  onOpenCompare?: () => void;
  onNavigateDownloadApp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  selectedCategoryId,
  onSelectProduct,
  onSelectCategory,
  onOpenMobileMenu,
  cartCount,
  onOpenCartModal,
  onOpenStoreModal,
  onOpenHelpCenter,
  onNavigateHome,
  onNavigateTrack,
  onNavigateAbout,
  onNavigateFounder,
  onOpenCompare,
  onNavigateDownloadApp
}) => {
  const { siteLogo, notifications, notificationSubscribers } = useAdmin();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const seenIds = new Set(getSeenNotificationIds());
  const unreadCount = notifications.filter((n: BroadcastNotification) => !seenIds.has(n.id)).length;

  const filtered = searchQuery.trim()
    ? products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectResult = (p: ProductItem) => {
    onSelectProduct(p);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'paper-documents': return <FileText className="w-3.5 h-3.5" />;
      case 'cards-invitations': return <Heart className="w-3.5 h-3.5" />;
      case 'custom-promotional': return <Gift className="w-3.5 h-3.5" />;
      case 'signage-vinyl': return <Megaphone className="w-3.5 h-3.5" />;
      case 'finishing-binding': return <Layers className="w-3.5 h-3.5" />;
      case 'business-cards': return <CreditCard className="w-3.5 h-3.5" />;
      case 'standees-banners': return <Megaphone className="w-3.5 h-3.5" />;
      case 'apparel': return <Shirt className="w-3.5 h-3.5" />;
      case 'photo-gifts': return <Gift className="w-3.5 h-3.5" />;
      case 'stamps-seals': return <Sparkles className="w-3.5 h-3.5" />;
      case 'stationery': return <Briefcase className="w-3.5 h-3.5" />;
      case 'packaging': return <Package className="w-3.5 h-3.5" />;
      default: return <Printer className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Main Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Left: Hamburger Menu (Mobile Only) + Shivani Graphics Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              type="button"
              className="lg:hidden p-1.5 sm:p-2 -ml-1 text-slate-800 hover:text-[#50007c] hover:bg-purple-50 rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </button>

            <button 
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer text-left min-w-0 py-1"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center p-0.5 sm:p-1 shadow-xs group-hover:scale-105 transition-transform overflow-hidden border border-purple-200">
                  <img 
                    src={siteLogo && siteLogo.trim() && !siteLogo.includes('sanishtech.com') ? siteLogo.trim() : '/official_logo.jpg'} 
                    alt="Shivani Graphics Logo" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.endsWith('/official_logo.jpg')) {
                        target.src = '/official_logo.jpg';
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col min-w-0 justify-center">
                <div className="flex items-center font-sans font-black text-base sm:text-2xl tracking-tight leading-none whitespace-nowrap">
                  <span className="text-[#50007c]">Shivani</span>
                  <span className="text-orange-500 ml-1">Graphics</span>
                </div>
                <span className="hidden xs:inline-block text-[8px] sm:text-[10px] text-[#50007c] font-black tracking-tight mt-1 group-hover:text-orange-600 transition-colors whitespace-nowrap">
                  Custom Printing Studio
                </span>
              </div>
            </button>
          </div>

          {/* Center: Search Bar on Desktop */}
          <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-md mx-3 xl:mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Visiting Cards, Standees, T-Shirts, Stamps..."
                className="w-full h-9 sm:h-10 pl-9 pr-8 py-2 text-xs bg-slate-100/90 hover:bg-slate-100 rounded-xl border border-slate-200/90 focus:border-[#50007c] focus:bg-white text-slate-900 outline-hidden transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Search Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 divide-y divide-slate-100 max-h-80 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150">
                {filtered.length > 0 ? (
                  filtered.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectResult(p)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50/70 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={getCacheBustedImageUrl(p.images[0]?.url, p.updatedAt)} 
                          alt={p.title} 
                          loading="lazy"
                          decoding="async"
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#50007c]">{p.title}</p>
                          <p className="text-[10px] text-slate-500">{p.categoryLabel}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        ⚡ Free Quote
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching print products found for "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Links, Search & Cart Icons (Clean Horizontal Baseline Alignment) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Track Order - Prominent and Aligned with Logo Baseline */}
            <button
              type="button"
              onClick={onNavigateTrack}
              className="hidden md:inline-flex items-center gap-2 h-9 sm:h-10 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:border-purple-300 hover:bg-purple-50/70 text-xs font-bold text-slate-700 hover:text-[#50007c] transition-all cursor-pointer shrink-0 shadow-2xs group"
              title="Track Order Status"
            >
              <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <span className="whitespace-nowrap font-bold">Track Order</span>
            </button>

            <button
              type="button"
              onClick={onOpenStoreModal}
              className="hidden md:inline-flex items-center gap-1.5 h-9 sm:h-10 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-[#50007c] transition-colors cursor-pointer shrink-0"
              title="Mahavir Enclave Store Location"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              <span className="whitespace-nowrap">Store</span>
            </button>

            <button
              type="button"
              onClick={onNavigateAbout}
              className="hidden lg:inline-flex items-center h-9 sm:h-10 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 hover:text-[#50007c] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              About
            </button>

            {onNavigateFounder && (
              <button
                type="button"
                onClick={onNavigateFounder}
                className="hidden xl:inline-flex items-center gap-1 h-9 sm:h-10 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200/60 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="Meet Our Founder"
              >
                <span>Founder</span>
              </button>
            )}

            {onOpenCompare && (
              <button
                type="button"
                onClick={onOpenCompare}
                className="hidden xl:inline-flex items-center gap-1 h-9 sm:h-10 text-xs font-black text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-xl transition-colors border border-orange-200 cursor-pointer shrink-0 whitespace-nowrap"
                title="Compare Products Side-by-Side"
              >
                <span>⚖️ Compare</span>
              </button>
            )}

            {/* Download App Button - Navigates to Dedicated App Download Page */}
            <button
              type="button"
              onClick={onNavigateDownloadApp ? onNavigateDownloadApp : () => setIsInstallModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
              title="Download & Install Shivani Graphics App on Desktop PC / Laptop"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download App</span>
            </button>

            {/* Notification Bell with animated unread badge */}
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center text-slate-700 hover:text-[#50007c] hover:bg-purple-50 rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label={`Offers & Announcements (${unreadCount} unread)`}
              title="Offers & Announcements"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              {unreadCount > 0 ? (
                <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {unreadCount}
                </span>
              ) : (
                notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full" />
                )
              )}
            </button>

            {/* Mobile Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(prev => !prev)}
              className="lg:hidden h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center text-slate-700 hover:text-[#50007c] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>

            {/* Shopping Cart Icon with Purple/Indigo Badge */}
            <button
              type="button"
              onClick={onOpenCartModal}
              className="relative h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center text-slate-700 hover:text-[#50007c] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              aria-label={`View Cart (${cartCount} items)`}
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0.5 right-0.5 bg-[#50007c] text-white text-[9px] sm:text-[10px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-xs"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

          </div>

        </div>

        {/* Mobile Expandable Search Input Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden py-2.5 border-t border-slate-100 overflow-hidden"
            >
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Visiting Cards, T-shirts, Standees, Stamps..."
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-100 rounded-xl border border-slate-200 outline-hidden focus:border-[#50007c] focus:bg-white text-slate-900"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {searchQuery.trim() && (
                <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-200 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {filtered.length > 0 ? (
                    filtered.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectResult(p)}
                        className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-purple-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <img 
                            src={getCacheBustedImageUrl(p.images[0]?.url, p.updatedAt)} 
                            alt={p.title} 
                            loading="lazy" 
                            decoding="async" 
                            className="w-7 h-7 rounded object-cover" 
                          />
                          <span>{p.title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          ⚡ Free Quote
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-500">
                      No results for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Horizontal Navigation Menu Bar */}
        <nav 
          aria-label="Category Navigation"
          className="border-t border-slate-100 overflow-x-auto scrollbar-none flex items-center gap-1 py-1.5 text-xs font-bold text-slate-600"
        >
          {CATEGORIES.map(cat => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#50007c] text-white shadow-2xs font-extrabold'
                    : 'hover:bg-purple-50 hover:text-[#50007c]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#50007c]'}>
                  {getCategoryIcon(cat.id)}
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
      
      {/* PWA App Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Offers & Notifications Bell Modal */}
      <NotificationBellModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        subscriberCount={notificationSubscribers.length}
      />
    </header>
  );
};
