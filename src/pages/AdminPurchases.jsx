// src/pages/AdminPurchases.jsx - Purchases, Vendor Bills & 3-Way Matching (Odoo Parity)
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Truck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminPurchases() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New RfQ form state
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 15 Days');
  const [lineItems, setLineItems] = useState([
    { item: 'Imported San Marzano Tomatoes', qty: 20, price: 280 },
    { item: 'Fresh Mozzarella Di Bufala', qty: 15, price: 420 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, [activeRestaurant]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const res = await fetch(`/api/erp/purchases?restaurant_id=${restId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.purchase_orders || []);
      }
    } catch (err) {
      console.error('Failed to load purchases:', err);
      addToast('Error loading purchase orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/erp/purchases/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Purchase Order updated to ${newStatus}`);
        fetchPurchases();
      }
    } catch (err) {
      addToast('Failed to update PO status', 'error');
    }
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { item: '', qty: 1, price: 100 }]);
  };

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const handleCreateRfQ = async (e) => {
    e.preventDefault();
    if (!vendorName || lineItems.length === 0) {
      addToast('Vendor name and line items required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/erp/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant?.id || 'rest_losteria',
          vendor_name: vendorName,
          vendor_email: vendorEmail,
          payment_terms: paymentTerms,
          items: lineItems,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`RfQ ${data.purchase_order.rfq_number} created!`);
        setShowAddModal(false);
        setVendorName('');
        setVendorEmail('');
        fetchPurchases();
      } else {
        addToast(data.error || 'Failed to create RfQ', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const totalSpent = orders.filter((o) => o.status === 'PAID').reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const pendingBillTotal = orders.filter((o) => o.status !== 'PAID').reduce((acc, o) => acc + (o.total_amount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Purchases, Vendor Bills & 3-Way Matching
            </h1>
            <p className="text-xs text-slate-500">
              Procure goods, verify physical delivery receipts against supplier invoices, and audit payments
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Request for Quotation (RfQ)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Total Purchase Orders</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Procurement records</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Unsettled Vendor Bills</div>
          <div className="text-2xl font-black text-amber-600 mt-1">₹{Math.round(pendingBillTotal)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending goods / matching</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Total Settled Bills</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{Math.round(totalSpent)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verified & paid out</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">3-Way Match Audit</div>
          <div className="text-base font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>PO + Receipt + Bill</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero invoice overpayment</div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
        {['ALL', 'RFQ_SENT', 'RECEIVED', 'BILL_VERIFIED', 'PAID'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st === 'ALL' ? 'All Orders' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400">
            <Truck className="w-10 h-10 stroke-[1.5] text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No purchase orders found</p>
            <p className="text-xs text-slate-400 mt-0.5">Send your first vendor quotation request above</p>
          </div>
        ) : (
          filteredOrders.map((po) => {
            const step = po.status === 'RFQ_SENT' ? 1 : po.status === 'RECEIVED' ? 2 : po.status === 'BILL_VERIFIED' ? 3 : 4;

            return (
              <div
                key={po.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-slate-900 text-base">{po.rfq_number}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {po.vendor_name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Terms: {po.payment_terms || 'Net 15'} · Issued on {po.created_at?.split('T')[0] || 'Today'}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Total with 5% GST</div>
                      <div className="text-xl font-black text-slate-900">₹{po.total_amount}</div>
                    </div>

                    {/* Action Step Button */}
                    {po.status === 'RFQ_SENT' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'RECEIVED')}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm"
                      >
                        Receive Goods
                      </button>
                    )}
                    {po.status === 'RECEIVED' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'BILL_VERIFIED')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                      >
                        Verify 3-Way Match
                      </button>
                    )}
                    {po.status === 'BILL_VERIFIED' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'PAID')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {po.status === 'PAID' && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Paid & Reconciled</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-Way Matching Progress Tracker */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-1.5 font-bold ${step >= 1 ? 'text-indigo-700' : 'text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
                    <span>1. RfQ Sent</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <div className={`flex items-center gap-1.5 font-bold ${step >= 2 ? 'text-amber-700' : 'text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">2</span>
                    <span>2. Goods Received</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <div className={`flex items-center gap-1.5 font-bold ${step >= 3 ? 'text-blue-700' : 'text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                    <span>3. Bill 3-Way Match</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                  <div className={`flex items-center gap-1.5 font-bold ${step >= 4 ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">4</span>
                    <span>4. Paid</span>
                  </div>
                </div>

                {/* Line Items Details */}
                {Array.isArray(po.items) && po.items.length > 0 && (
                  <div className="divide-y divide-slate-100 text-xs">
                    {po.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-slate-600">
                        <span>{it.item}</span>
                        <span className="font-bold text-slate-900">
                          {it.qty} × ₹{it.price} = ₹{parseFloat(it.qty || 1) * parseFloat(it.price || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add RfQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">New Request for Quotation (RfQ)</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfQ} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Supplier / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Foodservice Wholesale"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vendor Email (for PO delivery)</label>
                  <input
                    type="email"
                    placeholder="orders@supplier.com"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="Immediate Cash">Immediate Cash on Delivery</option>
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                </select>
              </div>

              {/* Dynamic Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Line Items & Quantities</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((li, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item description"
                        value={li.item}
                        onChange={(e) => handleLineItemChange(idx, 'item', e.target.value)}
                        className="flex-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={li.qty}
                        onChange={(e) => handleLineItemChange(idx, 'qty', e.target.value)}
                        className="w-16 px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-center outline-none"
                      />
                      <input
                        type="number"
                        placeholder="₹ Price"
                        value={li.price}
                        onChange={(e) => handleLineItemChange(idx, 'price', e.target.value)}
                        className="w-20 px-2 py-1.5 rounded-xl border border-slate-200 text-xs text-center outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send RfQ to Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPurchases;
