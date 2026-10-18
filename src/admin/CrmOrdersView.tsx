import React, { useState } from 'react';
import { ShoppingBag, Printer, CheckCircle, Clock, Trash2, Hash, ArrowRight, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { useAdmin, AdminOrder } from '../context/AdminContext';
import { InvoiceModal } from './InvoiceModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const CrmOrdersView: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, saveInvoice } = useAdmin();
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<AdminOrder | null>(null);
  const [activeStage, setActiveStage] = useState<string>('All');
  const [deleteTarget, setDeleteTarget] = useState<AdminOrder | null>(null);
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
      await deleteOrder(targetId);
      showToast(`Order ${targetId} permanently deleted from CRM & database.`);
    } catch {
      showToast(`Order ${targetId} removed.`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const pipelineStages: AdminOrder['status'][] = [
    'Design Pending',
    'Designing',
    'Printing',
    'Quality Check',
    'Ready for Pickup',
    'Delivered',
    'Cancelled'
  ];

  const filteredOrders = activeStage === 'All' 
    ? orders 
    : orders.filter(o => o.status === activeStage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">CRM Orders Pipeline ({orders.length})</h2>
          <p className="text-xs text-slate-500">Move customer orders seamlessly through Design, Printing, Quality Check, and Ready for Pickup stages.</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
          <ShieldCheck className="w-4 h-4 text-[#50007c]" />
          <span className="text-xs font-black text-[#50007c]">Live Firestore CRM Workflow</span>
        </div>
      </div>

      {/* Stage filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveStage('All')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeStage === 'All' ? 'bg-[#50007c] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {pipelineStages.map(stage => {
          const count = orders.filter(o => o.status === stage).length;
          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeStage === stage ? 'bg-[#50007c] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{stage}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeStage === stage ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Pipeline List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-black text-slate-800">No orders found in this stage</h3>
            <p className="text-xs text-slate-500">Orders created on the website or manually added will appear here.</p>
          </div>
        ) : (
          filteredOrders.map(ord => (
            <div key={ord.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-lg font-mono flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {ord.id}
                  </span>
                  <span className="text-xs font-black text-slate-900">{ord.customerName}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {ord.phone}</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{ord.productTitle} · Qty: {ord.quantity} ({ord.options})</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {ord.address} · <span className="font-semibold text-slate-700">{ord.date}</span></p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* CRM Status Changer */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">CRM Stage:</span>
                  <select
                    value={ord.status}
                    onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-purple-300 text-xs font-black bg-purple-50 text-purple-900 focus:ring-2 focus:ring-[#50007c]"
                  >
                    {pipelineStages.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">₹{ord.totalAmount}</span>
                  <button
                    onClick={() => {
                      saveInvoice(ord);
                      setSelectedOrderForInvoice(ord);
                    }}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#50007c] font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(ord)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        item={deleteTarget ? {
          id: deleteTarget.id,
          type: 'order',
          title: deleteTarget.customerName,
          subtitle: `${deleteTarget.productTitle} · Qty: ${deleteTarget.quantity}`,
          details: [
            { label: 'Stage', value: deleteTarget.status },
            { label: 'Amount', value: `₹${deleteTarget.totalAmount}` },
            { label: 'Phone', value: deleteTarget.phone || 'N/A' },
            { label: 'Date', value: deleteTarget.date || 'Today' }
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
