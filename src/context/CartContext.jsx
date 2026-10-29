// src/context/CartContext.jsx - Shopping cart state & table persistence
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('dineqr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [table, setTable] = useState(() => {
    try {
      const saved = localStorage.getItem('dineqr_table');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [restaurantSettings, setRestaurantSettings] = useState({
    cgst_pct: 2.5,
    sgst_pct: 2.5,
    service_charge_pct: 0.0,
    currency: '₹',
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('dineqr_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (table) {
      localStorage.setItem('dineqr_table', JSON.stringify(table));
    }
  }, [table]);

  // Fetch settings on mount
  useEffect(() => {
    fetch('/api/invoice/dummy-settings-check')
      .then((r) => r.json())
      .catch(() => {});
  }, []);

  const addToCart = (product, quantity = 1, notes = '') => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === product.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        if (notes) {
          copy[existingIndex].notes = notes;
        }
        return copy;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          is_veg: product.is_veg,
          quantity,
          notes,
        },
      ];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cgst = parseFloat(((subtotal * restaurantSettings.cgst_pct) / 100).toFixed(2));
  const sgst = parseFloat(((subtotal * restaurantSettings.sgst_pct) / 100).toFixed(2));
  const serviceCharge = parseFloat(
    ((subtotal * restaurantSettings.service_charge_pct) / 100).toFixed(2)
  );
  const grandTotal = Math.round(subtotal + cgst + sgst + serviceCharge);

  return (
    <CartContext.Provider
      value={{
        items,
        table,
        setTable,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        cgst,
        sgst,
        serviceCharge,
        grandTotal,
        currency: restaurantSettings.currency,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
