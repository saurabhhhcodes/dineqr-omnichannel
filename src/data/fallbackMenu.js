// src/data/fallbackMenu.js - Zero-network offline-first prototype showcase data & menu fallback
import showcaseData from './showcaseData.json';

export const FALLBACK_RESTAURANTS = [
  {
    id: 'rest_losteria',
    name: "L'Osteria Gourmet Bistro",
    slug: 'losteria',
    tagline: 'Artisanal Kitchen & Wood-Fired Oven',
    business_type: 'restaurant',
    station_type: 'table',
    staff_pin: '1234',
    address: 'Plot 42, Galleria Boulevard, Indiranagar, Bengaluru - 560038',
    phone: '+91 98765 43210',
    currency: '₹',
    cgst_pct: 2.5,
    sgst_pct: 2.5,
    service_charge_pct: 0.0,
    razorpay_key_id: 'rzp_test_TK088i9wgJLbAg',
    upi_id: 'losteria@okhdfcbank',
  },
  {
    id: 'rest_roastery',
    name: 'The Roastery Coffee House & Bakery',
    slug: 'roastery-cafe',
    tagline: 'Specialty Pour-Overs, Sourdough & Gourmet Bakes',
    business_type: 'cafe',
    station_type: 'table',
    staff_pin: '1234',
    address: '84, Lavelle Road, Shanthala Nagar, Ashok Nagar, Bengaluru - 560001',
    phone: '+91 98450 67890',
    currency: '₹',
    cgst_pct: 2.5,
    sgst_pct: 2.5,
    service_charge_pct: 0.0,
    razorpay_key_id: 'rzp_test_TK088i9wgJLbAg',
    upi_id: 'roastery@icici',
  },
  {
    id: 'rest_apex_clinic',
    name: 'Apex Healthcare & Multi-Specialty Clinic',
    slug: 'apex-clinic',
    tagline: 'Outpatient & Diagnostic Care',
    business_type: 'clinic',
    station_type: 'room',
    staff_pin: '1234',
    address: 'Suite 102, MediPark Plaza, Outer Ring Road, Bellandur, Bengaluru - 560103',
    phone: '+91 80 4567 8900',
    currency: '₹',
    cgst_pct: 0.0,
    sgst_pct: 0.0,
    service_charge_pct: 0.0,
    razorpay_key_id: 'rzp_test_TK088i9wgJLbAg',
    upi_id: 'apexclinic@sbi',
  },
  {
    id: 'rest_ironpulse_gym',
    name: 'IronPulse Fitness Club & Protein Bar',
    slug: 'ironpulse-gym',
    tagline: 'Day Passes, Protein Shakes & Personal Coaching',
    business_type: 'gym',
    station_type: 'bay',
    staff_pin: '1234',
    address: '5th Floor, Gold Crest Hub, 100ft Road, Koramangala, Bengaluru - 560095',
    phone: '+91 99001 22334',
    currency: '₹',
    cgst_pct: 9.0,
    sgst_pct: 9.0,
    service_charge_pct: 0.0,
    razorpay_key_id: 'rzp_test_TK088i9wgJLbAg',
    upi_id: 'ironpulse@axisbank',
  },
  {
    id: 'rest_glamour_salon',
    name: 'Glamour & Groom Salon & Spa',
    slug: 'glamour-salon',
    tagline: 'Styling & Spa Chairs',
    business_type: 'salon',
    station_type: 'chair',
    staff_pin: '1234',
    address: 'Shop 14, Ground Floor, Royal Arcade, Indiranagar 12th Main, Bengaluru - 560038',
    phone: '+91 97423 88776',
    currency: '₹',
    cgst_pct: 9.0,
    sgst_pct: 9.0,
    service_charge_pct: 0.0,
    razorpay_key_id: 'rzp_test_TK088i9wgJLbAg',
    upi_id: 'glamour@paytm',
  },
];

