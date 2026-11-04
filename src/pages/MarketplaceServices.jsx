// src/pages/MarketplaceServices.jsx - Hyperlocal On-Demand Services & Trades Marketplace (Apronto Competitor + Porter Logistics)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Hammer,
  ChefHat,
  Zap,
  Truck,
  Sparkles,
  Search,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  ArrowRight,
  Plus,
  X,
  CreditCard,
  Navigation,
  Package,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

const CATEGORIES = [
  { id: 'all', label: 'All Services & Supplies', icon: Sparkles },
  { id: 'chef', label: 'Private Chefs & Cooks', icon: ChefHat },
  { id: 'carpenter', label: 'Carpenters & Woodwork', icon: Hammer },
  { id: 'electrician', label: 'Electricians & Wiring', icon: Zap },
  { id: 'plumber', label: 'Plumbers & Water Pumps', icon: Wrench },
  { id: 'materials', label: 'Cement & Building Supplies', icon: Truck },
];

export function MarketplaceServices() {
  const { addToast } = useToast();
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [activeBookingPro, setActiveBookingPro] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [scheduledSlot, setScheduledSlot] = useState('Today / Next Available');
  const [instructions, setInstructions] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState(1);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  // Porter Logistics Calculator Modal State
  const [showPorterModal, setShowPorterModal] = useState(false);
  const [porterTargetPro, setPorterTargetPro] = useState(null);
  const [pickupAddr, setPickupAddr] = useState('Gupta Building Materials Depot, Bellandur, Bengaluru');
  const [dropAddr, setDropAddr] = useState('Plot 42, Galleria Boulevard, Indiranagar, Bengaluru');
  const [cargoDesc, setCargoDesc] = useState('10 Bags UltraTech Super Cement (500kg total)');
  const [vehicleType, setVehicleType] = useState('tata_ace');
  const [distanceKm, setDistanceKm] = useState('5.0');
  const [porterEstimate, setPorterEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [dispatchedShipment, setDispatchedShipment] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);

  // Pro Onboarding Drawer State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newProName, setNewProName] = useState('');
  const [newProPhone, setNewProPhone] = useState('');
  const [newProCategory, setNewProCategory] = useState('carpenter');
  const [newProHeadline, setNewProHeadline] = useState('');
  const [newProRate, setNewProRate] = useState('299');
  const [newProSkills, setNewProSkills] = useState('');
  const [newProLocation, setNewProLocation] = useState('Indiranagar, Bengaluru');
  const [isOnboarding, setIsOnboarding] = useState(false);

  const fetchPros = async () => {
    setLoading(true);
    try {
      let url = '/api/marketplace/pros';
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPros(data.pros || []);
      }
    } catch (err) {
      addToast('Failed to load specialists: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPros();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPros();
  };

  const handleOpenBooking = (pro) => {
    setActiveBookingPro(pro);
    setMaterialQuantity(pro.category === 'materials' ? 10 : 1);
    setBookingConfirmed(null);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      addToast('Please fill all required customer contact details', 'error');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const calcTotal = activeBookingPro.category === 'materials'
        ? activeBookingPro.fixed_price * materialQuantity
        : activeBookingPro.fixed_price;

      const res = await fetch('/api/marketplace/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: activeBookingPro.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          scheduled_at: scheduledSlot,
          instructions,
          total_amount: calcTotal,
          quantity: materialQuantity,
          payment_method: 'UPI / Razorpay Verified',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingConfirmed(data.booking);
        addToast(data.message, 'success');
      } else {
        addToast(data.error || 'Failed to confirm booking', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Porter Logistics Handlers
  const handleOpenPorter = (pro) => {
    setPorterTargetPro(pro);
    if (pro) {
      setPickupAddr(pro.location_area || 'Indiranagar, Bengaluru');
      setCargoDesc(pro.category === 'materials' ? '10 Bags UltraTech Cement & River Sand' : `${pro.provider_name} Professional Tool Kit`);
    }
    setDispatchedShipment(null);
    setShowPorterModal(true);
    calculatePorterEstimate();
  };

  const calculatePorterEstimate = async () => {
    setIsEstimating(true);
    try {
      const res = await fetch('/api/porter/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_address: pickupAddr,
          drop_address: dropAddr,
          vehicle_type: vehicleType,
          distance_km: parseFloat(distanceKm) || 4.5,
          cargo_weight_kg: 350,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPorterEstimate(data);
      }
    } catch (err) {
      addToast('Porter estimate failed: ' + err.message, 'error');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleDispatchPorter = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/porter/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingConfirmed?.id || '',
          item_description: cargoDesc,
          cargo_weight_kg: 350,
          vehicle_type: vehicleType,
          pickup_address: pickupAddr,
          drop_address: dropAddr,
          distance_km: parseFloat(distanceKm) || 4.5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchedShipment(data.shipment);
        addToast(data.message, 'success');
      } else {
        addToast(data.error || 'Dispatch failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  // Pro Onboarding Submit
  const handleOnboardPro = async (e) => {
    e.preventDefault();
    if (!newProName || !newProPhone) {
      addToast('Name and phone are required', 'error');
      return;
    }

    setIsOnboarding(true);
    try {
      const skillsArray = newProSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/marketplace/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_name: newProName,
          provider_phone: newProPhone,
          category: newProCategory,
          headline: newProHeadline,
          fixed_price: parseFloat(newProRate) || 199,
          skills: skillsArray,
          location_area: newProLocation,
          porter_eligible: newProCategory === 'materials' || newProCategory === 'carpenter' ? 1 : 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(data.message, 'success');
        setShowOnboardModal(false);
        setNewProName('');
        setNewProPhone('');
        setNewProHeadline('');
        setNewProSkills('');
        fetchPros();
      } else {
        addToast(data.error || 'Onboarding failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsOnboarding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>Hyperlocal On-Demand Services & Porter Dispatch</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Hire Nearby Pros & Order Raw Materials
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Book verified private chefs, master carpenters, licensed electricians, and plumbers. Order UltraTech cement, bricks, and sand with same-hour Porter mini-truck transfer directly to your doorstep.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowOnboardModal(true)}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Join as Pro / Supplier</span>
              </button>

              <button
                onClick={() => handleOpenPorter(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 font-bold text-xs transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Truck className="w-4 h-4" />
                <span>Porter Cargo Calculator</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by skill (e.g. Inverter, UltraTech, BBQ chef, door lock)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% ID Verified Pros</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Porter Tempo Transfer Ready</span>
            </span>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Specialists & Materials Grid */}
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Scanning nearby verified service specialists...</p>
          </div>
        ) : pros.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800 p-8">
            <Wrench className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No specialists found in this category</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Be the first verified professional to list in this area!
            </p>
            <button
              onClick={() => setShowOnboardModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Register as Specialist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pros.map((pro) => (
              <div
                key={pro.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition flex flex-col justify-between space-y-4 group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        <img
                          src={pro.image_url}
                          alt={pro.provider_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-white text-sm">{pro.provider_name}</h3>
                          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" title="Verified Professional" />
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {pro.rating}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {pro.distance_km} km away
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {pro.category}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-amber-300 leading-snug">
                    {pro.headline}
                  </p>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {pro.description}
                  </p>

                  {/* Skills tags */}
                  {pro.skills && pro.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pro.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Price Rate</span>
                    <div className="text-sm font-black text-white">
                      ₹{pro.fixed_price}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">/ {pro.pricing_unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {pro.porter_eligible === 1 && (
                      <button
                        onClick={() => handleOpenPorter(pro)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/20 text-xs font-bold transition cursor-pointer"
                        title="Porter Tempo Delivery Available"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenBooking(pro)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                    >
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {activeBookingPro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Book {activeBookingPro.provider_name}</h3>
                  <p className="text-[11px] text-slate-400">{activeBookingPro.headline}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveBookingPro(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingConfirmed ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Booking Confirmed!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Your service booking code is <strong className="text-amber-400">{bookingConfirmed.booking_code}</strong>.
                    The specialist has received your address and will arrive shortly.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="text-white font-bold">{bookingConfirmed.provider_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled:</span>
                    <span className="text-amber-300 font-bold">{bookingConfirmed.scheduled_at}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Paid:</span>
                    <span className="text-emerald-400 font-bold">₹{bookingConfirmed.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{bookingConfirmed.customer_address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveBookingPro(null)}
                    className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
                  >
                    Done
                  </button>
                  {activeBookingPro.porter_eligible === 1 && (
                    <button
                      onClick={() => {
                        setActiveBookingPro(null);
                        handleOpenPorter(activeBookingPro);
                      }}
                      className="flex-1 py-3 rounded-xl bg-slate-800 border border-sky-500/40 text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Book Porter Tempo</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3 text-xs">
                {activeBookingPro.category === 'materials' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white block">Quantity (50kg Bags)</span>
                      <span className="text-[10px] text-slate-400">₹{activeBookingPro.fixed_price} per bag</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMaterialQuantity(Math.max(1, materialQuantity - 5))}
                        className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold"
                      >
                        -
                      </button>
                      <span className="font-black text-amber-400 text-sm w-8 text-center">{materialQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setMaterialQuantity(materialQuantity + 5)}
                        className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Service / Delivery Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Plot No, Street, Landmark, Pincode"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Preferred Time Slot</label>
                    <select
                      value={scheduledSlot}
                      onChange={(e) => setScheduledSlot(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Today / Immediate (Within 60 Mins)">Immediate (60 Mins)</option>
                      <option value="Today Evening (4:00 PM - 7:00 PM)">Today Evening (4-7 PM)</option>
                      <option value="Tomorrow Morning (9:00 AM - 12:00 PM)">Tomorrow Morning (9-12 AM)</option>
                      <option value="Weekend Slot">Weekend Slot</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Job Notes / Problem</label>
                    <input
                      type="text"
                      placeholder="e.g. Kitchen tap leak / 2 ceiling fans"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Payable</span>
                    <div className="text-base font-black text-emerald-400">
                      ₹{activeBookingPro.category === 'materials'
                        ? activeBookingPro.fixed_price * materialQuantity
                        : activeBookingPro.fixed_price}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    {isSubmittingBooking ? 'Confirming...' : 'Confirm & Book'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PORTER LOGISTICS MODAL */}
      {showPorterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Porter Logistics Tempo Transfer</h3>
                  <p className="text-[11px] text-slate-400">On-demand tempo & courier transport for materials & heavy tools</p>
                </div>
              </div>
              <button
                onClick={() => setShowPorterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dispatchedShipment ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/40 flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Porter Vehicle Dispatched!</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Tracking Code: <strong className="text-sky-400">{dispatchedShipment.tracking_code}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver Assigned:</span>
                    <span className="text-white font-bold">{dispatchedShipment.driver_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle Number:</span>
                    <span className="text-amber-300 font-bold">{dispatchedShipment.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver Phone:</span>
                    <span className="text-slate-300 font-bold">{dispatchedShipment.driver_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Arrival:</span>
                    <span className="text-emerald-400 font-bold">{dispatchedShipment.eta_minutes} Mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fare:</span>
                    <span className="text-white font-bold">₹{dispatchedShipment.estimated_cost}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPorterModal(false)}
                  className="w-full py-3 rounded-xl bg-sky-500 text-slate-950 font-black text-xs"
                >
                  Close & View Live Route
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {/* Vehicle Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Select Porter Vehicle</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'two_wheeler', name: '2-Wheeler', cap: '20kg' },
                      { id: 'three_wheeler', name: '3-Wheeler', cap: '350kg' },
                      { id: 'tata_ace', name: 'Tata Ace', cap: '750kg' },
                      { id: 'pickup_8ft', name: '8ft Pickup', cap: '1200kg' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVehicleType(v.id);
                          setTimeout(calculatePorterEstimate, 50);
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                          vehicleType === v.id
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs">{v.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Cap: {v.cap}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Pickup Location</label>
                  <input
                    type="text"
                    value={pickupAddr}
                    onChange={(e) => setPickupAddr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Delivery / Drop Location</label>
                  <input
                    type="text"
                    value={dropAddr}
                    onChange={(e) => setDropAddr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Cargo Description</label>
                    <input
                      type="text"
                      value={cargoDesc}
                      onChange={(e) => setCargoDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Distance (km)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={distanceKm}
                      onChange={(e) => {
                        setDistanceKm(e.target.value);
                        setTimeout(calculatePorterEstimate, 100);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {porterEstimate && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Porter Fare</span>
                      <div className="text-xl font-black text-sky-400">
                        ₹{porterEstimate.pricing.total_estimated_fare}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <div>Base: ₹{porterEstimate.pricing.base_fare}</div>
                      <div>ETA: ~{porterEstimate.eta_minutes} Mins</div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={calculatePorterEstimate}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    Recalculate
                  </button>
                  <button
                    type="button"
                    disabled={isDispatching}
                    onClick={handleDispatchPorter}
                    className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
                  >
                    {isDispatching ? 'Dispatching...' : 'Dispatch Porter Now'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRO ONBOARDING MODAL */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base">Join as Verified Specialist</h3>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardPro} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Your Name / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Wooden Crafts"
                  value={newProName}
                  onChange={(e) => setNewProName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newProPhone}
                  onChange={(e) => setNewProPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newProCategory}
                    onChange={(e) => setNewProCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="carpenter">Carpenter</option>
                    <option value="chef">Private Chef</option>
                    <option value="electrician">Electrician</option>
                    <option value="plumber">Plumber & Pump</option>
                    <option value="materials">Cement & Materials</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Base Price Rate (₹)</label>
                  <input
                    type="number"
                    value={newProRate}
                    onChange={(e) => setNewProRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Headline / Service Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Master Carpenter for Door Locks, Wardrobes & Plywood"
                  value={newProHeadline}
                  onChange={(e) => setNewProHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Key Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Inverter Wiring, MCB, Fan Installation"
                  value={newProSkills}
                  onChange={(e) => setNewProSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Operating Area</label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar / Koramangala, Bengaluru"
                  value={newProLocation}
                  onChange={(e) => setNewProLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isOnboarding}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {isOnboarding ? 'Registering...' : 'Complete Registration & Go Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketplaceServices;
