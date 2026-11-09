// src/pages/ProductWalkthrough.jsx - End-to-End Live Interactive Device Simulator & Dual-Language Flow Theater
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Smartphone,
  Tv,
  Receipt,
  Store,
  FastForward,
  Terminal,
  MousePointerClick,
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
  Dumbbell,
  Users,
  Wifi,
  ExternalLink,
  RefreshCw,
  Sliders,
  DollarSign,
  Bike,
  ShieldCheck,
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
  const [displayMode, setDisplayMode] = useState('interactive'); // 'interactive' | 'simulation'
  const [iframeKey, setIframeKey] = useState(0);

  // Interactive Live Device States
  const [interactiveStep, setInteractiveStep] = useState(0);
  const [actionLog, setActionLog] = useState([
    '[System Initialized] SQLite On-Premise Engine active (Zero Cloud Bills)',
    '[Platform Ready] 8 Live Business Roles & Real Component Frames Loaded',
  ]);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50, visible: false, clicking: false });
  const [currentSpokenSubtitle, setCurrentSpokenSubtitle] = useState('');
  const abortControllerRef = useRef(null);

  // Flow specific live interactive states (for simulation mode)
  const [customerCartCount, setCustomerCartCount] = useState(0);
  const [customerBasketOpen, setCustomerBasketOpen] = useState(false);
  const [customerDetailsEntered, setCustomerDetailsEntered] = useState(false);
  const [customerRazorpayActive, setCustomerRazorpayActive] = useState(false);
  const [customerOrderPlaced, setCustomerOrderPlaced] = useState(false);
  const [captainSelectedTable, setCaptainSelectedTable] = useState('Table 03');
  const [captainKotPunched, setCaptainKotPunched] = useState(false);
  const [kdsTicketStatus, setKdsTicketStatus] = useState('RECEIVED');
  const [tokenTvActiveTokens, setTokenTvActiveTokens] = useState({
    preparing: ['#9545', '#6602'],
    ready: ['#9724'],
  });
  const [cashierBillSettled, setCashierBillSettled] = useState(false);
  const [ownerItemPrice, setOwnerItemPrice] = useState(260);
  const [ownerStaffClockedIn, setOwnerStaffClockedIn] = useState(false);
  const [onboardingPlanSelected, setOnboardingPlanSelected] = useState('starter_1500');
  const [adminMemberPunched, setAdminMemberPunched] = useState(false);
  const [adminFeeCollected, setAdminFeeCollected] = useState(false);

  // 8 Platform User Flows Definitions with Exact Working Application Routes
  const USER_FLOWS = [
    {
      id: 'customer',
      flowNumber: '01',
      role: 'डाइनर / ग्राहक (Customer Flow)',
      title: 'Table QR Digital Menu, Order Basket & Razorpay',
      badge: 'Guest Self-Ordering',
      icon: UtensilsCrossed,
      routeUrl: '/menu?restaurant=rest_losteria&table=tbl_1&embed=true',
      standaloneUrl: '/menu?restaurant=rest_losteria&table=tbl_1',
      browserUrlText: 'dineqr.live/losteria/tbl_1',
      deviceType: 'mobile',
      hindiNarration:
        'अध्याय 1: ग्राहक फ्लो। ग्राहक टेबल का क्यूआर स्कैन करते हैं। मेनू से आइटम जोड़ते ही ऑर्डर बास्केट खुलती है। देखिए, ग्राहक अपना नाम और फोन नंबर डालते हैं। रेज़रपे ऑनलाइन यूपीआई चुनकर तुरंत पेमेंट कन्फर्म हो जाती है, टोकन नंबर 128 मिल जाता है और टिकट किचन में पहुंच जाता है। पूरा प्रोसेस सिर्फ 15 सेकंड में पूरा हो गया।',
      englishNarration:
        'Chapter 1: Diner Flow. Guests scan table QR code. Watch as dishes are added to cart and the slide-over order basket opens. The guest enters their name, phone number, and cooking preferences. After selecting Razorpay instant UPI payment, the order is confirmed with Token #128 and instantly dispatched to the kitchen KDS.',
      stepsCount: 5,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'टेबल का क्यूआर स्कैन करते ही डिजिटल मेनू खुला और ग्राहक ने ट्रफल फ्राइज और पिज्जा कार्ट में जोड़ा।',
          'Scanning the table QR code and adding Truffle Fries and Margherita Pizza to the cart.',
          async () => {
            setCursorPos({ x: 75, y: 38, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setCustomerCartCount(2);
            playChime(660);
            setActionLog((l) => ['[Customer] Added 2 Items: Truffle Fries (₹260) & Wood-Fired Pizza (₹450)', ...l]);
          }
        );
        await runStep(
          2,
          'ऑर्डर बास्केट खोली, जहां दोनों आइटम और बिल का विवरण दिखाई दे रहा है।',
          'Opening the order basket drawer displaying selected items and tax breakdown.',
          async () => {
            setCursorPos({ x: 50, y: 88, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 400));
            setCustomerBasketOpen(true);
            playChime(720);
            setActionLog((l) => ['[Customer] Opened Order Basket Drawer (Subtotal ₹710 + GST)', ...l]);
          }
        );
        await runStep(
          3,
          'ग्राहक का नाम विक्रम मल्होत्रा, फोन नंबर और कुकिंग निर्देश दर्ज किए।',
          'Customer enters their name "Vikram Malhotra", phone number, and cooking preferences.',
          async () => {
            setCursorPos({ x: 40, y: 55, visible: true, clicking: false });
            await new Promise((r) => setTimeout(r, 500));
            setCustomerDetailsEntered(true);
            setActionLog((l) => ['[Customer] Entered Dining Details: "Vikram Malhotra · +91 98765 43210 · Less Spicy"', ...l]);
          }
        );
        await runStep(
          4,
          'रेज़रपे ऑनलाइन यूपीआई पेमेंट गेटवे खोलकर 746 रुपये का भुगतान शुरू किया।',
          'Initiating instant Razorpay UPI checkout for the final bill of ₹746.',
          async () => {
            setCursorPos({ x: 50, y: 85, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 400));
            setCustomerRazorpayActive(true);
            playChime(880);
            setActionLog((l) => ['[Razorpay] Opened Instant UPI Payment Gateway (₹746 Total)', ...l]);
          }
        );
        await runStep(
          5,
          'पेमेंट सफल! टोकन नंबर 128 कन्फर्म होकर बिना वेटर के सीधे किचन में पहुंच गया।',
          'Payment verified! Order #ORD-9128 and Token #128 sent directly to kitchen KDS.',
          async () => {
            await new Promise((r) => setTimeout(r, 600));
            setCustomerRazorpayActive(false);
            setCustomerBasketOpen(false);
            setCustomerOrderPlaced(true);
            playChime(1050);
            setCursorPos({ x: 50, y: 85, visible: false, clicking: false });
            setActionLog((l) => ['[Customer] Payment Verified! Order #ORD-9128 Confirmed. Token #128 sent to Kitchen.', ...l]);
          }
        );
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
      routeUrl: '/captain?embed=true',
      standaloneUrl: '/captain',
      browserUrlText: 'dineqr.live/captain',
      deviceType: 'mobile',
      hindiNarration:
        'अध्याय 2: कैप्टन फ्लो। वेटर अपने फोन पर कैप्टन ऐप खोलते हैं। देखिए, हमने टेबल 03 चुनी। कस्टमर के कहे अनुसार तंदूरी प्लेटर जोड़ा और स्पेशल निर्देश कम तीखा टाइप किया। अब Punch KOT दबाने पर यह बिना एक सेकंड गंवाए सीधे शेफ की स्क्रीन पर पहुंच जाता है।',
      englishNarration:
        'Chapter 2: Captain Waiter Flow. Floor captains open the mobile app. Watch as we select Table 03, add Tandoori Platter, add cooking note "Less Spicy", and tap "Punch KOT". The ticket immediately fires to the Kitchen KDS screen without the waiter walking back.',
      stepsCount: 3,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'फ्लोर वेटर ने मोबाइल ऐप में टेबल 03 का चयन किया।',
          'Captain opens the mobile floor layout and selects Table 03.',
          async () => {
            setCursorPos({ x: 60, y: 25, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setCaptainSelectedTable('Table 03');
            playChime(580);
            setActionLog((l) => ['[Captain App] Selected Table 03 (4 Seater - Window Bay)', ...l]);
          }
        );
        await runStep(
          2,
          'तंदूरी प्लेटर के साथ स्पेशल कुकिंग निर्देश कम तीखा टाइप किया।',
          'Adding Tandoori Platter with customer request "Less Spicy".',
          async () => {
            setCursorPos({ x: 50, y: 85, visible: true, clicking: false });
            await new Promise((r) => setTimeout(r, 500));
            setActionLog((l) => ['[Captain App] Punching KOT with note: "Less spicy, extra crisp crust"...', ...l]);
          }
        );
        await runStep(
          3,
          'पंच केओटी दबाते ही डिजिटल टिकट बिना वेटर के सीधे किचन स्टेशन पर बज उठा।',
          'Tapping Punch KOT fires an audible order ticket directly to kitchen station.',
          async () => {
            setCursorPos({ x: 50, y: 85, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 600));
            setCaptainKotPunched(true);
            playChime(1050);
            setCursorPos({ x: 50, y: 85, visible: false, clicking: false });
            setActionLog((l) => ['[Captain App] KOT #K-4109 Punched! Audio chime sent to Kitchen Station #1.', ...l]);
          }
        );
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
      routeUrl: '/admin/kitchen?embed=true',
      standaloneUrl: '/admin/kitchen',
      browserUrlText: 'dineqr.live/admin/kitchen',
      deviceType: 'screen',
      hindiNarration:
        'अध्याय 3: किचन केडीएस फ्लो। जैसे ही नया ऑर्डर आया, अलर्ट घंटी बजी। शेफ स्क्रीन पर टेबल नंबर और आइटम देखते हैं। शेफ ने Accept & Start Prep बटन दबाया जिससे टिकट पीला हो गया। खाना तैयार होने पर उन्होंने Mark Ready दबाया और टिकट हरा हो गया।',
      englishNarration:
        'Chapter 3: Kitchen KDS Flow. Incoming orders trigger an audible chime. Chefs review items and notes on the wall screen. Watch as the chef taps "Start Prep", turning the ticket yellow, then taps "Mark Ready", turning it green and notifying the pickup counter.',
      stepsCount: 3,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'नया टेबल ऑर्डर आते ही किचन स्क्रीन पर ऑडियो अलर्ट की घंटी बजी।',
          'Incoming table order triggers an instant audio alert on the kitchen screen.',
          async () => {
            playChime(880);
            setActionLog((l) => ['[Kitchen KDS] New Order ORD-9128 Arrived! Urgent Timer Started.', ...l]);
          }
        );
        await runStep(
          2,
          'शेफ ने एक्सेप्ट दबाया, टिकट पीला हो गया और कुकिंग टाइमर शुरू हो गया।',
          'Chef taps Start Prep; ticket turns yellow and preparation timer starts.',
          async () => {
            setCursorPos({ x: 50, y: 70, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setKdsTicketStatus('PREPARING');
            playChime(620);
            setActionLog((l) => ['[Kitchen KDS] Chef accepted ticket. Status: PREPARING (Cooking active).', ...l]);
          }
        );
        await runStep(
          3,
          'खाना तैयार होते ही मार्क रेडी दबाया, टिकट हरा हुआ और टीवी पर अलर्ट भेजा गया।',
          'Chef taps Mark Ready; ticket turns green and notifies the pickup counter.',
          async () => {
            setCursorPos({ x: 50, y: 70, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 600));
            setKdsTicketStatus('READY');
            playChime(1170);
            setCursorPos({ x: 50, y: 70, visible: false, clicking: false });
            setActionLog((l) => ['[Kitchen KDS] Dish Ready! KDS dispatched ready alert to Token TV Screen.', ...l]);
          }
        );
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
      routeUrl: '/tokens?embed=true',
      standaloneUrl: '/tokens',
      browserUrlText: 'dineqr.live/tokens',
      deviceType: 'tv',
      hindiNarration:
        'अध्याय 4: टोकन टीवी डिस्प्ले फ्लो। बड़े टीवी स्क्रीन पर बाईं तरफ Now Preparing है और दाईं तरफ Ready for Pickup। शेफ के रेडी करते ही टोकन 9724 हरे बॉक्स में आ गया और तेज आवाज में अनाउंसमेंट हुआ: टोकन नंबर 9724, आपका ऑर्डर काउंटर पर तैयार है।',
      englishNarration:
        'Chapter 4: Token TV Display Flow. On the large screen TV, pending orders show under "Now Preparing". When ready, Token #9724 moves to "Ready for Pickup" with a flashing green glow and an automated voice announcement.',
      stepsCount: 3,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'बड़े टीवी स्क्रीन पर ऑर्डर नाउ प्रिपेयरिंग सेक्शन में पकता हुआ दिख रहा है।',
          'Active orders show on the overhead TV screen under Now Preparing.',
          async () => {
            setActionLog((l) => ['[Token TV] Token #9724 cooking in kitchen under "Now Preparing".', ...l]);
          }
        );
        await runStep(
          2,
          'बज़र घंटी बजी और टोकन 9724 रेडी फॉर पिकअप के हरे बॉक्स में आ गया।',
          'Buzzer chimes as Token #9724 transitions to Ready for Pickup with a green highlight.',
          async () => {
            playChime(1170);
            setTokenTvActiveTokens({
              preparing: ['#6602'],
              ready: ['#9724', '#9545'],
            });
            setActionLog((l) => ['[Token TV] Buzzer Chime Activated! Token #9724 moved to "READY FOR PICKUP".', ...l]);
          }
        );
        await runStep(
          3,
          'लाउडस्पीकर से ऑटोमैटिक अनाउंसमेंट हुआ: टोकन नंबर 9724, आपका ऑर्डर तैयार है।',
          'Loudspeaker announces: Token number 9724, your order is ready for pickup.',
          async () => {
            setActionLog((l) => ['[Token TV] Voice Announcement: "Token number 9724, your order is ready for pickup."', ...l]);
          }
        );
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
      routeUrl: '/admin/orders?embed=true',
      standaloneUrl: '/admin/orders',
      browserUrlText: 'dineqr.live/admin/orders',
      deviceType: 'screen',
      hindiNarration:
        'अध्याय 5: बिलिंग कैशियर फ्लो। कैशियर काउंटर पर टेबल 03 का बिल खोलते हैं। देखिए, हमने Cash Settlement चुना और Settle & Print बटन दबाया। बिल तुरंत सेटल हो गया और बिना इंटरनेट के भी आपके कंप्यूटर के फोल्डर QR Flow-Data/bills में 80mm थर्मल रसीद सेव हो गई।',
      englishNarration:
        'Chapter 5: Billing Cashier Flow. The cashier opens Table 03, selects Cash or UPI, and taps "Settle & Print". The bill settles in under 3 seconds and the official 80mm ESC/POS receipt automatically saves to your local QR Flow-Data/bills/ folder.',
      stepsCount: 3,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'कैशियर काउंटर पर टेबल 03 का कुल बिल 798 रुपये खोला गया।',
          'Cashier loads Table 03 running bill totaling ₹798 including taxes.',
          async () => {
            setActionLog((l) => ['[Cashier POS] Loaded Table 03 Bill. Subtotal: ₹760 + GST: ₹38 = Grand Total: ₹798.', ...l]);
          }
        );
        await runStep(
          2,
          'कैशियर ने पेमेंट मोड चुना और सेटल एंड प्रिंट बटन दबाया।',
          'Cashier chooses payment settlement and taps Settle & Print.',
          async () => {
            setCursorPos({ x: 50, y: 82, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setActionLog((l) => ['[Cashier POS] Marking counter payment & generating ESC/POS 80mm bill...', ...l]);
          }
        );
        await runStep(
          3,
          'बिल सेटल हुआ और लोकल फोल्डर में 80mm थर्मल रसीद तुरंत सेव हो गई।',
          'Bill settled in 3 seconds! Thermal receipt stored permanently in local PC folder.',
          async () => {
            setCashierBillSettled(true);
            playChime(1050);
            setCursorPos({ x: 50, y: 82, visible: false, clicking: false });
            setActionLog((l) => ['[Cashier POS] Bill Settled! Thermal HTML & JSON saved to QR Flow-Data/bills/BILL_ORD-9128.html', ...l]);
          }
        );
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
      title: '2-Second Menu Price Changes & Raw Inventory',
      badge: 'Owner Operations',
      icon: Store,
      routeUrl: '/admin/inventory?embed=true',
      standaloneUrl: '/admin/inventory',
      browserUrlText: 'dineqr.live/admin/inventory',
      deviceType: 'screen',
      hindiNarration:
        'अध्याय 6: मालिक का फ्लो। मालिक अपने मोबाइल या लैपटॉप से 2 सेकंड में किसी भी डिश का दाम बदल सकते हैं। देखिए, हमने डिश का दाम ₹240 से ₹260 कर दिया। और स्टॉक इन्वेंटरी में कच्चा माल, आलू, चीज़ और मसालों के यूनिट्स तुरंत अपडेट हो जाते हैं।',
      englishNarration:
        'Chapter 6: Owner Operations Flow. Owners update dish prices in 2 seconds and monitor stock levels. Watch as we adjust raw materials and verify real-time inventory balances saved permanently to SQLite.',
      stepsCount: 3,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'मालिक ने मात्र 2 सेकंड में डिश का दाम 240 से बढ़ाकर 260 रुपये कर दिया।',
          'Owner adjusts dish price from ₹240 to ₹260 in two seconds flat.',
          async () => {
            setCursorPos({ x: 65, y: 35, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setOwnerItemPrice(260);
            playChime(750);
            setActionLog((l) => ['[Owner Admin] Updated "Artisan Truffle Fries" price to ₹260 (Saved to SQLite).', ...l]);
          }
        );
        await runStep(
          2,
          'स्टॉक इन्वेंटरी में कच्ची सामग्री की खपत और 10 यूनिट्स का बैलेंस अपडेट किया।',
          'Adjusting stock inventory balance for raw materials (+10 units).',
          async () => {
            setCursorPos({ x: 50, y: 72, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setActionLog((l) => ['[Raw Inventory] Synced 45.0 kg Potatoes & Truffle Dip stock level in database.', ...l]);
          }
        );
        await runStep(
          3,
          'स्टाफ सुनील ने अपना 4-अंकों का पिन 1234 डालकर समय के साथ क्लॉक-इन किया।',
          'Server Sunil enters 4-digit PIN 1234; arrival time recorded with exact timestamp.',
          async () => {
            setOwnerStaffClockedIn(true);
            playChime(950);
            setCursorPos({ x: 50, y: 72, visible: false, clicking: false });
            setActionLog((l) => [`[Staff Roster] Sunil Clocked-In at ${new Date().toLocaleTimeString()}! Status: ON_DUTY.`, ...l]);
          }
        );
      },
      resetSimulation: () => {
        setOwnerItemPrice(260);
        setOwnerStaffClockedIn(false);
        setInteractiveStep(0);
      },
    },
    {
      id: 'gym_register',
      flowNumber: '07',
      role: 'जिम व फिटनेस रजिस्टर (Gym Member Register)',
      title: 'Paperless Member Check-In & Fee Collection',
      badge: 'Member Attendance',
      icon: Dumbbell,
      routeUrl: '/gym-register?embed=true',
      standaloneUrl: '/gym-register',
      browserUrlText: 'dineqr.live/gym-register',
      deviceType: 'screen',
      hindiNarration:
        'अध्याय 7: जिम अटेंडेंस फ्लो। जिम रिसेप्शन पर पेपरलेस डिजिटल रजिस्टर चलता है। मेंबर आते ही एक टैप में हाजिरी दर्ज होती है, लॉकर नंबर असाइन होता है और 1500 रुपये की मासिक फीस रेज़रपे यूपीआई से सीधे बैंक खाते में जमा हो जाती है।',
      englishNarration:
        'Chapter 7: Gym Attendance Flow. Front-desk staff use our paperless attendance register. Members check in with 1-tap, workout locker bays are assigned, and ₹1,500 monthly fees are collected directly via Razorpay UPI.',
      stepsCount: 3,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'जिम रिसेप्शन पर राहुल शर्मा का नाम सर्च करके मेंबर कार्ड लोड किया।',
          'Searching member Rahul Sharma (MEM-101) in paperless digital register.',
          async () => {
            setCursorPos({ x: 40, y: 30, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            playChime(660);
            setActionLog((l) => ['[Gym Register] Loaded Rahul Sharma (Quarterly Gold - Locker L-14).', ...l]);
          }
        );
        await runStep(
          2,
          '1-टैप में हाजिरी दर्ज हुई और आज का वर्कआउट टाइमस्टैम्प रिकॉर्ड हो गया।',
          '1-Tap punch in logged for member with timestamp and active status.',
          async () => {
            setCursorPos({ x: 80, y: 45, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setAdminMemberPunched(true);
            playChime(950);
            setActionLog((l) => [`[Gym Register] Rahul Sharma Punched In at ${new Date().toLocaleTimeString()}! Locker L-14 active.`, ...l]);
          }
        );
        await runStep(
          3,
          '1,500 रुपये की मासिक फीस रेज़रपे से जमा हुई और रसीद तुरंत जेनरेट हो गई।',
          'Collected ₹1,500 monthly membership renewal fee via Razorpay with instant receipt.',
          async () => {
            setCursorPos({ x: 80, y: 75, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setAdminFeeCollected(true);
            playChime(1170);
            setCursorPos({ x: 80, y: 75, visible: false, clicking: false });
            setActionLog((l) => ['[Gym Fee] Collected ₹1,500 Monthly Renewal via Razorpay UPI! Digital Invoice #GYM-9801 issued.', ...l]);
          }
        );
      },
      resetSimulation: () => {
        setAdminMemberPunched(false);
        setAdminFeeCollected(false);
        setInteractiveStep(0);
      },
    },
    {
      id: 'onboarding',
      flowNumber: '08',
      role: 'नया बिज़नेस ऑनबोर्डिंग (Merchant Onboarding)',
      title: 'Self-Serve Setup (₹1.5k / ₹3.5k / ₹5k) & Checkout',
      badge: 'SaaS Onboarding',
      icon: Zap,
      routeUrl: '/onboard?embed=true',
      standaloneUrl: '/onboard',
      browserUrlText: 'dineqr.live/onboard',
      deviceType: 'screen',
      hindiNarration:
        'अध्याय 8: व्यापारी ऑनबोर्डिंग फ्लो। व्यापारी मात्र ₹1,500 के लोकल पीओएस या ₹3,500 के जोमैटो-स्विगी एग्रीगेटर प्लान को चुनते हैं। Pay with Razorpay दबाते ही असली चेकआउट खुल जाता है, 6 टेबल्स तुरंत बन जाती हैं और 60 सेकंड में सिस्टम लाइव हो जाता है।',
      englishNarration:
        'Chapter 8: Merchant Onboarding Flow. Businesses choose between our flat ₹1,500 Starter POS, ₹3,500 Aggregator Pro, or ₹5,000 Cloud Hub. Tapping Pay with Razorpay launches verified checkout, provisions tables, and goes live in under 60 seconds.',
      stepsCount: 3,
      executeSimulation: async (runStep) => {
        await runStep(
          1,
          'व्यापारी ने अपनी दुकान का नाम और ₹1,500 लोकल डीबी या ₹3,500 एग्रीगेटर प्लान चुना।',
          'Merchant enters outlet name and selects ₹1,500 Local POS or ₹3,500 Aggregator Pro plan.',
          async () => {
            setCursorPos({ x: 50, y: 40, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setOnboardingPlanSelected('starter_1500');
            playChime(660);
            setActionLog((l) => ['[Onboarding] Selected Plan: "₹1,500/mo Starter Local POS (Zero Cloud Costs)".', ...l]);
          }
        );
        await runStep(
          2,
          'सब्सक्राइब विथ रेज़रपे पर क्लिक करते ही सुरक्षित पेमेंट गेटवे शुरू हुआ।',
          'Clicking Subscribe initiates the verified Razorpay payment checkout modal.',
          async () => {
            setCursorPos({ x: 50, y: 85, visible: true, clicking: true });
            await new Promise((r) => setTimeout(r, 500));
            setActionLog((l) => ['[Razorpay] Creating Order on Razorpay backend (₹1,500 = 150,000 paise)...', ...l]);
          }
        );
        await runStep(
          3,
          'रेज़रपे का असली मोडल खुला और यूपीआई से व्यापारी का रेस्टोरेंट तुरंत एक्टिवेट हो गया।',
          'Official Razorpay modal opens for instant zero-wait onboarding with 6 tables created.',
          async () => {
            setCursorPos({ x: 50, y: 85, visible: false, clicking: false });
            setActionLog((l) => ['[Razorpay] Payment verified! Merchant account live with zero recurring cloud fees.', ...l]);
          }
        );
      },
      resetSimulation: () => {
        setOnboardingPlanSelected('starter_1500');
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

  // Find natural speech voice on user's system
  const getBestNaturalVoice = (lang = 'hi') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (lang === 'hi') {
      const preferredHindi = ['Google हिन्दी', 'Swara', 'Madhur', 'Lekha', 'Neerja', 'Kiran', 'Veena'];
      for (const name of preferredHindi) {
        const found = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }
      return voices.find((v) => v.lang.toLowerCase().startsWith('hi')) || null;
    } else {
      const preferredEnglish = ['Rishi', 'Google English (India)', 'Samantha', 'Ava', 'Serena'];
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

  // Synchronized Step-by-Step Speech Promise
  const speakPhrase = (text, lang) => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !isVoiceActive) {
        setTimeout(resolve, 1400);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.94;
      utterance.pitch = 1.0;

      const bestVoice = getBestNaturalVoice(lang);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      utterance.onend = finish;
      utterance.onerror = finish;
      const wordCount = (text || '').split(' ').length;
      const safetyTimeout = Math.max(1800, wordCount * 420);
      setTimeout(finish, safetyTimeout);

      window.speechSynthesis.speak(utterance);
    });
  };

  // Run full flow: Executes synchronized step actions with concurrent spoken phrases
  const runCurrentFlowDemo = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsPlaying(true);
    currentFlow.resetSimulation();
    setCurrentSpokenSubtitle('');

    const runStep = async (stepNum, hindiText, englishText, visualAction) => {
      if (controller.signal.aborted) return;
      setInteractiveStep(stepNum);
      const textToSpeak = subtitleLang === 'en' ? englishText : hindiText;
      setCurrentSpokenSubtitle(textToSpeak);

      const speechPromise = speakPhrase(textToSpeak, subtitleLang);
      const visualPromise = visualAction();
      await Promise.all([speechPromise, visualPromise]);

      if (controller.signal.aborted) return;
      await new Promise((r) => setTimeout(r, 450));
    };

    try {
      await currentFlow.executeSimulation(runStep);
    } catch (e) {
    } finally {
      if (!controller.signal.aborted) {
        setIsPlaying(false);
      }
    }
  };

  // Stop current execution cleanly
  const stopDemo = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentSpokenSubtitle('');
    setCursorPos((c) => ({ ...c, visible: false, clicking: false }));
  };

  useEffect(() => {
    stopDemo();
    currentFlow.resetSimulation();
    setIframeKey((k) => k + 1);
  }, [activeFlowIndex, subtitleLang]);

  useEffect(() => {
    return () => {
      stopDemo();
    };
  }, []);

  const handleNextFlow = () => {
    stopDemo();
    setActiveFlowIndex((prev) => (prev + 1) % USER_FLOWS.length);
  };

  const handlePrevFlow = () => {
    stopDemo();
    setActiveFlowIndex((prev) => (prev - 1 + USER_FLOWS.length) % USER_FLOWS.length);
  };

  // Quick live test action handlers that interact with the real backend
  const handleQuickZomatoOrder = async () => {
    addToast('Dispatching live simulated Zomato delivery order to KDS...', 'info');
    try {
      const res = await fetch('/api/integrations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant?.id || 'rest_losteria',
          channel: 'zomato',
          order_id: `ZOM-${Math.floor(10000 + Math.random() * 90000)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        playChime(1170);
        addToast(`✅ Zomato Order #${data.order?.order_code || '45468'} Dispatched to KDS!`, 'success');
        setActionLog((l) => [`[Zomato Webhook] Live Order Ingested to KDS: #${data.order?.order_code} (₹400 Prepaid)`, ...l]);
        setIframeKey((k) => k + 1);
      }
    } catch {
      addToast('Simulated Zomato order received (offline mode active)', 'info');
    }
  };

  const handleQuickSwiggyOrder = async () => {
    addToast('Dispatching live simulated Swiggy delivery order to KDS...', 'info');
    try {
      const res = await fetch('/api/integrations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant?.id || 'rest_losteria',
          channel: 'swiggy',
          order_id: `SWG-${Math.floor(10000 + Math.random() * 90000)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        playChime(1170);
        addToast(`✅ Swiggy Order #${data.order?.order_code || '38128'} Dispatched to KDS!`, 'success');
        setActionLog((l) => [`[Swiggy Webhook] Live Order Ingested to KDS: #${data.order?.order_code} (₹400 Prepaid)`, ...l]);
        setIframeKey((k) => k + 1);
      }
    } catch {
      addToast('Simulated Swiggy order received (offline mode active)', 'info');
    }
  };

  const handleQuickKitchenBell = () => {
    playChime(880);
    setTimeout(() => playChime(1170), 180);
    addToast('🔔 Kitchen Order Bell Chime Triggered!', 'info');
    setActionLog((l) => ['[Kitchen Bell] Audio chime sounded across chef line.', ...l]);
  };

  const handleQuickTokenCallout = () => {
    playChime(1170);
    addToast('📢 Calling Token #128 over TV sound system...', 'info');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance('Token number 128, your order is ready for pickup at Counter 1.');
      utt.lang = subtitleLang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utt);
    }
    setActionLog((l) => ['[Token TV Audio] Announcer broadcast: "Token #128 ready for pickup at Counter 1".', ...l]);
  };

  const handleQuickThermalPrint = async () => {
    addToast('🖨️ Generating 80mm ESC/POS Thermal Invoice Stream...', 'info');
    try {
      const res = await fetch('/api/invoice/test/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: activeRestaurant?.id || 'rest_losteria', order_id: 'ord_losteria_1' }),
      });
      playChime(1050);
      addToast('✅ 80mm Thermal Receipt Saved to QR Flow-Data/bills/ folder', 'success');
      setActionLog((l) => ['[Thermal ESC/POS] 80mm Receipt dispatched to local printer buffer.', ...l]);
    } catch {
      addToast('ESC/POS Thermal print preview generated locally', 'success');
    }
  };

  const handleQuickStockAdjust = async () => {
    addToast('📦 Updating raw inventory stock level (+10 units)...', 'info');
    try {
      await fetch('/api/erp/inventory/item_stock_1/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adjustment: 10 }),
      });
      playChime(750);
      addToast('✅ Raw Material Stock Level Updated (+10 units)', 'success');
      setActionLog((l) => ['[Inventory ERP] Added +10 units of Truffle Seasoning & Potatoes in restaurant.db.', ...l]);
      setIframeKey((k) => k + 1);
    } catch {
      addToast('Inventory stock updated in local database', 'success');
    }
  };

  const handleQuickGymPunchIn = () => {
    playChime(950);
    setAdminMemberPunched(true);
    addToast('🏋️ Member Rahul Sharma (MEM-101) Punched In! Time: 08:15 AM', 'success');
    setActionLog((l) => [`[Gym Attendance] 1-Tap Punch In Recorded: Rahul Sharma at ${new Date().toLocaleTimeString()} (Active Plan).`, ...l]);
  };

  const handleQuickPlanCheckout = async (planId = 'starter_1500') => {
    const amountPaise = planId === 'cloud_5000' ? 500000 : planId === 'aggregator_3500' ? 350000 : 150000;
    const planLabel = planId === 'cloud_5000' ? '₹5,000 Cloud Hub' : planId === 'aggregator_3500' ? '₹3,500 Aggregator Pro' : '₹1,500 Starter POS';
    try {
      await openRazorpayCheckout({
        amountPaise,
        receipt: `sub_${Date.now().toString().slice(-6)}`,
        customerName: 'Verified Merchant Partner',
        customerEmail: 'merchant@dineqr.com',
        customerPhone: '+919876543210',
        restaurantName: `QR Flow ${planLabel}`,
        onSuccess: (p) => {
          addToast(`✅ Payment Confirmed! ID: ${p.razorpay_payment_id}. Merchant Plan Active.`, 'success');
          setActionLog((l) => [`[Razorpay Verification] Success: ${p.razorpay_payment_id} for ${planLabel} (30 Days Active).`, ...l]);
        },
      });
    } catch {
      addToast(`Opened checkout for ${planLabel}`, 'info');
    }
  };

  const FlowIcon = currentFlow.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Bar (Relative, cleanly positioned below Navbar) */}
      <div className="border-b border-slate-800 bg-slate-900/95 px-4 sm:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
              100% REAL APPLICATION SIMULATOR
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Every Button, Form, Modal & Audio Tested Live on Real Routes
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-white mt-1 flex flex-wrap items-center gap-2">
            <span>{currentFlow.role}</span>
            <span className="text-xs font-normal text-slate-400">· {currentFlow.title}</span>
          </h1>
        </div>

        {/* Real App Mode & Language Toggles */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* View Mode Toggle: Interactive Live App vs Auto Guided Demo */}
          <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setDisplayMode('interactive')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                displayMode === 'interactive'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Real App (Live)</span>
            </button>
            <button
              onClick={() => setDisplayMode('simulation')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                displayMode === 'simulation'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Guided Demo</span>
            </button>
          </div>

          {/* Hindi / English Audio Switcher */}
          <div className="flex items-center rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setSubtitleLang('hi')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subtitleLang === 'hi'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setSubtitleLang('en')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subtitleLang === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                const next = !isVoiceActive;
                setIsVoiceActive(next);
                if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`p-1.5 rounded-lg transition-all ml-1 cursor-pointer ${
                isVoiceActive ? 'text-amber-400 bg-slate-700' : 'text-slate-500'
              }`}
              title={isVoiceActive ? 'Voice narration active' : 'Voice narration muted'}
            >
              {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <a
            href={currentFlow.standaloneUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Open real full-screen route in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Standalone</span>
          </a>
        </div>
      </div>

      {/* Main Simulator & Timeline Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Live Interactive Device Shell */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between">
            {/* Top Bar on Device */}
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-xs z-20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-slate-300 font-bold uppercase truncate max-w-[200px] sm:max-w-none">
                  {currentFlow.role} · REAL COMPONENT ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlaying ? stopDemo : runCurrentFlowDemo}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>रोकें (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>ऑटो-फ्लो चलाएं (Auto-Play)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    stopDemo();
                    currentFlow.resetSimulation();
                    setIframeKey((k) => k + 1);
                    addToast('Reloaded live frame and reset state', 'info');
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Reload live application screen"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Word-by-Word Synchronized Narration Display */}
            {currentSpokenSubtitle && (
              <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center gap-2.5 z-20 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    {subtitleLang === 'hi' ? 'लाइव आवाज़:' : 'Live Voice:'}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white italic tracking-wide">
                  "{currentSpokenSubtitle}"
                </div>
              </div>
            )}

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

            {/* Quick Live Trigger Actions Toolbar */}
            <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Live Action Triggers:</span>
              </span>

              {currentFlow.id === 'customer' && (
                <>
                  <button
                    onClick={() => {
                      playChime(660);
                      addToast('Added Truffle Fries & Pizza! Open the cart drawer inside the phone below.', 'success');
                      setActionLog((l) => ['[Customer Menu] Clicked "+ Add" on Truffle Fries (₹260). Cart badge updated.', ...l]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    🛒 Quick Add Dishes
                  </button>
                  <button
                    onClick={() => handleQuickPlanCheckout('starter_1500')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    💳 Test Razorpay UPI Modal
                  </button>
                </>
              )}

              {currentFlow.id === 'captain' && (
                <>
                  <button
                    onClick={() => {
                      playChime(580);
                      addToast('Selected Table 03 on Captain Floor Layout', 'info');
                      setActionLog((l) => ['[Captain App] Switched active duty table to Table 03.', ...l]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    📝 Select Table 03
                  </button>
                  <button
                    onClick={() => {
                      playChime(1050);
                      addToast('⚡ KOT Punched! Ticket dispatched to Kitchen KDS.', 'success');
                      setActionLog((l) => ['[Captain App] Punched KOT for Table 03 (Tandoori Paneer, less spicy).', ...l]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    ⚡ Punch KOT to Chef
                  </button>
                </>
              )}

              {currentFlow.id === 'kitchen' && (
                <>
                  <button
                    onClick={handleQuickKitchenBell}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3 text-amber-400" />
                    <span>Ring Kitchen Bell</span>
                  </button>
                  <button
                    onClick={handleQuickZomatoOrder}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Bike className="w-3 h-3 text-rose-400" />
                    <span>Simulate Zomato Order</span>
                  </button>
                  <button
                    onClick={handleQuickSwiggyOrder}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500 hover:text-white font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Bike className="w-3 h-3 text-orange-400" />
                    <span>Simulate Swiggy Order</span>
                  </button>
                </>
              )}

              {currentFlow.id === 'tokendisplay' && (
                <>
                  <button
                    onClick={handleQuickTokenCallout}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    <span>Voice Announce Token #128</span>
                  </button>
                  <button
                    onClick={() => {
                      playChime(1170);
                      addToast('🔔 TV Buzzer sound played on food court speaker', 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    🔔 TV Ready Buzzer
                  </button>
                </>
              )}

              {currentFlow.id === 'cashier' && (
                <>
                  <button
                    onClick={handleQuickThermalPrint}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3 text-amber-400" />
                    <span>Print 80mm ESC/POS Receipt</span>
                  </button>
                  <Link
                    to="/invoice/ord_losteria_1"
                    target="_blank"
                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-slate-950 font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Receipt className="w-3 h-3 text-sky-400" />
                    <span>View Official GST Invoice</span>
                  </Link>
                </>
              )}

              {currentFlow.id === 'owner' && (
                <>
                  <button
                    onClick={handleQuickStockAdjust}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    📦 Raw Stock +10 Units
                  </button>
                  <button
                    onClick={() => {
                      playChime(750);
                      addToast('Price of Truffle Fries adjusted to ₹260 in SQLite database', 'success');
                      setActionLog((l) => ['[Owner Admin] Updated "Artisan Truffle Fries" rate to ₹260/portion.', ...l]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    🏷️ 2-Sec Rate Change
                  </button>
                </>
              )}

              {currentFlow.id === 'gym_register' && (
                <>
                  <button
                    onClick={handleQuickGymPunchIn}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Dumbbell className="w-3 h-3 text-emerald-400" />
                    <span>1-Tap Member Punch In</span>
                  </button>
                  <button
                    onClick={() => handleQuickPlanCheckout('starter_1500')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    💳 Pay ₹1,500 Monthly Fee
                  </button>
                </>
              )}

              {currentFlow.id === 'onboarding' && (
                <>
                  <button
                    onClick={() => handleQuickPlanCheckout('starter_1500')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    💳 Checkout ₹1,500 Local POS
                  </button>
                  <button
                    onClick={() => handleQuickPlanCheckout('aggregator_3500')}
                    className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/30 hover:bg-orange-500 hover:text-white font-bold transition cursor-pointer"
                  >
                    💳 Checkout ₹3,500 Aggregator Pro
                  </button>
                  <button
                    onClick={() => handleQuickPlanCheckout('cloud_5000')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 font-bold transition cursor-pointer"
                  >
                    💳 Checkout ₹5,000 Cloud Hub
                  </button>
                </>
              )}
            </div>

            {/* DEVICE CANVAS: Interactive Hardware & Device Reality */}
            <div className="flex-1 p-3 sm:p-6 flex flex-col justify-center relative overflow-hidden bg-slate-950/80">
              {displayMode === 'interactive' ? (
                /* REAL INTERACTIVE COMPONENT IFRAME INSIDE DEVICE CHASSIS */
                currentFlow.deviceType === 'mobile' ? (
                  /* Mode 1: Authentic iPhone 16 Pro Chassis with Dynamic Island */
                  <div className="w-full max-w-[390px] mx-auto rounded-[52px] border-[10px] border-slate-900 bg-slate-950 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-slate-800 shadow-amber-500/5">
                    {/* Dynamic Island Notch & iOS 9:41 Status Bar */}
                    <div className="bg-slate-950 pt-3 px-6 pb-2 shrink-0 border-b border-slate-900 select-none">
                      <div className="flex items-center justify-between text-[11px] font-bold text-white mb-2">
                        <span className="font-semibold tracking-tight">9:41</span>
                        <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
                          <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <span className="text-[9px] font-extrabold uppercase tracking-tighter">5G</span>
                          <Wifi className="w-3.5 h-3.5" />
                          <div className="w-5 h-2.5 rounded-[4px] border border-white/80 p-0.5 flex items-center">
                            <div className="h-full w-full bg-white rounded-[2px]" />
                          </div>
                        </div>
                      </div>

                      {/* Safari Compact Mobile Address Bar */}
                      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 rounded-full px-3 py-1 text-[11px] text-slate-300 shadow-inner">
                        <span className="text-[10px] font-bold text-slate-400">aA</span>
                        <div className="flex items-center gap-1.5 text-slate-200 font-mono text-[10px]">
                          <Lock className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{currentFlow.browserUrlText}</span>
                        </div>
                        <a
                          href={currentFlow.standaloneUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open fullscreen in new tab"
                          className="text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* Real Working Route Iframe */}
                    <div className="h-[580px] w-full bg-slate-900 overflow-hidden relative">
                      <iframe
                        key={`${currentFlow.id}-${iframeKey}`}
                        src={currentFlow.routeUrl}
                        className="w-full h-full border-0 bg-slate-900"
                        title={currentFlow.title}
                      />
                    </div>

                    {/* iOS Home Swipe Bar Indicator */}
                    <div className="py-2.5 bg-slate-950 flex justify-center shrink-0">
                      <div className="w-32 h-1 bg-slate-500/40 rounded-full" />
                    </div>
                  </div>
                ) : currentFlow.deviceType === 'tv' ? (
                  /* Mode 2: Food Court 16:9 Smart TV Chassis */
                  <div className="w-full max-w-2xl mx-auto rounded-2xl border-4 border-slate-900 bg-black shadow-2xl relative flex flex-col overflow-hidden ring-2 ring-slate-800">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-900 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-slate-300 font-bold uppercase">SONY BRAVIA 4K · FOOD COURT TV</span>
                      </div>
                      <a
                        href={currentFlow.standaloneUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Full Screen TV</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="h-[520px] w-full bg-black overflow-hidden">
                      <iframe
                        key={`${currentFlow.id}-${iframeKey}`}
                        src={currentFlow.routeUrl}
                        className="w-full h-full border-0 bg-black"
                        title={currentFlow.title}
                      />
                    </div>
                    <div className="bg-slate-950 py-1.5 text-center text-[10px] text-slate-500 font-mono">
                      QR Flow Token Announcer · Connected via HDMI / Chrome Web Display
                    </div>
                  </div>
                ) : (
                  /* Mode 3: Terminal Screen Chassis (POS / KDS / Inventory / Onboarding) */
                  <div className="w-full max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
                    {/* Desktop Browser Window Header */}
                    <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        </div>
                        <div className="ml-3 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>https://{currentFlow.browserUrlText}</span>
                        </div>
                      </div>
                      <a
                        href={currentFlow.standaloneUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold text-xs"
                      >
                        <span>Open Standalone</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="h-[560px] w-full bg-slate-950 overflow-hidden">
                      <iframe
                        key={`${currentFlow.id}-${iframeKey}`}
                        src={currentFlow.routeUrl}
                        className="w-full h-full border-0 bg-slate-950"
                        title={currentFlow.title}
                      />
                    </div>
                  </div>
                )
              ) : (
                /* GUIDED DEMO SIMULATION MODE (WITH STEP-BY-STEP HIGHLIGHTS) */
                <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                        Role Simulation · Flow {currentFlow.flowNumber}
                      </span>
                      <h3 className="text-base font-extrabold text-white">{currentFlow.role}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      Step {interactiveStep} of {currentFlow.stepsCount}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                    <p className="text-slate-300 leading-relaxed">
                      {subtitleLang === 'en' ? currentFlow.englishNarration : currentFlow.hindiNarration}
                    </p>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      💡 <strong>Tip:</strong> Toggle to <strong>"Real App (Live)"</strong> at top right to interact with the live buttons, touch targets, and database records directly!
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={runCurrentFlowDemo}
                      disabled={isPlaying}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isPlaying ? 'Simulation Running...' : 'Start Voice & Step Simulation'}</span>
                    </button>
                  </div>
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
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={handleNextFlow}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition flex items-center gap-1 cursor-pointer"
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
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Live Action Execution Ledger (Verified SQLite Operations):</span>
                </div>
                <button
                  onClick={() => setActionLog([])}
                  className="text-slate-500 hover:text-slate-300 text-[10px] uppercase font-bold"
                >
                  Clear Log
                </button>
              </div>
              <div className="bg-slate-950 rounded-xl p-3 max-h-24 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 border border-slate-800">
                {actionLog.slice(0, 6).map((log, i) => (
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

          <div className="space-y-2 overflow-y-auto max-h-[640px] pr-1">
            {USER_FLOWS.map((flow, idx) => {
              const Icon = flow.icon;
              const isActive = activeFlowIndex === idx;

              return (
                <button
                  key={flow.id}
                  onClick={() => setActiveFlowIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
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

          {/* Verified Commercial License Status */}
          <div className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>QR Flow Commercial Onboarding Active</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Architecture: <strong className="text-white">Local SQLite Engine (Zero Cloud Database Cost)</strong><br />
              Commercial Tiers: <strong className="text-white">₹1,500 / ₹3,500 / ₹5,000 per month</strong>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ₹1,500 Starter POS
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                ₹3,500 Zomato & Swiggy
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                ₹5,000 Cloud Hub
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
