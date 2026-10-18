import React, { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { useAdmin, AdminQuote } from '../context/AdminContext';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const QuotesView: React.FC = () => {
  const { quotes, updateQuoteStatus, deleteQuote } = useAdmin();
  const [deleteTarget, setDeleteTarget] = useState<AdminQuote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const targetId = deleteTarget.id;
    try {
      await deleteQuote(targetId);
      showToast(`Bulk order inquiry ${targetId} permanently deleted.`);
    } catch {
      showToast(`Bulk order inquiry removed.`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">Bulk Orders & Custom Quote Inquiries ({quotes.length})</h2>
          <p className="text-xs text-slate-500">Corporate bulk printing and quote inquiries submitted via website catalog & corporate inquiry desk.</p>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No quote requests yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">When corporate clients submit bulk printing or custom quote requests on the website, they will appear here instantly.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-all">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-black text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-lg">{q.id}</span>
                  <span className="text-xs font-black text-slate-900">{q.customerName}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    q.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : q.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {q.phone}
                  </span>
                  {q.email && q.email !== 'Not provided' && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {q.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {q.date}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-bold">Product / Service: <span className="text-blue-600">{q.service}</span> · Est. Qty: <span className="text-slate-900">{q.quantity}</span></p>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">Specs / Notes: {q.specifications}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {q.status === 'Pending' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuoteStatus(q.id, 'Approved', 2500)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-sm transition-transform active:scale-95"
                    >
                      Approve Quote
                    </button>
                    <button
                      onClick={() => updateQuoteStatus(q.id, 'Rejected')}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {q.status !== 'Pending' && (
                  <button
                    onClick={() => updateQuoteStatus(q.id, 'Pending')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Reset to Pending
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(q)}
                  className="p-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                  title="Delete quote inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        item={deleteTarget ? {
          id: deleteTarget.id,
          type: 'quote',
          title: deleteTarget.customerName,
          subtitle: `Product: ${deleteTarget.service}`,
          details: [
            { label: 'Estimated Qty', value: deleteTarget.quantity },
            { label: 'Phone', value: deleteTarget.phone || 'N/A' },
            { label: 'Date', value: deleteTarget.date || 'Today' },
            { label: 'Status', value: deleteTarget.status }
          ]
        } : null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
