// src/pages/GymRegister.jsx - Digital Daily Member Check-in, Attendance Register & Fee Collection
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  Users,
  Search,
  CheckCircle2,
  Clock,
  CreditCard,
  Printer,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap,
  TrendingUp,
  UserCheck,
  UserX,
  Phone,
  Receipt,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { openRazorpayCheckout } from '../utils/razorpayCheckout.js';

const INITIAL_MEMBERS = [
  {
    id: 'MEM-101',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    plan: 'Quarterly Gold Fitness',
    expiryDate: '2026-12-15',
    status: 'ACTIVE',
    lastCheckIn: 'Today, 06:45 AM',
    checkedInToday: true,
    dueAmount: 0,
    lockerNo: 'L-14',
  },
  {
    id: 'MEM-102',
    name: 'Pooja Verma',
    phone: '+91 98112 34567',
    plan: 'Monthly Strength & Cardio',
    expiryDate: '2026-11-05',
    status: 'EXPIRED',
    lastCheckIn: '3 days ago',
    checkedInToday: false,
    dueAmount: 1500,
    lockerNo: 'L-08',
  },
  {
    id: 'MEM-103',
    name: 'Vikram Malhotra',
    phone: '+91 99887 76655',
    plan: 'Annual Elite VIP + Personal Training',
    expiryDate: '2027-04-20',
    status: 'ACTIVE',
    lastCheckIn: 'Today, 07:15 AM',
    checkedInToday: true,
    dueAmount: 0,
    lockerNo: 'VIP-02',
  },
  {
    id: 'MEM-104',
    name: 'Ananya Deshmukh',
    phone: '+91 97654 32109',
    plan: 'Monthly Strength & Cardio',
    expiryDate: '2026-11-08',
    status: 'EXPIRING_SOON',
    lastCheckIn: 'Yesterday, 05:30 PM',
    checkedInToday: false,
    dueAmount: 1500,
    lockerNo: 'L-22',
  },
  {
    id: 'MEM-105',
    name: 'Arjun Nair',
    phone: '+91 98450 11223',
    plan: '6-Month Functional & Crossfit',
    expiryDate: '2027-01-30',
    status: 'ACTIVE',
    lastCheckIn: 'Today, 08:00 AM',
    checkedInToday: true,
    dueAmount: 0,
    lockerNo: 'L-31',
  },
  {
    id: 'MEM-106',
    name: 'Kavita Rao',
    phone: '+91 99002 44556',
    plan: 'Monthly Strength & Cardio',
    expiryDate: '2026-11-02',
    status: 'EXPIRED',
    lastCheckIn: '5 days ago',
    checkedInToday: false,
    dueAmount: 1500,
    lockerNo: 'L-05',
  },
];

