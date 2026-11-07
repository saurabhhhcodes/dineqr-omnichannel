// scripts/seed_rich_menus.cjs
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.resolve(__dirname, '../data/restaurant.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding rich vertical items into restaurant.db...');

const ITEMS = [
  // Gym items (IronPulse)
  {
    id: 'item_gym_triple_choco',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_protein',
    name: 'Triple Dark Chocolate Muscle Builder (45g Whey, Oats, Cacao)',
    description: 'Heavy recovery blend with 45g micro-filtered isolate whey, rolled oats, dark unsweetened Belgian cacao, and MCT oil.',
    price: 280,
    is_veg: 1,
  },
  {
    id: 'item_gym_berry_blast',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_protein',
    name: 'Organic Blueberry & Vegan Pea Protein Smoothie Bowl',
    description: 'Wild Canadian blueberries, fermented organic pea protein, chia seeds, homemade almond granola, and flaxseed crunch.',
    price: 290,
    is_veg: 1,
  },
  {
    id: 'item_gym_creatine',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_protein',
    name: 'German Creapure Cooler (Iced Lemon Mint Fizz)',
    description: '5g Creapure micronized creatine monohydrate dissolved in cold electrolyte sparkling water with fresh lemon & mint.',
    price: 160,
    is_veg: 1,
  },
  {
    id: 'item_gym_pre_nitro',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_protein',
    name: 'Nitric Oxide Blue Raspberry Pre-Workout Pump',
    description: 'Citrulline malate (6g), Beta-alanine, natural green tea caffeine extract, and electrolytes for explosive energy.',
    price: 190,
    is_veg: 1,
  },
  {
    id: 'item_gym_keto_bowl',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_training',
    name: 'Grilled Lemon Herb Chicken & Quinoa Protein Meal Box',
    description: '220g tender grilled chicken breast, tri-color organic quinoa, steamed broccoli florets, and honey mustard dressing.',
    price: 380,
    is_veg: 0,
  },
  {
    id: 'item_gym_tofu_wrap',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_training',
    name: 'Spiced Paneer / Tofu High-Protein Spinach Tortilla Wrap',
    description: 'Charred cottage cheese cubes or organic firm tofu, roasted peppers, mint yogurt emulsion wrapped in whole-wheat spinach flatbread.',
    price: 260,
    is_veg: 1,
  },
  {
    id: 'item_gym_monthly_pass',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_passes',
    name: 'Monthly Unlimited IronPulse Club Gym Membership Pass',
    description: 'Full 30-day access to heavy weight rooms, cardio deck, steam shower locker suites, and biometric entry.',
    price: 1500,
    is_veg: 1,
  },
  {
    id: 'item_gym_dexa_scan',
    restaurant_id: 'rest_ironpulse_gym',
    category_id: 'cat_gym_training',
    name: 'InBody 770 DEXA Body Composition & Caloric Assessment',
    description: 'Clinical multi-frequency impedance analysis: visceral fat rating, segmental lean muscle mass, and certified dietitian report.',
    price: 499,
    is_veg: 1,
  },

  // Clinic items (Apex Healthcare)
  {
    id: 'item_cl_senior_opd',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_clinic_consult',
    name: 'Senior Consultant Physician OPD Consultation Token',
    description: 'In-person diagnosis, vitals assessment (SpO2, Blood Pressure, Pulse), digital prescription, and diet chart.',
    price: 600,
    is_veg: 1,
  },
  {
    id: 'item_cl_cbc_panel',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_clinic_tests',
    name: 'Complete Blood Count (CBC) with Automated ESR & Platelets',
    description: 'Fully automated 24-parameter hematology panel testing red cells, white differential, and infection markers. Report in 2 hours.',
    price: 350,
    is_veg: 1,
  },
  {
    id: 'item_cl_diabetic_profile',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_clinic_tests',
    name: 'Comprehensive Diabetic & Lipid Profile (HbA1c + Cholesterol)',
    description: 'Glycated hemoglobin (3-month average blood glucose) plus total lipid profile: HDL, LDL, VLDL, and triglycerides.',
    price: 799,
    is_veg: 1,
  },
  {
    id: 'item_cl_ecg',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_clinic_tests',
    name: '12-Lead Resting Electrocardiogram (ECG) with Cardiologist Review',
    description: 'Standard 12-lead digital cardiac electrical activity recording printed with instant cardiologist sign-off.',
    price: 350,
    is_veg: 1,
  },
  {
    id: 'item_cl_annual_health',
    restaurant_id: 'rest_apex_clinic',
    category_id: 'cat_clinic_wellness',
    name: 'Executive Comprehensive Annual Health Screening Package',
    description: '64 diagnostic parameters: Kidney (KFT), Liver (LFT), Thyroid (TSH), Chest X-Ray, ECG, Doctor Consultation included.',
    price: 2499,
    is_veg: 1,
  },

  // Salon items (Glamour & Groom)
  {
    id: 'item_sal_haircut',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_hair',
    name: 'Senior Stylist Precision Cut & Cooling Scalp Massage',
    description: 'Personalized face-contour hair styling, nourishing argan shampoo wash, relaxing scalp massage, and thermal blowdry.',
    price: 450,
    is_veg: 1,
  },
  {
    id: 'item_sal_beard',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_beard',
    name: 'Artisan Beard Sculpting & Steam Charcoal Towel Finish',
    description: 'Razor-sharp contour lines with Japanese shear trimming, warm botanical oil massage, and steaming herbal towel wrap.',
    price: 280,
    is_veg: 1,
  },
  {
    id: 'item_sal_hydra_facial',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_spa',
    name: 'Hydra-Glow Ultrasonic Deep Pore Cleansing Facial',
    description: 'Multi-stage vortex extraction, hyaluronic acid peptide infusion, and cold cryo-wand tightening for intense skin radiance.',
    price: 1200,
    is_veg: 1,
  },
  {
    id: 'item_sal_hair_spa',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_spa',
    name: 'Moroccan Argan Intensive Hair Spa & Keratin Therapy',
    description: 'Deep moisture cuticle mask with hot ozone steam, followed by leave-in botanical keratin shield against pollution.',
    price: 1400,
    is_veg: 1,
  },
  {
    id: 'item_sal_reflexology',
    restaurant_id: 'rest_glamour_salon',
    category_id: 'cat_sal_spa',
    name: 'Aromatherapy Foot & Calf Reflexology (45 Min)',
    description: 'Epsom salt & lavender foot soak followed by pressure-point meridian massage with cold-pressed organic sesame oil.',
    price: 850,
    is_veg: 1,
  },

  // Roastery items
  {
    id: 'item_rc_affogato',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_coffee',
    name: 'Vanilla Bean Gelato Affogato',
    description: 'Double shot of house espresso poured over slow-churned Madagascar vanilla bean gelato with cacao nibs.',
    price: 260,
    is_veg: 1,
  },
  {
    id: 'item_rc_matcha',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_coffee',
    name: 'Uji Ceremonial Matcha Latte',
    description: 'Stone-ground ceremonial grade Japanese matcha whisked with velvety steamed oat milk and raw wildflower honey.',
    price: 290,
    is_veg: 1,
  },
  {
    id: 'item_rc_pain_au_choc',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_bakery',
    name: 'Valrhona Pain au Chocolat',
    description: 'Flaky 72-layer butter pastry rolled with double batons of 66% Valrhona dark French chocolate.',
    price: 240,
    is_veg: 1,
  },
  {
    id: 'item_rc_almond_croissant',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_bakery',
    name: 'Twice-Baked Frangipane Almond Croissant',
    description: 'Twice-baked butter croissant loaded with rich almond cream frangipane and toasted sliced California almonds.',
    price: 270,
    is_veg: 1,
  },
  {
    id: 'item_rc_avocado_toast',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_all_day',
    name: 'Hass Avocado Tartine on Country Sourdough',
    description: 'Crushed Hass avocado, marinated heirloom cherry tomatoes, Persian feta, pickled shallots, and toasted dukkah spice.',
    price: 420,
    is_veg: 1,
  },
  {
    id: 'item_rc_shakshuka',
    restaurant_id: 'rest_roastery',
    category_id: 'cat_all_day',
    name: 'Skillet Baked Shakshuka with Feta',
    description: 'Two poached farm eggs gently simmered in spiced San Marzano tomato & roasted pepper ragout, served with warm sourdough focaccia.',
    price: 450,
    is_veg: 0,
  },
];

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO menu_items (id, restaurant_id, category_id, name, description, price, is_veg, is_available)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

let inserted = 0;
for (const it of ITEMS) {
  insertStmt.run(it.id, it.restaurant_id, it.category_id, it.name, it.description, it.price, it.is_veg);
  inserted++;
}

console.log(`Successfully seeded ${inserted} rich items into SQLite restaurant.db!`);
