# ⚡ QRFlow: Master Capabilities, Product Architecture & Operations Manual

> **Platform Version:** 3.8.0 Enterprise  
> **Brand Identity:** QRFlow (formerly DineQR)  
> **Product Thesis:** Autonomous Multi-Activity QR Workflows, On-Premise POS & AI Growth Engine  
> **Production Live URL:** [https://dineqr-omnichannel.netlify.app](https://dineqr-omnichannel.netlify.app)  
> **Local Base Port:** `http://localhost:3005`  
> **Target Audience:** Restaurants, Cafes, Cloud Kitchens, QSR Food Courts, Gyms, Clinics, and Retail Venues  

---

## 📑 Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [The 10 Core Functional Modules](#3-the-10-core-functional-modules)
   - [Module 1: Customer Table QR Ordering & 0% Commission Checkout](#module-1-customer-table-qr-ordering--0-commission-checkout)
   - [Module 2: Captain Waiter Mobile POS](#module-2-captain-waiter-mobile-pos)
   - [Module 3: Kitchen Display System (KDS) & Timers](#module-3-kitchen-display-system-kds--timers)
   - [Module 4: Food Court Token TV Display & Voice Announcer](#module-4-food-court-token-tv-display--voice-announcer)
   - [Module 5: Two-Way Zomato & Swiggy Delivery Aggregator Hub](#module-5-two-way-zomato--swiggy-delivery-aggregator-hub)
   - [Module 6: Multi-Vertical Operations (Gym & Clinic Queues)](#module-6-multi-vertical-operations-gym--clinic-queues)
   - [Module 7: 100% Local SQLite Storage & Zero Cloud Database Fees](#module-7-100-local-sqlite-storage--zero-cloud-database-fees)
   - [Module 8: AutoGram AI (Autonomous Instagram Growth & Video Engine)](#module-8-autogram-ai-autonomous-instagram-growth--video-engine)
   - [Module 9: Video Production & Marketing Studio](#module-9-video-production--marketing-studio)
   - [Module 10: Google AdSense Passive Monetization](#module-10-google-adsense-passive-monetization)
4. [Hardware & Multi-Platform Compatibility](#4-hardware--multi-platform-compatibility)
5. [Pricing Model & Revenue Economics](#5-pricing-model--revenue-economics)
6. [Security, Tax Compliance & Data Ownership](#6-security-tax-compliance--data-ownership)
7. [Verification, Quality Assurance & Test Suites](#7-verification-quality-assurance--test-suites)

---

## 1. Executive Summary & Core Philosophy

**QRFlow** is an omnichannel workflow and operating system engineered to disrupt legacy point-of-sale (POS) incumbents (such as Petpooja, Posist, and Toast) by addressing the three biggest pain points of retail and hospitality merchants:

1. **Zero Per-Order Commissions:** Legacy platforms charge 1.5% to 5% on top of payment processing or lock merchants into proprietary credit card processors. QRFlow connects directly to the merchant's own Razorpay/UPI gateway with **0% commission**.
2. **Permanent Data Ownership (Zero Cloud Bills):** Traditional providers store business records on expensive remote clouds. If a subscription lapses, access to customer history and order ledgers is revoked. QRFlow embeds a high-speed SQLite database engine directly on the local counter machine (`./data/restaurant.db`). The merchant owns their data perpetually.
3. **Autonomous Growth (Agency Killer):** Instead of requiring a ₹30,000/month social media marketing agency, QRFlow includes **AutoGram AI** — an autonomous agent that generates studio-quality 9:16 reels with animated kinetic captions, manages a 30-day posting calendar, and converts Instagram commenters into paying customers via instant 1.2-second DMs.

---

## 2. End-to-End System Architecture

QRFlow operates on an **Edge-Local Hybrid Architecture**:

```
                       [ Customer Phone / Table QR ]
                                     │
                             (Scans QR Code)
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │            QRFlow Cloud Tunnel / Edge Edge             │
        │       (HTTPS via Cloudflare / Netlify Edge Proxy)      │
        └────────────────────────────┬───────────────────────────┘
                                     │
                   WebSocket / SSE / REST Ingestion
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │            Local Counter Terminal (Port 3005)          │
        │   ┌────────────────────────────────────────────────┐   │
        │   │  Express.js Engine + SSE Event Bus             │   │
        │   └────────────────────────┬───────────────────────┘   │
        │                            │                           │
        │   ┌────────────────────────┴───────────────────────┐   │
        │   │  Local SQLite Engine (./data/restaurant.db)    │   │
        │   │  • 18 Tables: orders, items, inventory, staff  │   │
        │   │  • Write-Ahead Logging (WAL) Mode              │   │
        │   │  • Sub-millisecond read/write latency          │   │
        │   └────────────────────────┬───────────────────────┘   │
        └────────────────────────────┼───────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
[ Kitchen KDS Screen ]     [ Waiter Captain App ]     [ Food Court TV Display ]
(Audio chime + Timers)     (Table KOT punching)       (Voice Token Callout)
```

---

## 3. The 10 Core Functional Modules

### Module 1: Customer Table QR Ordering & 0% Commission Checkout
- **Route:** `/menu?restaurant=<id>&table=<id>`
- **Features:**
  - Physical scannable QR placards placed on tables, bar stools, or counters.
  - Ultra-fast digital menu with category filtering, instant search, and dietary tags (Vegetarian, Non-Vegetarian, Chef's Special, Spicy).
  - Floating Order Basket drawer with automated **CGST (2.5%) + SGST (2.5%)** or custom tax breakdown.
  - Seamless Razorpay UPI integration supporting Google Pay, PhonePe, Paytm, Credit/Debit Cards, and NetBanking.
  - Zero transaction cut: 100% of the funds settle directly to the merchant's bank account.

### Module 2: Captain Waiter Mobile POS
- **Route:** `/captain`
- **Features:**
  - Designed specifically for smartphone screens; waiters use their existing personal devices without expensive handheld hardware.
  - Table selection, party size, and multi-round order additions.
  - Kitchen Order Ticket (KOT) punching in **under 2 seconds**.
  - Custom cooking instructions per dish (e.g., "Extra spicy", "No onions", "Allergy alert").

### Module 3: Kitchen Display System (KDS) & Timers
- **Route:** `/admin/kitchen` (Public Demo: `/kds-demo`)
- **Features:**
  - Live real-time ticket streaming using Server-Sent Events (SSE).
  - Audible kitchen chimes and alarm buzzers that trigger automatically when a new ticket arrives.
  - Color-coded workflow: `RECEIVED` (Blue) &rarr; `PREPARING` (Amber) &rarr; `READY` (Emerald) &rarr; `COMPLETED` (Slate).
  - Elapsed preparation timers with visual urgent warnings when tickets exceed target prep times.
  - 1-Tap integration with 80mm ESC/POS thermal receipt printers.

### Module 4: Food Court Token TV Display & Voice Announcer
- **Route:** `/tokens` (Display URL: `/display/tokens`)
- **Features:**
  - Fullscreen high-visibility UI built for ceiling-mounted food court and QSR television screens.
  - Two-column layout: **"Preparing"** (Live progress) vs **"Ready for Pickup"** (Pulsing highlight).
  - Synthesized speech engine (Web Speech API + harmonic chime oscillator) that vocally announces ready orders (e.g., *"Token Number 128 is ready for collection!"*).
  - Bottom marquee news ticker and passive Google AdSense monetization banner.

### Module 5: Two-Way Zomato & Swiggy Delivery Aggregator Hub
- **Route:** `/admin/settings` (Integrations Tab)
- **Features:**
  - Centralized two-way webhook connector for **Zomato, Swiggy, Magicpin, and ONDC**.
  - Eliminates the counter clutter of 4 different delivery tablets.
  - Rider arrival tracking, dispatch management, and unified daily P&L reporting.

### Module 6: Multi-Vertical Operations (Gym & Clinic Queues)
- **Routes:** `/gym-register`, `/showcase`
- **Features:**
  - **Fitness Clubs & Gyms:** Paperless member attendance roster, 1-tap daily punch-in, membership expiry notifications, and protein bar sales billing.
  - **Medical Clinics & Diagnostics:** Patient room QR placards, OPD doctor queue management, computerized prescription slips, and consultation time tracking.
  - **Salons & Spas:** Styling chair QR menus, treatment bookings, and cashless chair-side UPI checkout.

### Module 7: 100% Local SQLite Storage & Zero Cloud Database Fees
- **File Location:** `./data/restaurant.db`
- **Features:**
  - Runs on the counter machine with zero cloud database hosting costs.
  - SQLite WAL (Write-Ahead Logging) ensures ACID compliance and 10,000+ reads/sec without lock contention.
  - 1-Click Binary Snapshot Export (`/api/erp/local-sqlite/export`) allows merchants to backup their full database to a USB thumb drive.
  - SHA-256 cryptographic webhook verification ensures data integrity across all 18 tables.

### Module 8: AutoGram AI (Autonomous Instagram Growth & Video Engine)
- **Routes:** `/instagram-automation`, `/yc-pitch`
- **Features:**
  - **AI Video Producer:** Input any topic or URL &rarr; AI drafts high-retention hooks, retention scripts, and kinetic Hormozi-style highlighted captions.
  - **Comment-to-DM Sales Bot:** Viewer comments `DEMO` or `PRICE` &rarr; Bot replies publicly and fires a personalized DM in **1.2 seconds** with a tracking invite.
  - **30-Day Auto-Pilot Content Queue:** Schedules 2 daily reels at peak engagement windows (12:45 PM & 7:45 PM) with live viral scoring (88–98/100).
  - **Y Combinator Pitch Deck:** Built-in YC Founder Application ready for submission.

### Module 9: Video Production & Marketing Studio
- **Route:** `/promo`
- **Features:**
  - Pre-rendered, broadcast-ready 1080p Full HD video assets:
    - `public/videos/qrflow_animated_hero_loop.mp4`: Pure cybernetic 3D motion graphic loop (0 humans).
    - `public/videos/autogram_yc_vertical_reels.mp4`: 9:16 vertical reel for Instagram & Shorts.
    - `public/videos/autogram_yc_landscape_showcase.mp4`: 16:9 widescreen showcase for YouTube & YC.
    - `public/videos/dineqr_promo_vertical_shorts.mp4`: Retail POS feature reel.
  - 1-Click copy-ready captions, hashtag bundles, and WhatsApp outreach templates.

### Module 10: Google AdSense Passive Monetization
- **Component:** `src/components/AdSenseBanner.jsx`
- **Features:**
  - Responsive ad banners placed non-intrusively on customer digital menus, food court token screens, and pricing pages.
  - Generates passive income from free foot traffic without paying for advertising.
  - Configurable Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`) via the Promo Studio.

---

## 4. Hardware & Multi-Platform Compatibility

QRFlow runs universally across any hardware without requiring dedicated proprietary terminals:

| Platform | Format / Technology | Primary Use Case |
|---|---|---|
| **Web Browser** | Chrome, Safari, Edge, Firefox | Cloud admin, customer table QR, and kiosk ordering |
| **Windows Desktop** | `.exe` Setup (Electron / Node Native) | Main billing counter & 80mm thermal receipt printer |
| **Android Tablet / Phone** | `.apk` Package | Waiter Captain mobile POS & kitchen wall displays |
| **macOS** | `.dmg` Universal Binary | Owner dashboard & analytics workstation |
| **Linux / Debian** | `.deb` Package | Low-cost Raspberry Pi or Debian counter terminals |

---

## 5. Pricing Model & Revenue Economics

QRFlow eliminates confusing tier traps and hidden transaction fees:

| Plan | Price (INR) | Key Inclusions | Target Segment |
|---|---|---|---|
| **Starter Local POS** | **₹1,500 / month** | Unlimited tables, QR menus, Captain App, Kitchen KDS, 100% Offline SQLite, Zero Commissions | Single-outlet Cafes, Bakeries, Small Bistros |
| **Aggregator Pro** | **₹3,500 / month** | All Starter features + Direct Two-Way Zomato & Swiggy Webhook Ingestion + Token TV Display | Busy QSRs, Cloud Kitchens, Multi-Aggregator Outlets |
| **Cloud Sync Hub** | **₹5,000 / month** | All Pro features + Multi-Chain Fleet Sync + 2GB Encrypted Snapshot Cloud Storage + Priority SLA | Multi-Branch Chains, Fine Dining, Gym & Clinic Franchises |

---

## 6. Security, Tax Compliance & Data Ownership

- **GST Tax Compliance:** Full support for Indian GST laws. Generates official tax invoices with breakdown of CGST, SGST, IGST, HSN/SAC codes, and restaurant GSTIN registration.
- **Data Sovereignty:** Merchant database resides strictly on the local drive. No third party can throttle or block access.
- **Role-Based Access Control:** Dual-layer security with staff 4-digit PINs (e.g. `1234` for Cashiers) and Super Admin authentication tokens.

---

## 7. Verification, Quality Assurance & Test Suites

The entire QRFlow ecosystem is backed by an automated CI/CD testing pipeline:

| Test Suite | Command | Total Tests | Pass Rate | Status |
|---|---|---|---|---|
| **Merchant Payment Suite** | `npm run test:payment` | 29 | **100% (29/29)** | ✅ Verified |
| **Postman API Collection** | `npm run test:postman` | 63 | **100% (63/63)** | ✅ Verified |
| **Full System Integration** | `npm run test:system` | 8 | **100% (8/8)** | ✅ Verified |
| **Autonomous Code Review Bot**| `npm run code-review` | 5 Rules | **0 Errors, 0 Warnings** | ✅ Verified |

---

**© 2026 QRFlow Technologies. All Rights Reserved.**
