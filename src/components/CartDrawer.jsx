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
  MessageSquare
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

    setIsSubmitting(true);

    try {
      // 1. Create order in backend local database
      const orderPayload = {
        restaurant_id: table?.restaurant_id || activeRestaurant?.id || 'rest_losteria',
        table_id: table ? table.id : null,
        customer_name: customerName.trim() || 'Guest',
        customer_phone: customerPhone.trim(),
        special_instructions: tableInstructions.trim(),
        payment_method: paymentChoice,
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
          body: JSON.stringify({ order_id: createdOrder.id }),
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

        {/* Slide-over panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
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

                  {/* Customer Information (Optional) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Dining Details</span>
                      <span className="text-[10px] text-slate-400 font-normal">For digital invoice</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Special table requests or allergies..."
                      value={tableInstructions}
                      onChange={(e) => setTableInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* Payment Choice Selection */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Payment Option</div>

                    {/* Razorpay Online */}
                    <label
                      onClick={() => setPaymentChoice('RAZORPAY')}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                        paymentChoice === 'RAZORPAY'
                          ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>Razorpay Online</span>
                            <span className="text-[9px] font-extrabold uppercase bg-sky-100 text-sky-800 px-1 py-0.2 rounded">
                              UPI / Cards
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">Google Pay, PhonePe, Cards, NetBanking</div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentChoice === 'RAZORPAY'}
                        onChange={() => setPaymentChoice('RAZORPAY')}
                        className="accent-sky-600"
                      />
                    </label>

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
