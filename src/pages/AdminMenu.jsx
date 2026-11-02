// src/pages/AdminMenu.jsx - Full-featured menu editor & dish catalog manager
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image,
  Utensils,
  FolderPlus,
  RefreshCw,
  X,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// 14 Curated High-Definition Food Photography Presets
const IMAGE_PRESETS = [
  { label: 'Wood-Fired Pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80&auto=format&fit=crop' },
  { label: 'Smash Cheeseburger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop' },
  { label: 'Artisan Pasta', url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800&q=80&auto=format&fit=crop' },
  { label: 'Truffle Fries / Tapas', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&q=80&auto=format&fit=crop' },
  { label: 'Paneer Tikka / Kebab', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80&auto=format&fit=crop' },
  { label: 'Specialty Coffee / Cold Brew', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80&auto=format&fit=crop' },
  { label: 'Mocktail / Shaken Cooler', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&auto=format&fit=crop' },
  { label: 'French Croissant / Bakery', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80&auto=format&fit=crop' },
  { label: 'Sourdough Avocado Toast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop' },
  { label: 'Tiramisu / Dessert Cake', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80&auto=format&fit=crop' },
  { label: 'Molten Chocolate Cake', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80&auto=format&fit=crop' },
  { label: 'Crispy Wings / Fried Chicken', url: 'https://images.unsplash.com/photo-1527477378408-1eddb9eb2130?w=800&q=80&auto=format&fit=crop' },
  { label: 'Indian Butter Chicken Bowl', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80&auto=format&fit=crop' },
  { label: 'Dal Makhani / Lentils', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&auto=format&fit=crop' },
];

export function AdminMenu() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Add / Edit Modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image_url: IMAGE_PRESETS[0].url,
    video_url: '/videos/item_6.mp4',
    is_veg: 1,
    spice_level: 'None',
    prep_time_mins: 15,
    calories: 400,
    tags: '',
  });

  // Add Category Modal state
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchMenuData = () => {
    if (!activeRestaurant) return;
    setIsLoading(true);

    Promise.all([
      fetch(`/api/menu?admin=true&restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
      fetch(`/api/menu/categories?restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
    ])
      .then(([menuData, catData]) => {
        if (menuData.success) setItems(menuData.items || []);
        if (catData.success) setCategories(catData.categories || []);
      })
      .catch((err) => addToast('Failed to load menu: ' + err.message, 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMenuData();
  }, [activeRestaurant]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      description: '',
      image_url: IMAGE_PRESETS[0].url,
      video_url: '/videos/item_6.mp4',
      is_veg: 1,
      spice_level: 'None',
      prep_time_mins: 15,
      calories: 400,
      tags: 'Popular',
    });
    setShowItemModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      description: item.description,
      image_url: item.image_url,
      video_url: item.video_url || '',
      is_veg: item.is_veg,
      spice_level: item.spice_level || 'None',
      prep_time_mins: item.prep_time_mins || 15,
      calories: item.calories || 0,
      tags: item.tags || '',
    });
    setShowItemModal(true);
  };

  // Toggle In Stock / Sold Out
  const handleToggleStock = async (item) => {
    try {
      const res = await fetch(`/api/menu/items/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !item.is_available }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`${item.name} is now ${data.item.is_available ? 'In Stock' : 'Marked Sold Out'}`);
        fetchMenuData();
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  // Save Dish (Create or Update)
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category_id) {
      addToast('Please fill all required dish fields', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        restaurant_id: activeRestaurant.id,
        price: parseFloat(formData.price),
      };

      const url = editingItem ? `/api/menu/items/${editingItem.id}` : '/api/menu/items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast(editingItem ? 'Dish updated successfully!' : 'New dish added to menu!');
        setShowItemModal(false);
        fetchMenuData();
      } else {
        addToast(data.error || 'Failed to save dish', 'error');
      }
    } catch (err) {
      addToast('Error saving dish: ' + err.message, 'error');
    }
  };

  // Delete Dish
  const handleDeleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/menu/items/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(`Dish deleted`);
        fetchMenuData();
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant.id,
          name: newCatName.trim(),
          description: newCatDesc.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Category "${newCatName}" created!`);
        setShowCatModal(false);
        setNewCatName('');
        setNewCatDesc('');
        fetchMenuData();
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const filteredItems = items.filter((it) => {
    if (selectedCategory !== 'ALL' && it.category_id !== selectedCategory) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return it.name.toLowerCase().includes(term) || it.description?.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                Digital Catalog Editor
              </span>
              <span className="text-xs text-slate-500">
                · {activeRestaurant?.name} ({items.length} dishes)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Menu & Dish Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add new dishes, update prices, toggle availability in real time, and customize items for your table QR codes.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCatModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-slate-600" />
              <span>New Category</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Dish</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes by name or ingredient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs font-bold pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Categories ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dish Catalog Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <span className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-600 rounded-full animate-spin inline-block mb-3"></span>
            <p className="text-xs font-bold text-slate-600">Loading restaurant dishes...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <Utensils className="w-12 h-12 stroke-[1.5] text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No dishes found</h3>
            <p className="text-xs text-slate-500 mt-1">Click "Add New Dish" above to add items to your digital QR menu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Photo & Video preview */}
                <div className="relative h-44 bg-slate-950 overflow-hidden">
                  {item.video_url ? (
                    <video
                      src={item.video_url}
                      poster={item.image_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  {/* Video pill indicator */}
                  {item.video_url && (
                    <span className="absolute bottom-2 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>Video Loop</span>
                    </span>
                  )}

                  {/* Veg / Non-Veg badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                    {item.is_veg ? (
                      <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-xs flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 border-2 border-rose-700 rounded-xs flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-xs bg-rose-700"></span>
                      </span>
                    )}
                    <span>{item.is_veg ? 'Veg' : 'Non-Veg'}</span>
                  </div>

                  {/* Stock pill */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleStock(item)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition cursor-pointer ${
                        item.is_available
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                      }`}
                      title="Click to toggle In Stock / Sold Out"
                    >
                      {item.is_available ? 'In Stock' : 'Sold Out'}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      <span className="font-black text-slate-900 text-base shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-slate-400 text-[11px]">
                      {item.prep_time_mins > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.prep_time_mins}m
                        </span>
                      )}
                      {item.spice_level && item.spice_level !== 'None' && (
                        <span className="flex items-center gap-0.5 text-amber-700 font-semibold">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          {item.spice_level}
                        </span>
                      )}
                      {item.calories > 0 && <span>{item.calories} kcal</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStock(item)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    >
                      Status: <span className={item.is_available ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {item.is_available ? 'Available' : 'Sold Out'}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dish Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingItem ? 'Edit Dish' : 'Add New Item to QR Menu'}
                </h3>
                <p className="text-xs text-slate-500">
                  Instantly available for customer ordering upon saving
                </p>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Truffle Burrata Pizza"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 450"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dietary Type
                  </label>
                  <select
                    value={formData.is_veg}
                    onChange={(e) => setFormData({ ...formData, is_veg: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                  >
                    <option value="1">Pure Veg</option>
                    <option value="0">Non-Veg</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Spice Level
                  </label>
                  <select
                    value={formData.spice_level}
                    onChange={(e) => setFormData({ ...formData, spice_level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                  >
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Spicy">Spicy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Ingredients, preparation technique, serving notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Photo Preset Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Dish Photography (Pick a preset or paste URL)</span>
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData({ ...formData, image_url: preset.url })}
                      className={`relative h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer group ${
                        formData.image_url === preset.url
                          ? 'border-orange-600 ring-2 ring-orange-200'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-[8px] text-white font-bold truncate px-1 py-0.5">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Video URL for Autoplay */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Video Autoplay Loop URL</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional (.mp4 video stream)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. /videos/item_6.mp4 or https://videos.pexels.com/...mp4"
                  value={formData.video_url || ''}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 transition cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish Dish to QR Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900">Add Menu Category</h3>
              <button
                onClick={() => setShowCatModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wood-Fired Pizzas, Combos, Breakfast"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short tagline for customers..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 transition cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
