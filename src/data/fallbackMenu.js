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

// Rich Specialty Items for IronPulse Fitness Club
const EXTRA_GYM_ITEMS = [
  {
    id: 'item_gym_triple_choco',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_recovery',
    name: 'Triple Dark Chocolate Muscle Builder (45g Whey, Oats, Cacao)',
    description: 'Heavy recovery blend with 45g micro-filtered isolate whey, rolled oats, dark unsweetened Belgian cacao, and MCT oil.',
    price: 280,
    image_url: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_gym_berry_blast',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_recovery',
    name: 'Organic Blueberry & Vegan Pea Protein Smoothie Bowl',
    description: 'Wild Canadian blueberries, fermented organic pea protein, chia seeds, homemade almond granola, and flaxseed crunch.',
    price: 290,
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_gym_creatine',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_recovery',
    name: 'German Creapure Cooler (Iced Lemon Mint Fizz)',
    description: '5g Creapure micronized creatine monohydrate dissolved in cold electrolyte sparkling water with fresh lemon & mint.',
    price: 160,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_gym_pre_nitro',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_recovery',
    name: 'Nitric Oxide Blue Raspberry Pre-Workout Pump',
    description: 'Citrulline malate (6g), Beta-alanine, natural green tea caffeine extract, and electrolytes for explosive energy.',
    price: 190,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_gym_keto_bowl',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_recovery',
    name: 'Grilled Lemon Herb Chicken & Quinoa Protein Meal Box',
    description: '220g tender grilled chicken breast, tri-color organic quinoa, steamed broccoli florets, and honey mustard dressing.',
    price: 380,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
    is_veg: 0,
    is_available: 1,
    spice_level: 'Mild',
  },
  {
    id: 'item_gym_tofu_wrap',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_recovery',
    name: 'Spiced Paneer / Tofu High-Protein Spinach Tortilla Wrap',
    description: 'Charred cottage cheese cubes or organic firm tofu, roasted peppers, mint yogurt emulsion wrapped in whole-wheat spinach flatbread.',
    price: 260,
    image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'Mild',
  },
  {
    id: 'item_gym_monthly_pass',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_passes',
    name: 'Monthly Unlimited IronPulse Club Gym Membership Pass',
    description: 'Full 30-day access to heavy weight rooms, cardio deck, steam shower locker suites, and biometric entry.',
    price: 1500,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_gym_dexa_scan',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_passes',
    name: 'InBody 770 DEXA Body Composition & Caloric Assessment',
    description: 'Clinical multi-frequency impedance analysis: visceral fat rating, segmental lean muscle mass, and certified dietitian report.',
    price: 499,
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
];

// Rich Specialty Items for Apex Healthcare Clinic
const EXTRA_CLINIC_ITEMS = [
  {
    id: 'item_cl_senior_opd',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_cl_opd',
    name: 'Senior Consultant Physician OPD Consultation Token',
    description: 'In-person diagnosis, vitals assessment (SpO2, Blood Pressure, Pulse), digital prescription, and diet chart.',
    price: 600,
    image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_cl_cbc_panel',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_cl_diag',
    name: 'Complete Blood Count (CBC) with Automated ESR & Platelets',
    description: 'Fully automated 24-parameter hematology panel testing red cells, white differential, and infection markers. Report in 2 hours.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_cl_diabetic_profile',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_cl_diag',
    name: 'Comprehensive Diabetic & Lipid Profile (HbA1c + Cholesterol)',
    description: 'Glycated hemoglobin (3-month average blood glucose) plus total lipid profile: HDL, LDL, VLDL, and triglycerides.',
    price: 799,
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_cl_ecg',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_cl_diag',
    name: '12-Lead Resting Electrocardiogram (ECG) with Cardiologist Review',
    description: 'Standard 12-lead digital cardiac electrical activity recording printed with instant cardiologist sign-off.',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_cl_annual_health',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_cl_prev',
    name: 'Executive Comprehensive Annual Health Screening Package',
    description: '64 diagnostic parameters: Kidney (KFT), Liver (LFT), Thyroid (TSH), Chest X-Ray, ECG, Doctor Consultation included.',
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
];

// Rich Specialty Items for Glamour & Groom Salon
const EXTRA_SALON_ITEMS = [
  {
    id: 'item_sal_haircut',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_hair',
    name: 'Senior Stylist Precision Cut & Cooling Scalp Massage',
    description: 'Personalized face-contour hair styling, nourishing argan shampoo wash, relaxing scalp massage, and thermal blowdry.',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_sal_beard',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_hair',
    name: 'Artisan Beard Sculpting & Steam Charcoal Towel Finish',
    description: 'Razor-sharp contour lines with Japanese shear trimming, warm botanical oil massage, and steaming herbal towel wrap.',
    price: 280,
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_sal_hydra_facial',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_spa',
    name: 'Hydra-Glow Ultrasonic Deep Pore Cleansing Facial',
    description: 'Multi-stage vortex extraction, hyaluronic acid peptide infusion, and cold cryo-wand tightening for intense skin radiance.',
    price: 1200,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_sal_hair_spa',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_spa',
    name: 'Moroccan Argan Intensive Hair Spa & Keratin Therapy',
    description: 'Deep moisture cuticle mask with hot ozone steam, followed by leave-in botanical keratin shield against pollution.',
    price: 1400,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
  {
    id: 'item_sal_reflexology',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_spa',
    name: 'Aromatherapy Foot & Calf Reflexology (45 Min)',
    description: 'Epsom salt & lavender foot soak followed by pressure-point meridian massage with cold-pressed organic sesame oil.',
    price: 850,
    image_url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80&auto=format&fit=crop',
    is_veg: 1,
    is_available: 1,
    spice_level: 'None',
  },
];

// Consolidate base showcase data with extras across all verticals
const ALL_BASE_ITEMS = [
  ...showcaseData.items,
  ...EXTRA_ROASTERY_ITEMS,
  ...EXTRA_GYM_ITEMS,
  ...EXTRA_CLINIC_ITEMS,
  ...EXTRA_SALON_ITEMS,
];
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

  // Legacy & popular aliases
  if (normalized === 'spicecraft' || normalized === 'rest_spicecraft' || normalized === 'losteria' || normalized === 'l-osteria') {
    return all.find((r) => r.id === 'rest_losteria') || FALLBACK_RESTAURANTS[0];
  }
  if (normalized === 'roastery' || normalized === 'roastery-cafe' || normalized === 'cafe') {
    return all.find((r) => r.id === 'rest_roastery') || FALLBACK_RESTAURANTS[1];
  }
  if (normalized === 'apex' || normalized === 'apex-clinic' || normalized === 'clinic') {
    return all.find((r) => r.id === 'rest_apex_clinic') || FALLBACK_RESTAURANTS[2];
  }
  if (normalized === 'ironpulse' || normalized === 'ironpulse-gym' || normalized === 'gym') {
    return all.find((r) => r.id === 'rest_ironpulse_gym') || FALLBACK_RESTAURANTS[3];
  }
  if (normalized === 'glamour' || normalized === 'glamour-salon' || normalized === 'salon') {
    return all.find((r) => r.id === 'rest_glamour_salon') || FALLBACK_RESTAURANTS[4] || FALLBACK_RESTAURANTS[0];
  }

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
