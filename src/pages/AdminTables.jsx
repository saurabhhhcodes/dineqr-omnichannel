// src/pages/AdminTables.jsx - Table management & instant QR code generator
import React, { useState, useEffect } from 'react';
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

  // Add Table Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newSection, setNewSection] = useState('Main Dining');
  const [newCapacity, setNewCapacity] = useState('4');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Placard Modal
  const [selectedPlacardTable, setSelectedPlacardTable] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

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
      addToast('Please enter table number', 'error');
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
          capacity: parseInt(newCapacity, 10),
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Table ${data.table.table_number} added with QR generated!`);
        setShowAddModal(false);
        setNewTableNumber('');
        setNewTableName('');
        fetchTables();
      } else {
        addToast(data.error || 'Failed to add table', 'error');
      }
    } catch (err) {
      addToast('Error adding table: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (table) => {
    if (!confirm(`Delete ${table.table_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tables/${table.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(`Table ${table.table_number} deleted`);
        fetchTables();
      } else {
        addToast(data.error || 'Failed to delete table', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                Table QR Suite
              </span>
              <span className="text-xs text-slate-500">· Instant Placard Generator</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Dining Tables & QR Code Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create dining tables, generate high-resolution QR codes, and download or print ready-made table stand placards for your restaurant.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* IP toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-bold border border-slate-200">
              <button
                onClick={() => setUseLanIp(false)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  !useLanIp ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Localhost
              </button>
              <button
                onClick={() => setUseLanIp(true)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  useLanIp ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Encode Wi-Fi IP ${localIp} into QR codes`}
              >
                <span>Phone Scan ({localIp})</span>
              </button>
            </div>

            <button
              onClick={fetchTables}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Refresh tables"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Table</span>
            </button>
          </div>
        </div>

        {/* Table Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-600 rounded-full animate-spin inline-block mb-3"></span>
            <p className="text-xs font-bold text-slate-600">Loading tables & QR codes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tables.map((tbl) => {
              const isOccupied = tbl.active_orders_count > 0;

              return (
                <div
                  key={tbl.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
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
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOccupied ? `${tbl.active_orders_count} Active Order` : 'Available'}
                      </span>
                    </div>

                    {/* Capacity & Info */}
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {tbl.capacity} Pax
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400 truncate">
                        ID: {tbl.id.substring(0, 8)}
                      </span>
                    </div>

                    {/* Mini QR Preview Thumbnail */}
                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                          <img
                            src={`/api/tables/${tbl.id}/qr?size=150&format=image`}
                            alt={`QR for ${tbl.table_number}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-1.5 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-amber-600" />
                          Scannable QR
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => handleOpenPlacard(tbl)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>View & Print Table Placard</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={tbl.menu_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <span>Test Menu</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      <button
                        onClick={() => handleDeleteTable(tbl)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add Dining Table</h3>
                <p className="text-xs text-slate-500">Automatically creates instant scannable QR</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Table Number / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 09, Patio 3, VIP Lounge"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Section / Dining Area
                </label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                >
                  <option value="Main Dining">Main Dining</option>
                  <option value="Terrace Garden">Terrace Garden</option>
                  <option value="Lounge & Bar">Lounge & Bar</option>
                  <option value="Rooftop Patio">Rooftop Patio</option>
                  <option value="Private Dining">Private Dining</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Table...' : 'Generate Table & QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Placard Modal */}
      {selectedPlacardTable && (
        <TablePlacard
          table={selectedPlacardTable}
          restaurant={activeRestaurant}
          qrDataUrl={qrDataUrl}
          targetUrl={selectedPlacardTable.menu_url}
          onClose={() => setSelectedPlacardTable(null)}
        />
      )}
    </div>
  );
}