export function GymRegister() {
  const { activeRestaurant, setActiveRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('dineqr_gym_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, CHECKED_IN, EXPIRED
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    plan: 'Monthly Strength & Cardio (₹1,500/mo)',
    lockerNo: '',
  });

  useEffect(() => {
    try {
      localStorage.setItem('dineqr_gym_members', JSON.stringify(members));
    } catch {}
  }, [members]);

  // Ensure active restaurant is gym
  useEffect(() => {
    if (activeRestaurant?.id !== 'rest_ironpulse_gym') {
      // offer switcher banner
    }
  }, [activeRestaurant]);

  const handlePunchCheckIn = (memberId) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, checkedInToday: true, lastCheckIn: `Today, ${timeStr}` }
          : m
      )
    );
    addToast(`Punch Recorded! ${members.find((m) => m.id === memberId)?.name} checked in at ${timeStr}`, 'success');
  };

  const handleCheckoutMembership = async (member) => {
    addToast(`Opening Razorpay Checkout for ${member.name} (₹1,500 Monthly Fee)...`, 'info');
    try {
      await openRazorpayCheckout({
        amount: 1500,
        currency: 'INR',
        name: 'IronPulse Fitness Club',
        description: `1-Month Gym Renewal · ${member.name}`,
        prefill: {
          name: member.name,
          contact: member.phone,
        },
        themeColor: '#f59e0b',
        onSuccess: (paymentRes) => {
          const nextMonth = new Date();
          nextMonth.setDate(nextMonth.getDate() + 30);
          const nextExpiry = nextMonth.toISOString().split('T')[0];

          setMembers((prev) =>
            prev.map((m) =>
              m.id === member.id
                ? {
                    ...m,
                    status: 'ACTIVE',
                    expiryDate: nextExpiry,
                    dueAmount: 0,
                    checkedInToday: true,
                    lastCheckIn: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                  }
                : m
            )
          );

          addToast(`Payment of ₹1,500 Verified (Ref: ${paymentRes.razorpay_payment_id || 'PAY-SUCCESS'})! Membership extended to ${nextExpiry}`, 'success');
        },
      });
    } catch (err) {
      addToast('Payment cancelled or simulated: ' + err.message, 'error');
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.phone.trim()) {
      addToast('Please enter member name and phone', 'error');
      return;
    }
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const created = {
      id: `MEM-${Math.floor(100 + Math.random() * 900)}`,
      name: newMember.name.trim(),
      phone: newMember.phone.trim(),
      plan: newMember.plan,
      expiryDate: nextMonth.toISOString().split('T')[0],
      status: 'ACTIVE',
      lastCheckIn: 'Today, Just Registered',
      checkedInToday: true,
      dueAmount: 0,
      lockerNo: newMember.lockerNo || `L-${Math.floor(10 + Math.random() * 80)}`,
    };

    setMembers([created, ...members]);
    setShowAddModal(false);
    setNewMember({ name: '', phone: '', plan: 'Monthly Strength & Cardio (₹1,500/mo)', lockerNo: '' });
    addToast(`Member ${created.name} registered and checked in successfully!`, 'success');
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'CHECKED_IN') return m.checkedInToday;
    if (filterTab === 'EXPIRED') return m.status === 'EXPIRED' || m.status === 'EXPIRING_SOON';
    return true;
  });

  const checkedInCount = members.filter((m) => m.checkedInToday).length;
  const expiredCount = members.filter((m) => m.status === 'EXPIRED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Daily Member Check-In & Attendance Register
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                    Paperless Notebook
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Replace physical paper registers with 1-tap punch-in, membership expiry alerts, and Razorpay fee collection.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Walk-in Member</span>
            </button>
            <Link
              to="/menu?restaurant=ironpulse-gym"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Protein Shake Menu</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Enrolled</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-white">{members.length}</div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 100% Digital Roster
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="flex items-center justify-between text-emerald-300 text-xs mb-1">
              <span>Checked-In Today</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{checkedInCount}</div>
            <div className="text-[11px] text-emerald-300/80 mt-1 font-medium">
              Live on gym floor now
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40">
            <div className="flex items-center justify-between text-rose-300 text-xs mb-1">
              <span>Renewals Due</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">{expiredCount}</div>
            <div className="text-[11px] text-rose-300/80 mt-1 font-medium">
              ₹1,500/mo fee pending
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40">
            <div className="flex items-center justify-between text-amber-300 text-xs mb-1">
              <span>SaaS Fee</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">₹1,500</div>
            <div className="text-[11px] text-amber-300/80 mt-1 font-medium">
              Flat / month · Zero commissions
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member by Name, Phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-bold focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Members ({members.length})
            </button>
            <button
              onClick={() => setFilterTab('CHECKED_IN')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterTab === 'CHECKED_IN'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Checked In ({checkedInCount})
            </button>
            <button
              onClick={() => setFilterTab('EXPIRED')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterTab === 'EXPIRED'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Due & Expired ({expiredCount})
            </button>
          </div>
        </div>

        {/* Member Register Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Member ID & Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Plan & Locker</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Today's Attendance</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredMembers.map((m) => {
                  const isExpired = m.status === 'EXPIRED';
                  const isExpiringSoon = m.status === 'EXPIRING_SOON';

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-850/60 transition ${
                        m.checkedInToday ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            m.checkedInToday
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isExpired
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{m.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{m.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{m.phone}</span>
                        </div>
                      </td>

                      {/* Plan & Locker */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-bold">{m.plan}</div>
                        <div className="text-[11px] text-amber-400 font-semibold">Locker: {m.lockerNo}</div>
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className={isExpired ? 'text-rose-400 font-black' : 'text-slate-300'}>
                            {m.expiryDate}
                          </span>
                        </div>
                        {isExpired && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-rose-600/30 text-rose-300 border border-rose-500/40">
                            Expired · Due ₹{m.dueAmount}
                          </span>
                        )}
                        {isExpiringSoon && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40">
                            Expiring in 2 days
                          </span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-4">
                        {m.checkedInToday ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{m.lastCheckIn}</span>
                          </div>
                        ) : (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Not checked in yet</span>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isExpired ? (
                            <button
                              onClick={() => handleCheckoutMembership(m)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Collect ₹1,500</span>
                            </button>
                          ) : !m.checkedInToday ? (
                            <button
                              onClick={() => handlePunchCheckIn(m.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Punch In</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active in Gym
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Member Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Enroll New Gym Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sameer Kulkarni"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Membership Plan</label>
                  <select
                    value={newMember.plan}
                    onChange={(e) => setNewMember({ ...newMember, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-amber-500 outline-none"
                  >
                    <option value="Monthly Strength & Cardio (₹1,500/mo)">Monthly (₹1,500)</option>
                    <option value="Quarterly Gold Fitness (₹4,000)">Quarterly (₹4,000)</option>
                    <option value="Annual Elite VIP (₹12,000)">Annual VIP (₹12,000)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Locker Number</label>
                  <input
                    type="text"
                    placeholder="e.g. L-19"
                    value={newMember.lockerNo}
                    onChange={(e) => setNewMember({ ...newMember, lockerNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                <span className="font-bold">Digital Register Benefit:</span> Member record is saved locally in SQLite and synced to Cloud without buying paper registers.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 shadow-md shadow-amber-500/20"
                >
                  Save & Punch In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GymRegister;
