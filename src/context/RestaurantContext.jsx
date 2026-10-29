// src/context/RestaurantContext.jsx - Multi-restaurant state & active cafe switcher
import React, { createContext, useContext, useState, useEffect } from 'react';

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);
  const [activeRestaurant, setActiveRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('dineqr_active_restaurant');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      if (data.success && data.restaurants) {
        setRestaurants(data.restaurants);

        // If no active restaurant or current one not in list, default to first
        if (!activeRestaurant || !data.restaurants.some((r) => r.id === activeRestaurant.id)) {
          const defaultRest = data.restaurants[0] || null;
          setActiveRestaurant(defaultRest);
          if (defaultRest) {
            localStorage.setItem('dineqr_active_restaurant', JSON.stringify(defaultRest));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const switchRestaurant = (restOrId) => {
    let target = null;
    if (typeof restOrId === 'string') {
      target = restaurants.find((r) => r.id === restOrId || r.slug === restOrId);
    } else {
      target = restOrId;
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
