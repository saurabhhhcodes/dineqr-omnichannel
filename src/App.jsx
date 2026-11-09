// src/App.jsx - Main Application Router & Shell (Multi-Tenant & Super Admin)
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { RestaurantProvider } from './context/RestaurantContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';

import { CustomerMenu } from './pages/CustomerMenu.jsx';
import { OrderConfirmation } from './pages/OrderConfirmation.jsx';
import { InvoiceView } from './pages/InvoiceView.jsx';
import { AdminKitchen } from './pages/AdminKitchen.jsx';
import { AdminTables } from './pages/AdminTables.jsx';
import { AdminOrders } from './pages/AdminOrders.jsx';
import { AdminMenu } from './pages/AdminMenu.jsx';
import { AdminSettings } from './pages/AdminSettings.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { SuperAdmin } from './pages/SuperAdmin.jsx';
import { ClientOnboarding } from './pages/ClientOnboarding.jsx';
import { LandingHero } from './pages/LandingHero.jsx';
import { AdminFloorPlan } from './pages/AdminFloorPlan.jsx';
import { AdminReservations } from './pages/AdminReservations.jsx';
import { AdminStaff } from './pages/AdminStaff.jsx';
import { AdminInventory } from './pages/AdminInventory.jsx';
import { AdminPurchases } from './pages/AdminPurchases.jsx';
import { AdminDownloads } from './pages/AdminDownloads.jsx';
import { SubscriptionPricing } from './pages/SubscriptionPricing.jsx';
import { ProductWalkthrough } from './pages/ProductWalkthrough.jsx';
import { CaptainApp } from './pages/CaptainApp.jsx';
import { TokenDisplay } from './pages/TokenDisplay.jsx';
import { PetpoojaComparison } from './pages/PetpoojaComparison.jsx';
import { MultiBusinessDashboard } from './pages/MultiBusinessDashboard.jsx';
import { GymRegister } from './pages/GymRegister.jsx';
import { AdminOrderRisk } from './pages/AdminOrderRisk.jsx';
import { MarketingPromoHub } from './pages/MarketingPromoHub.jsx';

import { AdminAuthGate } from './components/AdminAuthGate.jsx';

