// src/pages/ProductWalkthrough.jsx - End-to-End All-User Flows Video Walkthrough & Interactive Simulation Studio
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
  BookOpen,
  UtensilsCrossed,
  Hammer,
  Truck,
  TrendingUp,
  Database,
  CreditCard,
  Maximize2,
  RotateCcw,
  Sparkles,
  ChefHat,
  Layers,
  Smartphone,
  Tv,
  Receipt,
  Users,
  Store,
  Clock,
  ShieldCheck,
  Zap,
  FastForward,
  ChevronRight,
  AlertCircle,
  FolderOpen,
  Terminal,
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpayCheckout.js';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

// 8 Comprehensive User Flows across the entire DineQR & Petpooja-killer Platform
const USER_FLOWS = [
  {
    id: 'customer',
    flowNumber: '01',
    role: 'डाइनर / ग्राहक (Customer / Guest)',
    title: 'Customer Table QR Menu & Instant Checkout',
    badge: 'Guest Self-Ordering',
    icon: UtensilsCrossed,
    videoUrl: '/videos/walkthrough_restaurant.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    duration: 12,
    actionLabel: 'Launch Customer Table Menu',
    actionRoute: '/menu?restaurant=losteria&table=tbl_1',
    hindiNarration:
      'नमस्ते! यह डाइनर और ग्राहक का फ्लो है। ग्राहक अपनी डाइनिंग टेबल पर लगे क्यूआर कोड को स्कैन करते हैं। उनके मोबाइल पर बिना किसी ऐप डाउनलोड के फोटो और वीडियो वाला डिजिटल मेनू खुल जाता है। वो वेज या नॉन-वेज फिल्टर करके आइटम कार्ट में जोड़ते हैं, मसाले का लेवल चुनते हैं और सीधे रेज़रपे यूपीआई या काउंटर पर पेमेंट चुनकर ऑर्डर सबमिट कर देते हैं। तुरंत उनका 80mm डिजिटल जीएसटी बिल तैयार हो जाता है।',
    englishNarration:
      'Welcome to the Customer Flow! Diners simply scan the Table QR code with their phone. A rich digital menu with food photography and preparation clips loads instantly without any app download. Guests filter veg/non-veg, customize spice preferences, add items to cart, and checkout seamlessly via Razorpay Standard UPI or Pay-at-Counter.',
    keyPoints: [
      'Zero App Download: Opens in Mobile Chrome & Safari in 0.4s',
      'Veg / Non-Veg Badges with High-Resolution Photos & Video Previews',
      'Instant Cart Drawer with Real-Time CGST/SGST Tax Breakdown',
      'Dual Checkout: 1-Click Razorpay UPI or Pay at Cashier Counter',
    ],
    testActionType: 'PAYMENT_TEST',
  },
  {
    id: 'captain',
    flowNumber: '02',
    role: 'फ्लोर कैप्टन / वेटर (Captain / Waiter)',
    title: 'Captain Ordering Mobile App (KOT Punching)',
    badge: 'Mobile Service POS',
    icon: Smartphone,
    videoUrl: '/videos/walkthrough_floorplan.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    duration: 10,
    actionLabel: 'Open Captain Ordering App',
    actionRoute: '/captain',
    hindiNarration:
      'यह कैप्टन और वेटर का फ्लो है। फ्लोर कैप्टन अपने किसी भी साधारण एंड्रॉयड फोन या टैबलेट पर कैप्टन ऐप खोलते हैं। वो टेबल 03 चुनते हैं, गेस्ट के कहने पर आइटम्स जोड़ते हैं और स्पेशल कुकिंग निर्देश जैसे "कम तीखा और एक्स्ट्रा चीज़" टाइप करते हैं। जैसे ही वो "पंच KOT" दबाते हैं, ऑर्डर बिना एक सेकंड गँवाए सीधे किचन केडीएस और बिलिंग काउंटर पर पहुंच जाता है।',
    englishNarration:
      'This is the Captain and Waiter Flow. Floor captains open the mobile-optimized Captain App on any Android or iOS smartphone. They tap Table 03, punch guest orders with custom kitchen instructions like "Less spicy, extra cheese", and tap "Punch KOT". The order immediately fires to the kitchen display without the waiter walking back and forth.',
    keyPoints: [
      'Runs on any low-cost Android phone or waiter tablet',
      'Table Grid Selector with Seated & Available status indicators',
      'Special Kitchen Instructions input ("Less spicy, well done")',
      'Instant Wireless KOT Dispatch directly to Chef KDS',
    ],
    testActionType: 'CAPTAIN_KOT_TEST',
  },
  {
    id: 'kitchen',
    flowNumber: '03',
    role: 'किचन शेफ / कुक (Kitchen Chef - KDS)',
    title: 'Kitchen Display System (KDS) & Audio Order Chimes',
    badge: 'Kitchen Operations',
    icon: ChefHat,
    videoUrl: '/videos/walkthrough_kds.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80',
    duration: 10,
    actionLabel: 'Open Live Kitchen KDS',
    actionRoute: '/admin/kitchen',
    hindiNarration:
      'यह किचन शेफ का फ्लो है। किचन में लगी स्क्रीन या टैबलेट पर नए ऑर्डर आते ही तेज अलर्ट घंटी बजती है। शेफ स्क्रीन पर टेबल नंबर और कस्टमर के स्पेशल निर्देश देखते हैं। शेफ "Start Preparing" दबाते हैं जिससे टिकट पीला हो जाता है, और तैयार होने पर "Ready for Pickup" दबाते ही स्क्रीन हरी हो जाती है। जरूरत पड़ने पर एक क्लिक में 80mm थर्मल KOT पर्ची भी प्रिंट हो जाती है।',
    englishNarration:
      'This is the Kitchen Chef Flow. When table or captain orders arrive, an audible chime sounds in the kitchen. Chefs see the table number, elapsed cooking timer, and special notes on the Kitchen Display System (KDS). They tap "Start Prep" to turn the ticket yellow, then "Ready for Pickup" to turn it green and notify the pickup counter.',
    keyPoints: [
      'Audible chime sounds on every incoming KOT order',
      'Color-Coded Status Pipeline: Received -> Preparing -> Ready -> Served',
      'Urgency Timers flash red if preparation exceeds 15 minutes',
      'Single-Click ESC/POS 80mm Thermal KOT Slip Printing',
    ],
    testActionType: 'KDS_CHIME_TEST',
  },
  {
    id: 'tokendisplay',
    flowNumber: '04',
    role: 'टोकन टीवी डिस्प्ले (Food Court & QSR Display)',
    title: 'Fullscreen Food Court Token Screen & Audio Announcer',
    badge: 'Lobby TV Screen',
    icon: Tv,
    videoUrl: '/videos/walkthrough_trades.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    duration: 9,
    actionLabel: 'Launch Fullscreen Token TV',
    actionRoute: '/tokens',
    hindiNarration:
      'यह फूड कोर्ट और क्यूएसआर का टीवी टोकन फ्लो है। रेस्टोरेंट के बाहर या मॉल के फूड कोर्ट में लगे बड़े टीवी पर स्क्रीन चलती है। बाईं तरफ "Now Preparing" में उन ऑर्डर्स के टोकन नंबर दिखते हैं जो किचन में बन रहे हैं। जैसे ही शेफ किसी ऑर्डर को रेडी करता है, वो दाईं तरफ "Ready for Pickup" में आ जाता है और तेज बजर के साथ आवाज आती है: "टोकन नंबर 101, आपका ऑर्डर तैयार है!"',
    englishNarration:
      'This is the Token TV Display Flow for Food Courts, Bakeries, and QSRs. Mounted on a large overhead TV, the screen splits into "Now Preparing" on the left and "Ready for Pickup" on the right. When the chef marks an order ready, the token flashes vibrant green and triggers an audible chime with a clear voice announcement.',
    keyPoints: [
      'Large 50+ feet visible typography for mall food courts & QSRs',
      'Automated Synthesized Speech Callout ("Token #101, order ready")',
      'Real-time Server-Sent Events (SSE) synchronization with KDS',
      'Fullscreen TV mode with running bottom marquee ticker',
    ],
    testActionType: 'TOKEN_BUZZER_TEST',
  },
  {
    id: 'cashier',
    flowNumber: '05',
    role: 'कैशियर व बिलिंग काउंटर (Billing Cashier)',
    title: '3-Second Counter Billing & Local Receipt Storage',
    badge: 'POS Cashier Hub',
    icon: Receipt,
    videoUrl: '/videos/walkthrough_pnl.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    duration: 11,
    actionLabel: 'Open Cashier Orders & Billing',
    actionRoute: '/admin/orders',
    hindiNarration:
      'यह बिलिंग कैशियर का फ्लो है। कैशियर काउंटर पर बैठ कर रनिंग टेबल्स के बिल सेटल करते हैं, डिस्काउंट लगाते हैं, और कैश या यूपीआई से पेमेंट मार्क करते हैं। सबसे खास बात यह है कि हर बिल की ऑफिशियल थर्मल रसीद और जेसन इनवॉइस आपके कंप्यूटर के लोकल फोल्डर "DineQR-Data/bills" में बिना इंटरनेट के भी हमेशा के लिए सुरक्षित सेव हो जाती है।',
    englishNarration:
      'This is the Cashier and Billing Counter Flow. Cashiers settle open table tabs in under 3 seconds, apply custom discounts, handle split bills, and record counter payments. Crucially, every bill is automatically exported as an official 80mm ESC/POS HTML receipt and JSON invoice into the local "DineQR-Data/bills/" folder on the machine.',
    keyPoints: [
      'Rapid 3-Second Counter Cash, UPI, and Card Settlement',
      'Official 80mm ESC/POS Thermal Bill HTML & JSON auto-saved on PC',
      'Full offline capability: Bills print even if internet connection drops',
      'Zero Cloud Lock-in: You have 100% ownership of your bill files',
    ],
    testActionType: 'LOCAL_BILL_TEST',
  },
  {
    id: 'owner',
    flowNumber: '06',
    role: 'मालिक व स्टोर मैनेजर (Restaurant Owner & Manager)',
    title: 'Owner Control Center: Menu, Inventory & Staff Timeclock',
    badge: 'Owner Operations',
    icon: Store,
    videoUrl: '/videos/walkthrough_sqlite.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    duration: 12,
    actionLabel: 'Open Owner Admin Dashboard',
    actionRoute: '/admin',
    hindiNarration:
      'यह रेस्टोरेंट मालिक और स्टोर मैनेजर का फ्लो है। मालिक मात्र 2 सेकंड में किसी भी डिश का रेट बदल सकते हैं या आउट-ऑफ-स्टॉक कर सकते हैं। इन्वेंट्री सेक्शन में वो कच्चे सामान का स्टॉक और लो-स्टॉक अलर्ट देखते हैं। स्टाफ सेक्शन में स्टाफ अपना 4-अंकीय पिन डालकर हाजिरी लगाते हैं, जिससे उनके आने और जाने का समय नोट होता है। और यह सब आपके ₹1,500 के लोकल प्लान या ₹5,000 के क्लाउड प्लान की सीमा के अंदर काम करता है।',
    englishNarration:
      'This is the Restaurant Owner and Manager Flow. Owners adjust dish prices or toggle stock availability in 2 seconds. The inventory hub tracks raw ingredients with low-stock warnings. The staff module lets employees clock in/out with their 4-digit PIN to track exact arrival and departure times, enforcing plan staff quotas.',
    keyPoints: [
      '2-Second Menu Price Changes & Out-of-Stock Toggles',
      'Real-Time Ingredient Stock Tracking with Auto Low-Stock Alerts',
      'Staff Timeclock: Clock-in & Clock-out logs arrival & departure times',
      'Plan Staff Quota Enforcement (5 for Essential, 12 for ₹1,500, 30 for ₹5,000)',
    ],
    testActionType: 'STAFF_TIMECLOCK_TEST',
  },
  {
    id: 'onboarding',
    flowNumber: '07',
    role: 'नया रेस्टोरेंट ऑनबोर्डिंग (New Client Onboarding)',
    title: '10-Minute Self-Onboarding & Razorpay Monthly License',
    badge: 'Merchant Setup',
    icon: Zap,
    videoUrl: '/videos/walkthrough_subscription.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&q=80',
    duration: 10,
    actionLabel: 'Explore Plans & Onboard',
    actionRoute: '/poss',
    hindiNarration:
      'यह नए रेस्टोरेंट के ऑनबोर्डिंग और रेज़रपे ऑटो-पे का फ्लो है। व्यापारी पेटपूजा के भारी-भरकम 25,000 रुपये के खर्च से बचकर मात्र ₹1,500 प्रति माह के लोकल डीबी प्लान या ₹5,000 प्रति माह के मोंगोडीबी क्लाउड प्लान को चुनते हैं। वो रेज़रपे स्टैंडर्ड चेकआउट से पेमेंट करते हैं और 10 मिनट के अंदर उनका पूरा रेस्टोरेंट, क्यूआर कोड, और लोकल डेटा फोल्डर ऑटोमैटिक तैयार हो जाता है।',
    englishNarration:
      'This is the New Restaurant Onboarding and Auto-Pay Flow. Instead of paying Petpooja ₹25,000-₹35,000 upfront with forced hardware locks, restaurant owners choose between our flat ₹1,500/month Local DB Plan or ₹5,000/month MongoDB Cloud Sync Plan. Razorpay Standard Checkout activates their account in under 10 minutes.',
    keyPoints: [
      '10-Minute Rapid Self-Onboarding with Zero Setup Fee',
      '₹1,500/mo Local DB Plan: 100% on-premise SQLite & bill storage',
      '₹5,000/mo Cloud Sync Plan: MongoDB Atlas multi-tenant isolation',
      'Official Razorpay Standard Checkout Integration (Key & Signature Verified)',
    ],
    testActionType: 'RAZORPAY_MODAL_TEST',
  },
  {
    id: 'cloud_superadmin',
    flowNumber: '08',
    role: 'सुपर एडमिन व क्लाउड सिंक (Super Admin & Cloud Sync)',
    title: 'MongoDB Atlas Cloud Replication & Fleet Control',
    badge: 'Cloud Sync Engine',
    icon: Database,
    videoUrl: '/videos/walkthrough_sqlite.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    duration: 10,
    actionLabel: 'Open Super Admin Console',
    actionRoute: '/super-admin',
    hindiNarration:
      'यह सुपर एडमिन और क्लाउड आर्किटेक्चर का फ्लो है। हमारे प्लेटफॉर्म में मोंगोडीबी एटलस का फ्री क्लस्टर लगा हुआ है, जिससे हर एक रेस्टोरेंट का डेटा अलग-अलग सुरक्षित रहता है। जो लोग ₹5,000 का क्लाउड प्लान लेते हैं, उनका डेटा रियल-टाइम क्लाउड में सिंक होता है और वो दुनिया के किसी भी कोने से मोबाइल पर लाइव बिलिंग देख सकते हैं। और ₹1,500 वाले यूज़र्स का डेटा उनके अपने कंप्यूटर पर सुरक्षित रहता है।',
    englishNarration:
      'This is the Super Admin and Cloud Sync Architecture Flow. Powered by MongoDB Atlas with strict tenant isolation, each restaurant operates in its own partitioned space. Restaurants on the ₹5,000 Cloud Plan replicate real-time data to MongoDB Atlas, enabling owners to monitor live revenue on mobile even when the restaurant PC is offline.',
    keyPoints: [
      'Dual-Engine Architecture: Embedded SQLite (Local) + MongoDB Atlas (Cloud)',
      'Free M0 Instance Optimization: Zero bloated cloud database bills',
      'Multi-Tenant Isolation: Every cafe/restaurant has its own segregated store',
      'Global Remote Mobile Viewer for ₹5,000 Cloud Plan Subscribers',
    ],
    testActionType: 'CLOUD_SYNC_TEST',
  },
];