// Additional rich items for Roastery Cafe
const EXTRA_ROASTERY_ITEMS = [
  {
    id: 'item_rc_affogato',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_coffee',
    name: 'Vanilla Bean Gelato Affogato',
    description: 'Double shot of house espresso poured over slow-churned Madagascar vanilla bean gelato with cacao nibs.',
    price: 260,
    image_url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&q=80&auto=format&fit=crop',
    video_url: '/videos/item_10.mp4',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_rc_matcha',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_coffee',
    name: 'Uji Ceremonial Matcha Latte',
    description: 'Stone-ground ceremonial grade Japanese matcha whisked with velvety steamed oat milk and raw wildflower honey.',
    price: 290,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=800&q=80&auto=format&fit=crop',
    video_url: '/videos/item_22.mp4',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_rc_pain_au_choc',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_bakery',
    name: 'Valrhona Pain au Chocolat',
    description: 'Flaky 72-layer butter pastry rolled with double batons of 66% Valrhona dark French chocolate.',
    price: 240,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80&auto=format&fit=crop',
    video_url: '/videos/item_23.mp4',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_rc_almond_croissant',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_bakery',
    name: 'Twice-Baked Frangipane Almond Croissant',
    description: 'Twice-baked butter croissant loaded with rich almond cream frangipane and toasted sliced California almonds.',
    price: 270,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80&auto=format&fit=crop',
    video_url: '/videos/item_24.mp4',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_rc_avocado_toast',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_all_day',
    name: 'Hass Avocado Tartine on Country Sourdough',
    description: 'Crushed Hass avocado, marinated heirloom cherry tomatoes, Persian feta, pickled shallots, and toasted dukkah spice.',
    price: 420,
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop',
    video_url: '/videos/item_2.mp4',
    is_veg: 1,
    is_available: 1,
    spice_level: 'Mild',
  },
  {
    id: 'item_rc_shakshuka',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_all_day',
    name: 'Skillet Baked Shakshuka with Feta',
    description: 'Two poached farm eggs gently simmered in spiced San Marzano tomato & roasted pepper ragout, served with warm sourdough focaccia.',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=800&q=80&auto=format&fit=crop',
    video_url: '/videos/item_3.mp4',
    is_veg: 0,
    is_available: 1,
    spice_level: 'Medium',
  },
];

// Consolidate base showcase data with extras
const ALL_BASE_ITEMS = [...showcaseData.items, ...EXTRA_ROASTERY_ITEMS];
const ALL_BASE_CATEGORIES = showcaseData.cats;
const ALL_BASE_TABLES = showcaseData.tables;

// Retrieve custom registered restaurants from localStorage
export function getStoredCustomRestaurants() {
  try {
    const raw = localStorage.getItem('dineqr_custom_restaurants');
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to parse custom restaurants from localStorage:', err);
    return [];
  }
}

// Get all active restaurants: Fallback + Custom
export function getAllAvailableRestaurants() {
  const custom = getStoredCustomRestaurants();
  const map = new Map();
  FALLBACK_RESTAURANTS.forEach((r) => map.set(r.id, r));
  custom.forEach((r) => map.set(r.id, r));
  return Array.from(map.values());
}

// Resolve a restaurant by ID or slug
export function resolveRestaurant(restIdOrSlug) {
  if (!restIdOrSlug) return FALLBACK_RESTAURANTS[0];
  const all = getAllAvailableRestaurants();
  const normalized = String(restIdOrSlug).toLowerCase().trim();
  return (
    all.find(
      (r) =>
        r.id.toLowerCase() === normalized ||
        (r.slug && r.slug.toLowerCase() === normalized) ||
        r.name.toLowerCase() === normalized
    ) || FALLBACK_RESTAURANTS[0]
  );
}

// Get tables for restaurant
export function getFallbackTables(restIdOrSlug) {
  const rest = resolveRestaurant(restIdOrSlug);
  const targetId = rest?.id || 'rest_losteria';

  // 1. Check custom tables in localStorage
  try {
    const customTables = JSON.parse(localStorage.getItem(`dineqr_tables_${targetId}`) || '[]');
    if (customTables.length > 0) return customTables;
  } catch {}

  // 2. Check base tables
  const found = ALL_BASE_TABLES.filter((t) => t.restaurant_id === targetId);
  if (found.length > 0) return found;

  // 3. Fallback generated tables if custom restaurant
  const stationLabel = rest.station_type === 'room' ? 'Room' : rest.station_type === 'bay' ? 'Bay' : rest.station_type === 'chair' ? 'Chair' : 'Table';
  return Array.from({ length: 6 }, (_, i) => ({
    id: `tbl_${targetId}_${i + 1}`,
    restaurant_id: targetId,
    table_number: `${stationLabel} 0${i + 1}`,
    name: `${stationLabel} ${i + 1}`,
    section: 'Main Area',
    capacity: 4,
  }));
}

