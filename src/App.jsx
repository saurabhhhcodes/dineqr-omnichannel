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

function AppContent() {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isPrintOnly = location.pathname.startsWith('/invoice') && location.search.includes('print=true');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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

          {/* Client Self-Onboarding & Join */}
          <Route path="/onboard" element={<ClientOnboarding />} />
          <Route path="/join" element={<ClientOnboarding />} />

          {/* Restaurant / Clinic / Gym Staff & Owner */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/kitchen" element={<AdminKitchen />} />
          <Route path="/admin/tables" element={<AdminTables />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/floor-plan" element={<AdminFloorPlan />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/purchases" element={<AdminPurchases />} />
          <Route path="/admin/downloads" element={<AdminDownloads />} />
          <Route path="/downloads" element={<AdminDownloads />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Super Admin Fleet */}
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/admin/super" element={<SuperAdmin />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/menu" replace />} />
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