function AppContent() {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isPrintOnly = location.pathname.startsWith('/invoice') && location.search.includes('print=true');
  const isDarkPage =
    location.pathname === '/' ||
    location.pathname === '/home' ||
    location.pathname === '/walkthrough' ||
    location.pathname === '/demo' ||
    location.pathname === '/poss' ||
    location.pathname === '/compare/petpooja' ||
    location.pathname === '/captain' ||
    location.pathname === '/tokens' ||
    location.pathname === '/display/tokens' ||
    location.pathname === '/showcase' ||
    location.pathname === '/dashboards' ||
    location.pathname === '/business-dashboard' ||
    location.pathname === '/promo' ||
    location.pathname === '/marketing' ||
    location.pathname === '/social';
  const pageBg = isDarkPage ? 'bg-slate-950' : 'bg-slate-50';

  return (
    <div className={`min-h-screen ${pageBg} flex flex-col font-sans w-full max-w-full`}>
      {!isPrintOnly && (
        <Navbar onOpenCart={() => setIsCartOpen(true)} />
      )}

      <div className="flex-1">
        <Routes>
          {/* Universal Hero / Landing Portal */}
          <Route path="/" element={<LandingHero />} />
          <Route path="/home" element={<LandingHero />} />

          {/* Customer & Patient Facing Digital Menu */}
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/order/:orderId" element={<OrderConfirmation />} />
          <Route path="/invoice/:orderId" element={<InvoiceView />} />

          {/* Interactive Multi-Vertical Product Walkthrough with Subtitles */}
          <Route path="/walkthrough" element={<ProductWalkthrough />} />
          <Route path="/demo" element={<ProductWalkthrough />} />

          {/* Social Media & Marketing Video Studio + Google AdSense Monetization */}
          <Route path="/promo" element={<MarketingPromoHub />} />
          <Route path="/marketing" element={<MarketingPromoHub />} />
          <Route path="/social" element={<MarketingPromoHub />} />



          {/* Master Multi-Business Vertical Dashboards */}
          <Route path="/showcase" element={<MultiBusinessDashboard />} />
          <Route path="/dashboards" element={<MultiBusinessDashboard />} />
          <Route path="/business-dashboard" element={<MultiBusinessDashboard />} />
          <Route path="/gym-register" element={<GymRegister />} />
          <Route path="/admin/gym-register" element={<GymRegister />} />

          {/* Client Self-Onboarding & Join */}
          <Route path="/onboard" element={<ClientOnboarding />} />
          <Route path="/join" element={<ClientOnboarding />} />

          {/* Restaurant / Clinic / Gym Staff & Owner (Guarded by AdminAuthGate) */}
          <Route path="/admin" element={<AdminAuthGate><AdminDashboard /></AdminAuthGate>} />
          <Route path="/admin/kitchen" element={<AdminAuthGate><AdminKitchen /></AdminAuthGate>} />
          <Route path="/admin/tables" element={<AdminAuthGate><AdminTables /></AdminAuthGate>} />
          <Route path="/admin/menu" element={<AdminAuthGate><AdminMenu /></AdminAuthGate>} />
          <Route path="/admin/orders" element={<AdminAuthGate><AdminOrders /></AdminAuthGate>} />
          <Route path="/admin/floor-plan" element={<AdminAuthGate><AdminFloorPlan /></AdminAuthGate>} />
          <Route path="/admin/reservations" element={<AdminAuthGate><AdminReservations /></AdminAuthGate>} />
          <Route path="/admin/staff" element={<AdminAuthGate><AdminStaff /></AdminAuthGate>} />
          <Route path="/admin/inventory" element={<AdminAuthGate><AdminInventory /></AdminAuthGate>} />
          <Route path="/admin/purchases" element={<AdminAuthGate><AdminPurchases /></AdminAuthGate>} />
          <Route path="/admin/downloads" element={<AdminAuthGate><AdminDownloads /></AdminAuthGate>} />
          <Route path="/downloads" element={<AdminDownloads />} />
          <Route path="/pricing" element={<SubscriptionPricing />} />
          <Route path="/subscription" element={<SubscriptionPricing />} />
          <Route path="/admin/subscription" element={<AdminAuthGate><SubscriptionPricing /></AdminAuthGate>} />
          <Route path="/admin/settings" element={<AdminAuthGate><AdminSettings /></AdminAuthGate>} />
          <Route path="/admin/order-risk" element={<AdminAuthGate><AdminOrderRisk /></AdminAuthGate>} />
          <Route path="/admin/cctv-risk" element={<AdminAuthGate><AdminOrderRisk /></AdminAuthGate>} />

          {/* Super Admin Fleet */}
          <Route path="/super-admin" element={<AdminAuthGate><SuperAdmin /></AdminAuthGate>} />
          <Route path="/admin/super" element={<AdminAuthGate><SuperAdmin /></AdminAuthGate>} />

          {/* Public Live Interactive Demonstrations (Consumer & Merchant Exploration) */}
          <Route path="/tokens" element={<TokenDisplay />} />
          <Route path="/display/tokens" element={<TokenDisplay />} />
          <Route path="/captain" element={<CaptainApp />} />
          <Route path="/kds-demo" element={<AdminKitchen isPublicDemo={true} />} />
          <Route path="/cctv-demo" element={<AdminOrderRisk isPublicDemo={true} />} />
          <Route path="/risk-demo" element={<AdminOrderRisk isPublicDemo={true} />} />
          <Route path="/poss" element={<Navigate to="/pricing" replace />} />
          <Route path="/compare/petpooja" element={<Navigate to="/pricing" replace />} />
        </Routes>
      </div>

      {/* Global Cart Slide Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RestaurantProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </RestaurantProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
