// src/pages/AdminSettings.jsx - Restaurant profile, tax rates & Razorpay merchant account integration
import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Percent,
  Receipt,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Printer,
  Cpu,
  Copy,
  Zap,
  Flame,
  Share2
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminSettings() {
  const { activeRestaurant, refreshRestaurants } = useRestaurant();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    fssai: '',
    currency: '₹',
    cgst_pct: 2.5,
    sgst_pct: 2.5,
    service_charge_pct: 0.0,
    razorpay_key_id: '',
    razorpay_key_secret: '',
    upi_id: '',
    bank_account: '',
    bank_ifsc: '',
    cloud_domain: '',
    printer_type: 'browser',
    printer_ip: '',
    printer_port: 9100,
    paper_width: '80mm',
    auto_print_bills: 1,
    cash_drawer_kick: 1,
    zomato_res_id: '',
    zomato_api_key: '',
    zomato_auto_accept: 1,
    swiggy_outlet_id: '',
    swiggy_api_key: '',
    swiggy_auto_accept: 1,
    magicpin_merchant_id: '',
    ondc_provider_id: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingKeys, setIsValidatingKeys] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState(null);
  const [isTestingPrinter, setIsTestingPrinter] = useState(false);
  const [printerStatusMsg, setPrinterStatusMsg] = useState(null);
  const [testingPartner, setTestingPartner] = useState('');
  const [simulatingPartner, setSimulatingPartner] = useState('');

  useEffect(() => {
    if (!activeRestaurant) return;
    setIsLoading(true);

    fetch(`/api/restaurants/${activeRestaurant.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.restaurant) {
          const r = data.restaurant;
          setFormData({
            name: r.name || '',
            tagline: r.tagline || '',
            address: r.address || '',
            phone: r.phone || '',
            email: r.email || '',
            gstin: r.gstin || '',
            fssai: r.fssai || '',
            currency: r.currency || '₹',
            cgst_pct: r.cgst_pct !== undefined ? r.cgst_pct : 2.5,
            sgst_pct: r.sgst_pct !== undefined ? r.sgst_pct : 2.5,
            service_charge_pct: r.service_charge_pct !== undefined ? r.service_charge_pct : 0.0,
            razorpay_key_id: r.razorpay_key_id || '',
            razorpay_key_secret: '', // Don't prefill masked secret
            upi_id: r.upi_id || '',
            bank_account: r.bank_account || '',
            bank_ifsc: r.bank_ifsc || '',
            cloud_domain: r.cloud_domain || '',
            printer_type: r.printer_type || 'browser',
            printer_ip: r.printer_ip || '',
            printer_port: r.printer_port || 9100,
            paper_width: r.paper_width || '80mm',
            auto_print_bills: r.auto_print_bills !== undefined ? r.auto_print_bills : 1,
            cash_drawer_kick: r.cash_drawer_kick !== undefined ? r.cash_drawer_kick : 1,
            zomato_res_id: r.zomato_res_id || '',
            zomato_api_key: '',
            zomato_auto_accept: r.zomato_auto_accept !== undefined ? r.zomato_auto_accept : 1,
            swiggy_outlet_id: r.swiggy_outlet_id || '',
            swiggy_api_key: '',
            swiggy_auto_accept: r.swiggy_auto_accept !== undefined ? r.swiggy_auto_accept : 1,
            magicpin_merchant_id: r.magicpin_merchant_id || '',
            ondc_provider_id: r.ondc_provider_id || '',
          });
        }
      })
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => setIsLoading(false));
  }, [activeRestaurant]);

  const handleTestPartner = async (platform) => {
    const partnerId = platform === 'zomato' ? formData.zomato_res_id : formData.swiggy_outlet_id;
    if (!partnerId || !partnerId.trim()) {
      addToast(`Please enter ${platform === 'zomato' ? 'Zomato ResID' : 'Swiggy Outlet ID'} first`, 'error');
      return;
    }
    setTestingPartner(platform);
    try {
      const res = await fetch('/api/integrations/test-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, partner_id: partnerId }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message, 'success');
      } else {
        addToast(data.error || 'Partner validation failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setTestingPartner('');
    }
  };

  const handleSimulateAggregatorOrder = async (platform) => {
    setSimulatingPartner(platform);
    try {
      const res = await fetch('/api/integrations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, restaurant_id: activeRestaurant?.id || 'rest_losteria' }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message, 'info');
      } else {
        addToast(data.error || 'Simulation failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSimulatingPartner('');
    }
  };

  const handleTestPrinter = async () => {
    setIsTestingPrinter(true);
    setPrinterStatusMsg(null);
    try {
      const res = await fetch('/api/invoice/test/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_ip: formData.printer_ip,
          target_port: formData.printer_port,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPrinterStatusMsg({ success: true, message: data.message });
        addToast(data.message, 'success');
      } else {
        setPrinterStatusMsg({ success: false, message: data.error || 'Printer test failed' });
        addToast(data.error || 'Failed to print', 'error');
      }
    } catch (err) {
      setPrinterStatusMsg({ success: false, message: err.message });
      addToast('Printer test failed: ' + err.message, 'error');
    } finally {
      setIsTestingPrinter(false);
    }
  };

  const handleTestRazorpay = async () => {
    if (!formData.razorpay_key_id) {
      addToast('Please enter Razorpay Key ID', 'error');
      return;
    }
    setIsValidatingKeys(true);
    setKeyValidationStatus(null);
    try {
      const res = await fetch('/api/payment/razorpay/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_id: formData.razorpay_key_id,
          key_secret: formData.razorpay_key_secret || 'DyRucfn1FimHG6vcWs6CyePr',
        }),
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setKeyValidationStatus({ valid: true, message: data.message });
        addToast(`Razorpay Verified: ${data.message}`, 'success');
      } else {
        setKeyValidationStatus({ valid: false, error: data.error || 'Validation failed' });
        addToast(data.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      setKeyValidationStatus({ valid: false, error: err.message });
    } finally {
      setIsValidatingKeys(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!activeRestaurant) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${activeRestaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        addToast('Restaurant profile & payment account updated!');
        refreshRestaurants();
      } else {
        addToast(data.error || 'Failed to update settings', 'error');
      }
    } catch (err) {
      addToast('Error saving settings: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                Cafe Profile & Settlement
              </span>
              <span className="text-xs text-slate-500">· {activeRestaurant?.name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Settings & Payment Integration
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure your legal tax information (GST/FSSAI) and link your Razorpay merchant account for direct payouts.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* RAZORPAY DIRECT MERCHANT ACCOUNT SETTINGS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-200 shadow-md shadow-sky-500/5 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0c2340] text-sky-400 flex items-center justify-center font-black text-xl shadow-xs">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      Razorpay Merchant Account (Direct Payout)
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      Direct Settlement
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your own Razorpay API keys. Customer payments from your table QRs drop directly into your bank account.
                  </p>
                </div>
              </div>
            </div>

            {/* Explanatory callout */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3 text-xs text-sky-950">
              <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">How it works: </span>
                When customers scan your QR code and pay via UPI, Cards, or NetBanking, the funds settle straight into your linked bank account via your Razorpay MID. If left blank, DineQR automatically provides an interactive test sandbox so ordering is never disrupted.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. rzp_live_xxxxxxxxxxxx or rzp_test_xxxxxxxx"
                  value={formData.razorpay_key_id}
                  onChange={(e) => setFormData({ ...formData, razorpay_key_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Found in your Razorpay Dashboard &rarr; Settings &rarr; API Keys
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Razorpay Key Secret
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={formData.razorpay_key_secret}
                  onChange={(e) => setFormData({ ...formData, razorpay_key_secret: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used for authentic HMAC SHA-256 webhook signature verification
                </span>
              </div>
            </div>

            {/* Test Keys Action */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestRazorpay}
                disabled={isValidatingKeys}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isValidatingKeys ? 'Testing Credentials...' : 'Test Razorpay Connection'}</span>
              </button>

              {keyValidationStatus && (
                <div
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                    keyValidationStatus.valid
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {keyValidationStatus.valid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{keyValidationStatus.message}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{keyValidationStatus.error}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Direct UPI & Settlement Bank Account */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 mb-3">
                Direct UPI VPA & Settlement Bank Account
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Direct UPI VPA ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. cafe@okhdfcbank"
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 987654321012"
                    value={formData.bank_account}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={formData.bank_ifsc}
                    onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOD DELIVERY AGGREGATORS & OMNICHANNEL HUB (ZOMATO · SWIGGY · MAGICPIN · ONDC) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200/90 shadow-md shadow-rose-500/5 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-600 to-orange-500 text-white flex items-center justify-center font-black shadow-md shadow-rose-600/20">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      Food Delivery Aggregators & Omnichannel Hub
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                      Zomato · Swiggy · ONDC
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your external business partner IDs to stream live online delivery orders straight into your DineQR Kitchen Display (KDS).
                  </p>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Unified KDS Dispatch</span>
              </span>
            </div>

            {/* Explanatory callout */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950">
              <Zap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero Platform Switching: </span>
                When customers order via Zomato, Swiggy, Magicpin, or ONDC, the order payload arrives via webhook, drops directly into your KDS ticket queue with audio chimes, and triggers silent thermal printing without staff needing multiple tablets!
              </div>
            </div>

            {/* 1. ZOMATO PARTNER INTEGRATION */}
            <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    Z
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Zomato for Business</h3>
                    <p className="text-[11px] text-slate-500">Live order sync via Zomato Merchant API</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestPartner('zomato')}
                    disabled={testingPartner === 'zomato'}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition cursor-pointer"
                  >
                    {testingPartner === 'zomato' ? 'Validating...' : 'Verify ResID'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateAggregatorOrder('zomato')}
                    disabled={simulatingPartner === 'zomato'}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                    title="Simulate incoming Zomato delivery order"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{simulatingPartner === 'zomato' ? 'Sending...' : 'Simulate Zomato Order'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Zomato Restaurant ID (ResId)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18923412"
                    value={formData.zomato_res_id}
                    onChange={(e) => setFormData({ ...formData, zomato_res_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Found in your Zomato Merchant Dashboard &rarr; Profile
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Zomato API Secret / Webhook Key
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••"
                    value={formData.zomato_api_key}
                    onChange={(e) => setFormData({ ...formData, zomato_api_key: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used to authenticate incoming Zomato webhook payloads
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-rose-200/60">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="zomato_auto_accept"
                    checked={!!formData.zomato_auto_accept}
                    onChange={(e) => setFormData({ ...formData, zomato_auto_accept: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="zomato_auto_accept" className="font-bold text-slate-800 cursor-pointer">
                    Auto-Accept Zomato orders into Kitchen Display System
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-rose-200">
                  <span className="font-mono text-slate-700">Webhook: /api/integrations/zomato/webhook</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/integrations/zomato/webhook`);
                      addToast('Zomato webhook URL copied!');
                    }}
                    className="text-rose-600 hover:text-rose-800 cursor-pointer p-0.5"
                    title="Copy full Webhook URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. SWIGGY PARTNER INTEGRATION */}
            <div className="p-5 rounded-2xl bg-orange-50/40 border border-orange-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    S
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Swiggy Partner Integration</h3>
                    <p className="text-[11px] text-slate-500">Live order sync via Swiggy Outlet API</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestPartner('swiggy')}
                    disabled={testingPartner === 'swiggy'}
                    className="px-3 py-1.5 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 text-orange-700 text-xs font-bold transition cursor-pointer"
                  >
                    {testingPartner === 'swiggy' ? 'Validating...' : 'Verify Outlet ID'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateAggregatorOrder('swiggy')}
                    disabled={simulatingPartner === 'swiggy'}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                    title="Simulate incoming Swiggy delivery order"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{simulatingPartner === 'swiggy' ? 'Sending...' : 'Simulate Swiggy Order'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Swiggy Outlet ID / Store ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SWG-BLR-0419 or 481923"
                    value={formData.swiggy_outlet_id}
                    onChange={(e) => setFormData({ ...formData, swiggy_outlet_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Found in your Swiggy Partner App &rarr; Outlet Settings
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Swiggy Webhook API Token
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••••••••••"
                    value={formData.swiggy_api_key}
                    onChange={(e) => setFormData({ ...formData, swiggy_api_key: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used to authenticate orders dispatched from Swiggy dispatch
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-t border-orange-200/60">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="swiggy_auto_accept"
                    checked={!!formData.swiggy_auto_accept}
                    onChange={(e) => setFormData({ ...formData, swiggy_auto_accept: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="swiggy_auto_accept" className="font-bold text-slate-800 cursor-pointer">
                    Auto-Accept Swiggy orders into Kitchen Display System
                  </label>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-orange-200">
                  <span className="font-mono text-slate-700">Webhook: /api/integrations/swiggy/webhook</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/integrations/swiggy/webhook`);
                      addToast('Swiggy webhook URL copied!');
                    }}
                    className="text-orange-600 hover:text-orange-800 cursor-pointer p-0.5"
                    title="Copy full Webhook URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. MAGICPIN & ONDC INTEGRATION */}
            <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    O
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">ONDC Network & Magicpin</h3>
                    <p className="text-[11px] text-slate-500">Government Open Network for Digital Commerce & Local Discovery</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateAggregatorOrder('ondc')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Simulate ONDC Order</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Magicpin Merchant ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MP-DELHI-88192"
                    value={formData.magicpin_merchant_id}
                    onChange={(e) => setFormData({ ...formData, magicpin_merchant_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ONDC BAP / BPP Provider ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ondc.seller.losteria.in"
                    value={formData.ondc_provider_id}
                    onChange={(e) => setFormData({ ...formData, ondc_provider_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Profile Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Restaurant Profile & Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Restaurant / Cafe Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Physical Address (Printed on Tax Invoices)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* GST & Regulatory Compliance */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              GST Tax Details & Compliance
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  GSTIN (Goods and Services Tax Number)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  FSSAI Food License Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 11223344556677"
                  value={formData.fssai}
                  onChange={(e) => setFormData({ ...formData, fssai: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    CGST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.cgst_pct}
                    onChange={(e) => setFormData({ ...formData, cgst_pct: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Standard 2.5%</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    SGST Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.sgst_pct}
                    onChange={(e) => setFormData({ ...formData, sgst_pct: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Standard 2.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOM CLOUD DOMAIN CONFIGURATION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    Custom Cloud Domain & Public QR Origin
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase">
                    Admin Custom Domain
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set your branded domain (e.g. <code className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded">order.myrestaurant.com</code> or your custom tunnel).
                  All table QR codes and printable placards will encode this exact cloud domain for live public smartphone scanning.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Public Cloud Domain (HTTPS)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="https://order.myrestaurant.com or https://attention-software-carmen-waterproof.trycloudflare.com"
                  value={formData.cloud_domain}
                  onChange={(e) => setFormData({ ...formData, cloud_domain: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.cloud_domain) {
                      addToast('Please enter a domain first', 'error');
                      return;
                    }
                    window.open(formData.cloud_domain, '_blank');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Test Link
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Leave blank to automatically use the incoming request hostname (e.g. Cloudflare tunnel or Netlify edge).
              </p>
            </div>
          </div>

          {/* BILLING MACHINE & THERMAL POS HARDWARE SETUP */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-black text-slate-900">
                    Billing Machine & Thermal POS Hardware Setup
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold uppercase">
                    ESC/POS Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Connect 80mm/58mm thermal billing machines (Epson, TVS, Citizen, Posiflex, Rongta, Sunmi). Bills and customer tokens are automatically printed upon order placement or payment.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestPrinter}
                disabled={isTestingPrinter}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>{isTestingPrinter ? 'Testing Socket...' : 'Test Print Sample Slip'}</span>
              </button>
            </div>

            {printerStatusMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                  printerStatusMsg.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{printerStatusMsg.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Printer Interface / Protocol
                </label>
                <select
                  value={formData.printer_type}
                  onChange={(e) => setFormData({ ...formData, printer_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                >
                  <option value="tcp">Direct Network TCP (Port 9100 ESC/POS)</option>
                  <option value="usb">USB / Local Spooler Agent</option>
                  <option value="browser">Browser Native Print Dialog</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">Most billing machines use TCP port 9100</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Printer IP Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.100 or 127.0.0.1"
                  value={formData.printer_ip}
                  onChange={(e) => setFormData({ ...formData, printer_ip: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Static IP on restaurant LAN</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Printer Port
                </label>
                <input
                  type="number"
                  placeholder="9100"
                  value={formData.printer_port}
                  onChange={(e) => setFormData({ ...formData, printer_port: parseInt(e.target.value, 10) || 9100 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Standard ESC/POS port 9100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Thermal Paper Roll Width
                </label>
                <select
                  value={formData.paper_width}
                  onChange={(e) => setFormData({ ...formData, paper_width: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                >
                  <option value="80mm">80mm (Standard 3-inch, 42 columns)</option>
                  <option value="58mm">58mm (Compact 2-inch, 32 columns)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="auto_print_bills"
                  checked={!!formData.auto_print_bills}
                  onChange={(e) => setFormData({ ...formData, auto_print_bills: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="auto_print_bills" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Auto-Print on Order Placement / Payment
                </label>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="cash_drawer_kick"
                  checked={!!formData.cash_drawer_kick}
                  onChange={(e) => setFormData({ ...formData, cash_drawer_kick: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="cash_drawer_kick" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Auto-Kick Cash Drawer (ESC p)
                </label>
              </div>
            </div>
          </div>

          {/* Windows Desktop Client Support */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold flex items-center gap-2">
                    <span>Windows POS & Clinic Reception Desktop App</span>
                    <span className="text-[10px] uppercase font-black bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 px-2 py-0.5 rounded-full">
                      Native Windows
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    For Windows 10/11 reception counters, thermal receipt printing, and kiosk waiting room screens.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-sky-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hardware ESC/POS Silent Printing</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Automatically triggers silent thermal prints on 80mm/58mm USB and Ethernet receipt printers without displaying browser dialogs.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Full-Screen Kiosk Token Mode</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Press F11 to lock into a tamper-proof full-screen token display for clinic waiting areas or restaurant self-order kiosks.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Windows Quick Launcher script:</span>
              <span className="font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-amber-300 text-[11px]">
                scripts/start-windows-app.bat
              </span>
            </div>
          </div>

          {/* Submit bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Settings...' : 'Save Settings & Payment Keys'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
