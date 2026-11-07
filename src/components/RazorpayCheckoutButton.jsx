// src/components/RazorpayCheckoutButton.jsx - Standard Razorpay Payment Button & Modal Trigger
import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { triggerRazorpayCheckout } from '../utils/razorpayCheckout.js';
import { useToast } from '../context/ToastContext.jsx';

export function RazorpayCheckoutButton({
  amountInRupees = 500,
  label,
  name = "L'Osteria Gourmet Bistro",
  description = 'Digital Order Payment',
  customerName = 'Valued Guest',
  customerPhone = '9876543210',
  orderId = '',
  onPaymentSuccess,
  className = '',
}) {
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidStatus, setPaidStatus] = useState(null);

  const handleCheckout = () => {
    setIsProcessing(true);
    triggerRazorpayCheckout({
      amountInRupees,
      name,
      description,
      receipt: orderId || `rcpt_${Date.now()}`,
      prefill: {
        name: customerName,
        contact: customerPhone,
      },
      notes: {
        order_id: orderId,
        source: 'DineQR Standard Checkout',
      },
      onStart: () => setIsProcessing(true),
      onSuccess: (verifyData, response) => {
        setIsProcessing(false);
        setPaidStatus(response.razorpay_payment_id);
        addToast(`Payment successful! ID: ${response.razorpay_payment_id}`, 'success');
        if (onPaymentSuccess) {
          onPaymentSuccess(verifyData, response);
        }
      },
      onFailure: (err) => {
        setIsProcessing(false);
        addToast(err.message || 'Payment failed or was cancelled', 'error');
      },
      onDismiss: () => {
        setIsProcessing(false);
        addToast('Payment cancelled by user', 'info');
      },
    });
  };

  if (paidStatus) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Paid: {paidStatus}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={isProcessing}
      className={
        className ||
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition cursor-pointer disabled:opacity-50'
      }
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Opening Razorpay...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>{label || `Pay ₹${amountInRupees} with Razorpay`}</span>
        </>
      )}
    </button>
  );
}

export default RazorpayCheckoutButton;
