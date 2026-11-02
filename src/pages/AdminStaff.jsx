// src/pages/AdminStaff.jsx - Staff Planning & Live Duty Attendance Tracker (Odoo Parity)
import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Calendar,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Shield,
  Coffee,
  Sparkles,
  UserCheck,
  Activity,
  LogOut,
  Edit2,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminStaff() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('duty'); // 'duty' | 'roster'
  const [shifts, setShifts] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [activeStaff, setActiveStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [showAddShiftModal, setShowAddShiftModal] = useState(false);
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [showUpdateActivityModal, setShowUpdateActivityModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New shift form state
  const [employeeName, setEmployeeName] = useState('');
  const [role, setRole] = useState('Waiter / Server');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('19:00');
  const [color, setColor] = useState('#3b82f6');
  const [notes, setNotes] = useState('');

  // Clock-in form state
  const [clockInName, setClockInName] = useState('');
  const [clockInPin, setClockInPin] = useState('1234');
  const [clockInRole, setClockInRole] = useState('Waiter / Server');
  const [clockInActivity, setClockInActivity] = useState('Table Service (Section A)');
  const [clockInNotes, setClockInNotes] = useState('');

  // Update Activity state
  const [newActivity, setNewActivity] = useState('');
  const [activityStatus, setActivityStatus] = useState('ON_DUTY');

  const dutyActivities = [
    'Morning Kitchen Prep & Stocking',
    'Table Service (Section A)',
    'Table Service (Section B)',
    'POS Billing Counter & Cash Register',
    'Espresso Machine & Beverage Bar',
    'Head Chef Wood-Fired Oven Line',
    'Floor Captain & Guest Seating',
    'Cleaning, Dishwashing & Sanitization',
    'On Break / Lunch Period',
  ];

  useEffect(() => {
    fetchStaffData();
  }, [activeRestaurant]);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const [shiftsRes, attRes] = await Promise.all([
        fetch(`/api/erp/staff-shifts?restaurant_id=${restId}`),
        fetch(`/api/erp/staff-attendance?restaurant_id=${restId}`),
      ]);

      const shiftsData = await shiftsRes.json();
      const attData = await attRes.json();

      if (shiftsData.success) setShifts(shiftsData.shifts || []);
      if (attData.success) {
        setAttendanceLogs(attData.attendance_logs || []);
        setActiveStaff(attData.active_staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clock In handler
  const handleClockInSubmit = async (e) => {
    e.preventDefault();
    if (!clockInName.trim()) {
      addToast('Employee name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/erp/staff-attendance/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant?.id || 'rest_losteria',
          employee_name: clockInName.trim(),
          staff_pin: clockInPin.trim(),
          role: clockInRole,
          current_activity: clockInActivity,
          notes: clockInNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`${clockInName} clocked in for "${clockInActivity}"`, 'success');
        setShowClockInModal(false);
        setClockInName('');
        setClockInNotes('');
        fetchStaffData();
      } else {
        addToast(data.error || 'Failed to clock in', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Activity handler
  const handleUpdateActivitySubmit = async (e) => {
    e.preventDefault();
    if (!selectedAttendance) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/erp/staff-attendance/${selectedAttendance.id}/activity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_activity: newActivity,
          status: activityStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`${selectedAttendance.employee_name}'s activity updated to "${newActivity}"`, 'success');
        setShowUpdateActivityModal(false);
        fetchStaffData();
      } else {
        addToast(data.error || 'Failed to update activity', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clock Out handler
  const handleClockOut = async (att) => {
    if (!window.confirm(`Clock out ${att.employee_name} from duty?`)) return;

    try {
      const res = await fetch('/api/erp/staff-attendance/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: att.id,
          employee_name: att.employee_name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`${att.employee_name} clocked out successfully`);
        fetchStaffData();
      } else {
        addToast(data.error || 'Failed to clock out', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Create Shift handler
  const handleCreateShift = async (e) => {
    e.preventDefault();
    if (!employeeName || !role || !shiftDate || !startTime || !endTime) {
      addToast('Please fill all required shift fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/erp/staff-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant?.id || 'rest_losteria',
          employee_name: employeeName.trim(),
          role,
          shift_date: shiftDate,
          start_time: startTime,
          end_time: endTime,
          color,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.has_conflict) {
          addToast(data.conflict_warning, 'warning');
        } else {
          addToast(`Shift assigned to ${employeeName}`);
        }
        setShowAddShiftModal(false);
        setEmployeeName('');
        setNotes('');
        fetchStaffData();
      } else {
        addToast(data.error || 'Failed to schedule shift', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm('Are you sure you want to remove this shift?')) return;
    try {
      const res = await fetch(`/api/erp/staff-shifts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Shift removed from roster');
        fetchStaffData();
      }
    } catch (err) {
      addToast('Failed to delete shift', 'error');
    }
  };

  const roles = ['ALL', 'Head Chef', 'Sous Chef', 'Waiter / Server', 'Bartender', 'Floor Manager', 'Host / Reception'];
  const filteredShifts = roleFilter === 'ALL' ? shifts : shifts.filter((s) => s.role.includes(roleFilter));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Staff Operations & Live Duty Tracker
              </h1>
              <p className="text-xs text-slate-500">
                Track who is at the restaurant, record their active duty station, and schedule future shifts.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('duty')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'duty'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Duty ({activeStaff.length} On Duty)</span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Shift Roster ({shifts.length})</span>
            </button>
          </div>

          {activeTab === 'duty' ? (
            <button
              onClick={() => setShowClockInModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-600/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Clock-In Arrived Staff</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddShiftModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Shift</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: LIVE DUTY & CLOCK-IN TRACKER */}
      {activeTab === 'duty' && (
        <div className="space-y-6">
          {/* Active On-Duty Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Staff On Floor Right Now ({activeStaff.length})</span>
              </h2>
              <span className="text-xs text-slate-400">Real-time attendance & duties</span>
            </div>

            {activeStaff.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No Staff Clocked In Yet Today</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When employees arrive at the restaurant, click "Clock-In Arrived Staff" to log their arrival time and starting duty station.
                </p>
                <button
                  onClick={() => setShowClockInModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Clock In First Employee</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                            {staff.employee_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-slate-900">{staff.employee_name}</div>
                            <div className="text-[11px] text-slate-500 font-semibold">{staff.role}</div>
                          </div>
                        </div>

                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ON DUTY
                        </span>
                      </div>

                      {/* Current Activity Box */}
                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 mb-3 space-y-1">
                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          Current Assigned Activity
                        </div>
                        <div className="font-black text-xs text-amber-950">
                          {staff.current_activity}
                        </div>
                        {staff.notes && (
                          <div className="text-[10px] text-amber-800 italic">{staff.notes}</div>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Arrived at: {new Date(staff.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedAttendance(staff);
                          setNewActivity(staff.current_activity);
                          setActivityStatus(staff.status);
                          setShowUpdateActivityModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-600" />
                        <span>Change Duty</span>
                      </button>

                      <button
                        onClick={() => handleClockOut(staff)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Clock Out</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Attendance Ledger */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Today's Attendance & Duty Audit Log
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Staff Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Arrived (Clock-In)</th>
                    <th className="py-2.5 px-3">Departed (Clock-Out)</th>
                    <th className="py-2.5 px-3">Logged Activity</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                        No attendance history recorded yet today.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{log.employee_name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{log.role}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                          {new Date(log.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                          {log.clock_out_time ? new Date(log.clock_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{log.current_activity}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.status === 'ON_DUTY'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {log.status === 'ON_DUTY' ? 'Active On Floor' : 'Shift Complete'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROSTER & SHIFT PLANNING */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Role Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Role:</span>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Shifts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredShifts.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-extrabold text-sm text-slate-900">{s.employee_name}</div>
                    <button
                      onClick={() => handleDeleteShift(s.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-blue-600 mb-3">{s.role}</div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.shift_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.start_time} - {s.end_time}</span>
                    </div>
                  </div>

                  {s.notes && (
                    <p className="mt-3 text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                      {s.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CLOCK-IN STAFF */}
      {showClockInModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Clock-In Arrived Staff</h3>
              </div>
              <button
                onClick={() => setShowClockInModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClockInSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={clockInName}
                  maxLength={50}
                  onChange={(e) => setClockInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={clockInRole}
                    onChange={(e) => setClockInRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Waiter / Server">Waiter / Server</option>
                    <option value="Head Chef">Head Chef</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Cashier / Billing">Cashier / Billing</option>
                    <option value="Floor Manager">Floor Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={clockInPin}
                    onChange={(e) => setClockInPin(e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-center tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Starting Duty Station / Activity *
                </label>
                <select
                  value={clockInActivity}
                  onChange={(e) => setClockInActivity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white cursor-pointer"
                >
                  {dutyActivities.map((act) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duty Station Notes (Optional)
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Assigned to Tables 1-6"
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClockInModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition shadow-md shadow-blue-600/20"
                >
                  {isSubmitting ? 'Clocking In...' : 'Clock In to Duty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE ACTIVITY */}
      {showUpdateActivityModal && selectedAttendance && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Update Duty: {selectedAttendance.employee_name}
                </h3>
              </div>
              <button
                onClick={() => setShowUpdateActivityModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateActivitySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Current Duty Station
                </label>
                <select
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white cursor-pointer"
                >
                  {dutyActivities.map((act) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duty Status
                </label>
                <select
                  value={activityStatus}
                  onChange={(e) => setActivityStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                >
                  <option value="ON_DUTY">On Duty (Active on Floor)</option>
                  <option value="ON_BREAK">On Break (Lunch / Rest Period)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateActivityModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20"
                >
                  {isSubmitting ? 'Updating...' : 'Save Updated Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROSTER SHIFT */}
      {showAddShiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Schedule Staff Shift</h3>
              </div>
              <button
                onClick={() => setShowAddShiftModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employee Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Rossi"
                  value={employeeName}
                  maxLength={50}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Waiter / Server">Waiter / Server</option>
                    <option value="Head Chef">Head Chef</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Bartender">Bartender</option>
                    <option value="Floor Manager">Floor Manager</option>
                    <option value="Host / Reception">Host / Reception</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shift Date
                  </label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddShiftModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition shadow-md"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaff;
