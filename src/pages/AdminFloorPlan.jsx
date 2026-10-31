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
                Drag and position dining tables, monitor live orders, and optimize seat capacity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasUnsavedChanges && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 animate-pulse">
              ● Unsaved drag edits
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
        className="relative w-full h-[580px] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Floor Canvas HUD Overlays */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>Click & drag any table to rearrange dining room</span>
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
                width: `${table.width || 100}px`,
                height: `${table.height || 100}px`,
              }}
              className={`absolute cursor-move select-none flex flex-col items-center justify-center p-2 text-center transition-shadow shadow-lg ${
                isCircle ? 'rounded-full' : 'rounded-2xl'
              } ${
                isOccupied
                  ? 'bg-linear-to-b from-amber-500 to-amber-600 text-slate-950 border-2 border-amber-300 ring-4 ring-amber-500/20 shadow-amber-500/30'
                  : 'bg-slate-800 text-white border-2 border-slate-700 hover:border-slate-500'
              } ${isSelected ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''}`}
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
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
              {selectedTable.table_number}
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900">
                {selectedTable.table_name || `Table ${selectedTable.table_number}`}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Section: <strong className="text-slate-700">{selectedTable.section}</strong> · Capacity: {selectedTable.capacity} guests · Position: ({selectedTable.pos_x}px, {selectedTable.pos_y}px)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedTable.active_orders > 0 ? (
              <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                Active Tab: ₹{selectedTable.active_bill_total || 0} ({selectedTable.active_orders} orders)
              </div>
            ) : (
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                Ready for Seating
              </span>
            )}
            <a
              href={`/menu?restaurant=${activeRestaurant?.id || 'rest_losteria'}&table=${selectedTable.table_id}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Open Digital QR Menu
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFloorPlan;
