// src/pages/AdminTables.jsx - Table management & instant QR code generator
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Plus,
  Trash2,
  ExternalLink,
  Printer,
  Download,
  Users,
  Utensils,
  Eye,
  CheckCircle2,
  RefreshCw,
  X,
  Calendar,
  Lock,
  Globe,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { TablePlacard } from '../components/TablePlacard.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export function AdminTables() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localIp, setLocalIp] = useState('localhost');
  const [useLanIp, setUseLanIp] = useState(false);

  // Quick Table Reservation State
  const [reserveModalTable, setReserveModalTable] = useState(null);
  const [reserveForm, setReserveForm] = useState({
    guest_name: '',
    phone: '',
    pax: '4',
    time: '20:00',
    notes: 'Table requested via Host Desk',
  });
  const [reservedTables, setReservedTables] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dineqr_reserved_tables') || '{}');
    } catch {
      return {};
    }
  });

  // Add Table Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newSection, setNewSection] = useState('Main Area');
  const [newCapacity, setNewCapacity] = useState('4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Placard Modal
  const [selectedPlacardTable, setSelectedPlacardTable] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Niche Terminology Helpers
  const bType = activeRestaurant?.business_type || 'restaurant';
  const unitLabel = bType === 'gym' ? 'Workout Bay' : bType === 'clinic' ? 'Chamber' : bType === 'salon' ? 'Stylist Chair' : 'Dining Table';
  const suiteTitle = bType === 'gym'
    ? 'Gym Workstation Bays & Locker QR Codes'
    : bType === 'clinic'
    ? 'Consultation Chambers & OPD Kiosks'
    : bType === 'salon'
    ? 'Stylist Chairs & Spa Stations'
    : 'Dining Tables & QR Code Generator';
  const suiteSubtitle = bType === 'gym'
    ? 'Manage gym equipment bays, workout stations, and nutrition counter QR placards.'
    : bType === 'clinic'
    ? 'Manage doctor consultation chambers, patient token kiosks, and pharmacy QR stands.'
    : bType === 'salon'
    ? 'Manage hair styling stations, massage suites, and treatment chair QR placards.'
    : 'Create dining tables, generate high-resolution QR codes, and download or print ready-made table stand placards.';

  const fetchTables = () => {
    if (!activeRestaurant) return;
    setIsLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const query = useLanIp ? 'useLan=true' : (origin ? `baseUrl=${encodeURIComponent(origin)}` : '');
    fetch(`/api/tables?restaurant_id=${activeRestaurant.id}${query ? `&${query}` : ''}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.tables) {
          setTables(data.tables);
          if (data.local_ip) setLocalIp(data.local_ip);
        }
      })
      .catch((err) => addToast('Failed to load tables: ' + err.message, 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, [activeRestaurant, useLanIp]);

  const handleOpenPlacard = async (table) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const queryParam = useLanIp 
        ? '?useLan=true' 
        : (origin ? `?baseUrl=${encodeURIComponent(origin)}` : '');
      const res = await fetch(`/api/tables/${table.id}/qr${queryParam}`);
      const data = await res.json();
      if (data.success) {
        setQrDataUrl(data.qr_data_url);
        setSelectedPlacardTable({
          ...table,
          menu_url: data.target_url,
        });
      } else {
        addToast('Error generating QR: ' + data.error, 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber.trim()) {
      addToast(`Please enter ${unitLabel} number/name`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant.id,
          table_number: newTableNumber.trim(),
          name: newTableName.trim() || newTableNumber.trim(),
          section: newSection,
          capacity: parseInt(newCapacity, 10) || 4,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`${unitLabel} ${newTableNumber} created successfully!`, 'success');
        setShowAddModal(false);
        setNewTableNumber('');
        setNewTableName('');
        fetchTables();
      } else {
        addToast(data.error || 'Failed to create table', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    if (!reserveForm.guest_name.trim()) {
      addToast('Please enter guest name', 'error');
      return;
    }

    const updated = {
      ...reservedTables,
      [reserveModalTable.id]: {
        guest_name: reserveForm.guest_name.trim(),
        phone: reserveForm.phone.trim() || '+91 98765 00000',
        pax: reserveForm.pax || '4',
        time: reserveForm.time || '20:00',
        reserved_at: new Date().toISOString(),
      },
    };
    setReservedTables(updated);
    try {
      localStorage.setItem('dineqr_reserved_tables', JSON.stringify(updated));
    } catch {}

    addToast(`Table ${reserveModalTable.table_number} reserved for ${reserveForm.guest_name}!`, 'success');
    setReserveModalTable(null);
    setReserveForm({ guest_name: '', phone: '', pax: '4', time: '20:00', notes: '' });
  };

  const handleReleaseReservation = (tableId, tableNumber) => {
    const updated = { ...reservedTables };
    delete updated[tableId];
    setReservedTables(updated);
    try {
      localStorage.setItem('dineqr_reserved_tables', JSON.stringify(updated));
    } catch {}
    addToast(`${unitLabel} ${tableNumber} released and marked Available!`, 'info');
  };

  const handleDeleteTable = async (table) => {
    if (!confirm(`Delete ${table.table_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tables/${table.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(`${unitLabel} ${table.table_number} deleted`);
        fetchTables();
      } else {
        addToast(data.error || 'Failed to delete table', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const originHost = typeof window !== 'undefined' ? window.location.hostname : 'Cloud';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                {unitLabel} QR Suite
              </span>
              <span className="text-xs text-slate-500">· Instant Placard & Reservation Hub</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {suiteTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {suiteSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cloud QR vs Local LAN toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-bold border border-slate-200">
              <button
                onClick={() => setUseLanIp(false)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  !useLanIp ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Encode Cloud Live Domain into QR codes (Works on any phone worldwide)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Cloud Live ({originHost})</span>
              </button>
              <button
                onClick={() => setUseLanIp(true)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  useLanIp ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Encode local Wi-Fi IP ${localIp} for offline testing`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Wi-Fi LAN ({localIp})</span>
              </button>
            </div>

            <Link
              to="/admin/reservations"
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 transition"
              title="Open full advance table reservations calendar"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Reservations Book</span>
            </Link>

            <button
              onClick={fetchTables}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Refresh tables"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add {unitLabel}</span>
            </button>
          </div>
        </div>

        {/* Table Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-600 rounded-full animate-spin inline-block mb-3"></span>
            <p className="text-xs font-bold text-slate-600">Loading {unitLabel.toLowerCase()}s & QR codes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tables.map((tbl) => {
              const isOccupied = tbl.active_orders_count > 0;
              const reservation = reservedTables[tbl.id];
              const isReserved = !!reservation && !isOccupied;

              return (
                <div
                  key={tbl.id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isOccupied
                      ? 'border-rose-300 bg-rose-50/10'
                      : isReserved
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div>
                    {/* Header: Table Number & Status Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          {tbl.table_number}
                        </h3>
                        <p className="text-xs font-semibold text-amber-700 mt-0.5">{tbl.section}</p>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isOccupied
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : isReserved
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOccupied
                          ? `${tbl.active_orders_count} Active Order`
                          : isReserved
                          ? `Reserved (${reservation.time})`
                          : 'Available'}
                      </span>
                    </div>

                    {/* Reservation Details Banner if reserved */}
                    {isReserved && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 text-[11px] space-y-0.5">
                        <div className="font-bold flex items-center justify-between text-amber-900">
                          <span>👤 {reservation.guest_name}</span>
                          <span className="font-mono text-[10px]">{reservation.pax} Pax</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{reservation.phone}</div>
                      </div>
                    )}

                    {/* Capacity & Info */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {tbl.capacity} Pax
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400 truncate">
                        ID: {tbl.id.substring(0, 8)}
                      </span>
                    </div>

                    {/* Mini QR Preview Thumbnail */}
                    <div className="mt-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                          <img
                            src={`/api/tables/${tbl.id}/qr?size=150&format=image${useLanIp ? '&useLan=true' : ''}`}
                            alt={`QR for ${tbl.table_number}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-amber-600" />
                          <span>Scannable QR</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleOpenPlacard(tbl)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-98"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>View & Print Placard</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      {isReserved ? (
                        <button
                          onClick={() => handleReleaseReservation(tbl.id, tbl.table_number)}
                          className="py-1.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition cursor-pointer"
                        >
                          Release Table
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setReserveModalTable(tbl);
                            setReserveForm({
                              guest_name: '',
                              phone: '',
                              pax: String(tbl.capacity || 4),
                              time: '20:00',
                              notes: '',
                            });
                          }}
                          className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>Reserve</span>
                        </button>
                      )}

                      <a
                        href={tbl.menu_url}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <span>Test Menu</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Reservation Modal */}
      {reserveModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Reserve {unitLabel} {reserveModalTable.table_number}
                  </h3>
                  <p className="text-xs text-slate-500">Fast host-desk table locking</p>
                </div>
              </div>
              <button
                onClick={() => setReserveModalTable(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReservation} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={reserveForm.guest_name}
                  onChange={(e) => setReserveForm({ ...reserveForm, guest_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={reserveForm.phone}
                    onChange={(e) => setReserveForm({ ...reserveForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reservation Time</label>
                  <input
                    type="time"
                    value={reserveForm.time}
                    onChange={(e) => setReserveForm({ ...reserveForm, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Party Size (Pax)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={reserveForm.pax}
                  onChange={(e) => setReserveForm({ ...reserveForm, pax: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReserveModalTable(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 transition cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Add New {unitLabel}</h3>
                  <p className="text-xs text-slate-500">Generate QR code stand placard</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {unitLabel} Identifier / Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder={bType === 'gym' ? 'e.g. Bay 05' : bType === 'clinic' ? 'e.g. Room 102' : 'e.g. Table 14'}
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Friendly Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Window Corner / Balcony"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor Section</label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capacity (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 transition cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : `Create ${unitLabel}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Placard Print Modal */}
      {selectedPlacardTable && qrDataUrl && (
        <TablePlacard
          table={selectedPlacardTable}
          restaurant={activeRestaurant}
          qrDataUrl={qrDataUrl}
          onClose={() => setSelectedPlacardTable(null)}
        />
      )}
    </div>
  );
}
