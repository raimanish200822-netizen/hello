import React from 'react';
import { Trash2, AlertTriangle, X, Check } from 'lucide-react';

export interface DeleteModalItem {
  id: string;
  type: 'order' | 'invoice' | 'quote' | 'customer' | 'product' | 'banner' | 'review' | 'faq' | 'aboutUs' | 'record';
  title?: string;
  subtitle?: string;
  details?: { label: string; value: string | number }[];
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: DeleteModalItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  if (!isOpen || !item) return null;

  const getTypeLabel = (type: DeleteModalItem['type']) => {
    switch (type) {
      case 'invoice': return 'Invoice & Tax Record';
      case 'order': return 'Customer Order';
      case 'quote': return 'Bulk Order / Quote Inquiry';
      case 'customer': return 'Customer Profile';
      case 'product': return 'Product Item';
      case 'banner': return 'Banner / Website Image';
      case 'review': return 'Customer Review';
      case 'faq': return 'FAQ Entry';
      case 'aboutUs': return 'About Us Section';
      default: return 'Record';
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div 
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with warning icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-sm">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Confirm Deletion
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Delete {getTypeLabel(item.type)}?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item details card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-lg font-mono">
              {item.id}
            </span>
            {item.title && (
              <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                {item.title}
              </span>
            )}
          </div>

          {item.subtitle && (
            <p className="text-xs text-slate-600 font-medium">
              {item.subtitle}
            </p>
          )}

          {item.details && item.details.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
              {item.details.map((d, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{d.label}</span>
                  <span className="font-bold text-slate-800 truncate">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Warning message */}
        <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Are you sure you want to permanently remove this record? This action will remove it from database and local storage.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
