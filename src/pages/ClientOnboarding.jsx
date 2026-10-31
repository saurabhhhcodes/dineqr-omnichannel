// src/pages/ClientOnboarding.jsx - Universal Self-Serve Onboarding for Clinics, Restaurants, Gyms, and Events
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Stethoscope,
  UtensilsCrossed,
  Dumbbell,
  Sparkles,
  PartyPopper,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Smartphone,
  ExternalLink,
  Laptop,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

const INDUSTRIES = [
  {
    id: 'clinic',
    title: 'Medical Clinic / Hospital / Lab',
    badge: 'Healthcare',
    icon: Stethoscope,
    color: 'from-teal-500 to-emerald-600',
    stationDefault: 'room',
    stationLabel: 'Consultation Rooms / Tokens',
    description: 'Digital token queue, doctor OPD consultations, diagnostic blood panels & prescription slips.',
    sampleItem: 'General Physician OPD Consult (₹500)',
  },
  {
    id: 'restaurant',
    title: 'Restaurant, Cafe or Bar',
    badge: 'Dining & Drinks',
    icon: UtensilsCrossed,
    color: 'from-amber-500 to-orange-600',
    stationDefault: 'table',
    stationLabel: 'Dining Tables / Counter',
    description: 'Table QR code ordering, looping dish videos, kitchen KDS & instant GST billing.',
    sampleItem: 'Wood-Fired Neapolitan Pizza (₹620)',
  },
  {
    id: 'gym',
    title: 'Gym & Fitness Center',
    badge: 'Fitness & Sports',
    icon: Dumbbell,
    color: 'from-blue-600 to-indigo-600',
    stationDefault: 'bay',
    stationLabel: 'Workout Bays / Lockers',
    description: 'Day workout passes, smoothie protein bar, supplements and personal training bookings.',
    sampleItem: 'All-Access Workout Day Pass (₹350)',
  },
  {
    id: 'event',
    title: 'Social Gathering & Music Fest',
    badge: 'Events & Expos',
    icon: PartyPopper,
    color: 'from-purple-600 to-pink-600',
    stationDefault: 'booth',
    stationLabel: 'VIP Lounges / Booths',
    description: 'VIP lounge service, festival concessions, fast-track drink pickups & merchandise.',
    sampleItem: 'VIP Backstage Wristband (₹2,499)',
  },
];

