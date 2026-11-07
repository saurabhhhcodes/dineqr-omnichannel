// src/pages/AdminInventory.jsx - Real-Time Inventory & Replenishment Alerts (Odoo Parity)
import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Truck,
  Sparkles,
  X,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminInventory() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState({ total_items: 0, low_stock_alerts: 0, total_inventory_value: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Raw Ingredients');
  const [currentStock, setCurrentStock] = useState('10');
  const [minReorderLevel, setMinReorderLevel] = useState('5');
  const [unit, setUnit] = useState('kg');
  const [unitCost, setUnitCost] = useState('150');
  const [supplierName, setSupplierName] = useState('Fresh Farm Wholesale');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [activeRestaurant]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const res = await fetch(`/api/erp/inventory?restaurant_id=${restId}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
      addToast('Error loading inventory items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (id, adjustment) => {
    try {
      const res = await fetch(`/api/erp/inventory/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.map((item) => (item.id === id ? data.item : item)));
        // Refresh metrics
        fetchInventory();
      }
    } catch (err) {
      addToast('Failed to update stock', 'error');
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!name) {
      addToast('Item name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/erp/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant?.id || 'rest_losteria',
          name,
          sku,
          category,
          current_stock: currentStock,
          min_reorder_level: minReorderLevel,
          unit,
          unit_cost: unitCost,
          supplier_name: supplierName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Item "${name}" added to inventory!`);
        setShowAddModal(false);
        setName('');
        setSku('');
        fetchInventory();
      } else {
        addToast(data.error || 'Failed to add item', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['ALL', ...new Set(items.map((i) => i.category).filter(Boolean))];

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.supplier_name && item.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Real-Time Inventory & Stock Manager
            </h1>
            <p className="text-xs text-slate-500">
              Track raw ingredients, automatic reorder alerts, stock valuations, and supplier orders
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Item</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Total Tracked Items</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total_items}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across pantry & bar</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Low Stock Replenish Alerts</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.low_stock_alerts} Items</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Below minimum safe level</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Total Inventory Valuation</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{metrics.total_inventory_value}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">At current unit cost</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400">Storage Valuation Method</div>
          <div className="text-base font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>FIFO / Weighted Avg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Odoo accounting parity</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ingredient, SKU, or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Item & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Reorder Level</th>
                <th className="py-3.5 px-4">Unit Cost</th>
                <th className="py-3.5 px-4">Total Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 stroke-[1.5] text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No inventory items found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Add raw materials and stock above</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.current_stock <= item.min_reorder_level;
                  const isOut = item.current_stock <= 0;
                  const totalVal = Math.round(item.current_stock * item.unit_cost);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.sku}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-sm font-extrabold text-slate-900">
                          {item.current_stock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {item.min_reorder_level} {item.unit}
                      </td>

                      <td className="py-3.5 px-4 text-slate-900 font-bold">
                        ₹{item.unit_cost}
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        ₹{totalVal}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => handleAdjustStock(item.id, -5)}
                            className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-black transition cursor-pointer"
                            title="Remove 5 units"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, -1)}
                            className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Remove 1 unit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, 1)}
                            className="p-1 rounded bg-white hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Add 1 unit"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAdjustStock(item.id, 5)}
                            className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 text-[10px] font-black transition cursor-pointer"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">New Inventory Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-950 block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buffalo Mozzarella, Truffle Oil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold text-xs placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-950 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs bg-white text-slate-950 font-bold outline-none shadow-xs"
                  >
                    <option value="Raw Ingredients">Raw Ingredients</option>
                    <option value="Dairy & Cheese">Dairy & Cheese</option>
                    <option value="Beverage & Spirits">Beverage & Spirits</option>
                    <option value="Produce & Vegetables">Produce & Vegetables</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Bakery & Flour">Bakery & Flour</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-950 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs bg-white text-slate-950 font-bold outline-none shadow-xs"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="liters">liters</option>
                    <option value="bottles">bottles</option>
                    <option value="boxes">boxes</option>
                    <option value="units">units / pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-950 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    step="0.5"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold text-xs outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-950 block mb-1">Min Reorder</label>
                  <input
                    type="number"
                    step="0.5"
                    value={minReorderLevel}
                    onChange={(e) => setMinReorderLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold text-xs outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-950 block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold text-xs outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-950 block mb-1">Primary Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Metro Wholesale Foods"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-950 font-bold text-xs placeholder:text-slate-500 outline-none shadow-xs"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Stock Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventory;
