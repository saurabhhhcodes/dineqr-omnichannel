// src/pages/OrderConfirmation.jsx - Live order tracking, payment receipt & invoice launcher
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  UtensilsCrossed,
  Receipt,
  ArrowLeft,
  CreditCard,
  Banknote,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { RazorpayModal } from '../components/RazorpayModal.jsx';

export function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pay online if unpaid
  const [showPayModal, setShowPayModal] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);

  const fetchOrder = () => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Order not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrder();

    // Fire confetti on first load
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    // Live polling for kitchen progress updates
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleInitiatePayment = async () => {
    try {
      const res = await fetch('/api/payment/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        setRazorpayOrderData({
          order,
          razorpay_order: data.razorpay_order,
        });
        setShowPayModal(true);
      }
    } catch (e) {
      alert('Error initiating payment: ' + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <span className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-600 rounded-full animate-spin mb-3"></span>
        <p className="text-sm font-bold text-slate-600">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <p className="text-rose-600 font-bold mb-2">Error: {error || 'Order not found'}</p>
        <Link to="/menu" className="text-sm font-semibold text-amber-600 underline">
          Return to digital menu
        </Link>
      </div>
    );
  }

  // Stepper logic
  const steps = [
    { key: 'RECEIVED', label: 'Order Received', icon: CheckCircle2, desc: 'Sent to the kitchen' },
    { key: 'PREPARING', label: 'In the Kitchen', icon: ChefHat, desc: 'Chefs are crafting your dishes' },
    { key: 'READY', label: 'Ready to Serve', icon: BellRing, desc: 'Fresh from the oven' },
    { key: 'SERVED', label: 'Served & Enjoyed', icon: UtensilsCrossed, desc: 'Bon appétit!' },
  ];

  const statusHierarchy = {
    RECEIVED: 0,
    PREPARING: 1,
    READY: 2,
    SERVED: 3,
    COMPLETED: 4,
  };

  const currentLevel = statusHierarchy[order.status] ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back to Menu Link */}
        <div className="flex items-center justify-between">
          <Link
            to={order.table_id ? `/menu?table=${order.table_id}` : '/menu'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Add More Dishes to Table</span>
          </Link>

          <button
            onClick={fetchOrder}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Auto-refreshing</span>
          </button>
        </div>

        {/* Token Banner for Counter / Scanner Customers */}
        {(order.token_number || order.is_counter_order) && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 shadow-xl text-center space-y-2 border border-white/20 animate-in zoom-in-95">
            <div className="text-[10px] font-black uppercase tracking-widest bg-black/25 rounded-full px-3 py-1 inline-block">
              Counter Pickup Token
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight">
              TOKEN #{order.token_number || '1'}
            </div>
            <p className="text-xs text-amber-100 font-medium max-w-sm mx-auto">
              Guest: <strong className="text-white">{order.customer_name || 'Valued Guest'}</strong> · Please keep this screen open. Counter staff will call your token number when ready.
            </p>
          </div>
        )}

        {/* Order Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            Order Confirmed & Sent to Kitchen
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            {order.order_code}
          </h1>

          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500">
            <span className="font-bold text-slate-800">{order.table_number}</span>
            <span>•</span>
            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Payment Status Pill */}
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border shadow-xs">
            {order.payment_status === 'PAID' ? (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Paid ₹{order.grand_total} via Razorpay ({order.razorpay_payment_id || 'Verified'})</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-3 text-amber-800">
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-600" />
                  <span>Pay at Counter: ₹{order.grand_total} Pending</span>
                </div>
                <button
                  onClick={handleInitiatePayment}
                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                >
                  Pay Online
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Kitchen Status Stepper */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6">
            Live Kitchen Progress
          </h3>

          <div className="space-y-6">
            {steps.map((step, idx) => {
              const isPast = currentLevel > idx;
              const isCurrent = currentLevel === idx;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-px ${
                        isPast ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-4 ring-amber-100 animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold ${
                          isCurrent ? 'text-amber-600' : isPast ? 'text-slate-900' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ordered Dishes Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Order Items</h3>
            <span className="text-xs text-slate-500">{order.items?.length || 0} items</span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    {item.quantity}x {item.name}
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-amber-700 italic">Chef note: {item.notes}</div>
                  )}
                </div>
                <div className="font-bold text-slate-800">₹{item.subtotal}</div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (2.5%)</span>
              <span className="font-semibold text-slate-700">₹{order.cgst}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (2.5%)</span>
              <span className="font-semibold text-slate-700">₹{order.sgst}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900 text-sm">
              <span>Grand Total</span>
              <span className="text-base text-amber-600">₹{order.grand_total}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Invoice View */}
        <div className="space-y-3">
          <Link
            to={`/invoice/${order.id}`}
            className="w-full py-4 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>View & Print Official GST Tax Invoice</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Pay modal fallback */}
      <RazorpayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        orderData={razorpayOrderData}
        onPaymentSuccess={() => {
          setShowPayModal(false);
          fetchOrder();
        }}
        isMockMode={true}
      />
    </div>
  );
}
