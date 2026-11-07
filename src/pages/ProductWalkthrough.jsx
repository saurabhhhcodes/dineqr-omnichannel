// src/pages/ProductWalkthrough.jsx - End-to-End Live Interactive Device Simulator & Dual-Language Flow Theater
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Languages,
  ArrowRight,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Smartphone,
  Tv,
  Receipt,
  Store,
  Database,
  FastForward,
  Terminal,
  MousePointerClick,
  MonitorPlay,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Plus,
  Check,
  RotateCcw,
  Clock,
  Printer,
  Bell,
  Layers,
  ChevronRight,
  Lock,
  Zap,
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpayCheckout.js';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export function ProductWalkthrough() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { activeRestaurant } = useRestaurant();

  const [activeFlowIndex, setActiveFlowIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subtitleLang, setSubtitleLang] = useState('hi'); // 'hi' | 'en'
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [displayMode, setDisplayMode] = useState('interactive'); // 'interactive' | 'video'

  // Interactive Live Device States
  const [interactiveStep, setInteractiveStep] = useState(0); // 0 = idle, 1 = clicking, 2 = processing, 3 = completed
  const [actionLog, setActionLog] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50, visible: false, clicking: false });

  // Flow specific live interactive states
  const [customerCartCount, setCustomerCartCount] = useState(0);
  const [customerBasketOpen, setCustomerBasketOpen] = useState(false);
  const [customerDetailsEntered, setCustomerDetailsEntered] = useState(false);
  const [customerRazorpayActive, setCustomerRazorpayActive] = useState(false);
  const [customerOrderPlaced, setCustomerOrderPlaced] = useState(false);
  const [captainSelectedTable, setCaptainSelectedTable] = useState('Table 03');
  const [captainKotPunched, setCaptainKotPunched] = useState(false);
  const [kdsTicketStatus, setKdsTicketStatus] = useState('RECEIVED'); // RECEIVED, PREPARING, READY
  const [tokenTvActiveTokens, setTokenTvActiveTokens] = useState({
    preparing: ['#9545', '#6602'],
    ready: ['#9724'],
  });
  const [cashierBillSettled, setCashierBillSettled] = useState(false);
  const [ownerItemPrice, setOwnerItemPrice] = useState(240);
  const [ownerStaffClockedIn, setOwnerStaffClockedIn] = useState(false);
  const [onboardingPlanSelected, setOnboardingPlanSelected] = useState('pro_1500');
  const [cloudSynced, setCloudSynced] = useState(false);
  const [adminActiveNiche, setAdminActiveNiche] = useState('gym');
  const [adminMemberPunched, setAdminMemberPunched] = useState(false);
  const [adminFeeCollected, setAdminFeeCollected] = useState(false);

  // 8 Platform User Flows Definitions
  const USER_FLOWS = [
    {
      id: 'customer',
      flowNumber: '01',
      role: 'डाइनर / ग्राहक (Customer Flow)',
      title: 'Table QR Digital Menu, Order Basket & Razorpay',
      badge: 'Guest Self-Ordering',
      icon: UtensilsCrossed,
      videoUrl: '/videos/walkthrough_restaurant.mp4',
      hindiNarration:
        'अध्याय 1: ग्राहक फ्लो। ग्राहक टेबल का क्यूआर स्कैन करते हैं। मेनू से आइटम जोड़ते ही ऑर्डर बास्केट खुलती है। देखिए, ग्राहक अपना नाम "विक्रम मल्होत्रा" और फोन नंबर डालते हैं। रेज़रपे ऑनलाइन यूपीआई चुनकर "Pay & Confirm" दबाते हैं। तुरंत पेमेंट कन्फर्म हो गई, टोकन नंबर 128 मिल गया और टिकट किचन में पहुंच गया। पूरा प्रोसेस बिना वेटर के सिर्फ 15 सेकंड में पूरा हो गया।',
      englishNarration:
        'Chapter 1: Diner Flow. Guests scan table QR code. Watch as dishes are added to cart and the slide-over order basket opens. The guest enters their name, phone number, and cooking preferences. After selecting Razorpay instant UPI payment, the order is confirmed with Token #128 and instantly dispatched to the kitchen KDS.',
      stepsCount: 5,
      executeSimulation: async () => {
        // Step 1: Move cursor to add item button
        setCursorPos({ x: 75, y: 38, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 600));
        setCustomerCartCount(2);
        playChime(660);
        setActionLog((l) => ['[Customer] Added 2 Items: Truffle Fries (₹260) & Wood-Fired Pizza (₹450)', ...l]);
        setInteractiveStep(1);

        // Step 2: Open Order Basket Drawer
        await new Promise((r) => setTimeout(r, 800));
        setCursorPos({ x: 50, y: 88, visible: true, clicking: true });
        setCustomerBasketOpen(true);
        playChime(720);
        setActionLog((l) => ['[Customer] Opened Order Basket Drawer (Subtotal ₹710 + GST)', ...l]);
        setInteractiveStep(2);

        // Step 3: Enter Customer Details & Cooking Note
        await new Promise((r) => setTimeout(r, 900));
        setCursorPos({ x: 40, y: 55, visible: true, clicking: false });
        setCustomerDetailsEntered(true);
        setActionLog((l) => ['[Customer] Entered Dining Details: "Vikram Malhotra · +91 98765 43210 · Less Spicy"', ...l]);
        setInteractiveStep(3);

        // Step 4: Trigger Razorpay Checkout
        await new Promise((r) => setTimeout(r, 900));
        setCursorPos({ x: 50, y: 85, visible: true, clicking: true });
        setCustomerRazorpayActive(true);
        playChime(880);
        setActionLog((l) => ['[Razorpay] Opened Instant UPI Payment Gateway (₹746 Total)', ...l]);
        setInteractiveStep(4);

        // Step 5: Complete Order Placement
        await new Promise((r) => setTimeout(r, 1200));
        setCustomerRazorpayActive(false);
        setCustomerBasketOpen(false);
        setCustomerOrderPlaced(true);
        playChime(1050);
        setCursorPos({ x: 50, y: 85, visible: false, clicking: false });
        setInteractiveStep(5);
        setActionLog((l) => ['[Customer] Payment Verified! Order #ORD-9128 Confirmed. Token #128 sent to Kitchen.', ...l]);
      },
      resetSimulation: () => {
        setCustomerCartCount(0);
        setCustomerBasketOpen(false);
        setCustomerDetailsEntered(false);
        setCustomerRazorpayActive(false);
        setCustomerOrderPlaced(false);
        setInteractiveStep(0);
      },
    },
    {
      id: 'captain',
      flowNumber: '02',
      role: 'फ्लोर कैप्टन / वेटर (Captain Waiter Flow)',
      title: 'Mobile Captain App & Table KOT Punching',
      badge: 'Floor Waiter POS',
      icon: Smartphone,
      videoUrl: '/videos/walkthrough_floorplan.mp4',
      hindiNarration:
        'अध्याय 2: कैप्टन फ्लो। वेटर अपने फोन पर कैप्टन ऐप खोलते हैं। देखिए, हमने "टेबल 03" चुनी। कस्टमर के कहे अनुसार "तंदूरी प्लेटर" जोड़ा और स्पेशल निर्देश "कम तीखा" टाइप किया। अब "Punch KOT" दबाने पर यह बिना एक सेकंड गंवाए सीधे शेफ की स्क्रीन पर पहुंच जाता है।',
      englishNarration:
        'Chapter 2: Captain Waiter Flow. Floor captains open the mobile app. Watch as we select Table 03, add Tandoori Platter, add cooking note "Less Spicy", and tap "Punch KOT". The ticket immediately fires to the Kitchen KDS screen without the waiter walking back.',
      stepsCount: 3,
      executeSimulation: async () => {
        // Step 1: Select Table 03
        setCursorPos({ x: 60, y: 25, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 600));
        setCaptainSelectedTable('Table 03');
        playChime(580);
        setActionLog((l) => ['[Captain App] Selected Table 03 (4 Seater - Window Bay)', ...l]);
        setInteractiveStep(1);

        // Step 2: Add special note & tap Punch KOT
        await new Promise((r) => setTimeout(r, 900));
        setCursorPos({ x: 50, y: 85, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 500));
        setInteractiveStep(2);
        setActionLog((l) => ['[Captain App] Punching KOT with note: "Less spicy, extra crisp crust"...', ...l]);

        // Step 3: Success feedback
        await new Promise((r) => setTimeout(r, 1200));
        setCaptainKotPunched(true);
        playChime(1050);
        setCursorPos({ x: 50, y: 85, visible: false, clicking: false });
        setInteractiveStep(3);
        setActionLog((l) => ['[Captain App] KOT #K-4109 Punched! Audio chime sent to Kitchen Station #1.', ...l]);
      },
      resetSimulation: () => {
        setCaptainKotPunched(false);
        setInteractiveStep(0);
      },
    },
    {
      id: 'kitchen',
      flowNumber: '03',
      role: 'किचन शेफ / कुक (Kitchen Chef KDS)',
      title: 'Kitchen Display System & Sound Alerts',
      badge: 'Kitchen Display',
      icon: ChefHat,
      videoUrl: '/videos/walkthrough_kds.mp4',
      hindiNarration:
        'अध्याय 3: किचन केडीएस फ्लो। जैसे ही नया ऑर्डर आया, अलर्ट घंटी बजी। शेफ स्क्रीन पर टेबल नंबर और आइटम देखते हैं। शेफ ने "Accept & Start Prep" बटन दबाया जिससे टिकट पीला हो गया। खाना तैयार होने पर उन्होंने "Mark Ready" दबाया और टिकट हरा हो गया।',
      englishNarration:
        'Chapter 3: Kitchen KDS Flow. Incoming orders trigger an audible chime. Chefs review items and notes on the wall screen. Watch as the chef taps "Start Prep", turning the ticket yellow, then taps "Mark Ready", turning it green and notifying the pickup counter.',
      stepsCount: 3,
      executeSimulation: async () => {
        // Step 1: Order arrives, chime sounds
        playChime(880);
        setActionLog((l) => ['[Kitchen KDS] New Order ORD-9128 Arrived! Urgent Timer Started.', ...l]);
        setInteractiveStep(1);

        // Step 2: Tap "Start Preparing"
        await new Promise((r) => setTimeout(r, 800));
        setCursorPos({ x: 50, y: 70, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 400));
        setKdsTicketStatus('PREPARING');
        playChime(620);
        setActionLog((l) => ['[Kitchen KDS] Chef accepted ticket. Status: PREPARING (Cooking active).', ...l]);
        setInteractiveStep(2);

        // Step 3: Tap "Mark Ready"
        await new Promise((r) => setTimeout(r, 1200));
        setCursorPos({ x: 50, y: 70, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 400));
        setKdsTicketStatus('READY');
        playChime(1170);
        setCursorPos({ x: 50, y: 70, visible: false, clicking: false });
        setInteractiveStep(3);
        setActionLog((l) => ['[Kitchen KDS] Dish Ready! KDS dispatched ready alert to Token TV Screen.', ...l]);
      },
      resetSimulation: () => {
        setKdsTicketStatus('RECEIVED');
        setInteractiveStep(0);
      },
    },
    {
      id: 'tokendisplay',
      flowNumber: '04',
      role: 'टोकन टीवी डिस्प्ले (Token TV Announcer)',
      title: 'Food Court Large TV & Audio Buzzer Chime',
      badge: 'TV Announcer',
      icon: Tv,
      videoUrl: '/videos/walkthrough_kds.mp4',
      hindiNarration:
        'अध्याय 4: टोकन टीवी डिस्प्ले फ्लो। बड़े टीवी स्क्रीन पर बाईं तरफ "Now Preparing" है और दाईं तरफ "Ready for Pickup"। शेफ के रेडी करते ही टोकन 9724 हरे बॉक्स में आ गया और तेज आवाज में अनाउंसमेंट हुआ: "टोकन नंबर 9724, आपका ऑर्डर काउंटर पर तैयार है।"',
      englishNarration:
        'Chapter 4: Token TV Display Flow. On the large screen TV, pending orders show under "Now Preparing". When ready, Token #9724 moves to "Ready for Pickup" with a flashing green glow and an automated voice announcement.',
      stepsCount: 3,
      executeSimulation: async () => {
        // Step 1: Order shows in Preparing
        setActionLog((l) => ['[Token TV] Token #9724 cooking in kitchen under "Now Preparing".', ...l]);
        setInteractiveStep(1);

        // Step 2: Chime buzzer & move to Ready
        await new Promise((r) => setTimeout(r, 900));
        playChime(1170);
        setTokenTvActiveTokens({
          preparing: ['#6602'],
          ready: ['#9724', '#9545'],
        });
        setInteractiveStep(2);
        setActionLog((l) => ['[Token TV] Buzzer Chime Activated! Token #9724 moved to "READY FOR PICKUP".', ...l]);

        // Step 3: Voice Callout
        await new Promise((r) => setTimeout(r, 600));
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance('Token number 9724, your order is ready for pickup.');
          utt.lang = 'en-IN';
          window.speechSynthesis.speak(utt);
        }
        setInteractiveStep(3);
        setActionLog((l) => ['[Token TV] Voice Announcement: "Token number 9724, your order is ready for pickup."', ...l]);
      },
      resetSimulation: () => {
        setTokenTvActiveTokens({
          preparing: ['#9545', '#6602'],
          ready: ['#9724'],
        });
        setInteractiveStep(0);
      },
    },
    {
      id: 'cashier',
      flowNumber: '05',
      role: 'कैशियर व बिलिंग काउंटर (Billing Cashier)',
      title: '3-Second Billing & Local Folder Receipts',
      badge: 'Counter POS',
      icon: Receipt,
      videoUrl: '/videos/walkthrough_pnl.mp4',
      hindiNarration:
        'अध्याय 5: बिलिंग कैशियर फ्लो। कैशियर काउंटर पर टेबल 03 का बिल खोलते हैं। देखिए, हमने "Cash Settlement" चुना और "Settle & Print" बटन दबाया। बिल तुरंत सेटल हो गया और बिना इंटरनेट के भी आपके कंप्यूटर के फोल्डर DineQR-Data/bills में 80mm थर्मल रसीद सेव हो गई।',
      englishNarration:
        'Chapter 5: Billing Cashier Flow. The cashier opens Table 03, selects Cash or UPI, and taps "Settle & Print". The bill settles in under 3 seconds and the official 80mm ESC/POS receipt automatically saves to your local DineQR-Data/bills/ folder.',
      stepsCount: 3,
      executeSimulation: async () => {
        // Step 1: Open Table Bill
        setActionLog((l) => ['[Cashier POS] Loaded Table 03 Bill. Subtotal: ₹760 + GST: ₹38 = Grand Total: ₹798.', ...l]);
        setInteractiveStep(1);

        // Step 2: Tap Settle Bill
        await new Promise((r) => setTimeout(r, 900));
        setCursorPos({ x: 50, y: 82, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 400));
        setInteractiveStep(2);
        setActionLog((l) => ['[Cashier POS] Marking counter payment & generating ESC/POS 80mm bill...', ...l]);

        // Step 3: Receipt saved locally
        await new Promise((r) => setTimeout(r, 1200));
        setCashierBillSettled(true);
        playChime(1050);
        setCursorPos({ x: 50, y: 82, visible: false, clicking: false });
        setInteractiveStep(3);
        setActionLog((l) => ['[Cashier POS] Bill Settled! Thermal HTML & JSON saved to DineQR-Data/bills/BILL_ORD-9128.html', ...l]);
      },
      resetSimulation: () => {
        setCashierBillSettled(false);
        setInteractiveStep(0);
      },
    },
    {
      id: 'owner',
      flowNumber: '06',
      role: 'मालिक व स्टोर मैनेजर (Owner Operations)',
      title: '2-Second Menu Price Changes & Staff Timeclock',
      badge: 'Owner Operations',
      icon: Store,
      videoUrl: '/videos/walkthrough_sqlite.mp4',
      hindiNarration:
        'अध्याय 6: मालिक का फ्लो। मालिक अपने मोबाइल या लैपटॉप से 2 सेकंड में किसी भी डिश का दाम बदल सकते हैं। देखिए, हमने डिश का दाम ₹240 से ₹260 कर दिया। और स्टाफ सेक्शन में स्टाफ अपना पिन 1234 डालकर क्लॉक-इन करता है, जिससे उनके आने का सही समय रिकॉर्ड हो जाता है।',
      englishNarration:
        'Chapter 6: Owner Operations Flow. Owners update dish prices in 2 seconds. Watch as we adjust the price from ₹240 to ₹260. In the staff roster, employees enter their 4-digit PIN to clock in, recording their exact arrival timestamp.',
      stepsCount: 3,
      executeSimulation: async () => {
        // Step 1: Change price slider/input
        setCursorPos({ x: 65, y: 35, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 600));
        setOwnerItemPrice(260);
        playChime(750);
        setActionLog((l) => ['[Owner Admin] Updated "Artisan Truffle Fries" price to ₹260 (Saved to SQLite).', ...l]);
        setInteractiveStep(1);

        // Step 2: Staff Clock-In with PIN 1234
        await new Promise((r) => setTimeout(r, 900));
        setCursorPos({ x: 50, y: 72, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 400));
        setInteractiveStep(2);
        setActionLog((l) => ['[Staff Roster] Verifying PIN 1234 for Server Sunil (Duty #4)...', ...l]);

        // Step 3: Clock-In Success
        await new Promise((r) => setTimeout(r, 1100));
        setOwnerStaffClockedIn(true);
        playChime(950);
        setCursorPos({ x: 50, y: 72, visible: false, clicking: false });
        setInteractiveStep(3);
        setActionLog((l) => [`[Staff Roster] Sunil Clocked-In at ${new Date().toLocaleTimeString()}! Status: ON_DUTY.`, ...l]);
      },
      resetSimulation: () => {
        setOwnerItemPrice(240);
        setOwnerStaffClockedIn(false);
        setInteractiveStep(0);
      },
    },
    {
      id: 'onboarding',
      flowNumber: '07',
      role: 'नया रेस्टोरेंट ऑनबोर्डिंग (Merchant Onboarding)',
      title: '₹1,500 Local DB Plan & Razorpay Checkout Modal',
      badge: 'Merchant Setup',
      icon: Zap,
      videoUrl: '/videos/walkthrough_subscription.mp4',
      hindiNarration:
        'अध्याय 7: नए रेस्टोरेंट का ऑनबोर्डिंग फ्लो। व्यापारी पेटपूजा के 25,000 रुपये के खर्च से बचकर मात्र ₹1,500 प्रति माह के लोकल डीबी प्लान को चुनते हैं। देखिए, हम "Subscribe with Razorpay" बटन दबा रहे हैं। असली रेज़रपे का चेकआउट मोडल खुल गया, जहां यूपीआई और कार्ड से तुरंत पेमेंट हो जाती है।',
      englishNarration:
        'Chapter 7: Merchant Onboarding Flow. Instead of Petpooja’s ₹25,000 upfront fee, owners select our flat ₹1,500/month Local DB Plan. Watch as we tap "Subscribe with Razorpay". The official Razorpay checkout modal opens for instant UPI activation.',
      stepsCount: 3,
      executeSimulation: async () => {
        // Step 1: Select Plan
        setCursorPos({ x: 50, y: 40, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 600));
        setOnboardingPlanSelected('pro_1500');
        playChime(660);
        setActionLog((l) => ['[Onboarding] Selected Plan: "₹1,500/mo Local DB Plan (Zero Cloud DB Cost)".', ...l]);
        setInteractiveStep(1);

        // Step 2: Trigger Razorpay Checkout Modal
        await new Promise((r) => setTimeout(r, 900));
        setCursorPos({ x: 50, y: 85, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 400));
        setInteractiveStep(2);
        setActionLog((l) => ['[Razorpay] Creating Order on Razorpay backend (150,000 paise)...', ...l]);

        // Step 3: Trigger real Razorpay modal
        await new Promise((r) => setTimeout(r, 600));
        setCursorPos({ x: 50, y: 85, visible: false, clicking: false });
        try {
          await openRazorpayCheckout({
            amountPaise: 150000,
            receipt: 'rcpt_walkthrough_flow',
            customerName: 'Saurabh Bajpai (saurabhbajpai03)',
            customerEmail: 'saurabhbajpai03@gmail.com',
            customerPhone: '+919876543210',
            restaurantName: 'DineQR ₹1,500/mo Local Plan',
            onSuccess: (p) => {
              addToast(`Payment Verified! Payment ID: ${p.razorpay_payment_id}`, 'success');
              setActionLog((l) => [`[Razorpay] Verified signature for order ${p.razorpay_order_id}!`, ...l]);
            },
            onDismiss: () => {
              setActionLog((l) => ['[Razorpay] Modal closed by user. Ready for merchant onboarding.', ...l]);
            },
          });
        } catch (e) {}
        setInteractiveStep(3);
      },
      resetSimulation: () => {
        setInteractiveStep(0);
      },
    },
    {
      id: 'admin_business_control',
      flowNumber: '08',
      role: 'मालिक व एडमिन कंट्रोल (Admin Multi-Vertical Suite)',
      title: 'Universal Switcher for Restaurants, Cafes, Gyms & Clinics',
      badge: 'Admin Back-Office',
      icon: Store,
      videoUrl: '/videos/walkthrough_pnl.mp4',
      hindiNarration:
        'अध्याय 8: बिजनेस एडमिन फ्लो। मालिक एक ही सिस्टम से रेस्टोरेंट, कैफे, जिम का डिजिटल रजिस्टर, या क्लिनिक टोकन सीधे मैनेज कर सकते हैं। देखिए, हमने "Switch to Gym Mode" दबाया और तुरंत जिम के मेंबर्स की हाजिरी और ₹1500 की फीस रिन्यूअल स्क्रीन सामने आ गई। सब कुछ रियल-टाइम में कंट्रोल होता है।',
      englishNarration:
        'Chapter 8: Business Admin Flow. Owners can switch effortlessly between restaurant, cafe, gym digital attendance register, and clinic queues. Watch as we switch to Gym Mode, punch member attendance, and collect ₹1,500 renewal fees via Razorpay.',
      stepsCount: 4,
      executeSimulation: async () => {
        // Step 1: Click Switch Business
        setCursorPos({ x: 75, y: 20, visible: true, clicking: true });
        await new Promise((r) => setTimeout(r, 600));
        setInteractiveStep(1);
        setActionLog((l) => ['[Admin] Tapped Universal Business Switcher...', ...l]);

        // Step 2: Switch to Gym Mode
        await new Promise((r) => setTimeout(r, 700));
        setAdminActiveNiche('gym');
        playChime(750);
        setInteractiveStep(2);
        setActionLog((l) => ['[Admin] Activated IronPulse Fitness & Gym Mode! Paperless Member Register loaded.', ...l]);

        // Step 3: Punch Daily Member Attendance
        await new Promise((r) => setTimeout(r, 900));
        setCursorPos({ x: 80, y: 55, visible: true, clicking: true });
        setAdminMemberPunched(true);
        playChime(950);
        setInteractiveStep(3);
        setActionLog((l) => ['[Gym Register] 1-Tap Punch In Recorded: Rahul Sharma (08:15 AM). Expiry: 15 Dec.', ...l]);

        // Step 4: Settle ₹1,500 Monthly Fee
        await new Promise((r) => setTimeout(r, 1100));
        setCursorPos({ x: 80, y: 75, visible: true, clicking: true });
        setAdminFeeCollected(true);
        playChime(1170);
        setCursorPos({ x: 80, y: 75, visible: false, clicking: false });
        setInteractiveStep(4);
        setActionLog((l) => ['[Gym Register] Collected ₹1,500 Monthly Membership via Razorpay UPI! Digital bill generated.', ...l]);
      },
      resetSimulation: () => {
        setAdminActiveNiche('restaurant');
        setAdminMemberPunched(false);
        setAdminFeeCollected(false);
        setInteractiveStep(0);
      },
    },
  ];

  const currentFlow = USER_FLOWS[activeFlowIndex];

  // Synthesize Web Audio chime
  const playChime = (freq = 880) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  };

  // Find the highest-quality human natural voice on user's system (Zero API Key needed)
  const getBestNaturalVoice = (lang = 'hi') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'hi') {
      const preferredHindi = [
        'Google हिन्दी',
        'Swara',
        'Madhur',
        'Lekha (Enhanced)',
        'Lekha',
        'Neerja',
        'Kiran',
        'Veena',
      ];
      for (const name of preferredHindi) {
        const found = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
      return voices.find((v) => v.lang.toLowerCase().startsWith('hi')) || null;
    } else {
      const preferredEnglish = [
        'Rishi (Enhanced)',
        'Rishi',
        'Google English (India)',
        'Neerja',
        'Prabhat',
        'Samantha (Enhanced)',
        'Ava (Premium)',
        'Serena',
        'Google UK English Female',
      ];
      for (const name of preferredEnglish) {
        const found = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
      return (
        voices.find((v) => v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
        null
      );
    }
  };

  // High-Grade Natural Speech Narration (Ultra Fluent, Human Cadence)
  const speakNarration = (index, lang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!isVoiceActive) return;

    const flow = USER_FLOWS[index];
    if (!flow) return;

    const textToSpeak = lang === 'en' ? flow.englishNarration : flow.hindiNarration;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 0.94; // Measured, warm, natural human presentation speed
    utterance.pitch = 1.0; // Balanced conversational pitch

    const bestVoice = getBestNaturalVoice(lang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Run full flow: Speaks narration and executes live simulated actions
  const runCurrentFlowDemo = async () => {
    setIsPlaying(true);
    currentFlow.resetSimulation();
    speakNarration(activeFlowIndex, subtitleLang);
    await new Promise((r) => setTimeout(r, 600));
    await currentFlow.executeSimulation();
  };

  // Reset and speak when flow index changes
  useEffect(() => {
    currentFlow.resetSimulation();
    speakNarration(activeFlowIndex, subtitleLang);
  }, [activeFlowIndex, subtitleLang, isVoiceActive]);

  // Clean up speech synthesis
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleNextFlow = () => {
    setActiveFlowIndex((prev) => (prev + 1) % USER_FLOWS.length);
  };

  const handlePrevFlow = () => {
    setActiveFlowIndex((prev) => (prev - 1 + USER_FLOWS.length) % USER_FLOWS.length);
  };

  const FlowIcon = currentFlow.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
              LIVE PLATFORM SIMULATOR
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Every Button, Action & Dual-Language Flow Tested End-to-End
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>{currentFlow.role}</span>
            <span className="text-xs font-normal text-slate-400">· {currentFlow.title}</span>
          </h1>
        </div>

        {/* View Mode & Language Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Display Mode: Live Interactive Canvas vs Video */}
          <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setDisplayMode('interactive')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                displayMode === 'interactive'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>Live App Simulator</span>
            </button>
            <button
              onClick={() => setDisplayMode('video')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                displayMode === 'video'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>Recorded Video</span>
            </button>
          </div>

          {/* Hindi / English Audio Switcher */}
          <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setSubtitleLang('hi')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subtitleLang === 'hi'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setSubtitleLang('en')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                subtitleLang === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                const next = !isVoiceActive;
                setIsVoiceActive(next);
                if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-1.5 rounded-lg transition-all ml-1 ${
                isVoiceActive ? 'text-amber-400 bg-slate-700' : 'text-slate-500'
              }`}
              title={isVoiceActive ? 'Voice narration active' : 'Voice narration muted'}
            >
              {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <Link
            to="/poss"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition flex items-center gap-1.5"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span>Petpooja Comparison</span>
          </Link>
        </div>
      </header>

      {/* Main Simulator & Timeline Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Live Interactive Device Shell */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[500px] flex flex-col justify-between">
            {/* Top Bar on Device */}
            <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs z-20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-slate-300 font-bold uppercase">
                  {currentFlow.role} · SCREEN ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={runCurrentFlowDemo}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ऑटो-फ्लो चलाएं (Auto-Play Flow)</span>
                </button>
                <button
                  onClick={() => currentFlow.resetSimulation()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Reset flow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Virtual Touch Cursor */}
            {cursorPos.visible && (
              <div
                className="absolute z-50 pointer-events-none transition-all duration-300 ease-out flex items-center gap-1"
                style={{ top: `${cursorPos.y}%`, left: `${cursorPos.x}%` }}
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 border-white shadow-2xl flex items-center justify-center transition-all ${
                    cursorPos.clicking ? 'scale-75 bg-amber-400/80 ring-4 ring-amber-400/40' : 'bg-amber-500/60'
                  }`}
                >
                  <MousePointerClick className="w-4 h-4 text-slate-950" />
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/90 text-amber-400 border border-slate-700 shadow-lg whitespace-nowrap">
                  Tapping...
                </span>
              </div>
            )}

            {/* DEVICE CANVAS: Content changes based on active user flow */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center relative overflow-hidden bg-slate-950/60">
              {displayMode === 'video' ? (
                /* Mode A: Real Captured Platform Video */
                <div className="w-full h-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    src={currentFlow.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                /* Mode B: Live Real-Time Interactive Device Screen */
                <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
                  {/* Flow 1: Customer Self-Ordering Screen with Complete Basket & Razorpay Flow */}
                  {currentFlow.id === 'customer' && (
                    <div className="space-y-3">
                      {customerOrderPlaced ? (
                        <div className="p-5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/50 text-emerald-200 text-center space-y-3 animate-in zoom-in-95 shadow-xl">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                          <div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                              Order Live on Kitchen KDS
                            </span>
                            <h4 className="text-lg font-black text-white mt-1">Order #ORD-9128 Confirmed!</h4>
                            <div className="text-2xl font-mono font-black text-amber-400 my-1">
                              TOKEN #128
                            </div>
                            <p className="text-xs text-slate-300">
                              Billed to <strong className="text-white">Vikram Malhotra</strong> (+91 98765 43210) · Table 01
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left font-mono space-y-1">
                            <div className="flex justify-between text-slate-400">
                              <span>Payment Method:</span>
                              <span className="text-emerald-400 font-bold">Razorpay UPI (Verified)</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Total Paid:</span>
                              <span className="text-white font-bold">₹746.00</span>
                            </div>
                          </div>
                        </div>
                      ) : customerRazorpayActive ? (
                        <div className="p-5 rounded-2xl bg-slate-950 border-2 border-sky-500/60 text-white space-y-4 animate-in zoom-in-95 shadow-2xl">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-sky-400" />
                              <span className="text-xs font-black tracking-wide">Razorpay Instant Checkout</span>
                            </div>
                            <span className="text-xs font-mono font-black text-sky-400">₹746</span>
                          </div>
                          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs space-y-1.5">
                            <div className="flex justify-between text-slate-300">
                              <span>Selected App:</span>
                              <span className="font-bold text-white">Google Pay / PhonePe UPI</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Payer:</span>
                              <span className="font-bold text-white">Vikram Malhotra (98765 43210)</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 text-center font-bold text-xs text-amber-400 animate-pulse">
                            Simulating UPI PIN Authorization...
                          </div>
                        </div>
                      ) : customerBasketOpen ? (
                        <div className="p-4 rounded-2xl bg-white text-slate-950 space-y-3.5 shadow-2xl animate-in slide-in-from-right-4 border-2 border-slate-200">
                          {/* Basket Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-5 h-5 text-amber-600" />
                              <h4 className="font-black text-sm text-slate-950">Your Order Basket</h4>
                            </div>
                            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                              Table 01 · 2 Items
                            </span>
                          </div>

                          {/* Basket Items List */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between font-bold text-slate-900 py-1 border-b border-slate-100">
                              <span>1x Artisan Truffle Fries</span>
                              <span>₹260</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 py-1 border-b border-slate-100">
                              <span>1x Classic Margherita Pizza</span>
                              <span>₹450</span>
                            </div>
                          </div>

                          {/* High-Contrast Dining Details Form */}
                          <div className="p-3 rounded-xl bg-slate-100 border-2 border-slate-300 space-y-2">
                            <div className="text-[11px] font-black text-slate-950 uppercase tracking-wide">
                              Dining Details & Bill Info
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase">Your Name</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={customerDetailsEntered ? 'Vikram Malhotra' : ''}
                                  placeholder="e.g. Vikram Malhotra"
                                  className="w-full px-2 py-1.5 rounded-lg bg-white border-2 border-slate-300 text-xs font-bold text-slate-950 placeholder:text-slate-500 shadow-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 uppercase">Phone Number</label>
                                <input
                                  type="tel"
                                  readOnly
                                  value={customerDetailsEntered ? '+91 98765 43210' : ''}
                                  placeholder="+91 98765 43210"
                                  className="w-full px-2 py-1.5 rounded-lg bg-white border-2 border-slate-300 text-xs font-bold text-slate-950 placeholder:text-slate-500 shadow-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-900 uppercase">Special Note</label>
                              <input
                                type="text"
                                readOnly
                                value={customerDetailsEntered ? 'Less spicy, extra napkins' : ''}
                                placeholder="Less spicy..."
                                className="w-full px-2 py-1.5 rounded-lg bg-white border-2 border-slate-300 text-xs font-bold text-slate-950 placeholder:text-slate-500 shadow-xs"
                              />
                            </div>
                          </div>

                          {/* Bill & Pay CTA */}
                          <div className="pt-1 flex items-center justify-between text-xs font-bold">
                            <div>
                              <span className="text-slate-500 text-[10px] block">Grand Total (Incl. GST)</span>
                              <span className="text-base font-black text-slate-950">₹746</span>
                            </div>
                            <button
                              onClick={() => {
                                setCustomerRazorpayActive(true);
                                playChime(880);
                              }}
                              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
                            >
                              Pay & Confirm Order
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Menu Browse Screen */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                                Table 01 · Digital Menu
                              </span>
                              <h3 className="text-base font-extrabold text-white">L'Osteria Gourmet Bistro</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-5 h-5 text-amber-400" />
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                                {customerCartCount} Items
                              </span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <h4 className="text-sm font-bold text-white">Artisan Truffle Fries</h4>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">Golden fries, herb dips · ₹260</p>
                            </div>
                            <button
                              onClick={() => {
                                setCustomerCartCount((c) => c + 1);
                                playChime(660);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1 transition active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <h4 className="text-sm font-bold text-white">Classic Margherita Pizza</h4>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">San Marzano sauce, buffalo mozzarella · ₹450</p>
                            </div>
                            <button
                              onClick={() => {
                                setCustomerCartCount((c) => c + 1);
                                playChime(660);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1 transition active:scale-95 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          </div>

                          {customerCartCount > 0 && (
                            <button
                              onClick={() => {
                                setCustomerBasketOpen(true);
                                playChime(720);
                              }}
                              className="w-full py-3 rounded-xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-between px-4 transition bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                <span>View Basket ({customerCartCount} Items)</span>
                              </div>
                              <span className="font-black">₹710 ➔</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Flow 2: Captain Waiter Screen */}
                  {currentFlow.id === 'captain' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                            Captain App · Waiter Duty #4
                          </span>
                          <h3 className="text-base font-extrabold text-white">Punch Table KOT</h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700">
                          {captainSelectedTable}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {['Table 01', 'Table 02', 'Table 03'].map((tbl) => (
                          <button
                            key={tbl}
                            onClick={() => {
                              setCaptainSelectedTable(tbl);
                              playChime(580);
                            }}
                            className={`p-2 rounded-xl text-xs font-bold border transition ${
                              captainSelectedTable === tbl
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            {tbl}
                          </button>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <div className="font-bold text-white">1x Tandoori Paneer Platter (₹380)</div>
                        <div className="text-amber-400 text-[11px] italic">Special Note: "Less spicy, extra crisp"</div>
                      </div>

                      {captainKotPunched ? (
                        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center space-y-1 animate-in zoom-in-95">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                          <h4 className="text-sm font-extrabold">KOT #K-4109 Punched!</h4>
                          <p className="text-xs text-emerald-200">Dispatched to Chef KDS without walking to kitchen</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCaptainKotPunched(true);
                            playChime(1050);
                          }}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Punch KOT to Kitchen Station</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Flow 3: Kitchen KDS Screen */}
                  {currentFlow.id === 'kitchen' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                            Kitchen KDS Screen · Station #1
                          </span>
                          <h3 className="text-base font-extrabold text-white">Incoming Table Orders</h3>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                            kdsTicketStatus === 'READY'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : kdsTicketStatus === 'PREPARING'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          {kdsTicketStatus}
                        </span>
                      </div>

                      <div
                        className={`p-4 rounded-xl border transition-all ${
                          kdsTicketStatus === 'READY'
                            ? 'bg-emerald-950/40 border-emerald-500/40'
                            : kdsTicketStatus === 'PREPARING'
                            ? 'bg-amber-950/40 border-amber-500/40'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Table 03 · Token #9128</span>
                          <span className="font-mono text-amber-400">Elapsed: 03:12</span>
                        </div>
                        <div className="mt-2 text-xs space-y-1 text-slate-300">
                          <div>• 2x Wood-Fired Margherita Pizza</div>
                          <div>• 1x Artisanal Garlic Breadsticks</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setKdsTicketStatus(kdsTicketStatus === 'RECEIVED' ? 'PREPARING' : 'READY');
                            playChime(kdsTicketStatus === 'RECEIVED' ? 620 : 1170);
                          }}
                          className={`flex-1 py-3 rounded-xl font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 ${
                            kdsTicketStatus === 'READY'
                              ? 'bg-emerald-500 text-slate-950'
                              : kdsTicketStatus === 'PREPARING'
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>
                            {kdsTicketStatus === 'READY'
                              ? 'Order Ready for Pickup!'
                              : kdsTicketStatus === 'PREPARING'
                              ? 'Mark Ready for Pickup (Turn Green)'
                              : 'Accept & Start Prep (Turn Yellow)'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Flow 4: Token TV Display */}
                  {currentFlow.id === 'tokendisplay' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Tv className="w-5 h-5 text-amber-400" />
                          <h3 className="text-base font-extrabold text-white">Food Court Overhead TV</h3>
                        </div>
                        <span className="text-xs font-mono text-amber-400 font-bold">12:45:00 PM</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Now Preparing */}
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-center space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                            NOW PREPARING
                          </span>
                          <div className="flex flex-wrap justify-center gap-2">
                            {tokenTvActiveTokens.preparing.map((t) => (
                              <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-mono text-lg font-black text-amber-400">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Ready for Pickup */}
                        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2 animate-pulse">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                            READY FOR PICKUP
                          </span>
                          <div className="flex flex-wrap justify-center gap-2">
                            {tokenTvActiveTokens.ready.map((t) => (
                              <span key={t} className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono text-xl font-black shadow-lg">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          playChime(1170);
                          if ('speechSynthesis' in window) {
                            const utt = new SpeechSynthesisUtterance('Token number 9724, your order is ready.');
                            utt.lang = 'en-IN';
                            window.speechSynthesis.speak(utt);
                          }
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 flex items-center justify-center gap-2"
                      >
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span>Test TV Buzzer & Voice Callout</span>
                      </button>
                    </div>
                  )}

                  {/* Flow 5: Cashier POS */}
                  {currentFlow.id === 'cashier' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                            Billing Counter POS · Terminal #1
                          </span>
                          <h3 className="text-base font-extrabold text-white">Table 03 Bill Settlement</h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-300">Total: ₹798</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono text-slate-300">
                        <div className="flex justify-between">
                          <span>Subtotal (3 items)</span>
                          <span>₹760.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CGST (2.5%) + SGST (2.5%)</span>
                          <span>₹38.00</span>
                        </div>
                        <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-white text-sm">
                          <span>Grand Total</span>
                          <span className="text-amber-400">₹798.00</span>
                        </div>
                      </div>

                      {cashierBillSettled ? (
                        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center space-y-1 animate-in zoom-in-95">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                          <h4 className="text-sm font-extrabold">Bill Settled & Printed!</h4>
                          <p className="text-xs text-emerald-200">
                            Saved locally to: <code className="text-white">DineQR-Data/bills/</code>
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCashierBillSettled(true);
                            playChime(1050);
                          }}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Settle Bill & Print 80mm Receipt</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Flow 6: Owner Admin & Staff Timeclock */}
                  {currentFlow.id === 'owner' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                            Owner Control Center · Local DB
                          </span>
                          <h3 className="text-base font-extrabold text-white">Menu & Staff Operations</h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ₹1,500 Plan Active
                        </span>
                      </div>

                      {/* Instant Price Change */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Artisan Truffle Fries Price:</span>
                          <span className="font-mono font-black text-amber-400 text-base">₹{ownerItemPrice}</span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max="350"
                          step="10"
                          value={ownerItemPrice}
                          onChange={(e) => {
                            setOwnerItemPrice(Number(e.target.value));
                            playChime(750);
                          }}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>₹200</span>
                          <span>Adjust slider to change price in 2s</span>
                          <span>₹350</span>
                        </div>
                      </div>

                      {/* Staff Clock-in */}
                      {ownerStaffClockedIn ? (
                        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center text-xs font-bold animate-in zoom-in-95">
                          ✓ Server Sunil (Pin 1234) Clocked In at {new Date().toLocaleTimeString()}!
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setOwnerStaffClockedIn(true);
                            playChime(950);
                          }}
                          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center justify-center gap-2"
                        >
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Simulate Staff Clock-In with PIN 1234</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Flow 7: Onboarding & Razorpay Checkout */}
                  {currentFlow.id === 'onboarding' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                            Merchant Setup · Zero Upfront Cost
                          </span>
                          <h3 className="text-base font-extrabold text-white">Select Your Flat Plan</h3>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-bold">10-Min Setup</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setOnboardingPlanSelected('pro_1500')}
                          className={`p-3 rounded-xl border cursor-pointer transition ${
                            onboardingPlanSelected === 'pro_1500'
                              ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/20'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">Local DB Plan</div>
                          <div className="text-lg font-black text-amber-400 mt-1">₹1,500 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                          <p className="text-[10px] text-slate-400 mt-1">Zero cloud DB cost. On-premise SQLite.</p>
                        </div>

                        <div
                          onClick={() => setOnboardingPlanSelected('cloud_5000')}
                          className={`p-3 rounded-xl border cursor-pointer transition ${
                            onboardingPlanSelected === 'cloud_5000'
                              ? 'bg-emerald-500/10 border-emerald-400 ring-2 ring-emerald-400/20'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="text-xs font-bold text-white">Cloud Sync Plan</div>
                          <div className="text-lg font-black text-emerald-400 mt-1">₹5,000 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                          <p className="text-[10px] text-slate-400 mt-1">24/7 Global phone access. MongoDB Atlas.</p>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            await openRazorpayCheckout({
                              amountPaise: onboardingPlanSelected === 'cloud_5000' ? 500000 : 150000,
                              receipt: 'rcpt_demo_onboard',
                              customerName: 'Saurabh Bajpai (saurabhbajpai03)',
                              customerEmail: 'saurabhbajpai03@gmail.com',
                              customerPhone: '+919876543210',
                              restaurantName: `DineQR ${onboardingPlanSelected === 'cloud_5000' ? '₹5,000 Cloud' : '₹1,500 Local'} Plan`,
                              onSuccess: (p) => {
                                addToast(`Razorpay Verified! Payment ID: ${p.razorpay_payment_id}`, 'success');
                              },
                            });
                          } catch (e) {}
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Launch Official Razorpay Checkout Modal</span>
                      </button>
                    </div>
                  )}

                  {/* Flow 8: Admin & Multi-Business Control (Replaces Super Admin) */}
                  {currentFlow.id === 'admin_business_control' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                            Universal Business Control
                          </span>
                          <h3 className="text-base font-extrabold text-white">
                            {adminActiveNiche === 'gym'
                              ? 'IronPulse Fitness Club & Protein Bar'
                              : "L'Osteria Gourmet Bistro"}
                          </h3>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {adminActiveNiche === 'gym' ? 'Gym Roster Active' : 'Restaurant Mode'}
                        </span>
                      </div>

                      {/* Digital Member Register Card for Gym / Niche */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="font-bold text-slate-300">Member Attendance & Ledger</span>
                          <span className="text-[10px] text-amber-400 font-mono">Paperless Register</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <div>
                            <div className="font-bold text-white">Rahul Sharma (MEM-101)</div>
                            <div className="text-[10px] text-slate-400">Quarterly Gold · Locker L-14</div>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            adminMemberPunched
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {adminMemberPunched ? 'Punched (08:15 AM)' : 'Due In'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <div>
                            <div className="font-bold text-white">Monthly Membership Fee</div>
                            <div className="text-[10px] text-emerald-400 font-bold">₹1,500 / month flat</div>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            adminFeeCollected
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {adminFeeCollected ? 'Razorpay Verified' : 'Due ₹1,500'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setAdminActiveNiche('gym');
                            setAdminMemberPunched(true);
                            setAdminFeeCollected(true);
                            playChime(1170);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        >
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>Punch Member & Settle Fee</span>
                        </button>
                        <Link
                          to="/gym-register"
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
                        >
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Open Full Register ➔</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subtitle Bar at Bottom */}
            <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1">
                <span className="text-amber-400 font-bold mr-1.5">
                  [{currentFlow.role}]:
                </span>
                <span className="text-slate-200">
                  {subtitleLang === 'en' ? currentFlow.englishNarration : currentFlow.hindiNarration}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handlePrevFlow}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
                >
                  Prev
                </button>
                <button
                  onClick={handleNextFlow}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition flex items-center gap-1"
                >
                  <span>Next Flow</span>
                  <FastForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Terminal Output Log */}
          {actionLog.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>Live Action Execution Ledger:</span>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 max-h-24 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
                {actionLog.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="text-amber-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 Cols): Flow Timeline & Role Selector */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="px-1 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              8 All-Platform Roles
            </span>
            <span className="text-xs font-bold text-amber-400">
              Flow {currentFlow.flowNumber} / 08
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
            {USER_FLOWS.map((flow, idx) => {
              const Icon = flow.icon;
              const isActive = activeFlowIndex === idx;

              return (
                <button
                  key={flow.id}
                  onClick={() => setActiveFlowIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isActive ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        Flow #{flow.flowNumber}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {flow.badge}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                      {flow.role}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {flow.title}
                    </p>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0 self-center" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Onboarding for Saurabh Bajpai */}
          <div className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Verified Onboarding Active</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Account: <strong className="text-white">saurabhbajpai03</strong><br />
              Restaurant: <strong className="text-white">Saurabh Bajpai Bistro & Roastery</strong>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ₹1,500 Local DB Ready
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                MongoDB Atlas Free M0
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
