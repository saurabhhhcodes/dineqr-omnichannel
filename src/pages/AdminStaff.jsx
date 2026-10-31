// src/pages/AdminStaff.jsx - Staff Planning & Shift Scheduler (Odoo Parity)
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
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminStaff() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New shift form state
  const [employeeName, setEmployeeName] = useState('');
  const [role, setRole] = useState('Waiter / Server');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('19:00');
  const [color, setColor] = useState('#3b82f6');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, [activeRestaurant]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const res = await fetch(`/api/erp/staff-shifts?restaurant_id=${restId}`);
      const data = await res.json();
      if (data.success) {
        setShifts(data.shifts || []);
      }
    } catch (err) {
      console.error('Failed to load staff shifts:', err);
      addToast('Error loading shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          employee_name: employeeName,
          role,
          shift_date: shiftDate,
          start_time: startTime,
          end_time: endTime,
          color,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.has_conflict) {
          addToast(data.conflict_warning, 'warning');
        } else {
          addToast(`Shift assigned to ${employeeName}`);
        }
        setShowAddModal(false);
        setEmployeeName('');
        setNotes('');
        fetchShifts();
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
    if (!confirm('Are you sure you want to remove this shift?')) return;
    try {
      const res = await fetch(`/api/erp/staff-shifts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Shift removed from roster');
        fetchShifts();
      }
    } catch (err) {
      addToast('Failed to delete shift', 'error');
    }
  };

  const roles = ['ALL', 'Head Chef', 'Sous Chef', 'Waiter / Server', 'Bartender', 'Floor Manager', 'Host / Reception'];

  const filteredShifts = roleFilter === 'ALL'
    ? shifts
    : shifts.filter((s) => s.role.toLowerCase().includes(roleFilter.toLowerCase()));

  const uniqueStaff = new Set(shifts.map((s) => s.employee_name)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Staff Planning & Shift Scheduler
            </h1>
            <p className="text-xs text-slate-500">
              Schedule frontline servers, kitchen brigades, bartenders, and resolve roster shift conflicts
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Shift</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Total Scheduled Shifts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{shifts.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all roles</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Active Team Members</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{uniqueStaff} Staff</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Front & back of house</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Roster Status</div>
          <div className="text-base font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Fully Staffed</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero unassigned stations</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Conflict Checker</div>
          <div className="text-base font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Active Automated</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Overlap alerts enabled</div>
        </div>
      </div>

      {/* Role Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Role:</span>
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
            {r === 'ALL' ? 'All Roles' : r}
          </button>
        ))}
      </div>

      {/* Shifts Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400">
            <Users className="w-10 h-10 stroke-[1.5] text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700 text-sm">No shifts scheduled</p>
            <p className="text-xs text-slate-400 mt-0.5">Create your first staff roster shift above</p>
          </div>
        ) : (
          filteredShifts.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              style={{ borderLeftColor: s.color || '#3b82f6', borderLeftWidth: '5px' }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{s.employee_name}</h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-extrabold uppercase">
                      {s.role}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteShift(s.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete shift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.shift_date}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-extrabold text-blue-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{s.start_time} - {s.end_time}</span>
                    </span>
                  </div>

                  {s.notes && (
                    <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      Note: {s.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-emerald-600">● {s.status || 'SCHEDULED'}</span>
                <span>On-Premise Staff Sync</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Assign Team Shift</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Staff Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chef Marco or Priya Sharma"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role / Station *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="Head Chef">Head Chef (Kitchen Lead)</option>
                  <option value="Sous Chef">Sous Chef (Prep & Line)</option>
                  <option value="Waiter / Server">Waiter / Server (Floor)</option>
                  <option value="Bartender">Bartender (Bar Lounge)</option>
                  <option value="Floor Manager">Floor Manager (Supervisor)</option>
                  <option value="Host / Reception">Host / Reception (Seating)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Shift Date *</label>
                <input
                  type="date"
                  required
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Shift Notes</label>
                <input
                  type="text"
                  placeholder="e.g. VIP party coverage, dinner rush"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50"
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
