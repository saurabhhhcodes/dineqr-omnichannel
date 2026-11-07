// src/context/RestaurantContext.jsx - Multi-restaurant state & active cafe switcher
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FALLBACK_RESTAURANTS,
  getAllAvailableRestaurants,
  resolveRestaurant,
} from '../data/fallbackMenu.js';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [restaurants, setRestaurants] = useState(() => getAllAvailableRestaurants());
  const [activeRestaurant, setActiveRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('dineqr_active_restaurant');
      if (saved) {
        const parsed = JSON.parse(saved);
        return resolveRestaurant(parsed?.id || parsed?.slug);
      }
      return FALLBACK_RESTAURANTS[0];
    } catch {
      return FALLBACK_RESTAURANTS[0];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchRestaurants = async () => {
    const localAll = getAllAvailableRestaurants();
    setRestaurants(localAll);

    try {
      const res = await fetch('/api/restaurants');
      let data = null;
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        data = JSON.parse(text);
      }
      if (data && data.success && data.restaurants && data.restaurants.length > 0) {
        // Merge server restaurants with local custom restaurants
        const map = new Map();
        localAll.forEach((r) => map.set(r.id, r));
        data.restaurants.forEach((r) => map.set(r.id, { ...map.get(r.id), ...r }));
        const merged = Array.from(map.values());
        setRestaurants(merged);

        // If active restaurant is not set or missing, update
        if (!activeRestaurant || !merged.some((r) => r.id === activeRestaurant.id)) {
          const defaultRest = merged[0] || FALLBACK_RESTAURANTS[0];
          setActiveRestaurant(defaultRest);
          localStorage.setItem('dineqr_active_restaurant', JSON.stringify(defaultRest));
        }
      }
    } catch (err) {
      console.warn('API unavailable, keeping active local tenant defaults:', err.message);
      if (!activeRestaurant) {
        setActiveRestaurant(localAll[0] || FALLBACK_RESTAURANTS[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const switchRestaurant = (restOrId) => {
    let target = null;
    const currentList = restaurants.length > 0 ? restaurants : getAllAvailableRestaurants();
    if (typeof restOrId === 'string') {
      target = currentList.find(
        (r) => r.id === restOrId || r.slug === restOrId || r.name.toLowerCase() === restOrId.toLowerCase()
      );
    } else {
      target = restOrId;
    }
    if (!target && restOrId) {
      target = resolveRestaurant(restOrId);
    }
    if (target) {
      setActiveRestaurant(target);
      localStorage.setItem('dineqr_active_restaurant', JSON.stringify(target));
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        activeRestaurant,
        setActiveRestaurant: switchRestaurant,
        refreshRestaurants: fetchRestaurants,
        isLoading,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