export function ClientOnboarding() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setActiveRestaurant, refreshRestaurants } = useRestaurant();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  // Form State
  const [businessType, setBusinessType] = useState('clinic');
  const [stationType, setStationType] = useState('room');
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [stationCount, setStationCount] = useState(4);
  const [adminPin, setAdminPin] = useState('1234');

  // Payment Setup State
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_TK088i9wgJLbAg');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('DyRucfn1FimHG6vcWs6CyePr');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [settlementType, setSettlementType] = useState('direct');

  // Razorpay Key Validation State
  const [isValidatingKeys, setIsValidatingKeys] = useState(false);
  const [keyValidationStatus, setKeyValidationStatus] = useState(null);

  const handleSelectIndustry = (ind) => {
    setBusinessType(ind.id);
    setStationType(ind.stationDefault);
    if (!tagline) {
      if (ind.id === 'clinic') setTagline('Doctor Consultations, Diagnostic Panels & Pharmacy');
      else if (ind.id === 'restaurant') setTagline('Artisanal Kitchen & Wood-Fired Oven');
      else if (ind.id === 'gym') setTagline('Day Passes, Protein Shakes & Personal Coaching');
      else if (ind.id === 'event') setTagline('VIP Lounges, Fast-Track Drinks & Official Passes');
    }
  };

  const handleTestRazorpayKeys = async () => {
    if (!razorpayKeyId || !razorpayKeySecret) {
      addToast('Please enter both Razorpay Key ID and Secret', 'error');
      return;
    }
    setIsValidatingKeys(true);
    setKeyValidationStatus(null);
    try {
      const res = await fetch('/api/payment/razorpay/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        }),
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setKeyValidationStatus({
          valid: true,
          mode: data.mode,
          message: data.message,
        });
        addToast(`✅ Razorpay Verified! Connected in ${data.mode}`);
      } else {
        setKeyValidationStatus({
          valid: false,
          error: data.error || 'Authentication failed',
        });
        addToast('Invalid Razorpay credentials', 'error');
      }
    } catch (err) {
      setKeyValidationStatus({ valid: false, error: err.message });
      addToast('Failed to reach verification endpoint', 'error');
    } finally {
      setIsValidatingKeys(false);
    }
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Business Name is required', 'error');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/restaurants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          business_type: businessType,
          station_type: stationType,
          tagline: tagline.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          gstin: gstin.trim(),
          station_count: stationCount,
          admin_pin: adminPin.trim() || '1234',
          razorpay_key_id: razorpayKeyId.trim(),
          razorpay_key_secret: razorpayKeySecret.trim(),
          upi_id: upiId.trim(),
          bank_account: bankAccount.trim(),
          bank_ifsc: bankIfsc.trim(),
          settlement_type: settlementType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedResult(data);
        await refreshRestaurants();
        setActiveRestaurant(data.restaurant);
        addToast(`🎉 ${data.restaurant.name} onboarded successfully!`);
        setStep(4);
      } else {
        addToast(data.error || 'Failed to onboard business', 'error');
      }
    } catch (err) {
      addToast('Network error during onboarding: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal QR Self-Checkout & POS Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Join as Admin & Setup Your Business
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            Launch your self-ordering QR catalog, configure direct Razorpay payouts, and run operations on desktop, mobile, or Windows POS.
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {[
              { num: 1, label: 'Select Industry' },
              { num: 2, label: 'Profile & Stations' },
              { num: 3, label: 'Razorpay & Payouts' },
              { num: 4, label: 'Ready & Launch' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step === s.num
                      ? 'bg-sky-500 text-white ring-4 ring-sky-500/20'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </span>
                {s.num < 4 && <div className="w-4 sm:w-8 h-0.5 bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: SELECT INDUSTRY */}
        {step === 1 && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Step 1: Choose Your Industry / Business Type</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              The platform customizes your vocabulary, station designations (Rooms vs Tables vs Bays), and billing formats accordingly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                const isSelected = businessType === ind.id;
                return (
                  <div
                    key={ind.id}
                    onClick={() => handleSelectIndustry(ind)}
                    className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-950/30 ring-2 ring-sky-500/30'
                        : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${ind.color} text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                          {ind.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-white">{ind.title}</h3>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{ind.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Includes starter:</span>
                      <span className="text-sky-300 font-semibold">{ind.sampleItem}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
              >
                <span>Continue to Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BUSINESS IDENTITY & STATIONS */}
        {step === 2 && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Step 2: Business Profile & Stations</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">
              Enter your official brand identity and how many physical spots (rooms, tables, lockers, booths) you want to generate QR codes for.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      businessType === 'clinic'
                        ? 'e.g. LifeCare Multi-Specialty Clinic'
                        : businessType === 'gym'
                        ? 'e.g. Titan Strength Club'
                        : businessType === 'event'
                        ? 'e.g. ElectroVibe Festival 2026'
                        : 'e.g. Bella Italia Bistro'
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OPD Consultations, Blood Panels & Pharmacy"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="reception@yourdomain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Physical Location / Address
                </label>
                <input
                  type="text"
                  placeholder="Suite 201, Commercial Center, Indiranagar, Bengaluru - 560038"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Station Type
                  </label>
                  <select
                    value={stationType}
                    onChange={(e) => setStationType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="room">Consultation Room (Clinics)</option>
                    <option value="token">Token Counter (Labs / OPD)</option>
                    <option value="table">Dining Table (Restaurants/Cafes)</option>
                    <option value="bay">Workout Bay (Gyms)</option>
                    <option value="locker">Locker Number (Clubs)</option>
                    <option value="booth">VIP Booth (Events/Festivals)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Initial Station Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={stationCount}
                    onChange={(e) => setStationCount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Generates QR Placards 1 to {stationCount}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Admin Staff Access PIN
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Default: 1234</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    addToast('Please enter your Business Name', 'error');
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
              >
                <span>Continue to Payment Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RAZORPAY & PAYMENT METHODS */}
        {step === 3 && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Step 3: Direct Payment & Razorpay Setup</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Connect your Razorpay account so customer payments land directly in your bank account with zero delay.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#0c2340] border border-sky-500/30 text-sky-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span className="text-xs font-bold hidden sm:inline">Direct Merchant Gateway</span>
              </div>
            </div>

            <div className="space-y-5">
              {/* Razorpay Credentials Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-sky-300">
                    <CreditCard className="w-4 h-4" />
                    <span>Razorpay API Credentials</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Pre-filled with test credentials
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Razorpay Key ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="rzp_test_..."
                      value={razorpayKeyId}
                      onChange={(e) => {
                        setRazorpayKeyId(e.target.value);
                        setKeyValidationStatus(null);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Razorpay Key Secret *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter Key Secret"
                      value={razorpayKeySecret}
                      onChange={(e) => {
                        setRazorpayKeySecret(e.target.value);
                        setKeyValidationStatus(null);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Validation Test Button */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestRazorpayKeys}
                    disabled={isValidatingKeys}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isValidatingKeys ? (
                      <span>Testing connection...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Test & Validate Razorpay Keys</span>
                      </>
                    )}
                  </button>

                  {keyValidationStatus && (
                    <div
                      className={`text-xs font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                        keyValidationStatus.valid
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {keyValidationStatus.valid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{keyValidationStatus.message}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span>{keyValidationStatus.error}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* UPI & Bank Settlement Fallback */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Direct UPI & Bank Settlement Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Direct UPI VPA ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. drgupta@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Settlement Bank Account #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 987654321012"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bank IFSC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs uppercase focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Provisioning Your System...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Launch & Activate Digital QR System</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CELEBRATION & READY TO USE */}
        {step === 4 && createdResult && (
          <div className="bg-slate-800/90 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">
                {createdResult.restaurant.name} is Live!
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-md mx-auto">
                Your QR menus, direct Razorpay settlement, and station placards have been provisioned and ready for your customers and staff.
              </p>
            </div>

            {/* Quick Access Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40">
                <span className="text-[11px] text-amber-400 uppercase font-black">Merchant User ID</span>
                <div className="text-xl font-mono font-black text-white mt-0.5">
                  {createdResult.restaurant.merchant_user_id || 'MER-84920'}
                </div>
                <span className="text-[11px] text-slate-400">Use for portal login</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Staff Access PIN</span>
                <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{adminPin}</div>
                <span className="text-[11px] text-slate-500">Security passcode</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Subscription Plan</span>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">₹1,000 / mo</div>
                <span className="text-[11px] text-emerald-500">Flat rate active</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Stations</span>
                <div className="text-xl font-bold text-white mt-0.5">{stationCount} {stationType}s</div>
                <span className="text-[11px] text-sky-400">QR codes generated</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveRestaurant(createdResult.restaurant);
                  navigate('/admin/orders');
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
              >
                <Laptop className="w-4 h-4" />
                <span>One-Click Login to Dashboard</span>
              </button>

              <Link
                to="/admin/tables"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>Print QR Placards</span>
              </Link>

              <Link
                to={`/menu?restaurant=${createdResult.restaurant.slug || createdResult.restaurant.id}&table=stn_${createdResult.restaurant.id}_1`}
                target="_blank"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Live QR Menu</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
