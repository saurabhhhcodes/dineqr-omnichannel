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
  ExternalLink
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
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingKeys, setIsValidatingKeys] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState(null);

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
          });
        }
      })
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => setIsLoading(false));
  }, [activeRestaurant]);

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
        addToast(`✅ Razorpay Verified: ${data.message}`);
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
