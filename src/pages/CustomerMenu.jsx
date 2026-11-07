// src/pages/CustomerMenu.jsx - Digital menu page scanned via Table QR code
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  Utensils,
  ChevronDown,
  Info,
  Flame,
  Star,
  MapPin,
  Zap,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import { ItemModal } from '../components/ItemModal.jsx';
import { CartDrawer } from '../components/CartDrawer.jsx';
import { getFallbackMenu, getFallbackTables, resolveRestaurant } from '../data/fallbackMenu.js';

export function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');
  const restaurantParam = searchParams.get('restaurant');

  const { table, setTable, itemCount, grandTotal } = useCart();
  const { activeRestaurant, setActiveRestaurant, restaurants } = useRestaurant();

  const [categories, setCategories] = useState([]);
  const [groupedItems, setGroupedItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);

  // Immediately and synchronously resolve tenant from query param or activeRestaurant
  const initialRest = resolveRestaurant(restaurantParam || activeRestaurant?.id);
  const [currentRestaurant, setCurrentRestaurant] = useState(initialRest);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [activeModalItem, setActiveModalItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync restaurant if provided in URL parameter or context changes
  useEffect(() => {
    if (restaurantParam) {
      const resolved = resolveRestaurant(restaurantParam);
      setCurrentRestaurant(resolved);
      if (activeRestaurant?.id !== resolved.id) {
        setActiveRestaurant(resolved);
      }
    } else if (activeRestaurant) {
      setCurrentRestaurant(activeRestaurant);
    } else {
      const fallback = resolveRestaurant(null);
      setCurrentRestaurant(fallback);
      setActiveRestaurant(fallback);
    }
  }, [restaurantParam, activeRestaurant, setActiveRestaurant]);

  // 1. Resolve Table from URL query parameter (with offline-first resilience)
  useEffect(() => {
    const restId = currentRestaurant?.id || (restaurantParam ? resolveRestaurant(restaurantParam)?.id : activeRestaurant?.id) || 'rest_losteria';
    fetch(`/api/tables?restaurant_id=${restId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.success && data.tables && data.tables.length > 0) {
          setAvailableTables(data.tables);
          let matched = null;
          if (tableParam && tableParam !== 'counter' && tableParam !== 'takeaway') {
            matched = data.tables.find(
              (t) => t.id === tableParam || t.table_number.toLowerCase() === tableParam.toLowerCase()
            );
          }

          if (tableParam === 'counter' || tableParam === 'takeaway' || (!tableParam && data.tables.length === 0)) {
            setTable({ id: 'counter', table_number: 'Counter Pickup', section: 'Takeaway' });
          } else if (matched) {
            setTable(matched);
          } else if (data.tables.length > 0) {
            setTable(data.tables[0]);
          } else {
            setTable({ id: 'counter', table_number: 'Counter Pickup', section: 'Takeaway' });
          }
          return;
        }
        throw new Error('No tables returned');
      })
      .catch((err) => {
        console.warn('API unavailable for tables, using offline-first fallback:', err);
        const fbTables = getFallbackTables(restId);
        setAvailableTables(fbTables);
        let matched = null;
        if (tableParam && tableParam !== 'counter' && tableParam !== 'takeaway') {
          matched = fbTables.find(
            (t) => t.id === tableParam || t.table_number.toLowerCase() === tableParam.toLowerCase()
          );
        }
        if (matched) setTable(matched);
        else if (fbTables.length > 0) setTable(fbTables[0]);
        else setTable({ id: 'counter', table_number: 'Counter Pickup', section: 'Takeaway' });
      });
  }, [tableParam, setTable, currentRestaurant, activeRestaurant, restaurantParam]);

  // 2. Fetch Menu (with zero-network offline-first menu fallback)
  useEffect(() => {
    const restId = currentRestaurant?.id || (restaurantParam ? resolveRestaurant(restaurantParam)?.id : activeRestaurant?.id) || 'rest_losteria';
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('restaurant_id', restId);
    if (vegOnly) params.append('vegOnly', 'true');
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory !== 'all') params.append('category', selectedCategory);

    fetch(`/api/menu?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.success && data.grouped && data.grouped.length > 0) {
          setCategories(data.categories || []);
          setGroupedItems(data.grouped || []);
          setAllItems(data.items || []);
          try {
            localStorage.setItem(`dineqr_menu_cache_${restId}`, JSON.stringify(data));
          } catch {}
          return;
        }
        throw new Error('Empty menu data from server');
      })
      .catch((err) => {
        console.warn('Network menu fetch failed, activating zero-network offline-first menu fallback:', err);
        // Try localStorage cache first
        try {
          const cached = localStorage.getItem(`dineqr_menu_cache_${restId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.grouped && parsed.grouped.length > 0) {
              setCategories(parsed.categories || []);
              setGroupedItems(parsed.grouped || []);
              setAllItems(parsed.items || []);
              return;
            }
          }
        } catch {}

        // Full offline-first fallback menu generator
        const fb = getFallbackMenu({
          restaurantId: restId,
          category: selectedCategory,
          vegOnly,
          search: searchQuery.trim(),
        });
        setCategories(fb.categories || []);
        setGroupedItems(fb.grouped || []);
        setAllItems(fb.items || []);
      })
      .finally(() => setIsLoading(false));
  }, [vegOnly, searchQuery, selectedCategory, currentRestaurant, activeRestaurant]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      {/* Restaurant Header Banner - Compact & Luxury Mobile First */}
      <div className="bg-slate-900 text-white px-4 py-5 sm:py-7 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {currentRestaurant?.business_type === 'clinic'
                  ? 'Healthcare OPD'
                  : currentRestaurant?.business_type === 'gym'
                  ? 'Fitness Bar & Passes'
                  : currentRestaurant?.business_type === 'salon'
                  ? 'Salon & Spa Studio'
                  : currentRestaurant?.business_type === 'cafe'
                  ? 'Specialty Roastery & Bakes'
                  : 'Artisanal Kitchen'}
              </span>
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  {currentRestaurant?.business_type === 'clinic'
                    ? 'OPD Doctors Available'
                    : currentRestaurant?.business_type === 'gym'
                    ? 'Floor Open for Workout'
                    : currentRestaurant?.business_type === 'salon'
                    ? 'Stylists Available'
                    : 'Open for Dining'}
                </span>
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                · <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.9 (450+ reviews)
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentRestaurant?.name || "L'Osteria Gourmet Bistro"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              {currentRestaurant?.tagline || "Artisanal Kitchen & Wood-Fired Oven."}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {currentRestaurant?.address || 'Indiranagar, Bengaluru'}</span>
              <span className="hidden sm:inline">· Direct UPI & Card Payments</span>
            </div>
          </div>

          {/* Table / Station Designation Badge */}
          <div className="w-full sm:w-auto bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between sm:justify-start gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {currentRestaurant?.station_type === 'room'
                  ? 'Doctor Suite'
                  : currentRestaurant?.station_type === 'bay'
                  ? 'Fitness Bay'
                  : currentRestaurant?.station_type === 'chair'
                  ? 'Salon Chair'
                  : 'Ordering For'}
              </div>
              <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                <Utensils className="w-3.5 h-3.5" />
                <span>{table ? table.table_number : 'Station 01'}</span>
                {table?.section && (
                  <span className="text-xs font-normal text-slate-400">({table.section})</span>
                )}
              </div>
            </div>

            {availableTables.length > 1 && (
              <select
                value={table ? table.id : 'counter'}
                onChange={(e) => {
                  if (e.target.value === 'counter') {
                    setTable({ id: 'counter', table_number: 'Counter Pickup', section: 'Takeaway' });
                  } else {
                    const found = availableTables.find((t) => t.id === e.target.value);
                    setTable(found || null);
                  }
                }}
                className="bg-slate-900 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                title="Switch Table"
              >
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.table_number}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Search & Category Filter Navigation Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 space-y-2.5">
          {/* Search bar + Veg Filter toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  currentRestaurant?.business_type === 'gym'
                    ? 'Search whey isolate, protein smoothies, gym passes...'
                    : currentRestaurant?.business_type === 'clinic'
                    ? 'Search doctor consultations, blood tests, health checkups...'
                    : currentRestaurant?.business_type === 'salon'
                    ? 'Search haircuts, styling, hydra facials, spa...'
                    : currentRestaurant?.business_type === 'cafe'
                    ? 'Search pour-overs, sourdough tartines, croissants...'
                    : 'Search wood-fired pizzas, pasta, appetizers...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white border-2 border-slate-200 text-xs sm:text-sm font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Pure Veg Switch */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
                vegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-3 h-3 border-2 border-emerald-600 rounded-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </span>
              <span>Veg Only</span>
            </button>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Items
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dishes Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <span className="w-7 h-7 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-3"></span>
            <p className="text-xs font-semibold">Loading menu...</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Utensils className="w-10 h-10 stroke-[1.5] text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No dishes match your filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or vegetarian filter.
            </p>
          </div>
        ) : selectedCategory === 'all' && !searchQuery ? (
          // Grouped by Category view
          <div className="space-y-8">
            {groupedItems.map((group) => (
              <section key={group.id} className="scroll-mt-36">
                <div className="mb-3.5 flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{group.name}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.2 rounded-full bg-slate-200 text-slate-700">
                        {group.items.length}
                      </span>
                    </h2>
                    {group.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((dish) => (
                    <ItemCard
                      key={dish.id}
                      item={dish}
                      onSelect={(item) => setActiveModalItem(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          // Filtered list view
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {allItems.length} dishes
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allItems.map((dish) => (
                <ItemCard
                  key={dish.id}
                  item={dish}
                  onSelect={(item) => setActiveModalItem(item)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Sticky on Mobile Phones) */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-98 text-white font-bold text-xs shadow-xl shadow-slate-950/25 transition flex items-center justify-between cursor-pointer border border-slate-800"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">
                {itemCount}
              </div>
              <div className="text-left">
                <div className="text-[11px] text-slate-400">Your Order Basket</div>
                <div className="text-sm font-extrabold font-mono text-white leading-tight">₹{grandTotal}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold">
              <span>View Basket</span>
              <span>&rarr;</span>
            </div>
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      {activeModalItem && (
        <ItemModal
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}

export default CustomerMenu;