// Retrieve fallback menu items with instant filtering
export function getFallbackMenu({ restaurantId, category = 'all', vegOnly = false, search = '' }) {
  const rest = resolveRestaurant(restaurantId);
  const targetId = rest?.id || 'rest_losteria';

  // Categories
  let categories = ALL_BASE_CATEGORIES.filter((c) => c.restaurant_id === targetId);

  // Custom categories in localStorage if any
  try {
    const customCats = JSON.parse(localStorage.getItem(`dineqr_cats_${targetId}`) || '[]');
    if (customCats.length > 0) {
      categories = customCats;
    }
  } catch {}

  if (categories.length === 0) {
    categories = [
      { id: `cat_${targetId}_specials`, restaurant_id: targetId, name: 'Chef Specials & Recommended', display_order: 1 },
      { id: `cat_${targetId}_mains`, restaurant_id: targetId, name: 'Signature Dishes', display_order: 2 },
      { id: `cat_${targetId}_drinks`, restaurant_id: targetId, name: 'Beverages & Drinks', display_order: 3 },
    ];
  }

  // Items
  let items = ALL_BASE_ITEMS.filter((i) => i.restaurant_id === targetId);

  // Custom items in localStorage if any
  try {
    const customItems = JSON.parse(localStorage.getItem(`dineqr_items_${targetId}`) || '[]');
    if (customItems.length > 0) {
      items = [...items, ...customItems];
    }
  } catch {}

  // If no items at all (e.g. newly registered restaurant without server db sync), seed initial prototype items
  if (items.length === 0) {
    items = [
      {
        id: `item_${targetId}_1`,
        restaurant_id: targetId,
        category_id: categories[0]?.id || 'cat_specials',
        name: `${rest.name} Signature Platter`,
        description: 'House specialty crafted fresh daily with premium ingredients and our master seasoning.',
        price: 499,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
        video_url: '/videos/item_1.mp4',
        is_veg: 1,
        is_available: 1,
        spice_level: 'Mild',
      },
      {
        id: `item_${targetId}_2`,
        restaurant_id: targetId,
        category_id: categories[1]?.id || categories[0]?.id,
        name: 'Artisan Gourmet Entrée',
        description: 'Delicately prepared signature main course served with chef special garnishes and dips.',
        price: 599,
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80&auto=format&fit=crop',
        video_url: '/videos/item_2.mp4',
        is_veg: 0,
        is_available: 1,
        spice_level: 'Medium',
      },
      {
        id: `item_${targetId}_3`,
        restaurant_id: targetId,
        category_id: categories[2]?.id || categories[0]?.id,
        name: 'Handcrafted Refreshment Cooler',
        description: 'Chilled freshly pressed infusion with fresh mint, citrus twist, and sparkling soda.',
        price: 199,
        image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&auto=format&fit=crop',
        video_url: '/videos/item_3.mp4',
        is_veg: 1,
        is_available: 1,
        spice_level: 'None',
      },
    ];
  }

  // Filter by category
  let filteredItems = items;
  if (category && category !== 'all') {
    filteredItems = filteredItems.filter((i) => i.category_id === category);
  }

  // Filter by vegOnly
  if (vegOnly) {
    filteredItems = filteredItems.filter((i) => i.is_veg === 1 || i.is_veg === true);
  }

  // Filter by search
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filteredItems = filteredItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
    );
  }

  // Group by categories
  const grouped = categories
    .map((cat) => ({
      ...cat,
      items: filteredItems.filter((item) => item.category_id === cat.id),
    }))
    .filter((g) => g.items.length > 0);

  return {
    success: true,
    restaurant: rest,
    categories,
    grouped,
    items: filteredItems,
    isOfflineFallback: true,
  };
}

// Register a newly onboarded restaurant into localStorage for immediate offline persistence
export function saveCustomRestaurantLocally(restaurantData) {
  try {
    const existing = getStoredCustomRestaurants();
    const updated = [restaurantData, ...existing.filter((r) => r.id !== restaurantData.id)];
    localStorage.setItem('dineqr_custom_restaurants', JSON.stringify(updated));
    localStorage.setItem('dineqr_active_restaurant', JSON.stringify(restaurantData));

    // Also seed default tables if station count provided
    const stationCount = restaurantData.station_count || 6;
    const stationLabel =
      restaurantData.station_type === 'room'
        ? 'Consultation Room'
        : restaurantData.station_type === 'bay'
        ? 'Workout Bay'
        : restaurantData.station_type === 'chair'
        ? 'Styling Chair'
        : 'Dining Table';

    const tables = Array.from({ length: stationCount }, (_, i) => ({
      id: `tbl_${restaurantData.id}_${i + 1}`,
      restaurant_id: restaurantData.id,
      table_number: `${stationLabel} 0${i + 1}`,
      name: `${stationLabel} ${i + 1}`,
      section: 'Main Floor',
      capacity: 4,
    }));
    localStorage.setItem(`dineqr_tables_${restaurantData.id}`, JSON.stringify(tables));

    return restaurantData;
  } catch (err) {
    console.error('Failed to save custom restaurant locally:', err);
    return restaurantData;
  }
}
