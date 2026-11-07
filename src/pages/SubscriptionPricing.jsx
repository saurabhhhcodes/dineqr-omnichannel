// src/pages/SubscriptionPricing.jsx - Monthly Restaurant Platform Subscription & Razorpay Checkout
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Check,
  Zap,
  CreditCard,
  QrCode,
  Laptop,
  Database,
  ArrowRight,
  Layers,
  ChefHat,
  Receipt,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Flame,
  Radio,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function SubscriptionPricing() {
  const { activeRestaurant, refreshRestaurants } = useRestaurant();
  const { addToast } = useToast();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('starter_1000');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSubscription();
    // Load Razorpay checkout script if not already present
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [activeRestaurant]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const res = await fetch(`/api/subscription/status?restaurant_id=${restId}`);
      const data = await res.json();
      if (data.success) {
        setSubscription(data);
        if (data.plan?.amount === 1500) {
          setSelectedPlanId('pro_1500');
        }
      }
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setIsProcessing(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const orderRes = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restId,
          plan_id: planId,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        addToast(orderData.error || 'Failed to initiate subscription', 'error');
        setIsProcessing(false);
        return;
      }

      // Check if Razorpay SDK is available
      if (window.Razorpay && !orderData.simulated) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount_paise,
          currency: 'INR',
          name: 'DineQR Restaurant Platform',
          description: `Monthly Subscription: ${orderData.plan_name}`,
          order_id: orderData.order_id,
          prefill: {
            name: activeRestaurant?.owner_name || activeRestaurant?.name || 'Restaurant Admin',
            email: activeRestaurant?.email || 'admin@restaurant.com',
            contact: activeRestaurant?.phone || '+919876543210',
          },
          theme: { color: '#0284c7' },
          handler: async (response) => {
            await verifyPayment({
              restaurant_id: restId,
              plan_id: planId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              addToast('Subscription payment dismissed', 'info');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct simulation / offline fallback
        await verifyPayment({
          restaurant_id: restId,
          plan_id: planId,
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: 'rzp_pay_simulated_' + Date.now().toString().slice(-6),
          razorpay_signature: 'sig_simulated',
        });
      }
    } catch (err) {
      addToast(err.message, 'error');
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (payload) => {
    try {
      const res = await fetch('/api/subscription/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Subscription renewed! ${data.plan} is now active.`, 'success');
        await refreshRestaurants();
        fetchSubscription();
      } else {
        addToast(data.error || 'Payment verification failed', 'error');
      }
    } catch (err) {
      addToast('Verification error: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'starter_1000',
      title: 'Essential Restaurant Suite',
      price: '1,000',
      period: '/ month',
      badge: 'Most Popular',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      highlight: false,
      tagline: 'Ideal for cafes, bistros, dining halls & quick-service restaurants',
      features: [
        'Unlimited Table & Counter QR Code Menus',
        'Interactive Drag & Drop Floor Plan (Odoo Parity)',
        'Real-Time Kitchen Display System (KDS) & Audio Chimes',
        'Local SQLite On-Premise Engine (Zero Cloud DB Bills)',
        'Hardware ESC/POS Thermal Billing Printing (80mm & 58mm)',
        'Staff Roster Shift Planning & Live Clock-In Ledger',
        'Direct UPI & Razorpay Settlement to Your Bank',
        'Permanent Data Ownership (Export DB Anytime)',
      ],
    },
    {
      id: 'pro_1500',
      title: 'Local DB On-Premise Plan',
      price: '1,500',
      period: '/ month',
      badge: 'Most Popular · Zero Cloud DB Cost',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      highlight: true,
      tagline: 'Ideal for independent restaurants, cafes, dhabas & QSRs',
      features: [
        'Local SQLite Engine (Zero Cloud Database Server Bills)',
        'Local Owner Dashboard Access on Restaurant Wi-Fi / LAN',
        'Automatic 80mm Thermal Receipt Storage in DineQR-Data/bills/',
        'Captain Waiter Ordering App & Kitchen Display (KDS)',
        'Table Scan QR Menus with 0% Platform Commission',
        'Staff Timeclock: Logs Exact Arrival & Departure (Up to 12 Staff)',
        'Full Offline Operation: Bill Print Works Even Without Internet',
        'Zomato & Swiggy Webhook Ingestion & 80+ Real-Time Reports',
      ],
    },
    {
      id: 'enterprise_5000',
      title: 'Cloud Sync & MongoDB Atlas Plan',
      price: '5,000',
      period: '/ month',
      badge: '24/7 Global Remote Access',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      highlight: false,
      tagline: 'For busy multi-branch outlets, food halls & remote owners',
      features: [
        '24/7 Global Remote Access from Phone (Even if Restaurant PC is OFF)',
        'Real-Time MongoDB Atlas Cloud Replication (Multi-Tenant Partitioned)',
        'Up to 30 Staff User Accounts with Timeclock Pin Verification',
        'Multi-Station Kitchen KDS & Food Court Token TV Display',
        'Multi-Branch Consolidated Reporting & Central Menu Distribution',
        'Automatic Local Backup Sync to DineQR-Data/ + Cloud Cloud Storage',
        'Pay-on-Counter Cash, Card & Razorpay Direct Settlement',
        'Dedicated 1-on-1 VIP WhatsApp & Phone Implementation Specialist',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Flat Monthly Pricing · No Per-Order Commissions · Keep 100% of Revenue</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Restaurant Operating Platform Billing
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Choose a predictable monthly subscription. Your local SQLite database runs on your own hardware so you never pay AWS RDS cloud bills.
        </p>
      </div>

      {/* Current Active Plan Status Pill */}
      {subscription && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <CheckCircle2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base">{activeRestaurant?.name}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  {subscription.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Current Plan: <strong className="text-amber-400">{subscription.plan?.name}</strong> (₹{subscription.plan?.amount}/mo)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:text-right">
              <div className="text-xs text-slate-400">Term Remaining</div>
              <div className="text-sm font-black text-emerald-400">
                {subscription.days_left} Days Active
              </div>
            </div>
            <button
              onClick={fetchSubscription}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent =
            subscription?.plan?.amount ===
            (plan.id === 'starter_1000' ? 1000 : plan.id === 'pro_1500' ? 1500 : 5000);

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-8 border-2 transition-all flex flex-col justify-between ${
                plan.highlight
                  ? 'bg-linear-to-b from-white to-purple-50/40 border-purple-400 shadow-xl ring-4 ring-purple-500/10'
                  : 'bg-white border-slate-200 shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Current Active Plan
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">{plan.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100">
                  <span className="text-sm font-black text-slate-500">₹</span>
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                  <span className="text-xs font-bold text-slate-500">{plan.period}</span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isProcessing}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                    plan.highlight
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/25'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  } active:scale-98`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Processing via Razorpay...' : `Subscribe for ₹${plan.price} / month`}
                  </span>
                </button>
                <div className="text-center text-[10px] text-slate-400 mt-2">
                  Supports Google Pay, PhonePe, Paytm, Cards & NetBanking
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zero Cloud Database & Permanent Storage Guarantee */}
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600 shrink-0" />
          <h4 className="font-extrabold text-sm text-amber-950">
            Perpetual Data Ownership & Zero Cloud Database Lock-In
          </h4>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Unlike other software providers that hold your restaurant order records hostage if a subscription lapses, DineQR runs on your embedded local SQLite engine. Your data resides in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">./data/restaurant.db</code> on your computer or counter terminal. You can export a full binary backup of your entire historical order ledger at any time.
        </p>
        <div className="pt-1 flex items-center gap-3 flex-wrap">
          <a
            href="/api/erp/local-sqlite/export"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Download Local Database Snapshot (.db)</span>
          </a>
          <Link
            to="/admin/settings"
            className="text-xs font-bold text-amber-900 hover:underline"
          >
            Configure Cloud Domain & Thermal Printer in Settings →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPricing;
