// src/components/CartDrawer.jsx - Mobile-optimized sliding checkout drawer
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Receipt,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Zap,
  Smartphone,
  Building2,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { RazorpayModal } from './RazorpayModal.jsx';

export function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { activeRestaurant } = useRestaurant();
  const {
    items,
    table,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    cgst,
    sgst,
    grandTotal,
    itemCount,
  } = useCart();
  const { addToast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableInstructions, setTableInstructions] = useState('');
  const [paymentChoice, setPaymentChoice] = useState('RAZORPAY'); // 'RAZORPAY' or 'CASH_AT_COUNTER'
  const [specificMethod, setSpecificMethod] = useState('Google Pay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Razorpay state
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      addToast('Your cart is empty', 'error');
      return;
    }

    const isCounter = !table || table.id === 'counter' || table.id === 'takeaway';
    if (isCounter && !customerName.trim()) {
      addToast('Please enter your name for your pickup token & bill', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedMethodName = paymentChoice === 'CASH_AT_COUNTER' ? 'Cash at Counter' : `Razorpay (${specificMethod})`;

      // 1. Create order in backend local database
      const orderPayload = {
        restaurant_id: table?.restaurant_id || activeRestaurant?.id || 'rest_losteria',
        table_id: isCounter ? null : (table ? table.id : null),
        is_counter_order: isCounter ? 1 : 0,
        customer_name: customerName.trim() || (isCounter ? 'Walk-in Guest' : 'Guest'),
        customer_phone: customerPhone.trim(),
        special_instructions: tableInstructions.trim(),
        payment_method: selectedMethodName,
        items: items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      const createdOrder = data.order;

      // 2. If Razorpay chosen: initiate Razorpay order
      if (paymentChoice === 'RAZORPAY') {
        const rzpRes = await fetch('/api/payment/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: createdOrder.id,
            payment_method: selectedMethodName,
          }),
        });

        const rzpData = await rzpRes.json();
        if (!rzpData.success) {
          throw new Error(rzpData.error || 'Could not initiate Razorpay');
        }

        // Check if real Razorpay script can be opened
        if (
          !rzpData.is_mock &&
          window.Razorpay &&
          rzpData.key_id &&
          !rzpData.key_id.includes('demo')
        ) {
          const options = {
            key: rzpData.key_id,
            amount: rzpData.razorpay_order.amount,
            currency: rzpData.razorpay_order.currency,
            name: "L'Osteria Bistro",
            description: `Order ${createdOrder.order_code} - ${createdOrder.table_number}`,
            order_id: rzpData.razorpay_order.id,
            prefill: {
              name: customerName || 'Valued Guest',
              contact: customerPhone || '9876543210',
            },
            theme: { color: '#0284c7' },
            handler: async function (response) {
              const verifyRes = await fetch('/api/payment/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  order_id: createdOrder.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  is_mock: false,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                clearCart();
                onClose();
                navigate(`/order/${createdOrder.id}`);
              }
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Open interactive Razorpay sandbox modal
          setRazorpayOrderData({
            order: createdOrder,
            razorpay_order: rzpData.razorpay_order,
          });
          setShowRazorpayModal(true);
        }
      } else {
        // Cash at Counter: order is placed immediately
        addToast(`Order ${createdOrder.order_code} sent to kitchen!`);
        clearCart();
        onClose();
        navigate(`/order/${createdOrder.id}`);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paidOrder) => {
    setShowRazorpayModal(false);
    clearCart();
    onClose();
    navigate(`/order/${paidOrder.id}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over panel - perfectly aligned on mobile with 0 horizontal offset */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
          <div className="w-full sm:w-screen sm:max-w-md bg-white shadow-2xl flex flex-col justify-between h-full">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Your Order Basket</h2>
                  <div className="text-xs text-slate-500">
                    {table ? `Table: ${table.table_number || table.name}` : 'Takeaway / Counter'} · {itemCount} items
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingBag className="w-12 h-12 stroke-[1.5] text-slate-300 mb-3" />
                  <p className="text-base font-bold text-slate-700">Your basket is empty</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Scan through our wood-fired pizzas, starters and artisanal beverages to begin!
                  </p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="divide-y divide-slate-100 border-b border-slate-100 pb-2">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 flex items-start gap-3">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200/60"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                            <span className="text-xs font-black text-slate-900 shrink-0">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>

                          {item.notes && (
                            <p className="text-[11px] text-amber-700 italic mt-0.5">
                              Note: {item.notes}
                            </p>
                          )}

                          {/* Stepper */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-[11px] text-slate-400">₹{item.price} each</div>
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-white rounded text-slate-600 transition cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-7 text-center text-xs font-black text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-white rounded text-slate-600 transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information & Token / Table Registration */}
                  {(!table || table.id === 'counter' || table.id === 'takeaway') ? (
                    <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3 shadow-xs">
                      <div className="text-xs font-black text-amber-950 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-700" />
                          <span className="font-extrabold text-sm">Counter Pickup & Token Slip</span>
                        </span>
                        <span className="text-[10px] bg-amber-300 text-amber-950 font-black px-2 py-0.5 rounded uppercase">
                          Live Daily Token
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-950 block">
                          Customer Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your name (e.g. Rahul Sharma)"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none shadow-xs"
                        />
                        <p className="text-[11px] font-semibold text-slate-700">
                          Your name will be printed on the token & bill so kitchen staff can call you when your order is ready.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                        <div>
                          <label className="block text-xs font-black text-slate-950 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none shadow-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-950 mb-1">
                            Order Note
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Extra napkins"
                            value={tableInstructions}
                            onChange={(e) => setTableInstructions(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none shadow-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white border-2 border-slate-300 space-y-3.5 shadow-xs">
                      <div className="text-xs font-extrabold text-slate-950 flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                          <span className="text-sm font-black text-slate-950 tracking-tight">Dining Details & Bill Info</span>
                        </span>
                        <span className="text-[11px] text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Printed on GST Invoice
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-slate-950 mb-1.5 uppercase tracking-wide">
                            Your Name <span className="text-slate-600 font-semibold normal-case">(optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Vikram Malhotra"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none shadow-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-950 mb-1.5 uppercase tracking-wide">
                            Phone Number <span className="text-slate-600 font-semibold normal-case">(for SMS/WhatsApp)</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none shadow-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-950 mb-1.5 uppercase tracking-wide">
                          Cooking Instructions / Special Requests <span className="text-slate-600 font-semibold normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Less spicy, Jain prep, no onion/garlic, extra crispy..."
                          value={tableInstructions}
                          onChange={(e) => setTableInstructions(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none shadow-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Choice Selection */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Payment Option</div>

                    {/* Razorpay Online */}
                    <div
                      className={`p-3 rounded-2xl border transition ${
                        paymentChoice === 'RAZORPAY'
                          ? 'border-sky-500 bg-sky-50/40 ring-1 ring-sky-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <label
                        onClick={() => setPaymentChoice('RAZORPAY')}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Razorpay Online Gateway</span>
                              <span className="text-[9px] font-extrabold uppercase bg-sky-100 text-sky-800 px-1 py-0.2 rounded">
                                Instant
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">Pick preferred UPI app or cards</div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          checked={paymentChoice === 'RAZORPAY'}
                          onChange={() => setPaymentChoice('RAZORPAY')}
                          className="accent-sky-600"
                        />
                      </label>

                      {/* Direct Method Selector Subgrid */}
                      {paymentChoice === 'RAZORPAY' && (
                        <div className="mt-3 pt-2.5 border-t border-sky-100/70 grid grid-cols-3 gap-1.5">
                          {[
                            { id: 'Google Pay', name: 'GPay', icon: Smartphone, color: 'hover:border-sky-400' },
                            { id: 'PhonePe', name: 'PhonePe', icon: Smartphone, color: 'hover:border-purple-400' },
                            { id: 'Paytm', name: 'Paytm', icon: Smartphone, color: 'hover:border-sky-400' },
                            { id: 'BHIM / Cred UPI', name: 'BHIM / UPI', icon: Zap, color: 'hover:border-emerald-400' },
                            { id: 'Debit & Credit Cards', name: 'Cards', icon: CreditCard, color: 'hover:border-amber-400' },
                            { id: 'NetBanking', name: 'NetBanking', icon: Building2, color: 'hover:border-slate-400' },
                          ].map((m) => {
                            const IconComponent = m.icon;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setSpecificMethod(m.id)}
                                className={`p-2 rounded-xl text-left border text-xs font-medium transition cursor-pointer flex flex-col justify-between ${
                                  specificMethod === m.id
                                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 ' + m.color
                                }`}
                              >
                                <div>
                                  <IconComponent className={`w-4 h-4 ${specificMethod === m.id ? 'text-white' : 'text-slate-600'}`} />
                                </div>
                                <div className="text-[10px] font-bold mt-1 truncate">{m.name}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Pay at Counter */}
                    <label
                      onClick={() => setPaymentChoice('CASH_AT_COUNTER')}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                        paymentChoice === 'CASH_AT_COUNTER'
                          ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">Pay at Counter / Cash</div>
                          <div className="text-[11px] text-slate-500">Settle bill after dining with staff</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentChoice === 'CASH_AT_COUNTER'}
                        onChange={() => setPaymentChoice('CASH_AT_COUNTER')}
                        className="accent-amber-600"
                      />
                    </label>
                  </div>

                  {/* Bill Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Item Subtotal</span>
                      <span className="font-semibold text-slate-700">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>CGST (2.5%)</span>
                      <span className="font-semibold text-slate-700">₹{cgst}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>SGST (2.5%)</span>
                      <span className="font-semibold text-slate-700">₹{sgst}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                      <span>Grand Total</span>
                      <span className="text-base text-amber-600">₹{grandTotal}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Place Order CTA */}
            {items.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-white">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition flex items-center justify-between cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Placing Order...'
                        : paymentChoice === 'RAZORPAY'
                        ? 'Pay & Confirm Order'
                        : 'Confirm & Send to Kitchen'}
                    </span>
                  </div>
                  <span className="font-black">₹{grandTotal}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Simulator / Verification Modal */}
      <RazorpayModal
        isOpen={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        orderData={razorpayOrderData}
        onPaymentSuccess={handlePaymentSuccess}
        isMockMode={true}
      />
    </>
  );
}
