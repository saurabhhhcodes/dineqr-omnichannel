// src/pages/AdminFloorPlan.jsx - Interactive Visual Floor Plan & Seating Layout (Odoo Restaurant Parity)
import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Plus,
  Save,
  Users,
  Utensils,
  RefreshCw,
  Sparkles,
  DollarSign,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit2,
  Trash2,
  X,
  Circle,
  Square,
  QrCode,
  Layers,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminFloorPlan() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [floorTables, setFloorTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedTable, setSelectedTable] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add / Edit form fields
  const [formTableNumber, setFormTableNumber] = useState('');
  const [formSection, setFormSection] = useState('Main Dining');
  const [formCapacity, setFormCapacity] = useState(4);
  const [formShape, setFormShape] = useState('circle');
  const [formWidth, setFormWidth] = useState(90);
  const [formHeight, setFormHeight] = useState(90);

  // Dragging state
  const canvasRef = useRef(null);
  const [draggingTableId, setDraggingTableId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchFloorPlan();
  }, [activeRestaurant]);

  const fetchFloorPlan = async () => {
    setLoading(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const res = await fetch(`/api/erp/floor-plan?restaurant_id=${restId}`);
      const data = await res.json();
      if (data.success) {
        setFloorTables(data.floor_tables || []);
        setHasUnsavedChanges(false);
        if (selectedTable) {
          const found = data.floor_tables.find((t) => t.id === selectedTable.id);
          setSelectedTable(found || null);
        }
      }
    } catch (err) {
      console.error('Failed to load floor plan:', err);
      addToast('Error loading floor plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sections = ['ALL', ...new Set(floorTables.map((t) => t.section).filter(Boolean))];

  const filteredTables = selectedSection === 'ALL'
    ? floorTables
    : floorTables.filter((t) => t.section === selectedSection);

  // Mouse drag handlers
  const handleMouseDown = (e, table) => {
    e.stopPropagation();
    setSelectedTable(table);
    setDraggingTableId(table.id);

    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - canvasRect.left - table.pos_x,
      y: e.clientY - canvasRect.top - table.pos_y,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingTableId || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(canvasRect.width - 120, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(canvasRect.height - 120, e.clientY - canvasRect.top - dragOffset.y));

    // Snap to 10px grid
    const snappedX = Math.round(newX / 10) * 10;
    const snappedY = Math.round(newY / 10) * 10;

    setFloorTables((prev) =>
      prev.map((t) => (t.id === draggingTableId ? { ...t, pos_x: snappedX, pos_y: snappedY } : t))
    );
    setHasUnsavedChanges(true);
  };

  const handleMouseUp = () => {
    setDraggingTableId(null);
  };

  // Save batch layout coordinates
  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      const payload = {
        updates: floorTables.map((t) => ({
          id: t.id,
          pos_x: t.pos_x,
          pos_y: t.pos_y,
          shape: t.shape,
          width: t.width,
          height: t.height,
        })),
      };

      const res = await fetch('/api/erp/floor-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast('Floor plan layout saved successfully!');
        setHasUnsavedChanges(false);
      } else {
        addToast(data.error || 'Failed to save layout', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new table handler
  const handleOpenAddModal = () => {
    const nextNum = floorTables.length + 1;
    setFormTableNumber(`T-${nextNum < 10 ? '0' + nextNum : nextNum}`);
    setFormSection(sections[1] || 'Main Dining');
    setFormCapacity(4);
    setFormShape('circle');
    setFormWidth(90);
    setFormHeight(90);
    setShowAddModal(true);
  };

  const handleAddTableSubmit = async (e) => {
    e.preventDefault();
    if (!formTableNumber.trim()) {
      addToast('Table number is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find a free spot on the canvas
      const existingCount = floorTables.length;
      const col = existingCount % 4;
      const row = Math.floor(existingCount / 4);
      const posX = 40 + col * 140;
      const posY = 40 + row * 140;

      const res = await fetch('/api/erp/floor-plan/table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant?.id || 'rest_losteria',
          table_number: formTableNumber.trim(),
          name: `Table ${formTableNumber.trim()}`,
          section: formSection.trim() || 'Main Dining',
          capacity: parseInt(formCapacity) || 4,
          shape: formShape,
          width: parseInt(formWidth) || 90,
          height: parseInt(formHeight) || 90,
          pos_x: posX,
          pos_y: posY,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Table ${formTableNumber} added to floor plan!`, 'success');
        setShowAddModal(false);
        fetchFloorPlan();
      } else {
        addToast(data.error || 'Failed to add table', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit table handler
  const handleOpenEditModal = (table) => {
    setSelectedTable(table);
    setFormTableNumber(table.table_number || '');
    setFormSection(table.section || 'Main Dining');
    setFormCapacity(table.capacity || 4);
    setFormShape(table.shape || 'circle');
    setFormWidth(table.width || 90);
    setFormHeight(table.height || 90);
    setShowEditModal(true);
  };

  const handleEditTableSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/erp/floor-plan/table/${selectedTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: formTableNumber.trim(),
          name: `Table ${formTableNumber.trim()}`,
          section: formSection.trim(),
          capacity: parseInt(formCapacity) || 4,
          shape: formShape,
          width: parseInt(formWidth) || (formShape === 'circle' ? 90 : 110),
          height: parseInt(formHeight) || 90,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Table ${formTableNumber} updated!`, 'success');
        setShowEditModal(false);
        fetchFloorPlan();
      } else {
        addToast(data.error || 'Failed to update table', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete table handler
  const handleDeleteTable = async (table) => {
    if (!window.confirm(`Are you sure you want to remove ${table.table_number || 'this table'} from the floor plan?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/erp/floor-plan/table/${table.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Table ${table.table_number} removed.`);
        setSelectedTable(null);
        fetchFloorPlan();
      } else {
        addToast(data.error || 'Failed to remove table', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const totalSeats = floorTables.reduce((acc, t) => acc + (t.capacity || 2), 0);
  const activeTablesCount = floorTables.filter((t) => t.active_orders > 0).length;
  const totalFloorRevenue = floorTables.reduce((acc, t) => acc + (t.active_bill_total || 0), 0);

  return (
    <div
      className="space-y-6 select-none animate-in fade-in duration-300"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Visual Floor Plan & Seating Layout
              </h1>
              <p className="text-xs text-slate-500">
                Add, edit, drag, and configure dining tables. Monitor live guest tabs in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasUnsavedChanges && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved drag edits
            </span>
          )}

          <button
            onClick={fetchFloorPlan}
            disabled={loading}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Reload floor plan"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Table Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Table</span>
          </button>

          {/* Save Layout Button */}
          <button
            onClick={handleSaveLayout}
            disabled={isSaving || !hasUnsavedChanges}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
              hasUnsavedChanges
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Floor Layout'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Total Floor Tables</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{floorTables.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{totalSeats} guest capacity</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Occupied / Active</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{activeTablesCount} Tables</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {floorTables.length > 0 ? Math.round((activeTablesCount / floorTables.length) * 100) : 0}% occupancy
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Active Floor Billing</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{totalFloorRevenue}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unsettled live dining tabs</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Floor Mode</div>
          <div className="text-base font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Interactive Grid</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Snap to 10px alignment</div>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Section:</span>
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedSection === sec
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {sec === 'ALL' ? 'All Sections' : sec}
          </button>
        ))}
      </div>

      {/* Visual Floor Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-[600px] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Floor Canvas HUD Overlays */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Click to inspect & edit · Drag to position tables</span>
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Active Order</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block ml-2" />
            <span>Vacant</span>
          </div>
        </div>

        {/* Tables Layer */}
        {filteredTables.map((table) => {
          const isOccupied = table.active_orders > 0;
          const isSelected = selectedTable?.id === table.id;
          const isCircle = table.shape === 'circle';

          return (
            <div
              key={table.id}
              onMouseDown={(e) => handleMouseDown(e, table)}
              style={{
                left: `${table.pos_x}px`,
                top: `${table.pos_y}px`,
                width: `${table.width || (isCircle ? 90 : 110)}px`,
                height: `${table.height || 90}px`,
              }}
              className={`absolute cursor-move select-none flex flex-col items-center justify-center p-2 text-center transition-all shadow-lg ${
                isCircle ? 'rounded-full' : 'rounded-2xl'
              } ${
                isOccupied
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-2 border-amber-300 ring-4 ring-amber-500/20 shadow-amber-500/30'
                  : 'bg-slate-800 text-white border-2 border-slate-700 hover:border-slate-500'
              } ${isSelected ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-105 z-20' : 'z-10'}`}
            >
              <span className="text-xs font-black tracking-tight uppercase">
                {table.table_number || table.table_name}
              </span>

              <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5">
                <Users className="w-3 h-3" />
                <span className="font-bold">{table.capacity}p</span>
              </div>

              {isOccupied ? (
                <div className="mt-1 px-1.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[9px] font-extrabold tracking-wide truncate max-w-full">
                  ₹{table.active_bill_total || 0}
                </div>
              ) : (
                <div className="mt-1 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                  Vacant
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Table Inspector Details */}
      {selectedTable && (
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex items-center justify-center font-black text-lg ${
              selectedTable.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            } ${selectedTable.active_orders > 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'}`}>
              {selectedTable.table_number}
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span>{selectedTable.table_name || `Table ${selectedTable.table_number}`}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                  {selectedTable.shape || 'circle'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Section: <strong className="text-slate-700">{selectedTable.section}</strong> · Capacity: {selectedTable.capacity} guests · Position: ({selectedTable.pos_x}px, {selectedTable.pos_y}px)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {selectedTable.active_orders > 0 ? (
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                Active Tab: ₹{selectedTable.active_bill_total || 0} ({selectedTable.active_orders} orders)
              </div>
            ) : (
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                Ready for Seating
              </span>
            )}

            {/* Edit Table Button */}
            <button
              onClick={() => handleOpenEditModal(selectedTable)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Details</span>
            </button>

            {/* Delete Table Button */}
            <button
              onClick={() => handleDeleteTable(selectedTable)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
              title="Delete table from floor plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Live QR Link */}
            <a
              href={`/menu?restaurant=${activeRestaurant?.id || 'rest_losteria'}&table=${selectedTable.table_id}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Open QR Menu</span>
            </a>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW TABLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Add New Dining Table</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTableSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Table Number / Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T-12, Table 5, Rooftop Bar"
                  value={formTableNumber}
                  maxLength={15}
                  onChange={(e) => setFormTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Floor Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Dining, Patio"
                    value={formSection}
                    maxLength={25}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seats / Capacity
                  </label>
                  <select
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 font-bold bg-white cursor-pointer"
                  >
                    {[2, 4, 6, 8, 10, 12, 16].map((c) => (
                      <option key={c} value={c}>{c} Guests ({c}p)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Visual Shape
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormShape('circle');
                      setFormWidth(90);
                      setFormHeight(90);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                      formShape === 'circle'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Circle className="w-4 h-4 text-amber-500" />
                    <span>Round Circle (90px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormShape('rect');
                      setFormWidth(110);
                      setFormHeight(85);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                      formShape === 'rect'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Square className="w-4 h-4 text-amber-500" />
                    <span>Rectangle (110x85)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Floor Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXISTING TABLE */}
      {showEditModal && selectedTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Edit Table: {selectedTable.table_number}
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTableSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Table Number / Label *
                </label>
                <input
                  type="text"
                  required
                  value={formTableNumber}
                  maxLength={15}
                  onChange={(e) => setFormTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Floor Section
                  </label>
                  <input
                    type="text"
                    value={formSection}
                    maxLength={25}
                    onChange={(e) => setFormSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seats / Capacity
                  </label>
                  <select
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-500 font-bold bg-white cursor-pointer"
                  >
                    {[2, 4, 6, 8, 10, 12, 16].map((c) => (
                      <option key={c} value={c}>{c} Guests ({c}p)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Visual Shape
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormShape('circle');
                      setFormWidth(90);
                      setFormHeight(90);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                      formShape === 'circle'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Circle className="w-4 h-4 text-amber-500" />
                    <span>Round Circle (90px)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormShape('rect');
                      setFormWidth(110);
                      setFormHeight(85);
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                      formShape === 'rect'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Square className="w-4 h-4 text-amber-500" />
                    <span>Rectangle (110x85)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    handleDeleteTable(selectedTable);
                  }}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Update Table'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFloorPlan;
