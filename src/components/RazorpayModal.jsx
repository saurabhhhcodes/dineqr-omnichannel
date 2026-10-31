// src/components/RazorpayModal.jsx - Razorpay payment processor & interactive test simulator
import React, { useState } from 'react';
import { ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export function RazorpayModal({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
  isMockMode = false,
}) {
  const { addToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [vpa, setVpa] = useState('guest@okhdfcbank');

  if (!isOpen || !orderData) return null;

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate realistic payment gateway processing latency
      await new Promise((r) => setTimeout(r, 900));

      const fakePaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const fakeSignature = 'sim_sig_' + Math.random().toString(36).substring(2, 12);

      const res = await fetch('/api/payment/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderData.order.id,
          razorpay_order_id: orderData.razorpay_order.id,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: fakeSignature,
          payment_method: orderData.order.payment_method || (selectedMethod === 'upi' ? 'Razorpay (UPI Direct)' : selectedMethod === 'card' ? 'Razorpay (Card)' : 'Razorpay (NetBanking)'),
          is_mock: true,
        }),
      });

      const result = await res.json();
      if (result.success) {
        addToast('Payment of ₹' + orderData.order.grand_total + ' verified successfully!');
        onPaymentSuccess(result.order, fakePaymentId);
      } else {
        addToast(result.error || 'Payment verification failed', 'error');
      }
    } catch (err) {
      addToast('Payment error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0284c7] flex items-center justify-center font-black text-lg text-white">
              R
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>Razorpay Checkout</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {isMockMode ? 'Test Sandbox' : 'Secure 256-bit'}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {orderData.order.order_code} · {orderData.order.table_number}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Payable Amount</span>
            <div className="text-2xl font-black text-slate-900">
              ₹{orderData.order.grand_total}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
              <ShieldCheck className="w-4 h-4" />
              Verified Merchant
            </span>
            <span className="text-[11px] text-slate-400">L'Osteria Bistro</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Choose Payment Method
          </div>

          {/* UPI */}
          <label
            onClick={() => setSelectedMethod('upi')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              selectedMethod === 'upi'
                ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">UPI / QR (Google Pay, PhonePe, Paytm)</div>
                <div className="text-[11px] text-slate-500">Instant approval with zero surcharge</div>
              </div>
            </div>
            <input
              type="radio"
              checked={selectedMethod === 'upi'}
              onChange={() => setSelectedMethod('upi')}
              className="accent-sky-600"
            />
          </label>

          {/* Card */}
          <label
            onClick={() => setSelectedMethod('card')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              selectedMethod === 'card'
                ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Credit / Debit Card</div>
                <div className="text-[11px] text-slate-500">Visa, Mastercard, RuPay, Diners</div>
              </div>
            </div>
            <input
              type="radio"
              checked={selectedMethod === 'card'}
              onChange={() => setSelectedMethod('card')}
              className="accent-sky-600"
            />
          </label>

          {/* Netbanking */}
          <label
            onClick={() => setSelectedMethod('netbanking')}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              selectedMethod === 'netbanking'
                ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Net Banking</div>
                <div className="text-[11px] text-slate-500">HDFC, ICICI, SBI, Axis, Kotak & 50+ Banks</div>
              </div>
            </div>
            <input
              type="radio"
              checked={selectedMethod === 'netbanking'}
              onChange={() => setSelectedMethod('netbanking')}
              className="accent-sky-600"
            />
          </label>

          {/* If UPI selected */}
          {selectedMethod === 'upi' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5 animate-in fade-in duration-150">
              <div className="font-semibold text-slate-800">Fast UPI ID:</div>
              <input
                type="text"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="px-5 py-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Protected by Razorpay 256-bit encryption</span>
        </div>

        {/* Action Button */}
        <div className="p-5 bg-slate-50/80 border-t border-slate-100">
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-98 text-white font-bold text-sm shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Authorizing with Bank...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Authorize & Pay ₹{orderData.order.grand_total}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
