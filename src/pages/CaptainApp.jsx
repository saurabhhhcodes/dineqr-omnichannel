// src/pages/CaptainApp.jsx - Mobile Waiter & Captain Ordering App (Petpooja Parity)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  CreditCard,
  User,
  ArrowLeft,
  Sparkles,
  Layers,
  Send,
  Coffee,
  Receipt,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getFallbackMenu, getFallbackTables } from '../data/fallbackMenu.js';

export function CaptainApp() {
  const navigate = useNavigate();
  const { activeRestaurant, restaurants, setActiveRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Captain KOT Draft
  const [kotCart, setKotCart] = useState([]);
  const [captainName, setCaptainName] = useState('Captain Sunil (Duty #4)');
  const [specialNote, setSpecialNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPunchedKot, setLastPunchedKot] = useState(null);

  // Load tables & menu
  useEffect(() => {
    const restId = activeRestaurant?.id || 'rest_losteria';
    const fallbackTbls = getFallbackTables(restId);
    setTables(fallbackTbls);
    if (!selectedTable && fallbackTbls.length > 0) {
      setSelectedTable(fallbackTbls[0]);
    }

    const fallbackMenu = getFallbackMenu({ restaurantId: restId });
    setCategories(fallbackMenu.categories || []);
    setMenuItems(fallbackMenu.items || []);

    // Also attempt live fetch
    fetch(`/api/tables?restaurant_id=${restId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.tables?.length > 0) {
          setTables(data.tables);
          if (!selectedTable) setSelectedTable(data.tables[0]);
        }
      })
      .catch(() => {});

    fetch(`/api/menu?restaurant_id=${restId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.items?.length > 0) {
          setCategories(data.categories || []);
          setMenuItems(data.items || []);
        }
      })
      .catch(() => {});
  }, [activeRestaurant]);

  // Cart operations
  const handleAddToCart = (item) => {
    setKotCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1, notes: '' }];
    });
  };

  const handleUpdateQty = (itemId, delta) => {
    setKotCart((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const handleUpdateNote = (itemId, note) => {
    setKotCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, notes: note } : i)));
  };

  const calculateSubtotal = () =>
    kotCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Punch KOT to Kitchen KDS
  const handlePunchKot = async () => {
    if (kotCart.length === 0) {
      addToast('Add at least one item to punch KOT', 'error');
      return;
    }
    if (!selectedTable) {
      addToast('Please select a dining table', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const restId = activeRestaurant?.id || 'rest_losteria';
      const payload = {
        restaurant_id: restId,
        table_id: selectedTable.id,
        table_number: selectedTable.table_number,
        customer_name: `${selectedTable.table_number} (${captainName})`,
        customer_phone: '',
        special_instructions: specialNote.trim(),
        payment_method: 'CASH_AT_COUNTER',
        items: kotCart.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setLastPunchedKot(data.order);
        setKotCart([]);
        setSpecialNote('');
        addToast(`KOT #${data.order.order_code} sent to Kitchen KDS!`, 'success');
      } else {
        throw new Error(data.error || 'Failed to punch KOT');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered menu
  const filteredDishes = menuItems.filter((item) => {
    if (vegOnly && !item.is_veg) return false;
    if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/admin" className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                Captain KOT App
              </span>
              <span className="text-xs font-bold text-slate-200">{activeRestaurant?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/kitchen"
            target="_blank"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1"
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View KDS</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">{captainName}</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Table Selector + Menu Dishes */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Table Selector Row */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select Active Dining Table</span>
              <span className="text-amber-400">{selectedTable ? `Active: ${selectedTable.table_number}` : 'None'}</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {tables.map((t) => {
                const isSelected = selectedTable?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTable(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer shrink-0 flex flex-col items-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.table_number}</span>
                    <span className="text-[9px] opacity-75 font-normal">{t.section || 'Dining'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search + Category Bar */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick search dishes or codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
                  vegOnly
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Veg Only
              </button>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                    selectedCategory === c.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto max-h-[500px] pr-1">
            {filteredDishes.map((dish) => {
              const inCart = kotCart.find((i) => i.id === dish.id);
              return (
                <div
                  key={dish.id}
                  onClick={() => handleAddToCart(dish)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    inCart
                      ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${dish.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                      <span className="text-xs font-bold text-amber-400 font-mono">₹{dish.price}</span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{dish.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{dish.description}</div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 font-medium">Tap to add</span>
                    {inCart ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-xs">
                        x{inCart.quantity}
                      </span>
                    ) : (
                      <span className="p-1 rounded-lg bg-slate-800 text-slate-300">
                        <Plus className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Running KOT Ticket & Punch Action */}
        <div className="lg:col-span-4 bg-slate-950 p-4 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Target Table</span>
                <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <span>{selectedTable ? selectedTable.table_number : 'Select Table'}</span>
                </div>
              </div>

              {kotCart.length > 0 && (
                <button
                  onClick={() => setKotCart([])}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {kotCart.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-semibold">No items added to KOT ticket yet.</p>
                <p className="text-[11px] mt-0.5">Tap dishes from the left to start table order.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {kotCart.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate max-w-[150px]">{item.name}</span>
                      <span className="font-mono text-amber-400 font-bold">₹{item.price * item.quantity}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Note (e.g. less spicy)..."
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                        className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-300 w-36 outline-none focus:border-amber-500"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Summary & Punch Button */}
          <div className="border-t border-slate-800 pt-3 mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total KOT Items:</span>
              <span className="font-bold text-white font-mono">
                {kotCart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-black">
              <span className="text-slate-300">Running Total:</span>
              <span className="text-amber-400 font-mono text-base">₹{calculateSubtotal()}</span>
            </div>

            <input
              type="text"
              placeholder="General table note (e.g. VIP guests, birthday cake)..."
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-200 outline-none focus:border-amber-500 placeholder-slate-500"
            />

            <button
              onClick={handlePunchKot}
              disabled={isSubmitting || kotCart.length === 0}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Punching to Kitchen...' : 'Punch KOT to Kitchen KDS'}</span>
            </button>

            {lastPunchedKot && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>KOT #{lastPunchedKot.order_code} Punched</span>
                </div>
                <Link
                  to={`/invoice/${lastPunchedKot.id}`}
                  className="underline text-[11px] font-bold text-emerald-300"
                >
                  View Bill &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaptainApp;
