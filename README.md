# 🍽️ DineQR - Multi-Tenant Restaurant QR Menu, Live KDS, Invoicing & Direct Razorpay Platform

A complete, production-ready, multi-tenant digital dining and restaurant operations platform. DineQR empowers cafes and restaurants to eliminate physical paper menus, speed up table turnaround times, accept direct online payments straight into each restaurant's own bank account via **Razorpay**, manage orders with a live real-time **Kitchen Display System (KDS)**, generate **GST-compliant Tax Invoices**, and export full accounting reports in **Excel-ready CSV spreadsheets**.

Super admins can monitor platform GMV, onboard new restaurants in one click, and manage all tenants in real time.

---

## 🌐 Live Demo & Instant Access

The application is deployed and running live:

- **🌍 Public Cloudflare Demo Tunnel (HTTPS)**: [https://cave-ricky-fresh-placement.trycloudflare.com](https://cave-ricky-fresh-placement.trycloudflare.com)
- **📱 Local Wi-Fi Mobile Scan URL**: `http://192.168.29.237:3001`
- **💻 Localhost URL**: [http://localhost:3001](http://localhost:3001)

### Quick Links to Portals
| Portal | Direct Link | Purpose |
|---|---|---|
| **Customer Digital Menu (Table 01)** | [Open Menu](https://cave-ricky-fresh-placement.trycloudflare.com/menu?table=tbl_1) | Scan-to-order customer experience with visual catalog & online checkout |
| **Kitchen Display System (KDS)** | [Open KDS](https://cave-ricky-fresh-placement.trycloudflare.com/admin/kitchen) | Real-time live ticket queue with audio chime alert |
| **Menu Manager (Add/Edit Items)** | [Open Menu Manager](https://cave-ricky-fresh-placement.trycloudflare.com/admin/menu) | Add new dishes, edit pricing, toggle in-stock / sold-out |
| **Table & QR Code Generator** | [Open Tables](https://cave-ricky-fresh-placement.trycloudflare.com/admin/tables) | Generate dynamic scannable table QRs & printable 4x6" placards |
| **Orders Archive & Spreadsheet Export** | [Open Orders](https://cave-ricky-fresh-placement.trycloudflare.com/admin/orders) | Filter historical orders & download Excel-ready CSV report |
| **Cafe Settings & Razorpay Direct Account** | [Open Settings](https://cave-ricky-fresh-placement.trycloudflare.com/admin/settings) | Configure cafe profile, GSTIN, and direct Razorpay bank credentials |
| **Owner Dashboard** | [Open Dashboard](https://cave-ricky-fresh-placement.trycloudflare.com/admin) | Real-time sales, order counts, occupancy & top dishes |
| **Super Admin Fleet Command** | [Open Super Admin](https://cave-ricky-fresh-placement.trycloudflare.com/admin/super-admin) | Monitor all onboarded cafes, platform GMV & provision new tenants |

---

## 🌟 Key Features

### 1. 📱 Dynamic Scannable Table QR Codes (`/admin/tables`)
- Create tables with custom table numbers, seating capacities, and restaurant sections (*Main Dining, Terrace Garden, Lounge & Bar, Private Cabana*).
- Instantly renders scannable high-resolution QR codes encoded with table credentials.
- **LAN IP Switch**: Toggle between Localhost and your Wi-Fi LAN IP (`192.168.29.237:3001`) or Cloudflare Public URL so real mobile phone cameras can scan and open the menu immediately.
- **Printable Table Placards**: Generates branded 4x6" table tents with restaurant name, Wi-Fi password, and "Scan to Order" instructions. Download as PNG or SVG.

### 2. 🍲 Visual Digital Menu with Real HD Photography (`/menu?table=...`)
- Curated catalog of culinary photography across Starters, Wood-Fired Pizzas, Artisanal Pastas, Signature Drinks, and Desserts.
- Live search bar, category filter pills, and a quick Veg-Only toggle.
- Dish indicators: Preparation time (`⏱️ 15m`), spice level meters (`🌶️🌶️`), calorie count, and badges (*Bestseller*, *Chef's Special*).
- Dish customization modal: Diners can add custom notes (e.g., *"Make it extra spicy"*, *"No onion or garlic"*).
- Responsive slide-over cart drawer with live tax calculations.

### 3. 🍳 Live Kitchen Display System (KDS) (`/admin/kitchen`)
- Powered by **Server-Sent Events (SSE)** for zero-delay order synchronization across multiple screens.
- **Pleasant Web Audio Service Bell Chime**: Rings aloud in the kitchen whenever a customer places an order or completes payment.
- 4-stage kitchen order workflow: `[Start Cooking]` -> `[Mark Ready]` -> `[Mark Served]` -> `[Archive]`.
- Timers that flag tickets that have exceeded prep targets (> 15 mins).

### 4. ➕ Adding New Items to an Existing QR Menu (`/admin/menu`)
- Restaurant owners can add dishes on the fly without changing existing printed table QRs! Any new item added immediately appears on every customer's phone when they scan their table QR code.
- Includes a **Photo Preset Library** (Italian Pizzas, Pastas, Burgers, Sushi, Coffees, Cocktails, Desserts) for 1-click professional imagery, or allows custom Unsplash/CDN image URLs.
- Quick **In-Stock / Sold-Out** toggle: Instantly grey out sold-out items from customer menus without deleting them.

### 5. 💳 Multi-Tenant Razorpay Integration (Direct Restaurant Bank Settlement)
- **Direct Merchant Payouts**: Each cafe owner can navigate to `Admin -> Cafe Settings` and enter their own `Razorpay Key ID` and `Razorpay Key Secret`.
- All customer payments made through that restaurant's QR codes are routed and settled **directly into that restaurant's linked bank account**, with zero platform custody of funds.
- **Interactive Sandbox Mode**: When testing without live merchant keys, the platform includes a built-in sandbox simulator to verify complete payment workflows and order transitions to `PAID`.
- Also supports **Cash / Pay at Counter** for guests preferring traditional POS settlement.

### 6. 📊 Historical Order Management & Excel Spreadsheet Export (`/admin/orders`)
- Cafe owners can view all historical orders across time presets:
  - **Today**
  - **Yesterday**
  - **Last 7 Days**
  - **Last 30 Days**
  - **All Time**
- Search by customer name, order ID, or table number.
- **Excel-Ready Spreadsheet Export**: Click **"Export CSV for Excel"** to download a clean, UTF-8 encoded `.csv` file formatted for Microsoft Excel, Apple Numbers, and Google Sheets, containing:
  - Order ID & Short Code
  - Date & Timestamp
  - Table Number & Section
  - Customer Name & Phone
  - Itemized Items & Quantities
  - Subtotal, CGST, SGST, Service Charge, and Total Amount
  - Payment Method (Razorpay / Cash) & Status (PAID / PENDING)

### 7. 🧾 Official GST Tax Invoices (`/invoice/:orderId`)
- Official GST-compliant tax invoices with:
  - Restaurant GSTIN & FSSAI License Number
  - 5% GST calculated and itemized (2.5% CGST + 2.5% SGST)
  - Razorpay Transaction Reference ID
  - 1-click toggle between **Standard A4 Invoice** and **80mm POS Thermal Slip** with print-optimized CSS.

### 8. 🏢 Super Admin Fleet Command (`/admin/super-admin`)
- Monitor total platform Gross Merchandise Value (GMV), active restaurant count, total orders, and average ticket size.
- Overview cards for all onboarded cafes showing active tables, menu size, and total sales.
- **1-Click Tenant Provisioning**: Add a new cafe or bistro with custom name, address, GSTIN, FSSAI, and contact details.

---

## 📮 Postman Collection & Automated API Testing

A complete Postman v2.1 collection is included in `postman/DineQR_Platform.postman_collection.json`.

### How to Import into Postman
1. Open the Postman desktop app or web client.
2. Click **Import** (top left).
3. Drag and drop `postman/DineQR_Platform.postman_collection.json` (or select `postman/DineQR_Local.postman_environment.json`).
4. Set the `baseUrl` variable to `https://cave-ricky-fresh-placement.trycloudflare.com` or `http://localhost:3001`.
5. Run the collection using Postman Collection Runner!

### Running Automated Test Suites in Terminal
We provide an automated Node.js runner that executes all Postman endpoints and integration tests:

```bash
# Run both Postman API tests and internal system tests
npm test
```

**Verification Results:**
```
📮 Running DineQR Postman Collection Automated Test Suite...
  ✅ [1] GET /api/health -> Status 200 & Online
  ✅ [2] GET /api/restaurants -> Returns active restaurants
  ✅ [3] GET /api/restaurants/super-admin/overview -> Super admin metrics
  ✅ [4] POST /api/restaurants -> Provision new cafe tenant
  ✅ [5] PUT /api/restaurants/:id -> Configure direct Razorpay merchant keys
  ✅ [6] GET /api/tables -> List tables for restaurant
  ✅ [7] POST /api/tables -> Add new dining table
  ✅ [8] GET /api/tables/:id/qr -> Generate scannable QR Code PNG
  ✅ [9] POST /api/menu/items -> Add new dish to existing QR menu
  ✅ [10] PATCH /api/menu/items/:id/availability -> Toggle In Stock / Sold Out
  ✅ [11] POST /api/orders -> Place table order with tax calculation
  ✅ [12] POST /api/payment/razorpay/create-order -> Create Razorpay order
  ✅ [13] POST /api/payment/razorpay/verify -> Verify signature & update to PAID
  ✅ [14] PATCH /api/orders/:id/status -> Transition RECEIVED -> PREPARING
  ✅ [15] PATCH /api/orders/:id/status -> Transition PREPARING -> READY
  ✅ [16] PATCH /api/orders/:id/status -> Transition READY -> COMPLETED
  ✅ [17] GET /api/invoice/:orderId -> Official GST Tax Invoice breakdown
  ✅ [18] GET /api/orders/export -> Download Excel-ready CSV report

🏁 Postman Test Suite Summary: 18/18 assertions passed (100%)!
🧪 Full System Integration Test Suite: 8/8 tests passed (100%)!
```

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js v22/26, Express v5, native embedded `node:sqlite` (`DatabaseSync`), Server-Sent Events (SSE).
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Web Audio API.
- **Payments**: Razorpay Node SDK, HMAC-SHA256 signature verification, dynamic per-restaurant API key resolution.
- **Database**: Zero-dependency local SQLite file (`data/restaurant.db`) with automatic parameter sanitization.
- **Deployment**: Docker (`Dockerfile`), Docker Compose (`docker-compose.yml`), Render specification (`render.yaml`), and Cloudflare Tunnel (`cloudflared`).

---

## 🚢 Deployment Guide

### Option 1: Docker & Docker Compose (Recommended for VPS / Cloud Server)
```bash
# Clone the repository and run with Docker Compose
docker-compose up -d --build
```
Your platform will be accessible at port `3001` with data persisted in `./data/restaurant.db`.

### Option 2: Render / Railway / Fly.io
Use the included `render.yaml` or connect your GitHub repository:
- Build Command: `npm install && npm run build`
- Start Command: `node server/index.js`
- Persistent Disk: Mount `/app/data` (1GB)

### Option 3: Local or VPS Node.js
```bash
git clone <repo>
cd dineqr-platform
npm install
npm run build
NODE_ENV=production PORT=3001 node server/index.js
```
