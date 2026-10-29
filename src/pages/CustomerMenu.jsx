// src/pages/CustomerMenu.jsx - Digital menu page scanned via Table QR code
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Utensils,
  ChevronDown,
  Info,
  Flame
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { ItemCard } from '../components/ItemCard.jsx';
import { ItemModal } from '../components/ItemModal.jsx';
import { CartDrawer } from '../components/CartDrawer.jsx';

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
  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [activeModalItem, setActiveModalItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync restaurant if provided in URL parameter
  useEffect(() => {
    if (restaurantParam && restaurants.length > 0) {
      const matched = restaurants.find(
        (r) => r.id === restaurantParam || r.slug === restaurantParam
      );
      if (matched) {
        setActiveRestaurant(matched);
        setCurrentRestaurant(matched);
      }
    } else if (activeRestaurant) {
      setCurrentRestaurant(activeRestaurant);
    }
  }, [restaurantParam, restaurants, activeRestaurant]);

  // 1. Resolve Table from URL query parameter
  useEffect(() => {
    const restId = currentRestaurant?.id || activeRestaurant?.id || 'rest_losteria';
    fetch(`/api/tables?restaurant_id=${restId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.tables) {
          setAvailableTables(data.tables);
          if (tableParam) {
            const matched = data.tables.find(
              (t) => t.id === tableParam || t.table_number.toLowerCase() === tableParam.toLowerCase()
            );
            if (matched) {
              setTable(matched);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load tables:', err));
  }, [tableParam, setTable, currentRestaurant, activeRestaurant]);

  // 2. Fetch Menu
  useEffect(() => {
    const restId = currentRestaurant?.id || activeRestaurant?.id || 'rest_losteria';
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('restaurant_id', restId);
    if (vegOnly) params.append('vegOnly', 'true');
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory !== 'all') params.append('category', selectedCategory);

    fetch(`/api/menu?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || []);
          setGroupedItems(data.grouped || []);
          setAllItems(data.items || []);
        }
      })
      .catch((err) => console.error('Error fetching menu:', err))
      .finally(() => setIsLoading(false));
  }, [vegOnly, searchQuery, selectedCategory, currentRestaurant, activeRestaurant]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Table Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-white px-4 py-6 sm:py-8 shadow-lg border-b border-white/5 relative overflow-hidden">
        {/* Ambient Warm Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black tracking-widest uppercase">
                Interactive Video Menu
              </span>
              <span className="text-slate-400 text-xs font-medium">· Contactless Ordering</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {currentRestaurant?.name || "L'Osteria Gourmet Bistro"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              {currentRestaurant?.tagline || "Authentic Italian wood-fired pizzas, handcrafted pastas, and artisanal tapas."} Tap any dish to view ingredients, chef notes, and live video previews!
            </p>
          </div>

          {/* Current Table / Room Selector */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-xl rounded-2xl p-3.5 border border-white/15 flex items-center justify-between gap-4 shadow-xl">
            <div className="text-left">
              <div className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest">
                {currentRestaurant?.business_type === 'clinic'
                  ? 'Patient Room / Token'
                  : currentRestaurant?.business_type === 'gym'
                  ? 'Workout Bay / Locker'
                  : currentRestaurant?.business_type === 'event'
                  ? 'VIP Lounge / Booth'
                  : 'Table Number'}
              </div>
              <div className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>
                  {table
                    ? table.table_number
                    : currentRestaurant?.business_type === 'clinic'
                    ? 'Room 01'
                    : currentRestaurant?.business_type === 'gym'
                    ? 'Bay 01'
                    : 'Table 01'}
                </span>
                {table?.section && (
                  <span className="text-xs font-normal text-slate-300">({table.section})</span>
                )}
              </div>
            </div>

            <select
              value={table ? table.id : ''}
              onChange={(e) => {
                const found = availableTables.find((t) => t.id === e.target.value);
                setTable(found || null);
              }}
              className="bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-inner"
            >
              <option value="">
                {currentRestaurant?.business_type === 'clinic' ? 'Change Room / Token...' : 'Change Table...'}
              </option>
              {availableTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.table_number} ({t.section})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sticky Search & Category Filter Navigation */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          {/* Search bar + Veg Filter toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  currentRestaurant?.business_type === 'clinic'
                    ? 'Search consultations, blood tests, health panels...'
                    : currentRestaurant?.business_type === 'gym'
                    ? 'Search day passes, whey protein shakes, trainers...'
                    : currentRestaurant?.business_type === 'event'
                    ? 'Search VIP passes, craft beers, cocktails, merch...'
                    : 'Search pizzas, pasta, starters, mocktails...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Pure Veg Switch */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-black transition cursor-pointer shrink-0 shadow-xs active:scale-95 ${
                vegOnly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </span>
              <span>Veg Only</span>
            </button>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-black whitespace-nowrap transition cursor-pointer shadow-xs ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-black whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dishes Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <span className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-600 rounded-full animate-spin mb-3"></span>
            <p className="text-sm font-semibold">Loading culinary catalog...</p>
          </div>
        ) : allItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Utensils className="w-12 h-12 stroke-[1.5] text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No dishes match your filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or vegetarian filter.
            </p>
          </div>
        ) : selectedCategory === 'all' && !searchQuery ? (
          // Grouped by Category view
          <div className="space-y-10">
            {groupedItems.map((group) => (
              <section key={group.id} className="scroll-mt-36">
                <div className="mb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{group.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {group.items.length}
                    </span>
                  </h2>
                  {group.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{group.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {allItems.length} dishes
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-sm shadow-xl shadow-orange-600/35 transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">
                {itemCount}
              </div>
              <div className="text-left">
                <div className="text-xs leading-none opacity-90">View Order Basket</div>
                <div className="text-base font-black leading-tight mt-0.5">₹{grandTotal}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition">
              <span>Continue</span>
              <span>→</span>
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