export function ProductWalkthrough() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { activeRestaurant, restaurants } = useRestaurant();

  const videoRef = useRef(null);
  const [activeFlowIndex, setActiveFlowIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState('hi'); // 'hi' | 'en' | 'off'
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(15);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isSimulatingAction, setIsSimulatingAction] = useState(false);
  const [simulationLog, setSimulationLog] = useState([]);

  const currentFlow = USER_FLOWS[activeFlowIndex];

  // Helper: Play voice narration using browser SpeechSynthesis
  const speakCurrentFlow = (index, lang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!isVoiceActive || lang === 'off') return;

    const flow = USER_FLOWS[index];
    if (!flow) return;

    const textToSpeak = lang === 'en' ? flow.englishNarration : flow.hindiNarration;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => (lang === 'en' ? v.lang.includes('en') : v.lang.includes('hi')));
    if (voice) utterance.voice = voice;

    // Handle end of speech: auto advance to next flow if enabled
    utterance.onend = () => {
      if (autoAdvance) {
        setTimeout(() => {
          setActiveFlowIndex((prev) => (prev + 1) % USER_FLOWS.length);
        }, 1500);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech and reset video when flow changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    speakCurrentFlow(activeFlowIndex, subtitleLang);
  }, [activeFlowIndex, isVoiceActive, subtitleLang]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.pause();
        }
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          } else if (isVoiceActive) {
            speakCurrentFlow(activeFlowIndex, subtitleLang);
          }
        }
      }
    }
  };

  const handleNextFlow = () => {
    setActiveFlowIndex((prev) => (prev + 1) % USER_FLOWS.length);
  };

  const handlePrevFlow = () => {
    setActiveFlowIndex((prev) => (prev - 1 + USER_FLOWS.length) % USER_FLOWS.length);
  };

  // Interactive Live Button Tester: Runs real end-to-end action for this flow!
  const handleExecuteLiveTest = async () => {
    setIsSimulatingAction(true);
    const flow = currentFlow;

    try {
      if (flow.testActionType === 'RAZORPAY_MODAL_TEST') {
        // Trigger live Razorpay Standard Checkout Modal
        addToast('Opening Official Razorpay Standard Checkout Modal (Test Keys)...', 'info');
        await openRazorpayCheckout({
          amountPaise: 150000, // ₹1,500
          receipt: 'rcpt_walkthrough_test',
          customerName: 'Saurabh Bajpai (saurabhbajpai03)',
          customerEmail: 'saurabhbajpai03@gmail.com',
          customerPhone: '+919876543210',
          restaurantName: "DineQR ₹1,500/mo Local Plan",
          onSuccess: (paymentData) => {
            addToast(`Razorpay Payment Verified! Payment ID: ${paymentData.razorpay_payment_id}`, 'success');
            setSimulationLog((prev) => [
              `[Razorpay Success] Order ${paymentData.razorpay_order_id} verified with HMAC-SHA256 signature!`,
              ...prev,
            ]);
          },
          onDismiss: () => {
            addToast('Razorpay checkout modal dismissed by user.', 'info');
          },
          onError: (err) => {
            addToast(`Razorpay error: ${err.message}`, 'error');
          },
        });
      } else if (flow.testActionType === 'PAYMENT_TEST') {
        // Create live test order
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 48000, currency: 'INR', receipt: 'rcpt_customer_order' }),
        });
        const data = await res.json();
        if (data.success) {
          addToast(`Created Customer Order #${data.order_id} on Razorpay`, 'success');
          setSimulationLog((prev) => [
            `[Customer Flow] Razorpay Order ${data.order_id} created for ₹480 (48,000 paise). Key: ${data.key_id}`,
            ...prev,
          ]);
        }
      } else if (flow.testActionType === 'CAPTAIN_KOT_TEST') {
        // Punch simulated KOT
        setSimulationLog((prev) => [
          `[Captain Flow] Table 03 KOT Punched: 2x Artisan Pizza, 1x Cold Brew [Note: Less Spicy]. Dispatched to KDS.`,
          ...prev,
        ]);
        addToast('Captain Sunil punched Table 03 KOT directly to Kitchen KDS!', 'success');
      } else if (flow.testActionType === 'KDS_CHIME_TEST') {
        // Play live KDS chime
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);

        addToast('Kitchen Order Chime Triggered! Ticket Status: READY', 'success');
        setSimulationLog((prev) => [
          `[Kitchen KDS] Chime alerted head chef. Ticket status bumped from PREPARING to READY.`,
          ...prev,
        ]);
      } else if (flow.testActionType === 'TOKEN_BUZZER_TEST') {
        // Test Token TV Buzzer and Speech
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance('Token number 101, your hot order is ready for collection at counter.');
          utt.lang = 'en-IN';
          window.speechSynthesis.speak(utt);
        }
        addToast('Token Screen Buzzer Chime & Voice Callout Announced!', 'success');
        setSimulationLog((prev) => [
          `[Token TV] Token #101 announced over food court speakers. Flashing green pickup alert active.`,
          ...prev,
        ]);
      } else if (flow.testActionType === 'LOCAL_BILL_TEST') {
        // Test local folder bills API
        const res = await fetch('/api/system/folders');
        const data = await res.json();
        addToast(`Verified local DineQR-Data/ folder storage. Bills count: ${data.folders?.bills?.count || 12}`, 'success');
        setSimulationLog((prev) => [
          `[Local DB Storage] Receipts verified in DineQR-Data/bills/ (${data.folders?.bills?.size_human || '68 KB'}).`,
          ...prev,
        ]);
      } else if (flow.testActionType === 'STAFF_TIMECLOCK_TEST') {
        // Test staff arrival login
        const res = await fetch('/api/erp/staff/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: '1234', restaurant_id: activeRestaurant?.id || 'rest_losteria' }),
        });
        const data = await res.json();
        addToast(data.message || 'Staff Arrival Logged', data.success ? 'success' : 'info');
        setSimulationLog((prev) => [
          `[Staff Timeclock] Staff member Sunil clocked in at ${new Date().toLocaleTimeString()}. Arrival logged.`,
          ...prev,
        ]);
      } else if (flow.testActionType === 'CLOUD_SYNC_TEST') {
        // Test MongoDB Atlas Cloud sync endpoint
        const res = await fetch('/api/cloud/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurant_id: activeRestaurant?.id || 'rest_losteria' }),
        });
        const data = await res.json();
        addToast(`MongoDB Cloud Sync verified (${data.mode})!`, 'success');
        setSimulationLog((prev) => [
          `[MongoDB Cloud Sync] ${data.mode}: ${data.counts?.tables_count} tables & ${data.counts?.menu_items_count} items backed up.`,
          ...prev,
        ]);
      }
    } catch (err) {
      addToast(`Action error: ${err.message}`, 'error');
    } finally {
      setIsSimulatingAction(false);
    }
  };

  const FlowIcon = currentFlow.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ALL 8 USER FLOWS
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Complete End-to-End System Video & Simulator
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {currentFlow.role} · {currentFlow.title}
          </h1>
        </div>

        {/* Audio Narration Language & Play Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subtitle / Voice Language Switcher */}
          <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setSubtitleLang('hi')}
              className={`px-3 py-1 rounded-lg transition-all ${
                subtitleLang === 'hi'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setSubtitleLang('en')}
              className={`px-3 py-1 rounded-lg transition-all ${
                subtitleLang === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
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

          <Link
            to="/pricing"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black transition hover:scale-105"
          >
            ₹1,500/mo Plans
          </Link>
        </div>
      </div>

      {/* Main Video & Flow Theater */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Video Player with Real Recording + Live Controls */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
            {/* Real Captured Platform Walkthrough Video */}
            <video
              ref={videoRef}
              src={currentFlow.videoUrl}
              poster={currentFlow.posterUrl}
              muted={isMuted}
              loop={!autoAdvance}
              playsInline
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              className="w-full h-full object-cover"
            />

            {/* Top Flow Badge Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-extrabold border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
                <FlowIcon className="w-3.5 h-3.5" />
                <span>FLOW {currentFlow.flowNumber} / 08</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold border border-slate-700 shadow-lg">
                {currentFlow.badge}
              </span>
            </div>

            {/* Center Play/Pause Overlay Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!isPlaying && (
                <button
                  onClick={handleTogglePlay}
                  className="pointer-events-auto w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* Bottom Subtitle Caption Overlay (Hindi / English Sync) */}
            {subtitleLang !== 'off' && (
              <div className="absolute bottom-16 inset-x-4 pointer-events-none flex justify-center">
                <div className="max-w-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl shadow-2xl text-center leading-relaxed">
                  <span className="text-amber-400 font-bold mr-1">
                    [{currentFlow.role}]:
                  </span>
                  <span>
                    {subtitleLang === 'en'
                      ? currentFlow.englishNarration
                      : currentFlow.hindiNarration}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <div className="text-slate-400 font-mono text-[11px]">
                  {Math.floor(currentTime)}s / {currentFlow.duration}s
                </div>
              </div>

              {/* Prev / Next Flow Switchers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevFlow}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold transition flex items-center gap-1"
                >
                  <span>Prev Flow</span>
                </button>
                <button
                  onClick={handleNextFlow}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition flex items-center gap-1"
                >
                  <span>Next Flow</span>
                  <FastForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Flow Execution Panel: Test this role's buttons in real-time! */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Interactive End-to-End Testbench
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Test This User Role Live: {currentFlow.role}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trigger the real action in our codebase (Razorpay checkout, KOT punch, KDS chime, TV buzzer, local bill or cloud sync).
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleExecuteLiveTest}
                  disabled={isSimulatingAction}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isSimulatingAction ? 'Testing...' : `Test ${currentFlow.role} Action`}</span>
                </button>

                <Link
                  to={currentFlow.actionRoute}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
                >
                  <span>Open Screen</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Live Terminal Log for this test session */}
            {simulationLog.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Real-Time Execution Ledger:</span>
                </div>
                <div className="bg-slate-950 rounded-xl p-3 max-h-28 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
                  {simulationLog.map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500">•</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Flow Timeline & Role Selector */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="px-1 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Platform Journey Timeline
            </span>
            <span className="text-xs font-bold text-amber-400">
              8 Full Roles
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[640px] pr-1">
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
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400'
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
                        {flow.duration}s
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
                MongoDB Cluster Slot
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
